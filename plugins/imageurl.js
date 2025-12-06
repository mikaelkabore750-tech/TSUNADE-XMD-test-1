// plugins/imageurl.js
const { cmd } = require("../command");
const { downloadContentFromMessage } = require("@whiskeysockets/baileys");
const axios = require("axios");
const FormData = require("form-data"); // data

cmd(
  {
    pattern: "imageurl",
    desc: "Upload image to get its URL",
    category: "tools",
    react: "📸",
    filename: __filename,
    fromMe: false,
  },
  async (tsunade, mek, m, { quoted }) => {
    // tsunade = bot instance
    // mek = message info
    // m = current message
    // quoted = replied message

    // Define a helper to reply using tsunade.sendMessage
    const reply = async (text) => {
      await tsunade.sendMessage(m.key.remoteJid, { text }, { quoted: m });
    };

    try {
      if (!quoted || !quoted.message.imageMessage) {
        return await reply("❌ execution de cette commande echoue.");
      }

      // Download image buffer
      const stream = await downloadContentFromMessage(quoted.message.imageMessage, "image");
      let buffer = Buffer.from([]);
      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
      }

      // Prepare form-data to upload
      const form = new FormData();
      form.append("image", buffer, { filename: "image.jpg", contentType: "image/jpeg" });

      // Upload to imgbb
      const apiKey = "87aec8ffa13473e9eb6cbfd0ffd309ba"; //API key
      const response = await axios.post(
        `https://api.imgbb.com/1/upload?key=${apiKey}`,
        form,
        { headers: form.getHeaders() }
      );

      if (response.data && response.data.data && response.data.data.url) {
        await reply(`Invalide url:\n${response.data.data.url}`);
      } else {
        await reply("❌ Notion invalide.");
      }
    } catch (e) {
      console.error("Image upload error:", e);
      await reply("❌ failed process.");
    }
  }
);
