const MODEL_URL = "https://lynxia-server.onrender.com/chat";
const DEFAULT_LAT = 36.75; 
const DEFAULT_LON = 3.06;

async function getWeather(city = "Alger") {
  try {
    const normalize = str => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    city = normalize(city);

    const cities = {
      alger: { lat: 36.75, lon: 3.06 },
      oran: { lat: 35.7, lon: -0.63 },
      constantine: { lat: 36.36, lon: 6.61 },
      bejaia: { lat: 36.75, lon: 5.07 },
      tlemcen: { lat: 34.88, lon: -1.32 },
      annaba: { lat: 36.9, lon: 7.76 },
      setif: { lat: 36.19, lon: 5.41 }
    };

    const key = normalize(city).toLowerCase();
    const { lat, lon } = cities[key] || { lat: DEFAULT_LAT, lon: DEFAULT_LON };

    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`
    );
    const data = await res.json();

    const temp = data.current_weather.temperature;
    const vent = data.current_weather.windspeed;
    return `🌤️ La température actuelle à ${city} est de ${temp}°C avec un vent de ${vent} km/h.`;
  } catch {
    return `⚠️ Impossible d'obtenir la météo pour ${city}.`;
  }
}

async function getAIReply(prompt) {
  try {
    const lower = prompt.toLowerCase();
    const normalize = str => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    if (normalize(lower).includes("qui a participe") || lower.includes("participants"))
      return "Les participants au projet sont: Houssem, Nacuer, Younes et Hafid.";

    if (normalize(lower).includes("meteo") || normalize(lower).includes("temps")) {
      const parts = lower.split(" ");
      const city = parts.length > 1 ? parts.slice(1).join(" ") : "Alger";
      return await getWeather(city);
    }

    if (normalize(lower).includes("heure") || normalize(lower).includes("temps actuel")) {
      const now = new Date();
      return `🕒 Il est actuellement ${now.getHours()}h${now.getMinutes().toString().padStart(2, "0")}.`;
    }

    const res = await fetch(MODEL_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt })
    });

    if (!res.ok) return "⚠️ Le serveur n'a pas répondu correctement.";
    const data = await res.json();

    if (data.reply) return data.reply;
    if (data.choices && data.choices[0]?.message?.content) return data.choices[0].message.content;
    return "❌ Le modèle n'a pas renvoyé de texte.";
  } catch {
    return "⚠️ Erreur de connexion ou de format.";
  }
}

async function chat() {
  const input = document.getElementById("chat-input");
  const chatLog = document.getElementById("chat-body");
  const userInput = input.value.trim();
  if (!userInput) return;

  chatLog.innerHTML += `<p><b>Vous:</b> ${userInput}</p>`;
  input.value = "";

  const thinking = document.createElement("p");
  thinking.id = "thinking";
  thinking.innerHTML = "<i>🤖 Le modèle réfléchit...</i>";
  chatLog.appendChild(thinking);
  chatLog.scrollTop = chatLog.scrollHeight;

  const reply = await getAIReply(userInput);

  const thinkingElem = document.getElementById("thinking");
  if (thinkingElem) thinkingElem.remove();

  chatLog.innerHTML += `<p><b>Bot:</b> ${reply}</p>`;
  chatLog.scrollTop = chatLog.scrollHeight;
}

document.getElementById("send").addEventListener("click", chat);
document.getElementById("chat-input").addEventListener("keypress", e => { 
  if (e.key === "Enter") chat(); 
});
