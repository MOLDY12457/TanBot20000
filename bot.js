require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const express = require('express');

console.log('BOT DÉMARRE...');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,  // OBLIGATOIRE
    GatewayIntentBits.MessageContent  // OBLIGATOIRE pour /get
  ]
});

// === REPO ===
const GITHUB_RAW = "https://raw.githubusercontent.com/MOLDY12457/TanBot20000.games/master";
// ============

// === SITE WEB ===
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  const url = `https://${req.get('host')}`;
  console.log(`PAGE : ${url}`);
  res.send(`<h1 style="color:lime">BOT ONLINE</h1><p>URL: ${url}</p>`);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`SITE ON → https://tanbot20000.onrender.com`);
});
// ================

client.once('ready', () => {
  console.log(`BOT CONNECTÉ : ${client.user.tag}`);
  console.log(`SERVEURS : ${client.guilds.cache.size}`);
  console.log(`TEST LIEN : ${GITHUB_RAW}/252490.zip`);

  const cmd = new SlashCommandBuilder()
    .setName('get')
    .setDescription('Télécharge un jeu')
    .addIntegerOption(o => o.setName('appid').setDescription('App ID').setRequired(true));

  client.application.commands.create(cmd)
    .then(() => console.log('/get ENREGISTRÉE'))
    .catch(e => console.log('ERREUR CMD :', e.message));
});

client.on('interactionCreate', async (i) => {
  console.log(`INTERACTION : ${i.user.tag} → ${i.commandName}`);

  if (!i.isChatInputCommand() || i.commandName !== 'get') return;

  const appId = i.options.getInteger('appid');
  const zip = `${appId}.zip`;
  const link = `${GITHUB_RAW}/${zip}`;

  await i.deferReply();

  try {
    const res = await fetch(link);
    console.log(`FETCH ${appId} → ${res.status}`);

    if (!res.ok) throw 0;

    await i.editReply({
      embeds: [new EmbedBuilder()
        .setColor('#00ff00')
        .setTitle(`App ID: ${appId}`)
        .setDescription(`[Télécharger ${zip}](${link})`)
        .setTimestamp()
      ]
    });
  } catch {
    await i.editReply({
      embeds: [new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('Introuvable')
        .setDescription(`\`${zip}\` non trouvé`)
      ]
    });
  }
});

client.login(process.env.DISCORD_TOKEN).catch(e => {
  console.log('TOKEN INVALIDE :', e.message);
});
