const MODEL_URL = "https://lynxia-server.onrender.com/chat";
const WEATHER_API = "https://api.open-meteo.com/v1/forecast?latitude=36.75&longitude=3.06&current_weather=true";

async function getAIReply(prompt) {
  try {
    const lower = prompt.toLowerCase();

    if (lower.includes("qui a participe dans le projet") || lower.includes("participants"))
      return "Les participants au projet sont: Houssem, Nacuer, Younes et Hafid.";

    if (lower.includes("météo") || lower.includes("temps")) {
      const meteoRes = await fetch(WEATHER_API);
      const meteoData = await meteoRes.json();
      const temp = meteoData.current_weather.temperature;
      const vent = meteoData.current_weather.windspeed;
      return `🌤️ La température actuelle à Alger est de ${temp}°C avec un vent de ${vent} km/h.`;
    }

    if (lower.includes("heure") || lower.includes("temps actuel")) {
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
  } catch (e) {
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
  thinking.innerHTML = "<i>🤖 Le modèle réfléchit...</i>";
  chatLog.appendChild(thinking);
  chatLog.scrollTop = chatLog.scrollHeight;

  const reply = await getAIReply(userInput);
  thinking.remove();

  chatLog.innerHTML += `<p><b>Bot:</b> ${reply}</p>`;
  chatLog.scrollTop = chatLog.scrollHeight;
}

document.getElementById("send").addEventListener("click", chat);
document.getElementById("chat-input").addEventListener("keypress", e => { 
  if (e.key === "Enter") chat(); 
});
