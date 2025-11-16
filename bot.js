require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const express = require('express');

console.log('🚀 BOT DÉMARRE...');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// === REPO PUBLIQUE ===
const GITHUB_RAW = "https://raw.githubusercontent.com/MOLDY12457/TanBot20000.games/master";
// =====================

// === SITE PING ===
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  console.log('🌐 Page ping accédée');
  res.send(`
    <h1 style="color:lime">BOT ONLINE</h1>
    <p>Heure : ${new Date().toLocaleString('fr-FR')}</p>
    <p>Repo : <a href="https://github.com/MOLDY12457/TanBot20000.games">GitHub</a></p>
  `);
});

app.listen(PORT, () => {
  console.log(`🌐 Site ON → port ${PORT}`);
});
// ==================

client.once('ready', () => {
  console.log(`✅ Bot connecté : ${client.user.tag}`);
  console.log(`📍 Serveur : ${client.guilds.cache.size} serveur(s)`);
  console.log(`🔗 Test lien : ${GITHUB_RAW}/252490.zip`);

  const command = new SlashCommandBuilder()
    .setName('get')
    .setDescription('Télécharge un jeu')
    .addIntegerOption(option =>
      option.setName('appid')
        .setDescription('App ID')
        .setRequired(true)
    );

  client.application.commands.create(command)
    .then(() => console.log('✅ /get enregistrée'))
    .catch(err => console.log('❌ Erreur /get :', err.message));
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  console.log(`🎮 /get ${interaction.options.getInteger('appid')} par ${interaction.user.tag}`);

  const appId = interaction.options.getInteger('appid');
  const zipName = `${appId}.zip`;
  const directLink = `${GITHUB_RAW}/${zipName}`;

  await interaction.deferReply();

  try {
    const res = await fetch(directLink);
    console.log(`📡 Status ${res.status}`);

    if (!res.ok) throw new Error();

    const embed = new EmbedBuilder()
      .setColor('#00ff00')
      .setTitle(`App ID: ${appId}`)
      .setDescription(`[Télécharger ${zipName}](${directLink})`)
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
    console.log(`✅ Lien envoyé`);
  } catch (err) {
    console.log(`❌ Jeu non trouvé`);

    const embed = new EmbedBuilder()
      .setColor('#ff0000')
      .setTitle('Introuvable')
      .setDescription(`\`${zipName}\` non trouvé`)
      .setTimestamp();

    const ch = interaction.guild.channels.cache.find(c => c.name === 'demandes-lua');
    if (ch) {
      await ch.send(`@here Demande : \`${appId}\` par ${interaction.user}`);
      console.log(`📢 Demande envoyée`);
    }

    await interaction.editReply({ embeds: [embed] });
  }
});

console.log('🔑 Connexion avec token...');
client.login(process.env.DISCORD_TOKEN).catch(err => {
  console.log('❌ ERREUR CONNEXION :', err.message);
});
