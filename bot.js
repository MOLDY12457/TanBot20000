require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder, AttachmentBuilder } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates
  ]
});

const CONFIG = {
  uploadChannel: 'upload-lua',
  botChannel: 'lua-bot',
  triggerVocal: 'Créer un salon',
  categoryName: 'Salons Privés'
};

client.once('ready', () => {
  console.log(`✅ Bot ON → #${CONFIG.uploadChannel} → #${CONFIG.botChannel}`);
});

client.on('messageCreate', async (message) => {
  if (message.channel.name !== CONFIG.uploadChannel || message.author.bot) return;
  const file = message.attachments.first();
  if (!file || !file.name.endsWith('.zip')) return;

  const appId = file.name.replace('.zip', '').trim();
  if (!/^\d+$/.test(appId)) {
    message.react('❌');
    return;
  }

  const botChannel = message.guild.channels.cache.find(ch => ch.name === CONFIG.botChannel);
  if (!botChannel) {
    message.reply('❌ Salon `#lua-bot` introuvable !');
    return;
  }

  // 1. Envoie /get appid
  await botChannel.send(`/${appId}`);

  // 2. Embed avec SteamDB
  const embed = new EmbedBuilder()
    .setColor('#1b2838')
    .setTitle(`App ID: ${appId}`)
    .setURL(`https://steamdb.info/app/${appId}/charts/`)
    .setDescription(`[📊 Voir les stats sur SteamDB](https://steamdb.info/app/${appId}/charts/)`)
    .setThumbnail('https://steamdb.info/static/img/logo.png')
    .setFooter({ text: `Upload par ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
    .setTimestamp();

  // 3. Embed + ZIP
  await botChannel.send({
    embeds: [embed],
    files: [new AttachmentBuilder(file.url, { name: file.name })]
  });

  message.react('✅');
});

// Salon vocal privé
client.on('voiceStateUpdate', async (oldState, newState) => {
  const member = newState.member;
  const guild = newState.guild;

  if (newState.channel?.name === CONFIG.triggerVocal) {
    let category = guild.channels.cache.find(c => c.name === CONFIG.categoryName && c.type === 4);
    if (!category) category = await guild.channels.create({ name: CONFIG.categoryName, type: 4 });

    const voice = await guild.channels.create({
      name: member.user.username,
      type: 2,
      parent: category.id,
      permissionOverwrites: [
        { id: guild.id, deny: ['ViewChannel'] },
        { id: member.id, allow: ['ViewChannel', 'Connect', 'ManageChannels'] }
      ]
    });

    member.voice.setChannel(voice);
  }

  if (oldState.channel && oldState.channel.members.size === 0 && oldState.channel.parent?.name === CONFIG.categoryName) {
    oldState.channel.delete().catch(() => {});
  }
});

client.login(process.env.DISCORD_TOKEN);