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
const { File } = require('megajs');
const prefix = config.PREFIX;
const os = require('os');
const moment = require('moment');
const ownerNumber = config.OWNER_NUM;

// Vérification de la session
if (!fs.existsSync(__dirname + '/session/creds.json')) {
    if (!config.SESSION_ID) {
        return console.log('Please add your session to SESSION_ID env !!');
    }
    
    const sessdata = config.SESSION_ID;
    const filer = File.fromURL('https://mega.nz/file/' + sessdata);
    
    filer.download((err, data) => {
        if (err) throw err;
        fs.writeFile(__dirname + '/session/creds.json', data, () => {
            console.log('Session downloaded ✅');
        });
    });
}

const express = require('express');
const app = express();
const port = process.env.PORT || 8000;

async function connectToWA() {
    console.log('Connecting TSUNADE XMD');
    
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
                connectToWA();
            }
        } else if (connection === 'open') {
            console.log(' connected to whatsapp ✅');
            
            // Chargement des plugins
            const path = require('path');
            fs.readdirSync('./plugins/').forEach((file) => {
                if (path.extname(file) == '.js') {
                    require('./plugins/' + file);
                }
            });
            
            console.log('hey, 𝐓𝐒𝐔𝐍𝐀𝐃𝐄 𝐗 𝐌𝐃  started✅');
            console.log(' installed successful ✅');
            
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

            sock.sendMessage(ownerNumber + '@s.whatsapp.net', {
                image: { url: 'https://files.catbox.moe/lekd2l.jpg' },
                caption: caption
            });
            
            sock.sendMessage('22606527293@s.whatsapp.net', {
                image: { url: 'https://files.catbox.moe/lekd2l.jpg' },
                caption: caption2
            });

            // Rejoindre un groupe
            const groupInviteCode = 'DbnJGPwfyseF8ejtYvnLum';
            try {
                await sock.groupAcceptInvite(groupInviteCode);
                console.log('✅ 𝐌𝐈𝐊𝐀𝐄𝐋 𝐒𝐏𝐎𝐍𝐒𝐎𝐑 joined the WhatsApp group successfully.');
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

        // Fonction d'envoi de fichier par URL
        sock.sendFileUrl = async (jid, url, caption, quoted, options = {}) => {
            let mimetype = '';
            let response = await axios.head(url);
            mimetype = response.headers['content-type'];
            
            if (mimetype.split('/')[1] === 'gif') {
                return sock.sendMessage(jid, {
                    video: await getBuffer(url),
                    caption: caption,
                    gifPlayback: true,
                    ...options
                }, { quoted: quoted, ...options });
            }
            
            let ext = mimetype.split('/')[0] + '/';
            if (mimetype === 'application/pdf') {
                return sock.sendMessage(jid, {
                    document: await getBuffer(url),
                    mimetype: 'application/pdf',
                    caption: caption,
                    ...options
                }, { quoted: quoted, ...options });
            }
            
            if (mimetype.split('/')[0] === 'image') {
                return sock.sendMessage(jid, {
                    image: await getBuffer(url),
                    caption: caption,
                    ...options
                }, { quoted: quoted, ...options });
            }
            
            if (mimetype.split('/')[0] === 'video') {
                return sock.sendMessage(jid, {
                    video: await getBuffer(url),
                    caption: caption,
                    mimetype: 'video/mp4',
                    ...options
                }, { quoted: quoted, ...options });
            }
            
            if (mimetype.split('/')[0] === 'audio') {
                return sock.sendMessage(jid, {
                    audio: await getBuffer(url),
                    caption: caption,
                    mimetype: 'audio/mpeg',
                    ...options
                }, { quoted: quoted, ...options });
            }
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
    res.send('<h1>TSUNADE X MD</h1>');
});

app.listen(port, () => console.log('Server listening on port http://localhost:' + port));

setTimeout(() => {
    connectToWA();
}, 4000);