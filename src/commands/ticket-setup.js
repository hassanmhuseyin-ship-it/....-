const { PermissionFlagsBits, ChannelType, PermissionsBitField, ContainerBuilder, SeparatorSpacingSize, MessageFlags, ButtonBuilder, ButtonStyle } = require('discord.js');
const { successContainer, errorContainer } = require('../utils/components');
const config = require('../../config.json');

module.exports = {
	name: 'ticket-setup',
	aliases: ['ticketsetup'],
	description: '🎫 إرسال رسالة فتح تيكت بزر',
	usage: '+ticket-setup',

	async execute(message, args) {
		if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
			return message.reply(errorContainer('خطأ', 'هذا الأمر للأدمن فقط.'));
		}

		await message.delete().catch(() => {});

		await message.channel.send({
			components: [
				new ContainerBuilder()
					.setAccentColor(0x5865F2)
					.addTextDisplayComponents(
						(text) => text.setContent(`## 🎫 نظام التيكتات`),
					)
					.addSeparatorComponents((sep) => sep.setDivider(true).setSpacing(SeparatorSpacingSize.Small))
					.addTextDisplayComponents(
						(text) => text.setContent('اضغط على الزر أدناه لفتح تيكت جديد.\nسيتم إنشاء روم خاص لك مع الإدارة.'),
					)
					.addActionRowComponents((row) =>
						row.addComponents(
							new ButtonBuilder()
								.setCustomId('open-ticket')
								.setLabel('📩 فتح تيكت')
								.setStyle(ButtonStyle.Primary),
						),
					),
			],
			flags: MessageFlags.IsComponentsV2,
		});
	},
};
