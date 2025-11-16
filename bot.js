require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const express = require('express');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// === CONFIG ===
const GITHUB_USER = "MOLDY12457";
const GITHUB_REPO = "TanBot20000.games";
const GITHUB_BRANCH = "master";
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
// =============

// === SITE WEB POUR PING RENDER ===
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send(`
    <meta charset="utf-8">
    <title>UnLockedSteam Bot</title>
    <style>body{font-family:Arial;background:#1a1a1a;color:#0f0;text-align:center;padding:50px;}h1{color:#0f0;}span{color:lime;}</style>
    <h1>UnLockedSteam Bot - <span>ONLINE</span></h1>
    <p>Bot actif • Repo privée • ${new Date().toLocaleString('fr-FR')}</p>
    <hr><p><b>Status :</b> <span>ON</span></p>
  `);
});

app.listen(PORT, () => {
  console.log(`Site ON → https://ton-bot.onrender.com`);
});
// =================================

// === SLASH COMMAND ===
client.once('ready', () => {
  console.log('Bot ON - Repo privée + site ping');

  const command = new SlashCommandBuilder()
    .setName('get')
    .setDescription('Télécharge un jeu depuis ta repo privée')
    .addIntegerOption(option =>
      option.setName('appid')
        .setDescription('App ID')
        .setRequired(true)
        .setMinValue(1)
    );

  client.application.commands.create(command);
});
// =====================

// === COMMANDE /get ===
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand() || interaction.commandName !== 'get') return;

  const appId = interaction.options.getInteger('appid');
  const zipName = `${appId}.zip`;
  const directLink = `https://${GITHUB_TOKEN}@raw.githubusercontent.com/${GITHUB_USER}/${GITHUB_REPO}/${GITHUB_BRANCH}/${zipName}`;

  await interaction.deferReply();

  try {
    const res = await fetch(directLink);
    if (!res.ok) throw new Error();

    const embed = new EmbedBuilder()
      .setColor('#00ff00')
      .setTitle(`App ID: ${appId}`)
      .setDescription(`[Télécharger ${zipName}](${directLink})`)
      .setFooter({ text: 'GitHub Privé • UnLockedSteam' })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  } catch {
    const embed = new EmbedBuilder()
      .setColor('#ff0000')
      .setTitle('Jeu introuvable')
      .setDescription(`\`${zipName}\` non trouvé\n> Demande dans #demandes-lua`)
      .setTimestamp();

    const demandeChannel = interaction.guild.channels.cache.find(ch => ch.name === 'demandes-lua');
    if (demandeChannel) {
      await demandeChannel.send({
        content: `@here **Demande**\n> **App ID :** \`${appId}\`\n> **Par :** ${interaction.user}`,
        allowedMentions: { parse: ['everyone'] }
      });
    }

    await interaction.editReply({ embeds: [embed] });
  }
});
// =====================

client.login(process.env.DISCORD_TOKEN);
