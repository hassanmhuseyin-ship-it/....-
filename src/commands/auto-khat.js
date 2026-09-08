const { PermissionFlagsBits } = require('discord.js');
const { successContainer, infoContainer, errorContainer } = require('../utils/components');

module.exports = {
	name: 'autoline',
	aliases: ['اوتو-خط', 'autokhat', 'auto-line', 'اوتوخط'],
	description: '📏 تفعيل/تعطيل الخط التلقائي بعد كل رسالة',
	usage: '+autoline <on/off> [#channel]',

	async execute(message, args) {
		if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
			return message.reply(errorContainer('خطأ', 'ما عندك صلاحية استخدام هذا الأمر.'));
		}

		const action = args[0];
		if (!action || !['on', 'off', 'enable', 'disable'].includes(action.toLowerCase())) {
			return message.reply(errorContainer('خطأ', 'حدد الإجراء.\n**الاستخدام:** `+اوتو-خط on/off [#channel]`'));
		}

		const channel = message.mentions.channels.first() || message.channel;
		const isEnable = ['on', 'enable'].includes(action.toLowerCase());

		if (isEnable) {
			if (message.client.autoKhatChannels.has(channel.id)) {
				return message.reply(infoContainer('معلومة', `الخط التلقائي مفعّل بالفعل في ${channel}`));
			}

			message.client.autoKhatChannels.add(channel.id);
			await message.reply(
				successContainer(
					'تم التفعيل',
					`**الروم:** ${channel}\n**بواسطة:** ${message.author}\n\n> سيتم إرسال خط فاصل تلقائياً بعد كل رسالة في هذا الروم.`,
				),
			);
		} else {
			if (!message.client.autoKhatChannels.has(channel.id)) {
				return message.reply(infoContainer('معلومة', `الخط التلقائي معطّل بالفعل في ${channel}`));
			}

			message.client.autoKhatChannels.delete(channel.id);
			await message.reply(
				successContainer(
					'تم التعطيل',
					`**الروم:** ${channel}\n**بواسطة:** ${message.author}\n\n> تم إيقاف الخط التلقائي في هذا الروم.`,
				),
			);
		}
	},
};
