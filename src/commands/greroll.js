const { PermissionFlagsBits, ContainerBuilder, SeparatorSpacingSize, MessageFlags } = require('discord.js');
const { errorContainer } = require('../utils/components');

module.exports = {
	name: 'greroll',
	aliases: ['reroll'],
	description: '🔄 إعادة اختيار فائز',
	usage: '+greroll <messageId>',

	async execute(message, args) {
		if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
			return message.reply(errorContainer('خطأ', 'ما عندك صلاحية.'));
		}

		const msgId = args[0];
		if (!msgId) {
			return message.reply(errorContainer('خطأ', 'حدد آيدي رسالة القيف أواي.\n**الاستخدام:** `+greroll <messageId>`'));
		}

		try {
			const msg = await message.channel.messages.fetch(msgId);
			const reaction = msg.reactions.cache.get('🎉');
			const users = await reaction?.users.fetch();
			const participants = users?.filter(u => !u.bot);

			if (!participants || participants.size === 0) {
				return message.reply(errorContainer('خطأ', 'لا يوجد مشاركين.'));
			}

			const winner = participants.random();
			await message.channel.send({
				components: [
					new ContainerBuilder()
						.setAccentColor(0x9b59b6)
						.addTextDisplayComponents(
							(text) => text.setContent(`## 🔄 إعادة اختيار الفائز!`),
						)
						.addSeparatorComponents((sep) => sep.setDivider(true).setSpacing(SeparatorSpacingSize.Small))
						.addTextDisplayComponents(
							(text) => text.setContent(`**🏆 الفائز الجديد:** ${winner}`),
						),
				],
				flags: MessageFlags.IsComponentsV2,
			});
		} catch (error) {
			await message.reply(errorContainer('خطأ', `فشل: ${error.message}`));
		}
	},
};
