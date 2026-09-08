const { PermissionFlagsBits, ContainerBuilder, SeparatorSpacingSize, MessageFlags } = require('discord.js');
const { errorContainer } = require('../utils/components');

module.exports = {
	name: 'announce',
	aliases: ['bc', 'broadcast'],
	description: '📢 إرسال إعلان مميز',
	usage: '+announce <text>',

	async execute(message, args) {
		if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
			return message.reply(errorContainer('خطأ', 'هذا الأمر للأدمن فقط.'));
		}

		const text = args.join(' ');
		if (!text) {
			return message.reply(errorContainer('خطأ', 'اكتب محتوى الإعلان.'));
		}

		try {
			
			await message.channel.send({ content: '@everyone' });
			
			
			await message.channel.send({
				components: [
					new ContainerBuilder()
						.setAccentColor(0xe67e22)
						.addTextDisplayComponents(
							(t) => t.setContent(`## 📢 إعلان هام`),
						)
						.addSeparatorComponents((sep) => sep.setDivider(true).setSpacing(SeparatorSpacingSize.Small))
						.addTextDisplayComponents(
							(t) => t.setContent(text),
						)
						.addSeparatorComponents((sep) => sep.setDivider(true).setSpacing(SeparatorSpacingSize.Small))
						.addTextDisplayComponents(
							(t) => t.setContent(`> بواسطة ${message.author}`),
						),
				],
				flags: MessageFlags.IsComponentsV2,
			});

			await message.delete().catch(() => {});
		} catch (error) {
			await message.reply(errorContainer('خطأ', `فشل الإرسال: ${error.message}`)).catch(() => {});
		}
	},
};
