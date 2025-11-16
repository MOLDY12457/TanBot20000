require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const express = require('express');

// === CONFIG ===
const GITHUB_RAW = "https://raw.githubusercontent.com/MOLDY12457/TanBot20000.games/master";
const UPLOAD_CHANNEL = 'upload-lua';
const DEMANDE_CHANNEL = 'demandes-lua';
// =============

// === CLIENT ===
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});
// =============

// === SITE PING RENDER ===
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  const url = `https://${req.get('host')}`;
  console.log(`PING: ${url}`);
  res.send(`
    <h1 style="color:lime;text-align:center">BOT ONLINE</h1>
    <p><b>URL:</b> ${url}</p>
    <p><b>Repo:</b> <a href="https://github.com/MOLDY12457/TanBot20000.games">GitHub</a></p>
  `);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`SITE ON: https://ton-bot.onrender.com`);
});
// =========================

// === BOT READY ===
client.once('ready', () => {
  console.log(`BOT CONNECTÉ: ${client.user.tag}`);
  console.log(`SERVEURS: ${client.guilds.cache.size}`);

  // Enregistre la commande /get
  const cmd = new SlashCommandBuilder()
    .setName('get')
    .setDescription('Télécharge un jeu')
    .addIntegerOption(o => o.setName('appid').setDescription('App ID').setRequired(true));

  client.application.commands.create(cmd)
    .then(() => console.log('/get enregistrée'))
    .catch(e => console.log('ERREUR CMD:', e.message));
});
// ==================

// === /get COMMANDE ===
client.on('interactionCreate', async (i) => {
  if (!i.isChatInputCommand() || i.commandName !== 'get') return;

  const appId = i.options.getInteger('appid');
  const zip = `${appId}.zip`;
  const link = `${GITHUB_RAW}/${zip}`;

  console.log(`/get ${appId} par ${i.user.tag}`);

  await i.deferReply();

  try {
    const res = await fetch(link);
    console.log(`FETCH: ${res.status}`);

    if (!res.ok) throw new Error();

    const embed = new EmbedBuilder()
      .setColor('#00ff00')
      .setTitle(`App ID: ${appId}`)
      .setDescription(`[Télécharger ${zip}](${link})`)
      .setTimestamp();

    await i.editReply({ embeds: [embed] });
  } catch {
    const embed = new EmbedBuilder()
      .setColor('#ff0000')
      .setTitle('Jeu introuvable')
      .setDescription(`\`${zip}\` non trouvé sur GitHub`);

    await i.editReply({ embeds: [embed] });

    const ch = i.guild.channels.cache.find(c => c.name === DEMANDE_CHANNEL);
    if (ch) {
      await ch.send(`@here **Demande**\n> **App ID:** \`${appId}\`\n> **Par:** ${i.user}`);
      console.log(`Demande envoyée dans #${DEMANDE_CHANNEL}`);
    }
  }
});
// =====================

// === ANTI-SPAM MESSAGE (si tu veux garder /get en texte) ===
// Décommente si tu veux /get en message texte
/*
client.on('messageCreate', async (msg) => {
  if (msg.author.bot || !msg.content.startsWith('/get ')) return;
  const appId = msg.content.split(' ')[1];
  if (!appId || !/^\d+$/.test(appId)) return msg.reply('Utilise: `/get 252490`');

  // Simule la commande slash
  client.emit('interactionCreate', {
    isChatInputCommand: () => true,
    commandName: 'get',
    options: { getInteger: () => parseInt(appId) },
    user: msg.author,
    guild: msg.guild,
    deferReply: async () => {},
    editReply: async (data) => await msg.reply(data),
    reply: async (data) => await msg.reply(data)
  });
});
*/
// ========================================================

client.login(process.env.DISCORD_TOKEN).catch(e => {
  console.log('TOKEN INVALIDE:', e.message);
});
