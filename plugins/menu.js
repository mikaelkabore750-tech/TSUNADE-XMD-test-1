const { cmd, commands } = require('../command');
const config = require('../config');
const os = require('os');
const moment = require('moment');

cmd({
    'pattern': 'menu',
    'alias': ['getmenu'],
    'react': '👾',
    'desc': 'Get bot command list',
    'category': 'main',
    'filename': __filename
}, async (m, sock, msg, { from, pushname, sender, reply }) => {
    try {
        // Calcul du uptime
        const uptime = moment.duration(process.uptime() * 1000).humanize();
        
        // Calcul de la mémoire
        const totalRam = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2) + ' GB';
        const usedRam = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2) + ' MB';
        
        // Récupération du propriétaire
        const owner = config.OWNER_NUMBER || 'Unknown';
        const username = pushname || sender.split('@')[0];

        // Organisation des commandes par catégorie
        let commandCategories = {
            'main': '',
            'download': '',
            'group': '',
            'owner': '',
            'convert': '',
            'search': ''
        };

        // Parcours des commandes disponibles
        for (let i = 0; i < commands.length; i++) {
            const command = commands[i];
            if (command.category && !command.dontAddCommandList) {
                const commandLine = '▍     ▪️ ' + config.PREFIX + command.pattern + '\n';
                if (commandCategories[command.category]) {
                    commandCategories[command.category] += commandLine;
                }
            }
        }

        // Construction du message de menu
        const menuCaption = `
*🥷🏼Wᴇʟᴄᴏᴍᴇ Tᴏ 𝗧𝗦𝗨𝗡𝗔𝗗𝗘 𝗫𝗠𝗗 💞*

◤▬▬《 📱𝗦𝗧𝗔𝗧𝗨𝗦 𝗗𝗘𝗧𝗔𝗜𝗟𝗦 》▬▬◥
▍ 👾  *Bot*     : 𝗧𝗦𝗨𝗡𝗔𝗗𝗘 𝗫𝗠𝗗
▍ 👾  *User*    : ${username} / ${username}
▍ 💻  *Owner*   : MIKAEL SPNSR
▍ 👾  *Uptime*  : ${uptime}
▍ 👾  *RAM*     : ${usedRam} / ${totalRam}
▍ 👾  *Prefix*  : ${config.PREFIX}
◣▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬◢

◤▬▬▬▬▬⟮MENU-TECH-001⟯▬▬▬▬▬▬◥
▍ 🦠  *𝗣𝗨𝗕𝗟𝗜𝗖-𝗠𝗘𝗡𝗨*
▍  ⧉.alive
▍  ⧉.menu
▍  ⧉.ai <text>
▍  ⧉.dev
▍  ⧉.about
▍
▍ 🦠  *𝗠𝗘𝗗𝗜𝗔-𝗠𝗘𝗡𝗨*
▍  ⧉.song <text>
▍  ⧉.video <text>
▍  ⧉.fb <link>
▍  ⧉.tiktok <link>
▍  ⧉.dvideo <url>
▍
▍ 🦠  *𝗢𝗪𝗡𝗘𝗥-𝗠𝗘𝗡𝗨*
▍  ⧉.block
▍  ⧉.join
▍  ⧉.add
▍  ⧉.kick
▍  ⧉.left
▍  ⧉.mute
▍  ⧉.unmute
▍  ⧉.add
▍  ⧉.demote
▍  ⧉.pomote
▍  ⧉.shutdown
▍  ⧉.gjid
▍  ⧉.jid
▍  ⧉.broadcast
▍  ⧉.clearchats
▍  ⧉.getdp
▍  ⧉.update
▍  ⧉.settings
▍  ⧉.groupinfo
▍  ⧉.gmdp
▍
▍
▍  🦠 *𝗖𝗔𝗣𝗧𝗜𝗢𝗡-𝗠𝗘𝗡𝗨*
▍  ⧉.joke
▍  ⧉.fact
▍  ⧉.flirt
▍  ⧉.truth
▍  ⧉.dare
▍  ⧉.pickupline
▍  ⧉.char
▍  ⧉.spam
▍  ⧉.rm
▍
▍  🦠 *𝗢𝗧𝗔𝗞𝗨-𝗠𝗘𝗡𝗨*
▍  ⧉.loli
▍  ⧉.anime
▍  ⧉.animegirl
▍
▍  🦠 *𝗣𝗜𝗖𝗧𝗨𝗥𝗘-𝗠𝗘𝗡𝗨*
▍  ⧉.play2
▍  ⧉.drama
▍  ⧉.movie 
▍  ⧉.dog
▍  ⧉.save 
▍
▍ 🦠  *𝗦𝗬𝗦𝗧𝗘𝗠𝗘-𝗠𝗘𝗡𝗨*
▍  ⧉.sticker <reply img>
▍  ⧉.img <reply sticker>
▍  ⧉.tr <lang> <text>
▍  ⧉.tts <text>
▍  ⧉.fluxai <pomt>
▍  ⧉.gf <what you ask>
▍
▍ 💞  *ɪ  ᴀᴍ ᴛsᴜɴᴀᴅᴇ  xᴍᴅ ᴠ1.0*
▍     [reply save with statuse save text]
▍
◣▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬◢

⟥  *POWERED BY 𝗠𝗜𝗞𝗔𝗘𝗟 𝗦𝗣𝗡𝗥𝗦*  ⟤
`;

        // Envoi du menu avec image
        await sock.sendMessage(from, {
            'image': { 'url': 'https://files.catbox.moe/lekd2l.jpg' },
            'caption': menuCaption
        }, { 'quoted': msg });

    } catch (error) {
        console.error(error);
        reply('❌ Menu error:\n' + error.message);
    }
});