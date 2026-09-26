# auth.py — rotas de cadastro e login da Nyxus API.
# Fica separado do main.py para evitar conflitos na hora de juntar as branches.

import hashlib
import hmac
import os
import sqlite3
from datetime import datetime, timezone
from pathlib import Path

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

# Cria o grupo de rotas que será ligado ao app no main.py.
router = APIRouter()

# Define onde fica o banco de dados (criado automaticamente).
BASE = Path(__file__).parent
BANCO = BASE / "nyxus.db"

import jwt
from datetime import timedelta

# Chave secreta usada para "assinar" o crachá (troque por algo só seu antes de lançar de verdade).
SECRET_KEY = "troque-isso-por-um-texto-aleatorio-bem-grande"

def criar_token(usuario):
    # Monta o crachá: guarda o e-mail e uma data de validade (7 dias).
    validade = datetime.now(timezone.utc) + timedelta(days=7)
    payload = {"email": usuario["email"], "exp": validade}
    return jwt.encode(payload, SECRET_KEY, algorithm="HS256")

# Guarda quantas vezes cada e-mail errou a senha e até quando fica bloqueado.
# (fica só na memória do servidor — reseta se você reiniciar o uvicorn)
tentativas_login = {}

MAX_TENTATIVAS = 5
BLOQUEIO_MINUTOS = 5

def checar_bloqueio(email):
    # Vê se esse e-mail está bloqueado agora. Se estiver, avisa quanto falta.
    dados = tentativas_login.get(email)
    if dados and dados["bloqueado_ate"]:
        if datetime.now(timezone.utc) < dados["bloqueado_ate"]:
            minutos_restantes = int((dados["bloqueado_ate"] - datetime.now(timezone.utc)).total_seconds() / 60) + 1
            raise HTTPException(
                status_code=429,
                detail=f"Muitas tentativas erradas. Tente de novo em {minutos_restantes} minuto(s).",
            )
        else:
            # O bloqueio já passou, começa do zero.
            tentativas_login.pop(email, None)

def registrar_erro(email):
    # Soma mais um erro pra esse e-mail; bloqueia se bater o máximo.
    dados = tentativas_login.setdefault(email, {"erros": 0, "bloqueado_ate": None})
    dados["erros"] += 1
    if dados["erros"] >= MAX_TENTATIVAS:
        dados["bloqueado_ate"] = datetime.now(timezone.utc) + timedelta(minutes=BLOQUEIO_MINUTOS)

def limpar_tentativas(email):
    # Login certo: esquece os erros anteriores.
    tentativas_login.pop(email, None)

# Tipos de código e o que cada um dá para a conta criada com ele.
# Para criar outro tipo no futuro, basta adicionar mais uma entrada aqui.
TIPOS = {
    "beta": {
        "plano": "beta",             # nome do plano que aparece na conta
        "beta": 1,                   # flag: participante da beta
        "vitalicio": 1,              # flag: acesso vitalício e gratuito
        "atendimento_especial": 1,   # flag: atendimento especial
    },
}


def agora():
    # Data e hora atuais em UTC, no formato texto.
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def conectar():
    # Abre a conexão com o banco SQLite (o arquivo é criado se não existir).
    con = sqlite3.connect(BANCO)
    con.row_factory = sqlite3.Row
    return con


def garantir_coluna(con, tabela, coluna, definicao):
    # Adiciona a coluna se ela ainda não existir (atualiza bancos antigos).
    existentes = [linha["name"] for linha in con.execute(f"PRAGMA table_info({tabela})")]
    if coluna not in existentes:
        con.execute(f"ALTER TABLE {tabela} ADD COLUMN {coluna} {definicao}")


def iniciar_banco():
    # Cria as tabelas na primeira vez e atualiza as antigas, se precisar.
    con = conectar()
    con.execute(
        """
        CREATE TABLE IF NOT EXISTS usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            senha_hash TEXT NOT NULL,
            salt TEXT NOT NULL,
            plano TEXT NOT NULL DEFAULT 'beta'
        )
        """
    )
    con.execute(
        """
        CREATE TABLE IF NOT EXISTS codigos (
            codigo TEXT PRIMARY KEY,
            usado INTEGER NOT NULL DEFAULT 0
        )
        """
    )

    # Colunas novas (não fazem nada se já existirem).
    garantir_coluna(con, "usuarios", "beta", "INTEGER NOT NULL DEFAULT 0")
    garantir_coluna(con, "usuarios", "vitalicio", "INTEGER NOT NULL DEFAULT 0")
    garantir_coluna(con, "usuarios", "atendimento_especial", "INTEGER NOT NULL DEFAULT 0")
    garantir_coluna(con, "usuarios", "codigo_usado", "TEXT")
    garantir_coluna(con, "usuarios", "criado_em", "TEXT")
    garantir_coluna(con, "codigos", "tipo", "TEXT NOT NULL DEFAULT 'beta'")
    garantir_coluna(con, "codigos", "observacao", "TEXT")
    garantir_coluna(con, "codigos", "criado_em", "TEXT")
    garantir_coluna(con, "codigos", "usado_em", "TEXT")
    garantir_coluna(con, "codigos", "usado_por", "TEXT")

    con.commit()
    con.close()


def gerar_hash(senha, salt_hex):
    # Transforma a senha em um hash. A senha em si nunca é guardada.
    return hashlib.pbkdf2_hmac(
        "sha256",
        senha.encode("utf-8"),
        bytes.fromhex(salt_hex),
        200_000,
    ).hex()


def dados_da_conta(usuario):
    # Monta o que a API devolve para o frontend (nunca inclui senha ou hash).
    return {
        "nome": usuario["nome"],
        "email": usuario["email"],
        "plano": usuario["plano"],
        "flags": {
            "beta": bool(usuario["beta"]),
            "vitalicio": bool(usuario["vitalicio"]),
            "atendimento_especial": bool(usuario["atendimento_especial"]),
        },
    }


# Prepara o banco assim que o servidor liga.
iniciar_banco()


class DadosCadastro(BaseModel):
    nome: str
    email: str
    senha: str
    codigo: str


class DadosLogin(BaseModel):
    email: str
    senha: str


@router.post("/cadastro")
def cadastro(dados: DadosCadastro):
    nome = dados.nome.strip()
    email = dados.email.strip().lower()
    codigo = dados.codigo.strip().upper()

    if not nome or "@" not in email:
        raise HTTPException(status_code=400, detail="Preencha nome e e-mail válidos.")

    if len(dados.senha) < 6:
        raise HTTPException(
            status_code=400,
            detail="A senha precisa ter pelo menos 6 caracteres.",
        )

    con = conectar()
    try:
        # Confere se o código existe e ainda não foi usado.
        linha = con.execute(
            "SELECT usado, tipo FROM codigos WHERE codigo = ?", (codigo,)
        ).fetchone()
        if linha is None or linha["usado"]:
            raise HTTPException(
                status_code=400,
                detail="O código informado não existe ou já foi utilizado.",
            )

        # Descobre os benefícios que esse tipo de código libera.
        beneficios = TIPOS.get(linha["tipo"], TIPOS["beta"])

        # Cria o usuário com a senha protegida por hash.
        salt = os.urandom(16).hex()
        try:
            con.execute(
                """
                INSERT INTO usuarios
                    (nome, email, senha_hash, salt, plano,
                     beta, vitalicio, atendimento_especial,
                     codigo_usado, criado_em)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    nome,
                    email,
                    gerar_hash(dados.senha, salt),
                    salt,
                    beneficios["plano"],
                    beneficios["beta"],
                    beneficios["vitalicio"],
                    beneficios["atendimento_especial"],
                    codigo,
                    agora(),
                ),
            )
        except sqlite3.IntegrityError:
            raise HTTPException(
                status_code=409,
                detail="Este e-mail já está cadastrado.",
            )

        # Marca o código como usado só depois que a conta foi criada.
        con.execute(
            "UPDATE codigos SET usado = 1, usado_em = ?, usado_por = ? WHERE codigo = ?",
            (agora(), email, codigo),
        )
        con.commit()

        usuario = con.execute(
            "SELECT * FROM usuarios WHERE email = ?", (email,)
        ).fetchone()
    finally:
        con.close()

    conta = dados_da_conta(usuario)
    conta["token"] = criar_token(usuario)
    return conta


@router.post("/login")
def login(dados: DadosLogin):
    email = dados.email.strip().lower()

    checar_bloqueio(email)

    con = conectar()
    try:
        usuario = con.execute(
            "SELECT * FROM usuarios WHERE email = ?", (email,)
        ).fetchone()
    finally:
        con.close()

    # A mesma mensagem para e-mail errado ou senha errada, de propósito.
    erro = HTTPException(status_code=401, detail="E-mail ou senha incorretos.")
    if usuario is None:
        registrar_erro(email)
        raise erro

    hash_informado = gerar_hash(dados.senha, usuario["salt"])
    if not hmac.compare_digest(usuario["senha_hash"], hash_informado):
        registrar_erro(email)
        raise erro

    limpar_tentativas(email)

    conta = dados_da_conta(usuario)
    conta["token"] = criar_token(usuario)
    return conta