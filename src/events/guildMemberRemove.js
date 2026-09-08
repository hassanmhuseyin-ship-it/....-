const { Events, ContainerBuilder, SeparatorSpacingSize, MessageFlags } = require('discord.js');
const config = require('../../config.json');

module.exports = {
	name: Events.GuildMemberRemove,
	async execute(member) {
		const channelId = config.leaveChannelId;
		if (!channelId) return;

		const channel = member.guild.channels.cache.get(channelId);
		if (!channel) return;

		try {
			await channel.send({
				components: [
					new ContainerBuilder()
						.setAccentColor(0xe74c3c)
						.addTextDisplayComponents(
							(text) => text.setContent(`## 👋 مع السلامة!`),
						)
						.addSeparatorComponents((sep) => sep.setDivider(true).setSpacing(SeparatorSpacingSize.Small))
						.addTextDisplayComponents(
							(text) => text.setContent(
								`**${member.user.tag}** غادر السيرفر 😢\n\n` +
								`**👥 عدد الأعضاء الحالي:** ${member.guild.memberCount}`,
							),
						),
				],
				flags: MessageFlags.IsComponentsV2,
			});
		} catch (error) {
			console.error('[❌] خطأ في رسالة الوداع:', error);
		}

		
		try {
			if (config.memberStatChannelId && config.botStatChannelId) {
				const members = member.guild.memberCount;
				const bots = member.guild.members.cache.filter((m) => m.user.bot).size;
				const memberChannel = member.guild.channels.cache.get(config.memberStatChannelId);
				const botChannel = member.guild.channels.cache.get(config.botStatChannelId);

				if (memberChannel) await memberChannel.setName(`👥 الأعضاء: ${members}`);
				if (botChannel) await botChannel.setName(`🤖 البوتات: ${bots}`);
			}
		} catch (error) {
			console.error('[❌] خطأ في تحديث الإحصائيات:', error);
		}
	},
};
