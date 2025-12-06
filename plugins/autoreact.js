const config = require("../config");

module.exports = async (tsunade, m) => {
  try {
    if (!config.AUTO_REACT) return;

    if (m.key.fromMe || !m.message) return;

    // Random emoji list
    const emojis = ["❤️", "🔥", "😂", "👍", "🥰", "💯", "😎", "👏", "🙌", "💖"];

    // Pick one emoji randomly
    const emoji = emojis[Math.floor(Math.random() * emojis.length)];

    // Send reaction
    await tsunade.sendMessage(m.chat || m.key.remoteJid, {
      react: {
        text: emoji,
        key: m.key
      }
    });

  } catch (err) {
    console.error("Auto React Error:", err);
  }
};
