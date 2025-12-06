const { cmd } = require("../command");
const axios = require("axios");

const PHOTO_API_KEY = "AIzaSyBQOEMXyxxVJvzp1LtRPqinJeOsH6gVi74"; // Photoroom / SD API
const PHOTO_API_URL = "https://api.photoroom.com/v1/edits";

const GEMINI_API_KEY = "AIzaSyB19i1M8R6Ouwy1AP9ASsfLep_DPUAcOP0";

cmd(
  {
    pattern: "askedit",
    alias: ["ae"],
    react: "🤖",
    desc: "Ask Gemini + edit photo in one command",
    category: "ai",
    filename: __filename,
  },
  async (tsunade, mek, m, { from, q, reply }) => {
    try {
      // Check if reply contains image
      if (!mek.message.imageMessage)
        return reply("❌ Please reply to an image with this command!");

      await reply("🖼️ Processing your image and question...");

      // Download image
      const imageBuffer = await tsunade.downloadMediaMessage(mek);

      // 1️⃣ Photo Editing
      const editResponse = await axios.post(
        PHOTO_API_URL,
        {
          image: imageBuffer.toString("base64"),
          edits: {
            removeBackground: true,
            enhance: true,
          },
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${PHOTO_API_KEY}`,
          },
          responseType: "arraybuffer",
        }
      );

      await tsunade.sendMessage(
        from,
        { image: Buffer.from(editResponse.data, "binary") },
        { quoted: mek }
      );

      // 2️⃣ Gemini AI Reply (optional, if text exists)
      if (q) {
        const aiResponse = await axios.post(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
          { contents: [{ parts: [{ text: q }] }] },
          { headers: { "Content-Type": "application/json" } }
        );

        const aiReply =
          aiResponse?.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
          "No response from Gemini.";

        await tsunade.sendMessage(
          from,
          { text: `🤖 Gemini says:\n\n${aiReply}` },
          { quoted: mek }
        );
      }
    } catch (e) {
      console.error("Error:", e.message);
      reply(`❌ Something went wrong:\n${e.message}`);
    }
  }
);
