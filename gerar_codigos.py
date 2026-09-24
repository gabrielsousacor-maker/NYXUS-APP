# gerar_codigos.py — cria e lista os códigos de acesso do NYXUS.
# Uso (com o ambiente virtual ativo, dentro da pasta do projeto):
#   python gerar_codigos.py 10                        -> gera 10 códigos beta
#   python gerar_codigos.py 1 --obs "Fulano (Discord)"  -> gera 1 código com anotação
#   python gerar_codigos.py --listar                  -> mostra todos os códigos
#   python gerar_codigos.py --listar --livres         -> mostra só os que ninguém usou

import argparse
import secrets
import sqlite3

from auth import TIPOS, agora, conectar, iniciar_banco

# Letras e números sem caracteres que se confundem (sem 0/O, 1/I/L).
ALFABETO = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"


def novo_codigo():
    # Monta um código no formato NYXUS-XXXX-XXXX usando aleatoriedade segura.
    def parte():
        return "".join(secrets.choice(ALFABETO) for _ in range(4))

    return f"NYXUS-{parte()}-{parte()}"


def gerar(quantidade, tipo, observacao):
    # Cria a quantidade pedida de códigos e guarda todos no banco.
    con = conectar()
    criados = []
    while len(criados) < quantidade:
        codigo = novo_codigo()
        try:
            con.execute(
                "INSERT INTO codigos (codigo, tipo, observacao, criado_em) VALUES (?, ?, ?, ?)",
                (codigo, tipo, observacao, agora()),
            )
            criados.append(codigo)
        except sqlite3.IntegrityError:
            # Código repetido (quase impossível): sorteia outro.
            continue
    con.commit()
    con.close()
    return criados


def listar(apenas_livres):
    # Mostra os códigos existentes e quem usou cada um.
    con = conectar()
    sql = "SELECT * FROM codigos"
    if apenas_livres:
        sql += " WHERE usado = 0"
    sql += " ORDER BY criado_em, codigo"
    linhas = con.execute(sql).fetchall()
    con.close()

    if not linhas:
        print("Nenhum código encontrado.")
        return

    livres = 0
    for linha in linhas:
        if linha["usado"]:
            status = f"USADO por {linha['usado_por']} em {linha['usado_em']}"
        else:
            status = "LIVRE"
            livres += 1
        nota = f"  ({linha['observacao']})" if linha["observacao"] else ""
        print(f"{linha['codigo']}  [{linha['tipo']}]  {status}{nota}")

    print(f"\nTotal: {len(linhas)} | Livres: {livres} | Usados: {len(linhas) - livres}")


def main():
    parser = argparse.ArgumentParser(description="Gera e lista códigos de acesso do NYXUS.")
    parser.add_argument("quantidade", nargs="?", type=int, help="quantos códigos gerar")
    parser.add_argument("--tipo", default="beta", choices=list(TIPOS), help="tipo do código (padrão: beta)")
    parser.add_argument("--obs", default=None, help="anotação, ex.: para quem é o código")
    parser.add_argument("--listar", action="store_true", help="lista os códigos existentes")
    parser.add_argument("--livres", action="store_true", help="com --listar, mostra só os não usados")
    args = parser.parse_args()

    # Garante que o banco e as tabelas existem antes de qualquer coisa.
    iniciar_banco()

    if args.listar:
        listar(args.livres)
        return

    if not args.quantidade or args.quantidade < 1:
        parser.print_help()
        return

    if args.quantidade > 500:
        print("Por segurança, gere no máximo 500 códigos por vez.")
        return

    codigos = gerar(args.quantidade, args.tipo, args.obs)
    print(f"{len(codigos)} código(s) do tipo '{args.tipo}' criado(s):\n")
    for codigo in codigos:
        print(codigo)


if __name__ == "__main__":
    main()
