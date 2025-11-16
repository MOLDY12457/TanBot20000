require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const express = require('express');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// === TA REPO PUBLIQUE ===
const GITHUB_RAW = "https://raw.githubusercontent.com/MOLDY12457/TanBot20000.games/master";
// ========================

// === SITE WEB PING RENDER ===
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send(`
    <meta charset="utf-8">
    <title>UnLockedSteam Bot</title>
    <style>body{font-family:Arial;background:#111;color:#0f0;text-align:center;padding:50px;}h1{color:#0f0;}</style>
    <h1>UnLockedSteam Bot - <span style="color:lime">ONLINE</span></h1>
    <p>Repo publique • ${new Date().toLocaleString('fr-FR')}</p>
    <hr><p><b>Status :</b> <span style="color:lime">ON</span></p>
  `);
});

app.listen(PORT, () => {
  console.log(`Site ON → https://ton-bot.onrender.com`);
});
// ============================

client.once('ready', () => {
  console.log('Bot ON - Repo publique');

  const command = new SlashCommandBuilder()
    .setName('get')
    .setDescription('Télécharge un jeu depuis GitHub')
    .addIntegerOption(option =>
      option.setName('appid')
        .setDescription('App ID du jeu')
        .setRequired(true)
        .setMinValue(1)
    );

  client.application.commands.create(command).then(() => {
    console.log('Commande /get enregistrée');
  });
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand() || interaction.commandName !== 'get') return;

  const appId = interaction.options.getInteger('appid');
  const zipName = `${appId}.zip`;
  const directLink = `${GITHUB_RAW}/${zipName}`;

  console.log(`[GET] App ID: ${appId} → ${directLink}`);

  await interaction.deferReply();

  try {
    const res = await fetch(directLink);
    console.log(`[FETCH] Status: ${res.status}`);

    if (!res.ok) throw new Error('404');

    const embed = new EmbedBuilder()
      .setColor('#00ff00')
      .setTitle(`App ID: ${appId}`)
      .setDescription(`[Télécharger ${zipName}](${directLink})`)
      .setFooter({ text: 'GitHub Public • UnLockedSteam' })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
    console.log(`[SENT] Lien envoyé pour ${appId}`);
  } catch (error) {
    console.log(`[ERROR] Jeu introuvable: ${appId}`);

    const embed = new EmbedBuilder()
      .setColor('#ff0000')
      .setTitle('Jeu introuvable')
      .setDescription(`\`${zipName}\` non trouvé sur GitHub\n> Demande dans #demandes-lua`)
      .setTimestamp();

    const demandeChannel = interaction.guild.channels.cache.find(ch => ch.name === 'demandes-lua');
    if (demandeChannel) {
      await demandeChannel.send({
        content: `@here **Demande**\n> **App ID :** \`${appId}\`\n> **Par :** ${interaction.user}`,
        allowedMentions: { parse: ['everyone'] }
      });
      console.log(`[DEMANDE] Envoyée dans #demandes-lua`);
    }

    await interaction.editReply({ embeds: [embed] });
  }
});

client.login(process.env.DISCORD_TOKEN);
