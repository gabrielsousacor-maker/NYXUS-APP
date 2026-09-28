// ===================== GERADOR DE OCORRÊNCIAS =====================

const attackTemplates = [
    {
        type: "Acesso a painel administrativo",
        priority: "HIGH",
        description: "Um IP externo acessou áreas administrativas fora do horário comercial, sem autenticação prévia.",
        buildLogs: (ip, decoyIp) => [
            `GET /admin from ${ip}`,
            `GET /config.php from ${ip}`,
            `GET /dashboard from ${decoyIp}`
        ],
        verdict: "Associado a scanners automatizados"
    },
    {
        type: "Tráfego anômalo de saída",
        priority: "CRITICAL",
        description: "Um host interno está enviando grandes volumes de dados para um IP externo desconhecido.",
        buildLogs: (ip, decoyIp) => [
            `Outbound transfer 800MB to ${ip}`,
            `Internal sync with ${decoyIp}`,
            `Outbound transfer 950MB to ${ip}`
        ],
        verdict: "Servidor de exfiltração conhecido"
    },
    {
        type: "Scan de portas",
        priority: "LOW",
        description: "Um IP está testando múltiplas portas do servidor, possível fase de reconhecimento antes de um ataque maior.",
        buildLogs: (ip, decoyIp) => [
            `Port scan detected from ${ip}`,
            `Connection attempt on port 22 from ${ip}`,
            `Connection attempt on port 3389 from ${ip}`
        ],
        verdict: "Atividade de reconhecimento automatizado"
    },
    {
        type: "Possível ransomware",
        priority: "CRITICAL",
        description: "Arquivos estão sendo criptografados em massa e um host interno está se comunicando com um IP externo suspeito.",
        buildLogs: (ip, decoyIp) => [
            "Multiple file encryption events detected",
            `Suspicious process spawned by ${decoyIp}`,
            `C2 beacon detected to ${ip}`
        ],
        verdict: "IP associado a infraestrutura de ransomware conhecida"
    }
];

const fakeIPs = ["45.88.23.77", "203.0.113.44", "198.51.100.9", "185.220.101.5", "91.219.237.12", "165.227.35.88", "103.45.12.201"];
const decoyPoolInternal = ["192.168.1.15", "10.0.0.5", "172.16.0.22", "192.168.0.42"];
const fakeCountries = ["Rússia", "Cingapura", "Brasil", "Nigéria", "China", "Holanda", "Ucrânia"];
const fakeOrgs = ["BadNet Hosting", "Cloud Proxy Ltd", "Free Hosting Corp", "DarkRoute Networks", "ShadowISP"];

const timeLimitByPriority = {
    CRITICAL: [45, 150],
    HIGH: [150, 400],
    MEDIUM: [400, 1200],
    LOW: [1200, 5400]
};

const gapBetweenIncidents = [5, 45];

const FINANCIAL_FRAUD_CHANCE = 0.25;

// ===================== DIFICULDADE =====================

const DIFFICULTY_SETTINGS = {
    facil:   { label: "Fácil",   timeMult: 1.5, gapMult: 1.4 },
    normal:  { label: "Normal",  timeMult: 1,   gapMult: 1   },
    dificil: { label: "Difícil", timeMult: 0.6, gapMult: 0.6 }
};

let playerName = "";
let difficulty = "normal";

function pick(arr){
    return arr[Math.floor(Math.random() * arr.length)];
}

function randomInRange(min, max){
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateFinancialIncident(){
    const ip = pick(fakeIPs);
    const decoyIp = pick(decoyPoolInternal);
    const country = pick(fakeCountries);
    const org = pick(fakeOrgs);
    const stolenAmount = randomInRange(15000, 250000);
    const destinationAccount = `****${randomInRange(1000, 9999)} (conta offshore)`;
    const legitAccount = `****${randomInRange(1000, 9999)} (conta corporativa)`;
    const [min, max] = timeLimitByPriority.CRITICAL;
    const timeLimit = randomInRange(min, max) + 120;
    return {
        title: "Fraude financeira - Desvio de fundos",
        description: `Um IP conseguiu desviar aproximadamente R$ ${stolenAmount.toLocaleString("pt-BR")} da empresa. Encontre o IP, acesse o dispositivo do invasor, reverta a transferência e depois bloqueie o hardware e a rede dele.`,
        priority: "CRITICAL",
        special: "financial",
        ip,
        decoyIp,
        stolenAmount,
        destinationAccount,
        legitAccount,
        timeLimit,
        logs: [
            `ALERT: Unauthorized funds transfer initiated from ${ip}`,
            `Session hijack detected, originating IP ${ip}`,
            `Internal reference request from ${decoyIp}`
        ],
        geo: { country, org, city: "Desconhecida" },
        verdict: "MALICIOSO - Envolvido em fraude financeira confirmada"
    };
}

function generateLocalIncident(){
    if (Math.random() < FINANCIAL_FRAUD_CHANCE){
        return generateFinancialIncident();
    }

    const template = pick(attackTemplates);
    const ip = pick(fakeIPs);
    const decoyIp = pick(decoyPoolInternal);
    const country = pick(fakeCountries);
    const org = pick(fakeOrgs);

    const [min, max] = timeLimitByPriority[template.priority];
    const timeLimit = randomInRange(min, max);

    return {
        title: template.type,
        description: template.description,
        priority: template.priority,
        special: null,
        ip,
        decoyIp,
        timeLimit,
        logs: template.buildLogs(ip, decoyIp),
        geo: { country, org, city: "Desconhecida" },
        verdict: `MALICIOSO - ${template.verdict}`
    };
}

// Monta os passos "de verdade" pra resolver a ocorrência, sempre batendo
// com os comandos reais do jogo (não depende da fonte ter dito isso certo).
function buildSteps(incident){
    const steps = [
        "Verificar os logs (comando: check logs)",
        "Consultar geolocalização em ipinfo.local",
        "Consultar reputação em threatintel.local",
        "Confirmar o IP como suspeito no Painel de IP"
    ];
    if (incident.special === "financial"){
        steps.push("Acessar o dispositivo do atacante (comando: connect <ip>)");
        steps.push("Recuperar os fundos (comando: recover funds)");
    }
    steps.push(`Bloquear o IP correto (comando: block ip ${incident.ip})`);
    return steps;
}

// ===================== FONTE DE OCORRÊNCIAS (plugável) =====================
//
// Qualquer fonte usada aqui precisa devolver uma Promise que resolve para um
// objeto de ocorrência com este formato (o "contrato"):
//
// {
//   title: string,
//   description: string,
//   priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
//   special: null | "financial",
//   ip: string,                 // IP "malicioso" da ocorrência
//   decoyIp: string,            // IP interno que aparece nos logs como distração
//   timeLimit: number,          // segundos até escalar se não for resolvida
//   logs: string[],             // linhas mostradas em "check logs"
//   geo: { country, org, city },// mostrado em ipinfo.local
//   verdict: string,            // mostrado em threatintel.local
//   // campos extras só quando special === "financial":
//   stolenAmount?: number,
//   destinationAccount?: string,
//   legitAccount?: string
// }
//
// Hoje `local` só sorteia de uma lista fixa de templates. No futuro, dá pra
// trocar por uma fonte que chama um agente (ex: fetch pra um backend que usa
// um LLM) sem mexer em mais nada do jogo — só trocar o valor de `activeSource`.
const incidentSources = {
    local: {
        name: "Gerador local (templates fixos)",
        async getNextIncident(){
            // Resolve na hora, mas já fica "async" pra fontes futuras
            // que precisam esperar uma resposta de rede (ex: agente).
            return generateLocalIncident();
        }
    },

    nyxusAI: {
        name: "Nyxus AI (Ollama local)",
        async getNextIncident(){
            const systemPrompt = `Você é o Nyxus AI, o sistema de inteligência artificial que gera ocorrências de segurança para o Nyxus SOC Workspace, uma ferramenta de treino de analistas de cybersecurity.

Personalidade: direto, técnico e confiável — fala como um sistema de verdade de SOC, sem enrolação. De vez em quando solta um comentário seco/irônico sobre a gravidade da ocorrência (sem exagerar), mas nunca perde a precisão técnica. Você não é um assistente de bate-papo: sua única função aqui é gerar ocorrências realistas para treino.

Gere cenários variados (não repita sempre os mesmos tipos de ataque) e plausíveis para um SOC real: força bruta, exfiltração de dados, ransomware, phishing, movimentação lateral, fraude financeira, DDoS, etc.

Dificuldade selecionada pelo jogador: ${DIFFICULTY_SETTINGS[difficulty].label}.
- Fácil: cenário mais simples e direto, poucos elementos distratores nos logs, prioridade mais baixa em média.
- Normal: complexidade equilibrada.
- Difícil: cenário mais complexo, com mais linhas de log (inclua algum elemento de distração/ruído), maior chance de prioridade HIGH ou CRITICAL.`;

            const prompt = `Gere UMA ocorrência de segurança fictícia e responda APENAS com um JSON válido, sem nenhum texto antes ou depois, exatamente neste formato:

{
  "title": "string curta, tipo de ataque",
  "description": "string, 1-2 frases descrevendo a ocorrência",
  "priority": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "special": null,
  "ip": "um IP público fictício, formato xxx.xxx.xxx.xxx",
  "decoyIp": "um IP interno fictício, formato 10.x.x.x ou 192.168.x.x",
  "timeLimit": número de segundos entre 60 e 300,
  "logs": ["3 a 5 linhas de log fictícias, formato realista de SOC"],
  "geo": { "country": "país fictício", "org": "nome de organização/ISP fictício", "city": "cidade ou 'Desconhecida'" },
  "verdict": "string começando com 'MALICIOSO - ' seguido do motivo"
}`;

            const resposta = await fetch("http://localhost:11434/api/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    model: "llama3.2",
                    system: systemPrompt,
                    prompt,
                    stream: false,
                    format: "json"
                })
            });

            if (!resposta.ok){
                throw new Error(`Nyxus AI (Ollama) respondeu com erro: ${resposta.status}`);
            }

            const dados = await resposta.json();
            const incidente = JSON.parse(dados.response);

            // Validação básica: garante que os campos essenciais existem
            // antes de entregar a ocorrência pro resto do jogo.
            if (!incidente.title || !incidente.ip || !incidente.priority || !Array.isArray(incidente.logs)){
                throw new Error("Nyxus AI devolveu um formato inválido de ocorrência.");
            }

            return incidente;
        }
    }
};

// Troque aqui pra escolher a fonte: "local" ou "nyxusAI".
let activeSource = "nyxusAI";

async function generateIncident(){
    const source = incidentSources[activeSource];
    try {
        return await source.getNextIncident();
    } catch (err) {
        console.error(`Falha na fonte "${activeSource}", usando gerador local como fallback.`, err);
        return generateLocalIncident();
    }
}

// ===================== ESTADO =====================

let current = null;

let investigated = { logs: false, geo: false, reputation: false, confirmed: false, accessed: false, recovered: false };

let timeLeft = 0;
let timerInterval = null;
let waitingTimeout = null;
let stats = { resolved: 0, penalty: 0 };
const ipHistory = [];

// ===================== REFERÊNCIAS DOM =====================

const terminalOutput = document.getElementById("terminalOutput");
const terminalInput = document.getElementById("terminalInput");
const ipInfoBox = document.getElementById("ipInfoBox");
const browserContent = document.getElementById("browserContent");
const browserUrl = document.getElementById("browserUrl");

const incidentPriorityEl = document.getElementById("incidentPriority");
const incidentTimerEl = document.getElementById("incidentTimer");
const incidentTitleEl = document.getElementById("incidentTitle");
const incidentDescriptionEl = document.getElementById("incidentDescription");
const checkLogsEl = document.getElementById("checkLogs");
const checklistEl = document.querySelector(".checklist");
const checkWhoisEl = document.getElementById("checkWhois");

const resolvedCountEl = document.getElementById("resolvedCount");
const penaltyCountEl = document.getElementById("penaltyCount");
const difficultyLabelEl = document.getElementById("difficultyLabel");

const startScreen = document.getElementById("startScreen");
const playerNameInput = document.getElementById("playerNameInput");
const difficultyOptions = document.getElementById("difficultyOptions");
const startButton = document.getElementById("startButton");

const bossOverlay = document.getElementById("bossOverlay");
const bossMessageBody = document.getElementById("bossMessageBody");
const bossAckButton = document.getElementById("bossAckButton");

// ===================== TERMINAL: UTIL =====================

function print(text, cls){
    const line = document.createElement("div");
    if (cls) line.className = cls;
    line.textContent = text;
    terminalOutput.appendChild(line);
    terminalOutput.scrollTop = terminalOutput.scrollHeight;
}

terminalInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter"){
        const value = terminalInput.value;
        terminalInput.value = "";
        handleCommand(value);
    }
});

// ===================== TERMINAL: PARSER DE COMANDOS =====================

function handleCommand(raw){
    const input = raw.trim();
    if (!input) return;

    print("> " + input, "cmd-echo");
    const lower = input.toLowerCase();

    if (/^help$/.test(lower)){
        print("Comandos disponíveis no terminal:");
        print("  check logs");
        print("  scan <ip>");
        print("  connect <ip>       (só em casos de fraude financeira)");
        print("  recover funds      (só depois de 'connect', em fraude financeira)");
        print("  block ip <ip>");
        print("  clear");
        print("Use o navegador para geolocalização (ipinfo.local) e reputação (threatintel.local).");
        print("Use o painel de IP para confirmar o suspeito antes de bloquear.");
        return;
    }

    if (/^clear$/.test(lower)){
        terminalOutput.innerHTML = "";
        return;
    }

    if (!current){
        print("Nenhuma ocorrência ativa no momento. Aguarde o próximo alerta.", "muted-text");
        return;
    }

    if (/(check|show|list)\s+logs?/.test(lower)){
        print("Logs da ocorrência atual:");
        current.logs.forEach(l => print(l, "log-line"));
        investigated.logs = true;
        updateChecklist();
        return;
    }

    const ipMatch = input.match(/\d{1,3}(\.\d{1,3}){3}/);

    if (/whois|reputa|lookup/.test(lower)){
        print("O terminal não faz mais consultas de whois/reputação.", "warn-text");
        print("Use o navegador: ipinfo.local (geolocalização) e threatintel.local (reputação).", "warn-text");
        return;
    }

    if (/^scan/.test(lower)){
        if (!ipMatch){ print("Uso: scan <ip>"); return; }
        print(`Escaneando portas de ${ipMatch[0]}...`);
        print("22/tcp   open   ssh");
        print("80/tcp   open   http");
        print("443/tcp  open   https");
        return;
    }

    if (/^connect/.test(lower)){
        if (!ipMatch){ print("Uso: connect <ip>"); return; }
        handleConnect(ipMatch[0]);
        return;
    }

    if (/^recover\s+funds/.test(lower)){
        handleRecover();
        return;
    }

    if (/block/.test(lower)){
        if (!ipMatch){ print("Uso: block ip <ip>"); return; }
        tryBlock(ipMatch[0]);
        return;
    }

    print("Comando não reconhecido. Digite 'help' para ver as opções.", "warn-text");
}

function handleConnect(ip){
    if (current.special !== "financial"){
        print("Este caso não requer acesso remoto a nenhum dispositivo.", "warn-text");
        return;
    }
    if (ip !== current.ip){
        print(`Não foi possível conectar a ${ip} - nenhuma sessão remota disponível para este endereço.`, "warn-text");
        return;
    }
    if (!(investigated.logs && investigated.geo && investigated.reputation)){
        print("Conexão recusada: confirme que este é o IP correto antes de tentar acessar o dispositivo (verifique logs, geo e reputação primeiro).", "warn-text");
        return;
    }
    print(`Conectando remotamente a ${ip}...`);
    print("Acesso concedido. Dispositivo do invasor comprometido com sucesso.");
    print("Arquivo encontrado: transferencia_pendente.log");
    print(`R$ ${current.stolenAmount.toLocaleString("pt-BR")} transferidos para a conta ${current.destinationAccount}`, "critical-text");
    investigated.accessed = true;
    updateChecklist();
}

function handleRecover(){
    if (!current || current.special !== "financial"){
        print("Nenhuma recuperação de fundos é necessária no momento.", "warn-text");
        return;
    }
    if (!investigated.accessed){
        print("Você precisa acessar o dispositivo do atacante antes de recuperar os fundos (connect <ip>).", "warn-text");
        return;
    }
    print("Iniciando reversão da transferência...");
    print(`R$ ${current.stolenAmount.toLocaleString("pt-BR")} redirecionados de volta para a conta da empresa (${current.legitAccount}).`, "success-text");
    investigated.recovered = true;
    updateChecklist();
}

function tryBlock(ip){
    if (ip !== current.ip){
        print(`ATENÇÃO: ${ip} não corresponde a nenhuma ameaça confirmada. Bloqueio indevido pode causar problemas na operação.`, "warn-text");
        stats.penalty += 5;
        updateStatsBar();
        return;
    }

    const faltando = [];
    if (!investigated.logs) faltando.push("verificar os logs (terminal)");
    if (!investigated.geo) faltando.push("consultar geolocalização (ipinfo.local)");
    if (!investigated.reputation) faltando.push("consultar reputação (threatintel.local)");
    if (!investigated.confirmed) faltando.push("confirmar o IP como suspeito no Painel de IP");

    if (current.special === "financial"){
        if (!investigated.accessed) faltando.push("acessar o dispositivo do atacante (connect <ip>)");
        if (!investigated.recovered) faltando.push("recuperar os fundos (recover funds)");
    }

    if (faltando.length > 0){
        print("Investigação incompleta. Ainda falta: " + faltando.join(", ") + ".", "warn-text");
        return;
    }

    print(`IP ${ip} bloqueado com sucesso. Ocorrência resolvida.`, "success-text");
    resolveIncident();
}

// ===================== PAINEL DE IPs =====================

function registerIP(ip, geo, verdict, isMalicious){
    const existingIndex = ipHistory.findIndex(r => r.ip === ip);
    const record = { ip, geo, verdict, isMalicious, confirmed: false };

    if (existingIndex >= 0){
        record.confirmed = ipHistory[existingIndex].confirmed;
        ipHistory[existingIndex] = record;
    } else {
        ipHistory.unshift(record);
    }

    renderIPPanel();
}

function renderIPPanel(){
    if (ipHistory.length === 0){
        ipInfoBox.innerHTML = `<p class="muted">Nenhum IP consultado ainda.</p>`;
        return;
    }

    ipInfoBox.innerHTML = ipHistory.map((r) => {
        const canConfirm = current && r.ip === current.ip && !r.confirmed;

        return `
        <div class="ip-record">
            <div class="ip-title">${r.ip}</div>
            <div>País: ${r.geo.country}</div>
            <div>Organização: ${r.geo.org}</div>
            <div class="${r.isMalicious ? "verdict-malicious" : "verdict-clean"}">${r.verdict}</div>
            ${r.confirmed
                ? `<div class="confirmed-tag">✔ Confirmado como suspeito</div>`
                : canConfirm
                    ? `<button class="confirm-btn" onclick="confirmSuspect('${r.ip}')">Confirmar como suspeito</button>`
                    : ""}
        </div>`;
    }).join("");
}

function confirmSuspect(ip){
    const record = ipHistory.find(r => r.ip === ip);
    if (!record) return;

    record.confirmed = true;

    if (current && ip === current.ip){
        investigated.confirmed = true;
        updateChecklist();
        print(`IP ${ip} confirmado como suspeito no Painel de IP.`, "success-text");
    }

    renderIPPanel();
}

// ===================== OCORRÊNCIAS / TIMER =====================

async function loadIncident(){
    print("Buscando nova ocorrência...", "muted-text");
    current = await generateIncident();

    // Dificuldade escolhida afeta o tempo disponível, não muda o nível
    // de gravidade mostrado (isso continua vindo direto da ocorrência).
    const mult = DIFFICULTY_SETTINGS[difficulty].timeMult;
    current.timeLimit = Math.max(30, Math.round(current.timeLimit * mult));
    current.steps = buildSteps(current);

    investigated = { logs: false, geo: false, reputation: false, confirmed: false, accessed: false, recovered: false };
    renderIncidentPanel();
    renderChecklistExtras();
    renderIPPanel();
    startTimer();
    print(`Nova ocorrência recebida: "${current.title}" (${current.priority})`, "warn-text");
    showBossMessage(current);
}

function showBossMessage(incident){
    const mm = String(Math.floor(incident.timeLimit / 60)).padStart(2, "0");
    const ss = String(incident.timeLimit % 60).padStart(2, "0");

    bossMessageBody.innerHTML = `
        <p>Oi <strong>${playerName}</strong>! Temos uma ocorrência aqui pra você:</p>
        <div class="boss-priority ${incident.priority}">${incident.priority}</div>
        <p><strong>${incident.title}</strong></p>
        <p>${incident.description}</p>
        <p>Faz o seguinte:</p>
        <ul>${incident.steps.map(s => `<li>${s}</li>`).join("")}</ul>
        <p>Você tem <strong>${mm}:${ss}</strong> pra resolver. Bora?</p>
    `;
    bossOverlay.classList.remove("hidden");
}

function renderIncidentPanel(){
    incidentPriorityEl.textContent = current.priority;
    incidentPriorityEl.className = "priority-badge " + current.priority;
    incidentTitleEl.textContent = current.title;
    incidentDescriptionEl.textContent = current.description;
    updateChecklist();
}

function renderChecklistExtras(){
    const oldAccess = document.getElementById("checkAccess");
    const oldRecover = document.getElementById("checkRecover");
    if (oldAccess) oldAccess.remove();
    if (oldRecover) oldRecover.remove();

    if (current && current.special === "financial"){
        const liAccess = document.createElement("li");
        liAccess.id = "checkAccess";
        checklistEl.appendChild(liAccess);

        const liRecover = document.createElement("li");
        liRecover.id = "checkRecover";
        checklistEl.appendChild(liRecover);
    }

    updateChecklist();
}

function updateChecklist(){
    checkLogsEl.textContent = (investigated.logs ? "☑ " : "☐ ") + "Logs verificados (Terminal)";
    checkLogsEl.className = investigated.logs ? "done" : "";

    const navegadorOk = investigated.geo && investigated.reputation;
    checkWhoisEl.textContent = (navegadorOk ? "☑ " : "☐ ") + "Geo + Reputação verificados (Navegador)";
    checkWhoisEl.className = navegadorOk ? "done" : "";

    const accessEl = document.getElementById("checkAccess");
    if (accessEl){
        accessEl.textContent = (investigated.accessed ? "☑ " : "☐ ") + "Dispositivo do atacante acessado (connect <ip>)";
        accessEl.className = investigated.accessed ? "done" : "";
    }

    const recoverEl = document.getElementById("checkRecover");
    if (recoverEl){
        recoverEl.textContent = (investigated.recovered ? "☑ " : "☐ ") + "Fundos recuperados (recover funds)";
        recoverEl.className = investigated.recovered ? "done" : "";
    }
}

function startTimer(){
    clearInterval(timerInterval);
    timeLeft = current.timeLimit;
    updateTimerDisplay();

    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();
        if (timeLeft <= 0){
            clearInterval(timerInterval);
            escalate();
        }
    }, 1000);
}

function updateTimerDisplay(){
    const mm = String(Math.floor(timeLeft / 60)).padStart(2, "0");
    const ss = String(timeLeft % 60).padStart(2, "0");
    incidentTimerEl.textContent = `${mm}:${ss}`;
    incidentTimerEl.classList.toggle("low-time", timeLeft <= 20);
}

function escalate(){
    print(`⏰ Tempo esgotado! A ocorrência "${current.title}" escalou para o próximo turno.`, "warn-text");
    stats.penalty += 10;
    updateStatsBar();
    goToWaitingState();
}

function resolveIncident(){
    clearInterval(timerInterval);
    stats.resolved += 1;
    updateStatsBar();
    goToWaitingState();
}

function goToWaitingState(){
    current = null;
    clearInterval(timerInterval);

    incidentTitleEl.textContent = "-";
    incidentDescriptionEl.textContent = "Aguardando novo alerta...";
    incidentPriorityEl.textContent = "-";
    incidentPriorityEl.className = "priority-badge";
    incidentTimerEl.textContent = "--:--";
    incidentTimerEl.classList.remove("low-time");

    renderChecklistExtras();

    const [min, max] = gapBetweenIncidents;
    const gap = Math.max(3, Math.round(randomInRange(min, max) * DIFFICULTY_SETTINGS[difficulty].gapMult));

    print(`Nenhuma ocorrência ativa no momento. Próximo alerta em aproximadamente ${gap}s.`, "muted-text");

    clearTimeout(waitingTimeout);
    waitingTimeout = setTimeout(() => {
        loadIncident();
    }, gap * 1000);
}

function updateStatsBar(){
    resolvedCountEl.textContent = stats.resolved;
    penaltyCountEl.textContent = stats.penalty;
}

// ===================== NAVEGADOR SIMULADO =====================

function goToUrl(){
    navigate(browserUrl.value);
}

function navigate(url){
    browserUrl.value = url;
    const u = url.toLowerCase();

    if (u.includes("ipinfo")) renderIPInfoPage();
    else if (u.includes("threatintel")) renderThreatIntelPage();
    else if (u.includes("wiki") || u.includes("runbook")) renderWikiPage();
    else browserContent.innerHTML = `<p>Site não encontrado (simulado). Tente ipinfo.local, threatintel.local ou wiki.local/runbook.</p>`;
}

function renderIPInfoPage(){
    browserContent.innerHTML = `
        <h3>ipinfo.local</h3>
        <p>Consulta de geolocalização e organização de IP.</p>
        <input type="text" id="ipInfoInput" placeholder="Digite um IP">
        <button id="ipInfoBtn">Consultar</button>
        <div id="ipInfoResult" style="margin-top:12px;"></div>
    `;

    document.getElementById("ipInfoBtn").addEventListener("click", () => {
        const ip = document.getElementById("ipInfoInput").value.trim();
        const resultBox = document.getElementById("ipInfoResult");
        if (!ip){ resultBox.textContent = "Digite um IP válido."; return; }

        if (current && ip === current.ip){
            resultBox.innerHTML = `
                <p><strong>País:</strong> ${current.geo.country}</p>
                <p><strong>Organização:</strong> ${current.geo.org}</p>
            `;
            investigated.geo = true;
            const existing = ipHistory.find(r => r.ip === ip);
            registerIP(ip, current.geo, existing ? existing.verdict : "AGUARDANDO", existing ? existing.isMalicious : false);
            updateChecklist();
        } else {
            resultBox.innerHTML = `<p>Sem registros relevantes de localização para este IP.</p>`;
            registerIP(ip, { country: "Desconhecido", org: "-", city: "-" }, "AGUARDANDO", false);
        }
    });
}

function renderThreatIntelPage(){
    browserContent.innerHTML = `
        <h3>threatintel.local</h3>
        <p>Verificação de reputação de IP em base de ameaças.</p>
        <input type="text" id="threatInput" placeholder="Digite um IP">
        <button id="threatBtn">Verificar</button>
        <div id="threatResult" style="margin-top:12px;"></div>
    `;

    document.getElementById("threatBtn").addEventListener("click", () => {
        const ip = document.getElementById("threatInput").value.trim();
        const resultBox = document.getElementById("threatResult");
        if (!ip){ resultBox.textContent = "Digite um IP válido."; return; }

        if (current && ip === current.ip){
            resultBox.innerHTML = `<p style="color:#f85149; font-weight:bold;">${current.verdict}</p>`;
            investigated.reputation = true;
            const existing = ipHistory.find(r => r.ip === ip);
            registerIP(ip, existing ? existing.geo : { country: "Desconhecido", org: "-", city: "-" }, current.verdict, true);
            updateChecklist();
        } else {
            resultBox.innerHTML = `<p style="color:#3fb950; font-weight:bold;">LIMPO - Nenhuma ameaça associada</p>`;
            const existing = ipHistory.find(r => r.ip === ip);
            registerIP(ip, existing ? existing.geo : { country: "Desconhecido", org: "-", city: "-" }, "LIMPO", false);
        }
    });
}

function renderWikiPage(){
    browserContent.innerHTML = `
        <h3>wiki.local/runbook</h3>
        <p><strong>Procedimento padrão para ocorrências:</strong></p>
        <ol>
            <li>Verifique os logs no <strong>Terminal</strong> (<code>check logs</code>)</li>
            <li>Consulte a geolocalização em <strong>ipinfo.local</strong></li>
            <li>Consulte a reputação em <strong>threatintel.local</strong></li>
            <li>Confirme o IP como suspeito no <strong>Painel de IP</strong></li>
            <li>Em casos de fraude financeira: acesse o dispositivo (<code>connect &lt;ip&gt;</code>) e recupere os fundos (<code>recover funds</code>)</li>
            <li>Bloqueie o IP correto (<code>block ip &lt;ip&gt;</code>) no terminal</li>
            <li>Atenção: bloquear o IP errado gera penalidade</li>
        </ol>
    `;
}

// ===================== TELA INICIAL =====================

difficultyOptions.querySelectorAll(".difficulty-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        difficultyOptions.querySelectorAll(".difficulty-btn").forEach(b => b.classList.remove("selected"));
        btn.classList.add("selected");
        difficulty = btn.dataset.diff;
    });
});

startButton.addEventListener("click", () => {
    const nome = playerNameInput.value.trim();
    if (!nome){
        playerNameInput.focus();
        playerNameInput.placeholder = "Digite seu nome pra continuar";
        return;
    }
    playerName = nome;
    difficultyLabelEl.textContent = `Dificuldade: ${DIFFICULTY_SETTINGS[difficulty].label}`;
    startScreen.classList.add("hidden");
    init();
});

playerNameInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") startButton.click();
});

bossAckButton.addEventListener("click", () => {
    bossOverlay.classList.add("hidden");
});

// ===================== INICIALIZAÇÃO =====================

async function init(){
    print(`Sistema iniciado. Bem-vindo(a), ${playerName}. Digite 'help' para ver os comandos.`, "success-text");
    updateStatsBar();
    await loadIncident();
}