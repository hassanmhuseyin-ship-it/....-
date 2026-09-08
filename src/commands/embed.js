const { PermissionFlagsBits, ContainerBuilder, SeparatorSpacingSize, MessageFlags } = require('discord.js');
const { errorContainer } = require('../utils/components');

module.exports = {
	name: 'embed',
	description: '📦 إرسال رسالة بتنسيق Container v2',
	usage: '+embed <text>',

	async execute(message, args) {
		if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
			return message.reply(errorContainer('خطأ', 'ما عندك صلاحية استخدام هذا الأمر.'));
		}

		const text = args.join(' ');
		if (!text) {
			return message.reply(errorContainer('خطأ', 'اكتب النص.\n**الاستخدام:** `+embed <text>`'));
		}

		try {
			await message.delete();
			await message.channel.send({
				components: [
					new ContainerBuilder()
						.setAccentColor(0x5865F2)
						.addTextDisplayComponents(
							(t) => t.setContent(text),
						),
				],
				flags: MessageFlags.IsComponentsV2,
			});
		} catch (error) {
			await message.reply(errorContainer('خطأ', `فشل الإرسال: ${error.message}`));
		}
	},
};
