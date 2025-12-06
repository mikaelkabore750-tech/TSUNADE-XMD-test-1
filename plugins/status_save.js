const { cmd } = require("../command");
const { getRandom } = require('../lib/functions');
const fs = require('fs');

cmd(
{
  on: "body"
},
async (tsunade, mek, m, { from, body }) => {
  if (!m.quoted || !mek || !mek.message || !body) return;

  const data = JSON.stringify(mek.message, null, 2);
  const jsonData = JSON.parse(data);
  const isStatus = jsonData?.extendedTextMessage?.contextInfo?.remoteJid;

  if (!isStatus) return;

  let bdy = body.toLowerCase();
  let keywords = ["stats", "transfer", "active", "store", "sts", "envoi", "stts", "statuts", "donne", "send", "give", "ewpn", "ewapan", "ewanna", "danna", "dpn", "dapan", "ona", "daham", "diym", "dhm", "save", "status", "autos", "auto", "ewm", "ewnn"];
  let kk = keywords.map(word => word.toLowerCase());

  if (kk.includes(bdy)) {
    const caption = `𝗧𝗦𝗨𝗡𝗔𝗗𝗘 𝙓𝙈𝘿  𝙎𝙏𝘼𝙏𝙐𝙎 𝘿𝙊𝙒𝙉𝙇𝙊𝘿𝙀𝙍`;

    if (m.quoted.type === 'imageMessage') {
      let buff = await m.quoted.download();
      return await tsunade.sendMessage(from, {
        image: buff,
        caption
      });

    } else if (m.quoted.type === 'videoMessage') {
      let buff = await m.quoted.download();
      return await tsunade.sendMessage(from, {
        video: buff,
        mimetype: "video/mp4",
        fileName: `${m.id}.mp4`,
        caption
      }, { quoted: mek });

    } else if (m.quoted.type === 'audioMessage') {
      let buff = await m.quoted.download();
      return await tsunade.sendMessage(from, {
        audio: buff,
        mimetype: "audio/mp3",
        ptt: true
      }, { quoted: mek });

    } else if (m.quoted.type === 'extendedTextMessage') {
      await tsunade.sendMessage(from, { text: m.quoted.msg.text });
    }
  }
})
