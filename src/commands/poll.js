const { PermissionFlagsBits, ContainerBuilder, SeparatorSpacingSize, MessageFlags } = require('discord.js');
const { errorContainer } = require('../utils/components');

module.exports = {
	name: 'poll',
	aliases: ['vote'],
	description: '📊 عمل تصويت',
	usage: '+poll <question>',

	async execute(message, args) {
		if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
			return message.reply(errorContainer('خطأ', 'ما عندك صلاحية استخدام هذا الأمر.'));
		}

		const question = args.join(' ');
		if (!question) {
			return message.reply(errorContainer('خطأ', 'اكتب السؤال.\n**الاستخدام:** `+poll <question>`'));
		}

		try {
			await message.delete();
			const pollMsg = await message.channel.send({
				components: [
					new ContainerBuilder()
						.setAccentColor(0xf1c40f)
						.addTextDisplayComponents(
							(text) => text.setContent(`## 📊 تصويت`),
						)
						.addSeparatorComponents((sep) => sep.setDivider(true).setSpacing(SeparatorSpacingSize.Small))
						.addTextDisplayComponents(
							(text) => text.setContent(`**${question}**\n\n✅ — نعم\n❌ — لا`),
						)
						.addSeparatorComponents((sep) => sep.setDivider(true).setSpacing(SeparatorSpacingSize.Small))
						.addTextDisplayComponents(
							(text) => text.setContent(`> بواسطة ${message.author} | تفاعل بالإيموجي للتصويت`),
						),
				],
				flags: MessageFlags.IsComponentsV2,
			});

			await pollMsg.react('✅');
			await pollMsg.react('❌');
		} catch (error) {
			await message.reply(errorContainer('خطأ', `فشل إنشاء التصويت: ${error.message}`));
		}
	},
};
