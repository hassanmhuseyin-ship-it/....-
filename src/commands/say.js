const { PermissionFlagsBits } = require('discord.js');
const { errorContainer } = require('../utils/components');

module.exports = {
	name: 'say',
	description: '💬 البوت يرسل رسالة',
	usage: '+say <text>',

	async execute(message, args) {
		if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
			return message.reply(errorContainer('خطأ', 'ما عندك صلاحية استخدام هذا الأمر.'));
		}

		const text = args.join(' ');
		if (!text) {
			return message.reply(errorContainer('خطأ', 'اكتب الرسالة.\n**الاستخدام:** `+say <text>`'));
		}

		try {
			await message.delete();
			await message.channel.send(text);
		} catch (error) {
			await message.reply(errorContainer('خطأ', `فشل الإرسال: ${error.message}`));
		}
	},
};
