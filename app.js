// Define o endereço do nosso backend durante o desenvolvimento.
const API_URL = "http://127.0.0.1:8000";

// Define os estilos selecionados inicialmente pelo usuário.
let selectedStyles = ["futebol", "tiro"];

// Define a quantidade inicial de animações.
let animationAmount = 1;

// Procura os elementos principais
const selectedStylesElement = document.getElementById("selectedStyles");
const generateButton = document.getElementById("generateButton");
const changeButton = document.getElementById("changeButton");
const stylePanel = document.getElementById("stylePanel");
const saveStylesButton = document.getElementById("saveStyles");
const animationAmountElement = document.getElementById("animationAmount");
const resultText = document.getElementById("resultText");
const scoreElement = document.getElementById("score");
const styleButtons = document.querySelectorAll(".style-option");
const animationOne = document.getElementById("animationOne");
const animationTwo = document.getElementById("animationTwo");
const animationThree = document.getElementById("animationThree");

const styleNames = {
    futebol: "⚽ Futebol",
    tiro: "🎯 Tiro",
    corrida: "🏎️ Corrida"
};

// Cores da identidade NIXUS - tudo no lima
const coresNixus = {
    futebol: "#D6FF00", // lima principal
    tiro: "#a8cc00", // lima mais escuro
    corrida: "#e6ff66", // lima mais claro
    neutro: "#2a2a2a"
}

function renderSelectedStyles() {
    selectedStylesElement.innerHTML = "";
    selectedStyles.forEach(style => {
        const chip = document.createElement("span");
        chip.className = "style-chip";
        chip.textContent = styleNames[style];
        selectedStylesElement.appendChild(chip);
    });
}

function updateBackground() {
    // Transição suave em todas
    [animationOne, animationTwo, animationThree].forEach(el => {
        el.style.transition = "all 0.6s ease";
    });

    animationOne.style.background = selectedStyles.includes("futebol")? coresNixus.futebol : coresNixus.neutro;
    animationTwo.style.background = selectedStyles.includes("tiro")? coresNixus.tiro : coresNixus.neutro;
    animationThree.style.background = selectedStyles.includes("corrida")? coresNixus.corrida : coresNixus.neutro;
}

async function generateCombination() {
    resultText.textContent = "Gerando combinação NYXUS...";
    const categories = selectedStyles.join(",");
    const url = `${API_URL}/combinations?categories=${categories}&amount=${animationAmount}`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Erro ao acessar a API.");
        const data = await response.json();

        if (!data.combinations.length) {
            resultText.textContent = "Nenhuma combinação encontrada.";
            return;
        }

        const bestCombination = data.combinations[0];
        const animationNames = bestCombination.animations.map(a => a.name);

        resultText.textContent = animationNames.join(" × ");
        scoreElement.textContent = `Compatibilidade: ${bestCombination.score}%`;

        // Chama a animação visual só com imagem/css
        playVisualCombination();

    } catch (error) {
        resultText.textContent = "Não foi possível conectar ao servidor.";
        console.error(error);
    }
}

function playVisualCombination() {
    // Reseta animação
    [animationOne, animationTwo, animationThree].forEach(el => {
        el.style.animation = "none";
    });
    void animationOne.offsetWidth; // força recalcular

    // Pulso de 3s mantendo identidade
    [animationOne, animationTwo, animationThree].forEach(el => {
        if (el.style.background!== "rgb(42, 42, 42)") { // só anima as ativas
            el.style.transform = "scale(1.4)";
            el.style.opacity = "0.7";
            setTimeout(() => {
                el.style.transform = "scale(1)";
                el.style.opacity = "0.22";
            }, 800);
        }
    });

    // Reativa movimento infinito
    animationOne.style.animation = "moveOne 7s infinite alternate ease-in-out";
    animationTwo.style.animation = "moveTwo 8s infinite alternate ease-in-out";
    animationThree.style.animation = "moveThree 9s infinite alternate ease-in-out";
}

// Eventos - igual você já tinha
changeButton.addEventListener("click", () => {
    stylePanel.classList.remove("hidden");
});

styleButtons.forEach(button => {
    button.addEventListener("click", () => {
        const style = button.dataset.style;
        if (selectedStyles.includes(style)) {
            selectedStyles = selectedStyles.filter(item => item!== style);
            button.classList.remove("selected");
            return;
        }
        if (selectedStyles.length >= 3) {
            alert("Você pode escolher no máximo 3 estilos.");
            return;
        }
        selectedStyles.push(style);
        button.classList.add("selected");
    });
});

saveStylesButton.addEventListener("click", () => {
    if (selectedStyles.length === 0) {
        alert("Escolha pelo menos um estilo.");
        return;
    }
    animationAmount = Number(animationAmountElement.value);
    renderSelectedStyles();
    updateBackground();
    stylePanel.classList.add("hidden");
    generateCombination();
});

generateButton.addEventListener("click", generateCombination);

// Inicial
renderSelectedStyles();
updateBackground();
generateCombination();
