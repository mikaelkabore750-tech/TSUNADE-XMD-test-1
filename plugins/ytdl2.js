// plugins/dvideo.js
const { cmd } = require("../command");
const yts = require("yt-search");
const axios = require("axios");

cmd(
  {
    pattern: "dvideo",
    react: "♻️",
    desc: "Download YouTube Video via link",
    category: "download",
    filename: __filename,
  },
  async (tsunade, mek, m, { from, args, reply }) => {
    try {
      const link = args[0];
      if (!link) return reply("*Please provide a YouTube video link.* 🎥❤️");

      // 1) Validate URL
      let url;
      try {
        url = new URL(link).toString();
      } catch {
        return reply("❌ Invalid YouTube link!");
      }

      // 2) Fetch video info
      const searchResult = await yts(url);
      if (!searchResult.videos.length) return reply("❌ No video found for this link!");
      const info = searchResult.videos[0];

      const desc = `
🧩 *𝗧𝗦𝗨𝗡𝗔𝗗𝗘 𝗫𝗠𝗗 DOWNLOADER* 🧩
📌 *Title:* ${info.title}
⏱️ *Uploaded:* ${info.timestamp} (${info.ago} ago)
👀 *Views:* ${info.views}
🔗 *Video URL:* ${info.url}
━━━━━━━━━━━━━━━━━━
*ᵐⁱᵏᵃᵉˡ-ˢᵖⁿʳˢ🦠*
      `.trim();

      await tsunade.sendMessage(
        from,
        { image: { url: info.thumbnail }, caption: desc },
        { quoted: mek }
      );

      // 3) Download video from API
      const downloadVideo = async (videoUrl, quality = "720") => {
        const apiUrl = `https://p.oceansaver.in/ajax/download.php?format=${quality}&url=${encodeURIComponent(
          videoUrl
        )}&api=dfcb6d76f2f6a9894gjkege8a4ab232222`;

        const res = await axios.get(apiUrl);
        if (!res.data.success) throw new Error("Failed to fetch video details.");

        const { id, title } = res.data;
        const progressUrl = `https://p.oceansaver.in/ajax/progress.php?id=${id}`;

        // Poll until download is ready
        while (true) {
          const prog = (await axios.get(progressUrl)).data;
          if (prog.success && prog.progress === 1000) {
            const vid = await axios.get(prog.download_url, { responseType: "arraybuffer" });
            return { buffer: vid.data, title };
          }
          await new Promise((r) => setTimeout(r, 5000));
        }
      };

      // 4) Download & send video
      const { buffer, title } = await downloadVideo(url, "720");
      await tsunade.sendMessage(
        from,
        {
          video: buffer,
          mimetype: "video/mp4",
          caption: `🎥 *${title}*\n\nⒸ ALL RIGHTS RESERVED 𝗧𝗦𝗨𝗡𝗔𝗗𝗘 𝗫𝗠𝗗❤️`,
        },
        { quoted: mek }
      );

      reply("*Thanks for using the bot!* 🎥");
    } catch (e) {
      console.error(e);
      reply(`❌ Error: ${e.message}`);
    }
  }
);
