const fs = require("fs");
const { cmd } = require("../command");
const config = require("../config");
const { spawn } = require("child_process");

// Settings mapping
const settingsMap = [
  "AUTO_REPLY",
  "AUTO_VOICE",
  "AUTO_STICKER",
  "ANTI_LINK",
  "ANTI_BAD",
  "AUTO_READ_STATUS",
  "AUTO_REACT"
];

const menuImage = "https://files.catbox.moe/ew4vew.jpg"; // Catbox URL

// Show settings menu
cmd({
  pattern: "settings",
  react: "⚙️",
  desc: "Show and edit settings",
  category: "main",
  filename: __filename
}, async (conn, mek, m, { from, reply }) => {
  try {
    let list = "*⚙️ SETTINGS MENU ⚙️*\n\n";
    settingsMap.forEach((key, index) => {
      list += `${index + 1}. ${key} : ${config[key]}\n`;
    });
    list += "\n👉 Reply with number to toggle ON/OFF";

    await conn.sendMessage(
      from,
      { image: { url: menuImage }, caption: list },
      { quoted: mek }
    );

  } catch (e) {
    console.log(e);
    reply("❌ Error: " + e.message);
  }
});

// Catch replies for toggling
cmd({
  pattern: "settings-reply",
  dontAddCommandList: true,
  filename: __filename
}, async (conn, mek, m, { body, from, reply }) => {
  try {
    if (!/^\d+$/.test(body.trim())) return;
    let num = parseInt(body.trim());
    if (num < 1 || num > settingsMap.length) return reply("❌ Invalid number");

    let key = settingsMap[num - 1];
    let current = config[key];
    let newValue = current === "true" || current === true ? false : true;

    // Read config.js
    let file = fs.readFileSync("./config.js", "utf8");

    // Replace line
    let regex = new RegExp(`${key}:.*`, "g");
    let newLine = `${key}: ${newValue},`;
    file = file.replace(regex, newLine);

    // Save file
    fs.writeFileSync("./config.js", file, "utf8");

    await reply(`✅ ${key} switched to ${newValue}\n♻️ Bot restarting to apply changes...`);

    // Auto restart bot
    spawn("node", ["index.js"], {
      detached: true,
      stdio: "inherit"
    });
    process.exit();

  } catch (e) {
    console.log(e);
    reply("❌ Error: " + e.message);
  }
});
