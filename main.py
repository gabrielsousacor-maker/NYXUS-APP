# Importa o FastAPI, que será responsável por criar nossa API.
from fastapi import FastAPI, HTTPException

# Importa o middleware necessário para permitir que o frontend converse com o backend.
from fastapi.middleware.cors import CORSMiddleware

# Importa o módulo itertools para gerar combinações automaticamente.
from itertools import product

# Importa o módulo random para criar pequenas variações nas pontuações.
import random
from auth import router as auth_router

# Cria a aplicação principal do FastAPI.
app = FastAPI(
    # Define o nome que aparecerá na documentação automática da API.
    title="Nyxus API",
    # Define a versão atual do projeto.
    version="0.2.0"
)


# Permite que o frontend faça requisições para nossa API.
app.add_middleware(
    # Define o middleware responsável pelo CORS.
    CORSMiddleware,
    # Permite requisições vindas de qualquer origem durante o desenvolvimento.
    allow_origins=["*"],
    # Permite o envio de cookies caso sejam necessários futuramente.
    allow_credentials=False,
    # Permite todos os métodos HTTP durante o desenvolvimento.
    allow_methods=["*"],
    # Permite todos os cabeçalhos HTTP durante o desenvolvimento.
    allow_headers=["*"],
)

app.include_router(auth_router)

# Cria nossa biblioteca inicial de animações.
ANIMATIONS = {

    # Cria as animações relacionadas ao futebol.
    "futebol": [

        # Define a primeira animação de futebol.
        {
            "id": "F1",
            "name": "Controle de bola",
            "energy": 6,
            "speed": 5,
            "intensity": 5
        },

        # Define a segunda animação de futebol.
        {
            "id": "F2",
            "name": "Drible rápido",
            "energy": 8,
            "speed": 8,
            "intensity": 7
        },

        # Define a terceira animação de futebol.
        {
            "id": "F3",
            "name": "Chute potente",
            "energy": 9,
            "speed": 7,
            "intensity": 9
        },

        # Define a quarta animação de futebol.
        {
            "id": "F4",
            "name": "Comemoração",
            "energy": 7,
            "speed": 4,
            "intensity": 6
        },

        # Define a quinta animação de futebol.
        {
            "id": "F5",
            "name": "Passe preciso",
            "energy": 5,
            "speed": 6,
            "intensity": 5
        }
    ],

    # Cria as animações relacionadas ao estilo de tiro.
    "tiro": [

        # Define a primeira animação de tiro.
        {
            "id": "S1",
            "name": "Movimento tático",
            "energy": 8,
            "speed": 8,
            "intensity": 8
        },

        # Define a segunda animação de tiro.
        {
            "id": "S2",
            "name": "Esquiva",
            "energy": 9,
            "speed": 9,
            "intensity": 8
        },

        # Define a terceira animação de tiro.
        {
            "id": "S3",
            "name": "Mira",
            "energy": 5,
            "speed": 3,
            "intensity": 7
        },

        # Define a quarta animação de tiro.
        {
            "id": "S4",
            "name": "Corrida tática",
            "energy": 9,
            "speed": 9,
            "intensity": 7
        },

        # Define a quinta animação de tiro.
        {
            "id": "S5",
            "name": "Movimento defensivo",
            "energy": 6,
            "speed": 6,
            "intensity": 6
        }
    ],

    # Cria as animações relacionadas ao estilo de corrida.
    "corrida": [

        # Define a primeira animação de corrida.
        {
            "id": "R1",
            "name": "Largada",
            "energy": 9,
            "speed": 10,
            "intensity": 8
        },

        # Define a segunda animação de corrida.
        {
            "id": "R2",
            "name": "Derrapagem",
            "energy": 8,
            "speed": 9,
            "intensity": 9
        },

        # Define a terceira animação de corrida.
        {
            "id": "R3",
            "name": "Aceleração",
            "energy": 10,
            "speed": 10,
            "intensity": 8
        },

        # Define a quarta animação de corrida.
        {
            "id": "R4",
            "name": "Curva",
            "energy": 7,
            "speed": 8,
            "intensity": 7
        },

        # Define a quinta animação de corrida.
        {
            "id": "R5",
            "name": "Finalização",
            "energy": 6,
            "speed": 5,
            "intensity": 6
        }
    ]
}


# Cria a biblioteca de eventos do Passo 3 (lista dinâmica do frontend).
# Espelha os dados locais do app.js para que futuramente possam vir do banco de dados.
EVENTS = [

    # Define o primeiro evento: torneio de futebol ao vivo.
    {
        "id": 1,
        "icon": "⚽",
        "nome": "Copa NYXUS — Futebol Virtual",
        "categoria": "futebol",
        "meta": "32 equipes · Semifinal",
        "status": "live",
        "statusLabel": "AO VIVO",
        "participantes": "1.240",
        "premiacao": "R$ 5.000",
        "descricao": (
            "O maior torneio de futebol virtual da plataforma. "
            "Enfrente equipes de todo o Brasil em partidas táticas de alto nível, "
            "com transmissão ao vivo e comentários em tempo real."
        )
    },

    # Define o segundo evento: desafio de tiro em breve.
    {
        "id": 2,
        "icon": "🎯",
        "nome": "Sniper Challenge S3",
        "categoria": "tiro",
        "meta": "Solo · Classificatória",
        "status": "soon",
        "statusLabel": "EM BREVE",
        "participantes": "540",
        "premiacao": "R$ 2.000",
        "descricao": (
            "Prove sua pontaria na terceira temporada do Sniper Challenge. "
            "Mapas inéditos, modos de precisão extrema e um ranking global "
            "que define os melhores atiradores da temporada."
        )
    },

    # Define o terceiro evento: campeonato de corrida em breve.
    {
        "id": 3,
        "icon": "🏎️",
        "nome": "Grand Prix NYXUS",
        "categoria": "corrida",
        "meta": "Circuito aberto · 12 pistas",
        "status": "soon",
        "statusLabel": "EM BREVE",
        "participantes": "320",
        "premiacao": "R$ 1.500",
        "descricao": (
            "Um campeonato de corridas com 12 pistas exclusivas e sistema de upgrade de veículo. "
            "A cada corrida, pontos são acumulados para o ranking final da temporada."
        )
    },

    # Define o quarto evento: torneio encerrado.
    {
        "id": 4,
        "icon": "🏆",
        "nome": "NYXUS Open — Temporada 1",
        "categoria": "futebol",
        "meta": "Multi-estilo · Encerrado",
        "status": "closed",
        "statusLabel": "ENCERRADO",
        "participantes": "2.800",
        "premiacao": "R$ 10.000",
        "descricao": (
            "A primeira grande competição multi-estilo da plataforma. "
            "Combinando futebol, tiro e corrida em uma disputa épica de três dias "
            "que definiu os primeiros campeões da NYXUS."
        )
    }
]


# Cria uma função responsável por calcular a compatibilidade entre animações.
def calculate_score(combination):

    # Cria uma lista contendo os níveis de energia das animações.
    energies = [animation["energy"] for animation in combination]

    # Cria uma lista contendo as velocidades das animações.
    speeds = [animation["speed"] for animation in combination]

    # Cria uma lista contendo as intensidades das animações.
    intensities = [animation["intensity"] for animation in combination]

    # Calcula a média de energia das animações.
    energy_average = sum(energies) / len(energies)

    # Calcula a média de velocidade das animações.
    speed_average = sum(speeds) / len(speeds)

    # Calcula a média de intensidade das animações.
    intensity_average = sum(intensities) / len(intensities)

    # Calcula uma pequena variação para evitar resultados sempre iguais.
    variation = random.uniform(0, 5)

    # Calcula a pontuação final.
    score = (
        energy_average * 3
        + speed_average * 3
        + intensity_average * 3
        + variation
    )

    # Limita a pontuação para não ultrapassar 100.
    score = min(round(score, 2), 100)

    # Retorna a pontuação calculada.
    return score


# Cria a função que gera as combinações.
def generate_combinations(categories, amount):

    # Cria uma lista vazia para armazenar as animações disponíveis.
    animation_lists = []

    # Percorre todas as categorias recebidas.
    for category in categories:

        # Verifica se a categoria existe na biblioteca.
        if category not in ANIMATIONS:

            # Retorna uma lista vazia caso a categoria não exista.
            return []

        # Adiciona as animações daquela categoria à lista.
        animation_lists.append(ANIMATIONS[category])

    # Cria todas as combinações possíveis entre as categorias.
    combinations = product(*animation_lists)

    # Cria uma lista para armazenar os resultados.
    results = []

    # Percorre todas as combinações encontradas.
    for combination in combinations:

        # Seleciona somente a quantidade de animações solicitada.
        selected = list(combination)[:amount]

        # Calcula a pontuação daquela combinação.
        score = calculate_score(selected)

        # Cria o resultado da combinação.
        result = {
            "animations": selected,
            "score": score
        }

        # Adiciona o resultado à lista.
        results.append(result)

    # Ordena as combinações da maior pontuação para a menor.
    results.sort(
        key=lambda item: item["score"],
        reverse=True
    )

    # Retorna as melhores combinações.
    return results[:10]


# Cria a rota inicial da API.
@app.get("/")
def home():

    # Retorna uma mensagem confirmando que a API está funcionando.
    return {
        "message": "Nyxus API funcionando!",
        "version": "0.2.0"
    }


# Cria uma rota utilizada para verificar a saúde do servidor.
@app.get("/health")
def health():

    # Retorna o estado atual do servidor.
    return {
        "status": "online"
    }


# Cria uma rota para listar as categorias disponíveis.
@app.get("/categories")
def categories():

    # Retorna os nomes das categorias existentes.
    return {
        "categories": list(ANIMATIONS.keys())
    }


# Cria uma rota responsável por gerar combinações.
@app.get("/combinations")
def combinations(
    # Recebe as categorias separadas por vírgula.
    categories: str = "futebol,tiro",
    # Define a quantidade de animações de cada categoria.
    amount: int = 1
):

    # Divide o texto das categorias usando a vírgula.
    category_list = [
        category.strip().lower()
        for category in categories.split(",")
    ]

    # Impede que o usuário utilize mais de três categorias.
    category_list = category_list[:3]

    # Impede que a quantidade seja menor que uma animação.
    amount = max(1, amount)

    # Impede que a quantidade seja maior que duas animações.
    amount = min(2, amount)

    # Gera as combinações.
    results = generate_combinations(
        category_list,
        amount
    )

    # Retorna os dados para o frontend.
    return {
        "categories": category_list,
        "amount": amount,
        "combinations": results
    }


# Cria uma rota para listar todos os eventos (Passo 3 — lista dinâmica).
# O frontend poderá substituir os dados locais do app.js por esta chamada futuramente.
@app.get("/events")
def events(
    # Permite filtrar eventos por status: live, soon ou closed.
    status: str = None,
    # Permite filtrar eventos por categoria: futebol, tiro ou corrida.
    categoria: str = None
):

    # Começa com a lista completa de eventos.
    resultado = EVENTS

    # Aplica o filtro de status caso tenha sido informado.
    if status:
        resultado = [
            event for event in resultado
            if event["status"] == status.strip().lower()
        ]

    # Aplica o filtro de categoria caso tenha sido informado.
    if categoria:
        resultado = [
            event for event in resultado
            if event["categoria"] == categoria.strip().lower()
        ]

    # Retorna a lista de eventos encontrados e o total.
    return {
        "total": len(resultado),
        "events": resultado
    }


# Cria uma rota para buscar um evento específico pelo ID (Passo 4 — tela de detalhes).
# O frontend usa esta rota ao abrir o overlay de detalhe de um evento da lista.
@app.get("/events/{event_id}")
def event_detail(event_id: int):

    # Percorre a lista de eventos procurando pelo ID recebido.
    for event in EVENTS:

        # Verifica se o ID do evento atual corresponde ao buscado.
        if event["id"] == event_id:

            # Retorna os dados completos do evento encontrado.
            return event

    # Retorna erro 404 caso nenhum evento com esse ID seja encontrado.
    raise HTTPException(
        status_code=404,
        detail=f"Evento com id {event_id} não encontrado."
    )
