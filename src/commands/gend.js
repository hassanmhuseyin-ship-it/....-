const { PermissionFlagsBits, ContainerBuilder, SeparatorSpacingSize, MessageFlags } = require('discord.js');
const { errorContainer } = require('../utils/components');

module.exports = {
	name: 'gend',
	description: '🛑 إنهاء قيف أواي',
	usage: '+gend <messageId>',

	async execute(message, args) {
		if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
			return message.reply(errorContainer('خطأ', 'ما عندك صلاحية.'));
		}

		const msgId = args[0];
		if (!msgId) {
			return message.reply(errorContainer('خطأ', 'حدد آيدي رسالة القيف أواي.\n**الاستخدام:** `+gend <messageId>`'));
		}

		try {
			const msg = await message.channel.messages.fetch(msgId);
			const reaction = msg.reactions.cache.get('🎉');
			const users = await reaction?.users.fetch();
			const participants = users?.filter(u => !u.bot);

			if (!participants || participants.size === 0) {
				return message.reply(errorContainer('انتهى', 'لا يوجد مشاركين.'));
			}

			const winner = participants.random();
			await message.channel.send({
				components: [
					new ContainerBuilder()
						.setAccentColor(0x2ecc71)
						.addTextDisplayComponents(
							(text) => text.setContent(`## 🎉 مبروك!`),
						)
						.addSeparatorComponents((sep) => sep.setDivider(true).setSpacing(SeparatorSpacingSize.Small))
						.addTextDisplayComponents(
							(text) => text.setContent(`**🏆 الفائز:** ${winner}\n**👥 المشاركين:** ${participants.size}`),
						),
				],
				flags: MessageFlags.IsComponentsV2,
			});
		} catch (error) {
			await message.reply(errorContainer('خطأ', `فشل: ${error.message}`));
		}
	},
};
