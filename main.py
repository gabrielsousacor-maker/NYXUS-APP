# Importa o FastAPI, que será responsável por criar nossa API.
from fastapi import FastAPI

# Importa o middleware necessário para permitir que o frontend converse com o backend.
from fastapi.middleware.cors import CORSMiddleware

# Importa o módulo itertools para gerar combinações automaticamente.
from itertools import product

# Importa o módulo random para criar pequenas variações nas pontuações.
import random


# Cria a aplicação principal do FastAPI.
app = FastAPI(
    # Define o nome que aparecerá na documentação automática da API.
    title="Nyxus API",
    # Define a versão atual do projeto.
    version="0.1.0"
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
        "message": "GameVerse API funcionando!",
        "version": "0.1.0"
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