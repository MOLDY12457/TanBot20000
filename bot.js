require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

const UPLOAD_CHANNEL = 'upload-lua'; // nom exact

client.once('ready', () => {
  console.log('Bot prêt ! Tape /get <appid> pour avoir le ZIP');
});

client.on('messageCreate', async (msg) => {
  if (msg.author.bot) return;
  if (!msg.content.startsWith('/get ')) return;

  const appId = msg.content.split(' ')[1]?.trim();
  if (!appId || !/^\d+$/.test(appId)) {
    return msg.reply('❌ Utilise : `/get 252490`');
  }

  const channel = msg.guild.channels.cache.find(ch => ch.name === UPLOAD_CHANNEL);
  if (!channel) return msg.reply('❌ Salon `#upload-lua` introuvable');

  // Cherche le message avec le ZIP
  const messages = await channel.messages.fetch({ limit: 100 });
  const zipMessage = messages.find(m => 
    m.attachments.size > 0 && 
    m.attachments.first().name === `${appId}.zip`
  );

  if (!zipMessage) {
    return msg.reply(`❌ Aucun \`${appId}.zip\` trouvé dans #upload-lua`);
  }

  const zipUrl = zipMessage.attachments.first().url;
  msg.reply(`📦 **${appId}.zip** → [Télécharger](${zipUrl})`);
});

client.login(process.env.DISCORD_TOKEN);
