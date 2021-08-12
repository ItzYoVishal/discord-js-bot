const { Command, CommandContext } = require("@root/structures");
const { MessageEmbed } = require("discord.js");
const { EMOJIS, EMBED_COLORS } = require("@root/config.json");
const { getMatchingChannel } = require("@utils/guildUtils");
const outdent = require("outdent");

const allowedTypes = ["text", "voice", "news"];

module.exports = class ChannelInfo extends Command {
  constructor(client) {
    super(client, {
      name: "chinfo",
      description: "shows mentioned channel information",
      usage: "[channel]",
      aliases: ["channelinfo"],
      category: "INFORMATION",
      botPermissions: ["EMBED_LINKS"],
    });
  }

  /**
   * @param {CommandContext} ctx
   */
  async run(ctx) {
    const { message, args, channel, guild } = ctx;
    let targetChannel;

    if (message.mentions.channels.size > 0) {
      targetChannel = message.mentions.channels.first();
    } else {
      if (args.length > 0) {
        const search = args.join(" ");
        const tcByName = getMatchingChannel(guild, search).filter((ch) => allowedTypes.includes(ch.type));
        if (tcByName.length == 0) return ctx.reply(`"No channels found matching \`${search}\`!`);
        if (tcByName.length > 1) return ctx.reply(`"Multiple channels found matching \`${search}\`!`);
        targetChannel = tcByName.first();
      } else {
        targetChannel = channel;
      }
    }

    const { id, name, topic, parent, position, createdTimestamp, type } = targetChannel;

    let desc = outdent`
    ${EMOJIS.ARROW} ID: **${id}**
    ${EMOJIS.ARROW} Name: **${name}**
    ${EMOJIS.ARROW} Type: **${type}**
    ${EMOJIS.ARROW} Category: **${parent ? parent : "NA"}**
    ${EMOJIS.ARROW} Topic: **${topic ? topic : "No topic set"}**
    ${EMOJIS.ARROW} Position: **${position}**\n
    `;

    if (type === "text" || type === "news") {
      const { rateLimitPerUser, nsfw } = targetChannel;
      desc += outdent`${EMOJIS.ARROW} Slowmode: **${rateLimitPerUser}**
      ${EMOJIS.ARROW} isNSFW: **${nsfw ? EMOJIS.TICK : EMOJIS.X_MARK}**
      `;
    }

    if (type === "voice") {
      const { bitrate, userLimit } = targetChannel;
      desc += outdent`${EMOJIS.ARROW} Bitrate: **${bitrate}**
      ${EMOJIS.ARROW} User Limit: **${userLimit}**
      `;
    }

    const embed = new MessageEmbed().setAuthor("Channel Details").setColor(EMBED_COLORS.BOT_EMBED).setDescription(desc);
    ctx.reply({ embeds: [embed] });
  }
};
