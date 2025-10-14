const stopwords = [
  "pour", "moi", "toi", "le", "les", "un", "une", "de", "du", "des", 
  "et", "en", "au", "aux", "que", "qui", "sur", "dans", "avec", "ce", "cette",
  "mais", "ou", "par", "il", "elle", "on", "ne", "pas", "la"
];

async function loadData() {
  window.dataset = [];
  try {
    const data = await fetch("conservation.json").then(res => res.json());
    window.dataset = data.dataset || data.intents || [];
  } catch (e) {}
}

function clean(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’]/g, "'")
    .replace(/œ/g, "oe")
    .replace(/æ/g, "ae")
    .replace(/[^a-z0-9' ]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter(word => !stopwords.includes(word))
    .join(" ");
}

function getBotReply(userInput) {
  const cleanedInput = clean(userInput);
  let matches = [];
  window.dataset.forEach(item => {
    const questions = item.question || item.questions || [];
    const answers = item.answer || item.answers || [];
    const qList = Array.isArray(questions) ? questions : [questions];
    const aList = Array.isArray(answers) ? answers : [answers];
    qList.forEach(q => {
      const cq = clean(q);
      if (cleanedInput.includes(cq) || cq.includes(cleanedInput)) {
        matches = matches.concat(aList);
      }
    });
  });
  if (matches.length > 0) return matches[Math.floor(Math.random() * matches.length)];
  return null;
}

function elizaReply(userInput) {
  const cleaned = clean(userInput);
  const reflections = { "je":"vous","moi":"vous","mon":"votre","mes":"vos","tu":"je","toi":"moi","ton":"mon","tes":"mes" };
  const reflected = cleaned.split(" ").map(w => reflections[w] || w).join(" ");
  if(cleaned.includes("je me sens")) return `Pourquoi vous sentez-vous ${reflected.replace("je me sens","").trim()} ?`;
  if(cleaned.includes("je suis")) return `Depuis combien de temps êtes-vous ${reflected.replace("je suis","").trim()} ?`;
  return null;
}

function timeReply(userInput) {
  const text = clean(userInput);
  if(text.includes("heure") || text.includes("temps")) {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2,"0");
    return `Il est actuellement ${hours}h${minutes} ⏰`;
  }
  return null;
}

function calcReply(userInput) {
  try {
    if(/[\d\+\-\*\/\(\)\.]/.test(userInput)) {
      const result = Function(`"use strict"; return (${userInput})`)();
      if(!isNaN(result)) return `Résultat: ${result}`;
    }
  } catch(e) {}
  return null;
}

async function searchDuckDuckGo(query) {
  const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&kl=fr-fr`;
  const res = await fetch(url);
  const data = await res.json();
  return data.AbstractText || null;
}

async function searchWikipedia(query) {
  const url = `https://fr.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  return data.extract || null;
}

async function smartSearch(query) {
  let result = await searchWikipedia(query);
  if (result) return result;
  result = await searchDuckDuckGo(query);
  if (result) return result;
  return "❌ Je n'ai rien trouvé 😅";
}

async function getWeather(city) {
  try {
    const url = `https://wttr.in/${encodeURIComponent(city)}?format=j1`;
    const res = await fetch(url);
    const data = await res.json();
    const current = data.current_condition[0];
    return `🌦️ Météo à ${city}: ${current.temp_C}°C, ${current.weatherDesc[0].value}, humidité ${current.humidity}%`;
  } catch(e) {
    return "❌ Impossible d'obtenir la météo.";
  }
}

async function chat() {
  const input = document.getElementById("chat-input");
  const chatLog = document.getElementById("chat-body");
  const userInput = input.value.trim();
  if (!userInput) return;
  chatLog.innerHTML += `<p><b>Vous:</b> ${userInput}</p>`;
  if (!window.dataset || window.dataset.length === 0) await loadData();
  let reply = calcReply(userInput);
  if(!reply) reply = timeReply(userInput);
  if(!reply) reply = getBotReply(userInput);
  if(!reply) reply = elizaReply(userInput);
  if(!reply && (userInput.toLowerCase().startsWith("chercher ") || userInput.toLowerCase().startsWith("recherche ") || userInput.toLowerCase().startsWith("trouver "))) {
    const query = userInput.replace(/^chercher\s+|^recherche\s+|^trouver\s+/i, "");
    reply = await smartSearch(query);
  }
  if(!reply && (userInput.toLowerCase().includes("meteo") || userInput.toLowerCase().includes("temps a"))) {
    const city = userInput.split(" ").pop();
    reply = await getWeather(city);
  }
  if(!reply) reply = "Je suis un simple robot. Je ne comprends pas le langage naturel. Je me base uniquement sur les données et les correspondances. Je peux calculer et vous donner du temps. Si vous souhaitez quelque chose, écrivez-le directement et je vous répondrai. Pour une recherche efficace sur Wikipédia, vous pouvez utiliser «trouver» ou «chercher» ou «recherche» avec ce que vous voulez directement. Merci de votre compréhension.";
  chatLog.innerHTML += `<p><b>Bot:</b> ${reply}</p>`;
  input.value = "";
  chatLog.scrollTop = chatLog.scrollHeight;
}

document.getElementById("reset").addEventListener("click", () => {
  document.getElementById("chat-body").innerHTML = "";
});
document.getElementById("send").addEventListener("click", chat);
document.getElementById("chat-input").addEventListener("keypress", e => { if(e.key === "Enter") chat(); });
loadData();
