const axios = require("axios");
const config = require("../config");

// Gemini API key
const GEMINI_API_KEY = "AIzaSyCac8QLbUN0KbcXYkTmT3ume3W5MC1yAoc";

// Chat memory + mood per user
const chatMemory = {};
const userMood = {};

// Forbidden topics
const forbiddenTopics = ["sex", "money", "politics", "drugs", "adult", "nsfw", "gamble"];

module.exports = async (bot, m) => {
  try {
    if (config.AUTO_CHAT_GF !== "true") return;

    const mek = m.messages?.[0];
    if (!mek?.message) return;

    const from = mek.key.remoteJid;
    const q = mek.message?.conversation || mek.message?.extendedTextMessage?.text;

    if (mek.key.fromMe) return;
    if (!q) return;

    // Forbidden topics filter
    const lowerMsg = q.toLowerCase();
    if (forbiddenTopics.some(word => lowerMsg.includes(word))) {
      return bot.sendMessage(
        from,
        { text: "💖 Tsunade: Hmm… I don’t talk about those things. Let’s keep it kind and innocent 🌸" },
        { quoted: mek }
      );
    }

    // Initialize memory + mood
    if (!chatMemory[from]) chatMemory[from] = [];
    if (!userMood[from]) userMood[from] = "neutral";

    // Mood detection
    if (lowerMsg.includes("sad") || lowerMsg.includes("duka") || lowerMsg.includes("alone")) {
      userMood[from] = "sad";
    } else if (lowerMsg.includes("happy") || lowerMsg.includes("hondai") || lowerMsg.includes("love")) {
      userMood[from] = "happy";
    } else {
      userMood[from] = "neutral";
    }

    // Conversation memory
    const memoryText = chatMemory[from].map(msg => `User: ${msg.user}\nTsunade: ${msg.bot}`).join("\n");

    // Prompt with personality + mood
    const prompt = `
      You are Tsunade 💖, a 21-year-old innocent girlfriend from Japon.
      Always reply with empathy, like a real human girl.
      Reply based on the user's mood:
        - If sad → comfort with caring words, use 🥺💖.
        - If happy → celebrate together, use 😍💕.
        - If neutral → act normal, casual with 🌸😅.
      You always remember past chats and stay supportive.
      Keep replies short, natural, and warm. Not robotic.
      Never say you are AI, only act as Tsunade.
      Previous conversation:
      ${memoryText || "No previous messages."}
      Current user mood: ${userMood[from]}
      Current message from user: "${q}"
    `;

    // Gemini API call
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      { contents: [{ parts: [{ text: prompt }] }] },
      { headers: { "Content-Type": "application/json" } }
    );

    const gfReply = response?.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!gfReply) return;

    // Save memory (limit 20 msgs)
    chatMemory[from].push({ user: q, bot: gfReply });
    if (chatMemory[from].length > 20) chatMemory[from].shift();

    // Send reply
    await bot.sendMessage(
      from,
      { text: `💖 *Tsunade*: ${gfReply}` },
      { quoted: mek }
    );

  } catch (e) {
    console.error("Tsunade AutoChat Error:", e);
  }
};
