require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

const UPLOAD_CHANNEL = 'upload-lua';
const DEMANDE_CHANNEL = 'demandes-lua'; // ← CRÉÉ CE SALON !

client.once('ready', () => {
  console.log('Bot ON');
  console.log('Salons :', UPLOAD_CHANNEL, '→', DEMANDE_CHANNEL);
});

client.on('messageCreate', async (msg) => {
  if (msg.author.bot) return;
  if (!msg.content.startsWith('/get ')) return;

  const appId = msg.content.split(' ')[1]?.trim();
  if (!appId || !/^\d+$/.test(appId)) {
    return msg.reply('❌ `/get 252490`');
  }

  const uploadChannel = msg.guild.channels.cache.find(ch => ch.name === UPLOAD_CHANNEL);
  if (!uploadChannel) return msg.reply('❌ `#upload-lua` introuvable');

  const messages = await uploadChannel.messages.fetch({ limit: 100 });
  const zipMessage = messages.find(m => m.attachments.first()?.name === `${appId}.zip`);

  if (zipMessage) {
    return msg.reply(`[Télécharger ${appId}.zip](${zipMessage.attachments.first().url})`);
  }

  const demandeChannel = msg.guild.channels.cache.find(ch => ch.name === DEMANDE_CHANNEL);
  if (!demandeChannel) {
    console.log('ERREUR: #demandes-lua introuvable');
    return msg.reply('❌ `#demandes-lua` introuvable → crée-le !');
  }

  const botPerms = demandeChannel.permissionsFor(client.user);
  if (!botPerms?.has('SendMessages') || !botPerms?.has('MentionEveryone')) {
    return msg.reply('❌ Pas de permission dans `#demandes-lua`');
  }

  await demandeChannel.send({
    content: `@here **Demande de jeu**\n> **App ID :** \`${appId}\`\n> **Par :** ${msg.author}\n> Ajoute \`${appId}.zip\` dans #upload-lua`,
    allowedMentions: { parse: ['everyone'] }
  });

  msg.reply(`Demande envoyée dans #demandes-lua avec @here`);
});

client.login(process.env.DISCORD_TOKEN);
