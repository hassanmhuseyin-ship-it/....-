const { ContainerBuilder, SeparatorSpacingSize, MessageFlags } = require('discord.js');

module.exports = {
	name: 'serverinfo',
	aliases: ['si', 'server'],
	description: '🏠 معلومات السيرفر',
	usage: '+serverinfo',

	async execute(message, args) {
		const guild = message.guild;

		const verificationLevels = {
			0: 'لا يوجد',
			1: 'منخفض',
			2: 'متوسط',
			3: 'عالي',
			4: 'عالي جداً',
		};

		const boostLevels = {
			0: 'لا يوجد',
			1: 'المستوى 1',
			2: 'المستوى 2',
			3: 'المستوى 3',
		};

		const textChannels = guild.channels.cache.filter(c => c.type === 0).size;
		const voiceChannels = guild.channels.cache.filter(c => c.type === 2).size;
		const categories = guild.channels.cache.filter(c => c.type === 4).size;

		const info = [
			`**🏠 الاسم:** ${guild.name}`,
			`**🆔 الآيدي:** \`${guild.id}\``,
			`**👑 المالك:** <@${guild.ownerId}>`,
			`**👥 الأعضاء:** ${guild.memberCount}`,
			`**📅 تاريخ الإنشاء:** <t:${Math.floor(guild.createdTimestamp / 1000)}:R>`,
			`**🔒 مستوى التحقق:** ${verificationLevels[guild.verificationLevel]}`,
			`**💎 التعزيزات:** ${guild.premiumSubscriptionCount || 0} (${boostLevels[guild.premiumTier]})`,
			`**📝 الرومات:** ${textChannels} نصي | ${voiceChannels} صوتي | ${categories} تصنيف`,
			`**🎭 الرتب:** ${guild.roles.cache.size}`,
			`**😀 الإيموجي:** ${guild.emojis.cache.size}`,
		].join('\n');

		await message.reply({
			components: [
				new ContainerBuilder()
					.setAccentColor(0x5865F2)
					.addTextDisplayComponents(
						(text) => text.setContent(`## 🏠 معلومات السيرفر`),
					)
					.addSeparatorComponents((sep) => sep.setDivider(true).setSpacing(SeparatorSpacingSize.Small))
					.addTextDisplayComponents(
						(text) => text.setContent(info),
					),
			],
			flags: MessageFlags.IsComponentsV2,
		});
	},
};
