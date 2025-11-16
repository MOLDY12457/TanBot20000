require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

const UPLOAD_CHANNEL = 'upload-lua';
const DEMANDE_CHANNEL = 'demandes-lua';

// Anti-double réponse
const processed = new Set();

client.once('ready', () => {
  console.log('Bot ON - /get <appid> → ZIP ou demande @here');
});

client.on('messageCreate', async (msg) => {
  if (msg.author.bot) return;
  if (!msg.content.startsWith('/get ')) return;

  const msgId = msg.id;
  if (processed.has(msgId)) return; // déjà traité
  processed.add(msgId);
  setTimeout(() => processed.delete(msgId), 5000);

  const appId = msg.content.split(' ')[1]?.trim();
  if (!appId || !/^\d+$/.test(appId)) {
    return msg.reply('❌ `/get 252490`');
  }

  const uploadChannel = msg.guild.channels.cache.find(ch => ch.name === UPLOAD_CHANNEL);
  if (!uploadChannel) return msg.reply('❌ `#upload-lua` introuvable');

  const messages = await uploadChannel.messages.fetch({ limit: 100 });
  const zipMessage = messages.find(m => m.attachments.first()?.name === `${appId}.zip`);

  if (zipMessage) {
    const embed = new EmbedBuilder()
      .setColor('#00ff00')
      .setTitle(`App ID: ${appId}`)
      .setDescription(`[Télécharger ${appId}.zip](${zipMessage.attachments.first().url})`)
      .setFooter({ text: 'UnLockedSteam' })
      .setTimestamp();
    return msg.reply({ embeds: [embed] });
  }

  const demandeChannel = msg.guild.channels.cache.find(ch => ch.name === DEMANDE_CHANNEL);
  if (!demandeChannel) return msg.reply('❌ `#demandes-lua` introuvable');

  const botPerms = demandeChannel.permissionsFor(client.user);
  if (!botPerms?.has('SendMessages') || !botPerms?.has('MentionEveryone')) {
    return msg.reply('❌ Pas de permission dans `#demandes-lua`');
  }

  const embed = new EmbedBuilder()
    .setColor('#ff0000')
    .setTitle('Demande de jeu')
    .addFields(
      { name: 'App ID', value: `\`${appId}\``, inline: true },
      { name: 'Par', value: `${msg.author}`, inline: true },
      { name: 'Action', value: `Ajoute \`${appId}.zip\` dans #upload-lua` }
    )
    .setTimestamp();

  await demandeChannel.send({
    content: `@here`,
    embeds: [embed],
    allowedMentions: { parse: ['everyone'] }
  });

  msg.reply(`Demande envoyée dans #demandes-lua`);
});
// === KEEP ALIVE POUR RENDER ===
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.status(200).send('Bot ON - UnLockedSteam');
});

app.listen(PORT, () => {
  console.log(`Ping server ON → http://localhost:${PORT}`);
});
client.login(process.env.DISCORD_TOKEN);
