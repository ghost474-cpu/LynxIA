const API_KEY = "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";
const WEATHER_API = "https://api.open-meteo.com/v1/forecast?latitude=36.75&longitude=3.06&current_weather=true"; // Alger par défaut

async function getAIReply(prompt) {
  try {
    // Vérification spéciale pour certaines questions
    if (prompt.toLowerCase().includes("qui a participe dans le projet") || prompt.toLowerCase().includes("participants")) {
      return "Les participants au projet sont: Houssem, Nacuer, Younes, Hafid.";
    }

    // Si l'utilisateur demande le temps
    if (prompt.toLowerCase().includes("météo") || prompt.toLowerCase().includes("temps")) {
      const meteoRes = await fetch(WEATHER_API);
      const meteoData = await meteoRes.json();
      const temp = meteoData.current_weather.temperature;
      const vent = meteoData.current_weather.windspeed;
      return `🌤️ La température actuelle à Alger est de ${temp}°C avec un vent de ${vent} km/h.`;
    }

    // Si l'utilisateur demande l'heure
    if (prompt.toLowerCase().includes("heure") || prompt.toLowerCase().includes("temps actuel")) {
      const now = new Date();
      return `🕒 Il est actuellement ${now.getHours()}h${now.getMinutes().toString().padStart(2, "0")}.`;
    }

    // Requête vers OpenRouter
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "Tu es un assistant utile et amical parlant français." },
          { role: "user", content: prompt }
        ]
      })
    });

    const data = await res.json();
    console.log("Résultat brut:", data);

    if (data.choices && data.choices[0]?.message?.content) {
      return data.choices[0].message.content;
    } else {
      return "❌ Le modèle n'a pas renvoyé de texte.";
    }
  } catch (e) {
    console.error("Erreur:", e);
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
  chatLog.innerHTML += `<p><i>🤖 Le modèle réfléchit...</i></p>`;
  chatLog.scrollTop = chatLog.scrollHeight;

  const reply = await getAIReply(userInput);
  chatLog.innerHTML += `<p><b>Bot:</b> ${reply}</p>`;
  chatLog.scrollTop = chatLog.scrollHeight;
}

document.getElementById("send").addEventListener("click", chat);
document.getElementById("chat-input").addEventListener("keypress", e => { 
  if (e.key === "Enter") chat(); 
});


