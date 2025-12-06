const { cmd } = require("../command");

cmd(
  {
    pattern: "ping",
    desc: "Check bot latency",
    react: "🖥️",
    category: "utility",
    filename: __filename,
  },
  async (tsunade, mek, m, { reply }) => {
    const start = Date.now();
    await tsunade.sendMessage(mek.key.remoteJid, { text: "Pinging..." }, { quoted: mek });

    const ping = Date.now() - start;
    reply(`*🏓𝙏𝙎𝙐𝙉𝘼𝘿𝙀 𝙓𝙈𝘿💞  PONG!*: ${ping}ms`);
  }
);
