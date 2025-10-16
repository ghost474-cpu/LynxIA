// رابط السيرفر على Render
const MODEL_URL = "https://lynxia-server.onrender.com//chat";
const WEATHER_API = "https://api.open-meteo.com/v1/forecast?latitude=36.75&longitude=3.06&current_weather=true"; // Alger par défaut

async function getAIReply(prompt) {
  try {
    // 🔹 بعض الإجابات المبرمجة يدويًا
    const lower = prompt.toLowerCase();

    if (lower.includes("qui a participe dans le projet") || lower.includes("participants")) {
      return "Les participants au projet sont: Houssem, Nacuer, Younes et Hafid.";
    }

    // 🔹 سؤال عن الطقس
    if (lower.includes("météo") || lower.includes("temps")) {
      const meteoRes = await fetch(WEATHER_API);
      const meteoData = await meteoRes.json();
      const temp = meteoData.current_weather.temperature;
      const vent = meteoData.current_weather.windspeed;
      return `🌤️ La température actuelle à Alger est de ${temp}°C avec un vent de ${vent} km/h.`;
    }

    // 🔹 سؤال عن الساعة
    if (lower.includes("heure") || lower.includes("temps actuel")) {
      const now = new Date();
      return `🕒 Il est actuellement ${now.getHours()}h${now.getMinutes().toString().padStart(2, "0")}.`;
    }

    // 🔹 الآن نرسل الطلب إلى السيرفر (بدون مفتاح API في المتصفح!)
    const res = await fetch(MODEL_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ prompt })
    });

    if (!res.ok) {
      console.error("Erreur serveur:", res.status);
      return "⚠️ Le serveur n'a pas répondu correctement.";
    }

    const data = await res.json();
    console.log("Réponse du serveur:", data);

    // 🔹 نتوقع من السيرفر أن يعيد { reply: "..." }
    if (data.reply) return data.reply;

    // 🔹 إذا أعاد شكل مختلف، نحاول استخراجه
    if (data.choices && data.choices[0]?.message?.content) {
      return data.choices[0].message.content;
    }

    return "❌ Le modèle n'a pas renvoyé de texte.";
  } catch (e) {
    console.error("Erreur:", e);
    return "⚠️ Erreur de connexion ou de format.";
  }
}

// 🧠 دالة المحادثة
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

// ⚙️ الأحداث
document.getElementById("send").addEventListener("click", chat);
document.getElementById("chat-input").addEventListener("keypress", e => { 
  if (e.key === "Enter") chat(); 
});







