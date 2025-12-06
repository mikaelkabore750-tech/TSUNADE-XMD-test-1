// antidelete.js
let cache = {}; // msg cache

module.exports = {
  name: "antidelete",

  async onMessage(sock, m) {
    try {
      if (!m.message) return;

      let msgId = m.key.id;
      let jid = m.key.remoteJid;

      // text type cache 
      if (m.message.conversation) {
        cache[msgId] = {
          type: "text",
          text: m.message.conversation,
          jid,
          from: m.key.participant || jid,
        };
      }

      // image type save 
      if (m.message.imageMessage) {
        cache[msgId] = {
          type: "image",
          caption: m.message.imageMessage.caption || "",
          jid,
          from: m.key.participant || jid,
        };
      }

      // video type caption 
      if (m.message.videoMessage) {
        cache[msgId] = {
          type: "video",
          caption: m.message.videoMessage.caption || "",
          jid,
          from: m.key.participant || jid,
        };
      }

    } catch (e) {
      console.log("onMessage error:", e);
    }
  },

  async onDelete(sock, deleted) {
    try {
      let msgKey = deleted.key.id;
      let jid = deleted.key.remoteJid;
      let user = (deleted.key.participant || jid).split("@")[0];

      if (!cache[msgKey]) return;

      let original = cache[msgKey];

      if (original.type === "text") {
        await sock.sendMessage(jid, {
          text: `🛑 Anti-Delete!\n👉 @${user} deleted:\n\n${original.text}`,
          mentions: [deleted.key.participant || jid],
        });
      }

      if (original.type === "image") {
        await sock.sendMessage(jid, {
          text: `🛑 Anti-Delete!\n👉 @${user} deleted an *Image* 📷\n\nCaption: ${original.caption}`,
          mentions: [deleted.key.participant || jid],
        });
      }

      if (original.type === "video") {
        await sock.sendMessage(jid, {
          text: `🛑 Anti-Delete!\n👉 @${user} deleted a *Video* 🎥\n\nCaption: ${original.caption}`,
          mentions: [deleted.key.participant || jid],
        });
      }

    } catch (e) {
      console.log("onDelete error:", e);
    }
  }
};
