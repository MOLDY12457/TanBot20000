require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const express = require('express');

console.log('🚀 BOT DÉMARRE...');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// === TA REPO ===
const GITHUB_RAW = "https://raw.githubusercontent.com/MOLDY12457/TanBot20000.games/master";
// ===============

// === SITE WEB – URL RECUPÉRÉE ===
const app = express();
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';  // <-- OBLIGATOIRE SUR RENDER

app.get('/', (req, res) => {
  const url = req.protocol + '://' + req.get('host');
  console.log(`🌐 Page accédée : ${url}`);
  res.send(`
    <meta charset="utf-8">
    <title>UnLockedSteam Bot</title>
    <style>body{font-family:Arial;background:#111;color:#0f0;text-align:center;padding:50px;}h1{color:#0f0;}</style>
    <h1>BOT ONLINE</h1>
    <p><b>URL :</b> <a href="${url}">${url}</a></p>
    <p><b>Heure :</b> ${new Date().toLocaleString('fr-FR')}</p>
    <p><b>Repo :</b> <a href="https://github.com/MOLDY12457/TanBot20000.games">GitHub</a></p>
    <hr>
    <p><span style="color:lime">UptimeRobot ping ici toutes les 5 min</span></p>
  `);
});

app.listen(PORT, HOST, () => {
  const url = `https://${process.env.RENDER_EXTERNAL_HOSTNAME || 'ton-bot.onrender.com'}`;
  console.log(`🌐 SITE ON → ${url}`);
});
// =================================

// === BOT ===
client.once('ready', () => {
  console.log(`✅ Bot connecté : ${client.user.tag}`);
  console.log(`🔗 Test : ${GITHUB_RAW}/252490.zip`);

  const command = new SlashCommandBuilder()
    .setName('get')
    .setDescription('Télécharge un jeu')
    .addIntegerOption(o => o.setName('appid').setDescription('App ID').setRequired(true));

  client.application.commands.create(command)
    .then(() => console.log('✅ /get OK'))
    .catch(e => console.log('❌ /get erreur :', e.message));
});

client.on('interactionCreate', async (i) => {
  if (!i.isChatInputCommand() || i.commandName !== 'get') return;

  const appId = i.options.getInteger('appid');
  const zip = `${appId}.zip`;
  const link = `${GITHUB_RAW}/${zip}`;

  console.log(`🎮 /get ${appId}`);

  await i.deferReply();

  try {
    const res = await fetch(link);
    console.log(`📡 ${res.status}`);

    if (!res.ok) throw 0;

    await i.editReply({
      embeds: [new EmbedBuilder()
        .setColor('#00ff00')
        .setTitle(`App ID: ${appId}`)
        .setDescription(`[Télécharger ${zip}](${link})`)
        .setTimestamp()
      ]
    });
    console.log(`✅ Envoyé`);
  } catch {
    await i.editReply({
      embeds: [new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('Introuvable')
        .setDescription(`\`${zip}\` non trouvé`)
        .setTimestamp()
      ]
    });

    const ch = i.guild.channels.cache.find(c => c.name === 'demandes-lua');
    if (ch) await ch.send(`@here Demande : \`${appId}\` par ${i.user}`);
  }
});

client.login(process.env.DISCORD_TOKEN).catch(e => {
  console.log('❌ TOKEN INVALIDE :', e.message);
});
