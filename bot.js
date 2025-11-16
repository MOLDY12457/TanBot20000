require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const express = require('express');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// === TA REPO ===
const GITHUB_RAW = "https://raw.githubusercontent.com/MOLDY12457/TanBot20000.games/master";
// ========================

// === SITE PING ===
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send(`
    <h1>UnLockedSteam Bot - ONLINE</h1>
    <p>Repo publique • ${new Date().toLocaleString('fr-FR')}</p>
    <p><b>Status :</b> <span style="color:green">ON</span></p>
  `);
});

app.listen(PORT, () => {
  console.log(`Site ON → port ${PORT}`);
});
// ====================

client.once('ready', () => {
  console.log('✅ Bot ON - Repo publique');
  console.log(`Lien de test : ${GITHUB_RAW}/252490.zip`);

  const command = new SlashCommandBuilder()
    .setName('get')
    .setDescription('Télécharge un jeu')
    .addIntegerOption(option =>
      option.setName('appid')
        .setDescription('App ID')
        .setRequired(true)
        .setMinValue(1)
    );

  client.application.commands.create(command).then(() => {
    console.log('✅ Commande /get enregistrée');
  }).catch(err => {
    console.log('❌ Erreur commande :', err);
  });
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand() || interaction.commandName !== 'get') return;

  const appId = interaction.options.getInteger('appid');
  const zipName = `${appId}.zip`;
  const directLink = `${GITHUB_RAW}/${zipName}`;

  console.log(`🔍 /get ${appId} → ${directLink}`);

  await interaction.deferReply();

  try {
    console.log('📡 Fetching...');
    const res = await fetch(directLink);
    console.log(`📡 Status: ${res.status} ${res.statusText}`);
    console.log(`📡 Headers:`, res.headers.get('content-type'));

    if (!res.ok) {
      throw new Error(`Status ${res.status}`);
    }

    const embed = new EmbedBuilder()
      .setColor('#00ff00')
      .setTitle(`App ID: ${appId}`)
      .setDescription(`[Télécharger ${zipName}](${directLink})`)
      .setFooter({ text: 'GitHub Public' })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
    console.log(`✅ Lien envoyé pour ${appId}`);
  } catch (error) {
    console.log(`❌ Erreur:`, error.message);

    const embed = new EmbedBuilder()
      .setColor('#ff0000')
      .setTitle('Jeu introuvable')
      .setDescription(`\`${zipName}\` non trouvé\n> Demande envoyée dans #demandes-lua`)
      .setTimestamp();

    const demandeChannel = interaction.guild.channels.cache.find(ch => ch.name === 'demandes-lua');
    if (demandeChannel) {
      await demandeChannel.send({
        content: `@here **Demande**\n> **App ID :** \`${appId}\`\n> **Par :** ${interaction.user}`,
        allowedMentions: { parse: ['everyone'] }
      });
      console.log(`📢 Demande envoyée dans #demandes-lua`);
    }

    await interaction.editReply({ embeds: [embed] });
  }
});

client.login(process.env.DISCORD_TOKEN);
