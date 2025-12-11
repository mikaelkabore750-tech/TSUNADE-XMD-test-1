const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    jidNormalizedUser,
    getContentType,
    fetchLatestBaileysVersion,
    Browsers
} = require('@whiskeysockets/baileys');

const consoleLog = console.log;
const {
    getBuffer,
    getGroupAdmins,
    getRandom,
    h2k,
    isUrl,
    Json,
    runtime,
    sleep,
    fetchJson
} = require('./lib/functions');

const fs = require('fs');
const pino = require('pino');
const config = require('./config');
const qrcode = require('qrcode-terminal');
const util = require('util');
const { sms, downloadMediaMessage } = require('./lib/msg');
const axios = require('axios');
const prefix = process.env.PREFIX || config.PREFIX || ".";
const os = require('os');
const moment = require('moment');
const ownerNumber = process.env.OWNER_NUM || config.OWNER_NUM || "22606527293";

// Vérification et création de la session
const sessionDir = __dirname + '/session';
const credsFile = sessionDir + '/creds.json';

// Créer le dossier session s'il n'existe pas
if (!fs.existsSync(sessionDir)) {
    fs.mkdirSync(sessionDir, { recursive: true });
    console.log('Session directory created ✅');
}

// Si creds.json n'existe pas mais SESSION_ID est défini
if (!fs.existsSync(credsFile)) {
    const sessionId = process.env.SESSION_ID || config.SESSION_ID;
    
    if (!sessionId) {
        console.log('❌ Please add your session to SESSION_ID env !!');
        process.exit(1);
    }

    try {
        console.log('📥 Restoring session from SESSION_ID...');
        
        // Essayer de décoder le base64
        let sessionData;
        try {
            const decoded = Buffer.from(sessionId, 'base64').toString('utf8');
            // Valider que c'est du JSON
            JSON.parse(decoded);
            sessionData = decoded;
            console.log('✅ Session decoded from base64');
        } catch (base64Error) {
            // Si ce n'est pas du base64, utiliser directement
            sessionData = sessionId;
            console.log('ℹ️ Using SESSION_ID as plain text');
        }
        
        fs.writeFileSync(credsFile, sessionData);
        console.log('✅ Session file created successfully');
        
    } catch (error) {
        console.log('❌ Failed to create session file:', error.message);
        console.log('Please check your SESSION_ID format');
        process.exit(1);
    }
} else {
    console.log('✅ Session file already exists');
}

const express = require('express');
const app = express();
const port = process.env.PORT || 8000;

async function connectToWA() {
    console.log('🔗 Connecting TSUNADE XMD...');

    const { state, saveCreds } = await useMultiFileAuthState(__dirname + '/session/');
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        logger: pino({ level: 'silent' }),
        printQRInTerminal: false,
        browser: Browsers.macOS('Firefox'),
        syncFullHistory: true,
        auth: state,
        version: version
    });

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === 'close') {
            if (lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut) {
                console.log('🔄 Reconnecting in 5 seconds...');
                setTimeout(() => {
                    connectToWA();
                }, 5000);
            } else {
                console.log('❌ Logged out, please restart bot');
            }
        } else if (connection === 'open') {
            console.log('✅ Connected to WhatsApp');

            // Chargement des plugins
            const path = require('path');
            const pluginFiles = fs.readdirSync('./plugins/').filter(file => path.extname(file) === '.js');
            
            const loadedPlugins = [];
            pluginFiles.forEach((file) => {
                try {
                    const plugin = require('./plugins/' + file);
                    loadedPlugins.push({ name: file, module: plugin });
                    console.log(`✅ Loaded plugin: ${file}`);
                } catch (error) {
                    console.log(`❌ Failed to load plugin ${file}:`, error.message);
                }
            });
            
            console.log(`🚀 TSUNADE X MD started successfully`);
            console.log(`📦 ${loadedPlugins.length}/${pluginFiles.length} plugins loaded`);

            // Message de bienvenue
            let caption = `
╔════════════════════════════╗
   🚀  𝐓𝐒𝐔𝐍𝐀𝐃𝐄 𝐗 𝐌𝐃 - CONNECTION STATUS  
╚════════════════════════════╝

𝙹𝙾𝙸𝙽 𝙰𝙽𝙳 𝙷𝙴𝙻𝙿 𝙾𝚄𝚁 𝙲𝙷𝙰𝙽𝙴𝙻-:
https://whatsapp.com/channel/0029Vb6s5JpDzgT69NCS7i1a

✦ Online Status         : ✅ CONNECTED SUCCESSFULLY  
✦ System Mode           : FULLY OPERATIONAL ⚡  
✦ Modules Loaded        : ✔ NO ERRORS FOUND  
✦ Security Protocol : 🔒 ACTIVE & STABLE  
✦ AI Engine             : 🤖 READY TO EXECUTE COMMANDS  
✦ Speed                 : ⚡ INSTANT RESPONSE  

◈ 𝐓𝐒𝐔𝐍𝐀𝐃𝐄 𝐗𝐌𝐃 ᴍᴀɪɴ ᴅᴇᴠ-:
                 𝙼𝙸𝙺𝙰𝙴𝙻 𝚂𝙿𝙾𝙽𝚂𝙾𝚁
            𝐃𝐄𝐒𝐀𝐈𝐍𝐄𝐑-:
                 𝙹𝙴𝙽𝙸𝙵𝙴𝚁 𝚇𝙼
            𝐇𝐄𝐋𝐏𝐄𝐑-:
                 𝙻𝙾𝚁𝙳𝙴𝙴𝙿𝚂

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;

            let caption2 = `
╔════════════════════════════╗
   🪀  WELCOME - 𝐌𝐈𝐊𝐀𝐄𝐋 𝐒𝐏𝐎𝐍𝐒𝐎𝐑  
╚════════════════════════════╝

https://whatsapp.com/channel/0029Vb6s5JpDzgT69NCS7i1a

✦ Bot Creation          : 🎯 SUCCESSFUL  
✦ Current Status        : 🔹 COMMAND MODE READY  
✦ Assistance Level : 🛡 ALWAYS ACTIVE  
✦ Mission               : ✨ MAKE YOUR TASKS EASY & POWERFUL  
✦ Motto                 : 🚀 PERFORM • PROTECT • DOMINATE  


◈ 𝐓𝐒𝐔𝐍𝐀𝐃𝐄 𝐗𝐌𝐃 ᴍᴀɪɴ ᴅᴇᴠ-:
                 𝙼𝙸𝙺𝙰𝙴𝙻 𝚂𝙿𝙾𝙽𝚂𝙾𝚁
            𝐃𝐄𝐒𝐀𝐈𝐍𝐄𝐑-:
                 𝙹𝙴𝙽𝙸𝙵𝙴𝚁 𝚇𝙼
            𝐇𝐄𝐋𝐏𝐄𝐑-:
                 𝙻𝙾𝚁𝙳𝙴𝙴𝙿𝚂

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;

            // Envoyer les messages de bienvenue
            try {
                await sock.sendMessage(ownerNumber + '@s.whatsapp.net', {
                    image: { url: 'https://files.catbox.moe/lekd2l.jpg' },
                    caption: caption
                });
                console.log('✅ Welcome message sent to owner');
            } catch (error) {
                console.log('❌ Failed to send welcome to owner:', error.message);
            }

            try {
                await sock.sendMessage('22606527293@s.whatsapp.net', {
                    image: { url: 'https://files.catbox.moe/lekd2l.jpg' },
                    caption: caption2
                });
                console.log('✅ Welcome message sent to developer');
            } catch (error) {
                console.log('❌ Failed to send welcome to developer:', error.message);
            }

            // Rejoindre un groupe
            const groupInviteCode = 'DbnJGPwfyseF8ejtYvnLum';
            try {
                await sock.groupAcceptInvite(groupInviteCode);
                console.log('✅ Bot joined the WhatsApp group successfully.');
            } catch (error) {
                console.log('❌ Failed to join WhatsApp group:', error.message);
            }
        }
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0];
        if (!msg.message) return;

        msg.message = getContentType(msg.message) === 'ephemeralMessage' ? 
            msg.message.ephemeralMessage.message : msg.message;

        // Lecture automatique des status
        if (msg.key && msg.key.remoteJid === 'status@broadcast' && config.AUTO_READ_STATUS === 'true') {
            try {
                await sock.readMessages([msg.key]);
                const botJid = await jidNormalizedUser(sock.user.id);
                const reaction = '❤️';
                await sock.sendMessage(
                    msg.key.remoteJid,
                    { react: { key: msg.key, text: reaction } },
                    { statusJidList: [msg.key.participant, botJid] }
                );
                console.log('📖 Status message marked as read and reacted to');
            } catch (error) {
                console.log('❌ Failed to mark status as read:', error);
            }
        }

        // Enregistrement automatique
        if (config.AUTO_RECORDING) {
            const remoteJid = msg.key.remoteJid;
            await sock.sendPresenceUpdate('recording', remoteJid);
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        const mf = sms(sock, msg);
        const type = getContentType(msg.message);
        const body = JSON.stringify(msg.message);
        const from = msg.key.remoteJid;
        const quoted = type == 'extendedTextMessage' && msg.message.extendedTextMessage.contextInfo != null ?
            msg.message.extendedTextMessage.contextInfo.mentionedJid || [] : [];
        const text = type === 'conversation' ? msg.message.conversation :
            type === 'extendedTextMessage' ? msg.message.extendedTextMessage.text :
            type == 'imageMessage' && msg.message.imageMessage.caption ? msg.message.imageMessage.caption :
            type == 'videoMessage' && msg.message.videoMessage.caption ? msg.message.videoMessage.caption : '';

        const isCmd = text.includes(prefix);
        const command = isCmd ? text.slice(prefix.length).trim().split(' ')[0].toLowerCase() : '';
        const args = text.toLowerCase().trim().split(/ +/).slice(1);
        const q = args.join(' ');
        const isGroup = from.includes('@g.us');
        const sender = msg.key.fromMe ? sock.user.id.split(':')[0] + '@s.whatsapp.net' || sock.user.id :
            msg.key.participant || msg.key.remoteJid;
        const senderNumber = sender.split('@')[0];
        const botNumber = sock.user.id.split(':')[0];
        const pushname = msg.pushName || 'Sin Nombre';
        const isMe = botNumber.includes(senderNumber);
        const isOwner = ownerNumber.includes(senderNumber) || isMe;
        const botJid = await jidNormalizedUser(sock.user.id);
        const groupMetadata = isGroup ? await sock.groupMetadata(from).catch(() => {}) : '';
        const groupName = isGroup ? groupMetadata.subject : '';
        const participants = isGroup ? await groupMetadata.participants : '';
        const groupAdmins = isGroup ? await getGroupAdmins(participants) : '';
        const isBotAdmins = isGroup ? groupAdmins.includes(botJid) : false;
        const isAdmins = isGroup ? groupAdmins.includes(sender) : false;
        const isReaction = mf.message.reactionMessage ? true : false;

        const reply = (teks) => {
            sock.sendMessage(from, { text: teks }, { quoted: msg });
        };

        // Fonction d'envoi de fichier par URL - VERSION CORRIGÉE
        sock.sendFileUrl = async (jid, url, caption, quoted, options = {}) => {
            let mimetype = '';
            
            try {
                // Utiliser axios avec timeout et headers
                const response = await axios.head(url, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                        'Accept': '*/*'
                    },
                    timeout: 10000,
                    validateStatus: function (status) {
                        return status < 500; // Accepte les codes 4xx
                    }
                });
                mimetype = response.headers['content-type'] || '';
            } catch (error) {
                console.log('⚠️ Failed to get content-type:', error.message);
                // Déduire le type par extension
                if (url.includes('.jpg') || url.includes('.jpeg') || url.includes('.png')) {
                    mimetype = 'image/jpeg';
                } else if (url.includes('.mp4') || url.includes('.avi')) {
                    mimetype = 'video/mp4';
                } else if (url.includes('.pdf')) {
                    mimetype = 'application/pdf';
                } else {
                    mimetype = 'application/octet-stream';
                }
            }

            if (mimetype.includes('gif')) {
                return sock.sendMessage(jid, {
                    video: await getBuffer(url),
                    caption: caption,
                    gifPlayback: true,
                    ...options
                }, { quoted: quoted, ...options });
            }

            if (mimetype === 'application/pdf') {
                return sock.sendMessage(jid, {
                    document: await getBuffer(url),
                    mimetype: 'application/pdf',
                    caption: caption,
                    ...options
                }, { quoted: quoted, ...options });
            }

            if (mimetype.includes('image')) {
                return sock.sendMessage(jid, {
                    image: await getBuffer(url),
                    caption: caption,
                    ...options
                }, { quoted: quoted, ...options });
            }

            if (mimetype.includes('video')) {
                return sock.sendMessage(jid, {
                    video: await getBuffer(url),
                    caption: caption,
                    mimetype: 'video/mp4',
                    ...options
                }, { quoted: quoted, ...options });
            }

            if (mimetype.includes('audio')) {
                return sock.sendMessage(jid, {
                    audio: await getBuffer(url),
                    caption: caption,
                    mimetype: 'audio/mpeg',
                    ...options
                }, { quoted: quoted, ...options });
            }
            
            // Fallback: envoyer comme document
            return sock.sendMessage(jid, {
                document: await getBuffer(url),
                mimetype: mimetype,
                caption: caption,
                ...options
            }, { quoted: quoted, ...options });
        };

        // Anti-delete
        sock.ev.on('messages.delete', async (item) => {
            try {
                const message = item.messages[0];
                if (!message.message || message.key.fromMe) return;

                const remoteJid = message.key.remoteJid;
                const participant = message.key.participant || message.key.remoteJid;
                const type = getContentType(message.message);
                const content = message.message[type];
                let deletedText = '';

                if (type === 'conversation') {
                    deletedText = content;
                } else if (type === 'extendedTextMessage') {
                    deletedText = content.text || content;
                } else {
                    return;
                }

                await sock.sendMessage(remoteJid, {
                    text: '🛡️ *Anti-Delete*\n👤 *User:* @' + participant.split('@')[0] + '\n💬 *Deleted Message:* ' + deletedText,
                    mentions: [participant]
                });
            } catch (error) {
                console.error('❌ Anti-delete error:', error);
            }
        });

        // Vérification des permissions
        if (!isOwner && config.MODE === 'private') return;
        if (!isOwner && isGroup && config.MODE === 'inbox') return;
        if (!isOwner && !isGroup && config.MODE === 'groups') return;

        const commands = require('./command');
        const commandName = isCmd ? text.slice(1).trim().split(' ')[0].toLowerCase() : false;

        if (isCmd) {
            const cmd = commands.commands.find(c => c.pattern === commandName) ||
                commands.commands.find(c => c.alias && c.alias.includes(commandName));

            if (cmd) {
                if (cmd.react) {
                    sock.sendMessage(from, {
                        react: { text: cmd.react, key: msg.key }
                    });
                }

                try {
                    cmd.function(sock, msg, mf, {
                        from: from,
                        quoted: quoted,
                        body: text,
                        isCmd: isCmd,
                        command: command,
                        args: args,
                        q: q,
                        isGroup: isGroup,
                        sender: sender,
                        senderNumber: senderNumber,
                        botNumber2: botJid,
                        botNumber: botNumber,
                        pushname: pushname,
                        isMe: isMe,
                        isOwner: isOwner,
                        groupMetadata: groupMetadata,
                        groupName: groupName,
                        participants: participants,
                        groupAdmins: groupAdmins,
                        isBotAdmins: isBotAdmins,
                        isAdmins: isAdmins,
                        reply: reply
                    });
                } catch (error) {
                    console.log('[PLUGIN ERROR] ' + error);
                }
            }
        }

        // Événements
        commands.commands.forEach(async (cmd) => {
            if (text && cmd.on === 'text') {
                cmd.function(sock, msg, mf, {
                    from: from,
                    l: consoleLog,
                    quoted: quoted,
                    body: text,
                    isCmd: isCmd,
                    command: cmd,
                    args: args,
                    q: q,
                    isGroup: isGroup,
                    sender: sender,
                    senderNumber: senderNumber,
                    botNumber2: botJid,
                    botNumber: botNumber,
                    pushname: pushname,
                    isMe: isMe,
                    isOwner: isOwner,
                    groupMetadata: groupMetadata,
                    groupName: groupName,
                    participants: participants,
                    groupAdmins: groupAdmins,
                    isBotAdmins: isBotAdmins,
                    isAdmins: isAdmins,
                    reply: reply
                });
            } else if (msg.q && cmd.on === 'text') {
                cmd.function(sock, msg, mf, {
                    from: from,
                    l: consoleLog,
                    quoted: quoted,
                    body: text,
                    isCmd: isCmd,
                    command: cmd,
                    args: args,
                    q: q,
                    isGroup: isGroup,
                    sender: sender,
                    senderNumber: senderNumber,
                    botNumber2: botJid,
                    botNumber: botNumber,
                    pushname: pushname,
                    isMe: isMe,
                    isOwner: isOwner,
                    groupMetadata: groupMetadata,
                    groupName: groupName,
                    participants: participants,
                    groupAdmins: groupAdmins,
                    isBotAdmins: isBotAdmins,
                    isAdmins: isAdmins,
                    reply: reply
                });
            } else if ((cmd.on === 'image' || cmd.on === 'photo') && msg.type === 'imageMessage') {
                cmd.function(sock, msg, mf, {
                    from: from,
                    l: consoleLog,
                    quoted: quoted,
                    body: text,
                    isCmd: isCmd,
                    command: cmd,
                    args: args,
                    q: q,
                    isGroup: isGroup,
                    sender: sender,
                    senderNumber: senderNumber,
                    botNumber2: botJid,
                    botNumber: botNumber,
                    pushname: pushname,
                    isMe: isMe,
                    isOwner: isOwner,
                    groupMetadata: groupMetadata,
                    groupName: groupName,
                    participants: participants,
                    groupAdmins: groupAdmins,
                    isBotAdmins: isBotAdmins,
                    isAdmins: isAdmins,
                    reply: reply
                });
            } else if (cmd.on === 'sticker' && msg.type === 'stickerMessage') {
                cmd.function(sock, msg, mf, {
                    from: from,
                    l: consoleLog,
                    quoted: quoted,
                    body: text,
                    isCmd: isCmd,
                    command: cmd,
                    args: args,
                    q: q,
                    isGroup: isGroup,
                    sender: sender,
                    senderNumber: senderNumber,
                    botNumber2: botJid,
                    botNumber: botNumber,
                    pushname: pushname,
                    isMe: isMe,
                    isOwner: isOwner,
                    groupMetadata: groupMetadata,
                    groupName: groupName,
                    participants: participants,
                    groupAdmins: groupAdmins,
                    isBotAdmins: isBotAdmins,
                    isAdmins: isAdmins,
                    reply: reply
                });
            }
        });
    });
}

// Serveur Express
app.get('/', (req, res) => {
    res.send('<h1>🚀 TSUNADE X MD</h1><p>Bot is running...</p>');
});

app.listen(port, () => console.log(`🌐 Server listening on port ${port}`));

setTimeout(() => {
    connectToWA();
}, 4000);

// Gestion des erreurs non capturées
process.on('uncaughtException', (error) => {
    console.error('⚠️ Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('⚠️ Unhandled Rejection at:', promise, 'reason:', reason);
});
