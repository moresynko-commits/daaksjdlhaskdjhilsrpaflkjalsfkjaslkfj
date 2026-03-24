const { Client, GatewayIntentBits, Collection, SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, Embed, ButtonBuilder, ButtonStyle } = require('discord.js');
const express = require('express');
const app = express();
const client = new Client({ 
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ] 
});

// Keepalive for Render
const PORT = process.env.PORT || 3000;
app.get('/keepalive', (req, res) => res.send('pong'));
app.listen(PORT, () => console.log(`Keepalive on port ${PORT}`));

client.commands = new Collection();

const TARGET_CHANNEL = '1471998856806797524';
const INTRO_CHANNEL = '1471660664022896902';
const COMMUNITY_ROLE = '1471652018329227415';

const AUTHORIZED_USERS = [
  1471642523821674618, // Chairman
  1471642550271082690, // Vice Chairman
  1471642360503992411, // Leadership Council
  1481808354929279026, // Director
  1481807872739508375, // Deputy Director
  1481807873515323402, // Assistant Director
  1481807872076808293, // Board of Directors
  1471642668630020268, // Executive Director
  1471642626863141059, // Partner Executive
  1471642323657031754, // Associate Executive
  1471642126663024640  // Board of Executives
];

const HIERARCHY = `1471642523821674618 - Chairman
1471642550271082690 - Vice Chairman
1471642360503992411 - Leadership Council

1481808354929279026 - Director
1481807872739508375 - Deputy Director
1481807873515323402 - Assistant Director
1481807872076808293 - Board of Directors

1471642668630020268 - Executive Director
1471642626863141059 - Partner Executive
1471642323657031754 - Associate Executive
1471642126663024640 - Board of Executives

1471687503135248625 - Head Manager
1471646332799418601 - Senior Manager
1471640133462659236 - Junior Manager
1471646520909758666 - Intern Manager
1471641915215843559 - Management Team

1471646257679171687 - Supervision Manager
1471646221604098233 - Senior Supervisor
1471646134098460743 - Junior Supervisor
1471640008011026666 - Intern Supervisor
1471641790112333867 - Supervision Team

1472073458321063987 - Evaluation Supervisor
1472073396451020953 - Senior Evaluator
1472073148949336215 - Junior Evaluator
1472073043554734100 - Trial Evaluator
1472072792081170682 - Evaluation Team

1481809153549930516 - Internal Affairs Evaluator
1481809152660475967 - Senior Internal Affairs
1481809151985320018 - Junior Internal Affairs
1481809151305711646 - Trial Internal Affairs
1481808964772433991 - Internal Affairs Team

1471645738734714982 - Head Administrator
1471645702357520468 - Senior Administrator
1481813743569604729 - Central Administrator
1471646093287755796 - Junior Administrator
1471647027896254557 - Trial Administrator
1471640542231396373 - Administration Team

1471642772359479420 - Head Moderator
1471642726796628048 - Senior Moderator
1481813691899969577 - Central Moderator
1471646011741966517 - Junior Moderator
1471646061369098375 - Trial Moderator
1471640225015922982 - Moderation Team

Moderation + Administration is Low-Rank
Internal Affairs + Evaluation is Middle-Rank
Supervision + Management is High-Rank
Board of Executives + Board of Directors is Senior High-Rank
Leadership Council is Leadership (LS)`;

const WELCOME_EMOJI_MSG = '<:ILSRP:1471990869166002291> <:Welcome0:1485813700462903306><:Welcome1:1485813730779594862><:Welcome2:1485813755756544212><:Welcome3:1485813779928453223> to **Illinois State Roleplay, {mention}. ILSRP is now at **{count}** members.';

const JOIN_WEBHOOK_JSON = {
  "flags": 32768,
  "components": [
    {
      "type": 17,
      "components": [
        {
          "type": 12,
          "items": [
            {
              "media": {
                "url": "https://cdn.discordapp.com/attachments/1472412365415776306/1473135761078358270/welcomeilsrp.png?ex=69c297d6&is=69c14656&hm=d7d37098dfc8bddb88c5a99c531817843c49594294c596d5420408cd171b8db7&"
              }
            }
          ]
        }
      ]
    },
    {
      "type": 17,
      "components": [
        {
          "type": 10,
          "content": "**Welcome to <:ILSRP:1471990869166002291> Illinois State Roleplay!**\n> Thank you for joining ILSRP, {mention}. You are member {count}.\n\n We are an ER:LC Roleplay Community based on the state of Illinois in the United States.\n> - Want to learn more about the server? Check out ⁠⁠<#1471702849401393264>!\n> - Reading our ⁠⁠<#1471703130587795578> is necessary to ensure that you won't be moderated for rule-breaking.\n> - Do you need support or have questions? Create a support ticket in <#1471666959753154646>.\n> - Would you like full community access? Ensure that <#1471660766536011952> is complete with Melonly.\n> - Interact with others in ⁠<#1471639394212515916>.\n\n\nOtherwise, have a fantastic day, and we hope to see you interact with our community events, channels, and features."
        }
      ]
    }
  ],
  "username": "「👋」introduction",
  "avatar_url": "https://cdn.discordapp.com/attachments/1472412365415776306/1472412580055089152/isrp.png?ex=69c29953&is=69c147d3&hm=f95fe361d041765916666918b06d9cfc2151995e1c7b92f6a499166ef2c6496e&"
};

async function updateChannelName() {
  try {
    const channel = await client.channels.fetch(TARGET_CHANNEL);
    const guild = channel.guild;
    const humans = guild.members.cache.filter(m => !m.user.bot).size;
    const name = `Members: ${humans}\n\n${HIERARCHY}`;
    await channel.setName(name.slice(0, 100)); // Discord name limit
    console.log(`Updated channel name to Members: ${humans}`);
  } catch (error) {
    console.error('Update channel error:', error);
  }
}

async function isAuthorized(userId) {
  return AUTHORIZED_USERS.includes(parseInt(userId));
}

async function sendJoinWelcome(guild, member) {
  try {
    const channel = await guild.channels.fetch(INTRO_CHANNEL);
    const humans = guild.members.cache.filter(m => !m.user.bot).size;
    const webhookContent = JOIN_WEBHOOK_JSON.content.replace(/{mention}/g, member.toString()).replace(/{count}/g, humans);
    // Note: To send rich webhook, use guild.webhooks.create or external service; here simulate with send + files/embeds approx
    await channel.send({
      content: `<@ ${member.id}>`,
      embeds: [{
        title: '**Welcome to <:ILSRP:1471990869166002291> Illinois State Roleplay!**',
        description: JOIN_WEBHOOK_JSON.components[1].components[0].content.replace(/{mention}/g, member.toString()).replace(/{count}/g, humans),
        color: 0x4bbfff,
        image: { url: 'https://cdn.discordapp.com/attachments/1472412365415776306/1473135761078358270/welcomeilsrp.png?ex=69c297d6&is=69c14656&hm=d7d37098dfc8bddb88c5a99c531817843c49594294c596d5420408cd171b8db7&' }
      }]
    });
  } catch (error) {
    console.error('Join welcome error:', error);
  }
}

async function sendCommunityWelcome(guild, member) {
  try {
    const humans = guild.members.cache.filter(m => !m.user.bot).size;
    const content = WELCOME_EMOJI_MSG.replace('{mention}', member.toString()).replace('{count}', humans);
    const targetChannel = guild.channels.cache.find(c => c.name.includes('welcome') || c.name.includes('general')) || guild.publicUpdatesChannel;
    if (targetChannel) await targetChannel.send(content);
  } catch (error) {
    console.error('Community role welcome error:', error);
  }
}

client.once('ready', async () => {
  console.log(`Logged in as ${client.user.tag}!`);
  client.user.setActivity('Illinois State | .gg/EWXT6P9cfw', { type: 'WATCHING' });

  // Deploy slash
  const sayCommand = new SlashCommandBuilder()
    .setName('say')
    .setDescription('Say something')
    .addStringOption(option => option.setName('content').setDescription('Message').setRequired(true))
    .addIntegerOption(option => option.setName('time').setDescription('Delay minutes, max 60').setMinValue(0).setMaxValue(60))
    .addChannelOption(option => option.setName('channel').setDescription('Target channel'));

  await client.application.commands.create(sayCommand);

  // Start interval
  updateChannelName();
  setInterval(updateChannelName, 600000); // 10 min
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName } = interaction;

  if (commandName === 'ping') {
    const reply = await interaction.reply({ content: 'Pong!', fetchReply: true });
    setTimeout(() => reply.delete().catch(() => {}), 3000);
    return;
  }

  if (commandName === 'say') {
    const userId = interaction.user.id;
    if (!await isAuthorized(userId)) return interaction.reply({ content: 'Unauthorized.', ephemeral: true });

    const content = interaction.options.getString('content');
    const time = interaction.options.getInteger('time') || 0;
    const targetChannel = interaction.options.getChannel('channel') || interaction.channel;

    await interaction.reply({ content: `Scheduled${time ? ` in ${time}min` : ''}.`, ephemeral: true });

    setTimeout(async () => {
      try {
        await targetChannel.send(content);
      } catch (e) {
        console.error('Say send error:', e);
      }
    }, time * 60 * 1000);
  }
});

client.on('messageCreate', async message => {
  if (message.author.bot || !message.content.startsWith('.')) return;

  const args = message.content.slice(1).trim().split(/ +/);
  const command = args.shift().toLowerCase();
  const content = args.join(' ');

  if (command === 'ping') {
    const reply = await message.reply('Pong!');
    setTimeout(() => reply.delete().catch(() => {}), 3000);
    return;
  }

  if (command === 'dot') {
    await message.reply('・');
    return;
  }

  if (command === 'say') {
    if (!await isAuthorized(message.author.id)) return message.reply('Unauthorized.');
    if (!content) return message.reply('No content.');

    await message.channel.send(content);
    return;
  }
});

client.on('guildMemberAdd', async member => {
  await sendJoinWelcome(member.guild, member);
});

client.on('guildMemberUpdate', async (oldMember, newMember) => {
  const communityRole = newMember.guild.roles.cache.get(COMMUNITY_ROLE);
  if (!oldMember.roles.cache.has(COMMUNITY_ROLE) && newMember.roles.cache.has(COMMUNITY_ROLE)) {
    await sendCommunityWelcome(newMember.guild, newMember);
  }
});

client.login(process.env.TOKEN);
