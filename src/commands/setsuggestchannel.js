const { PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('../../config.json');
const { successContainer, errorContainer } = require('../utils/components');

module.exports = {
	name: 'setsuggestchannel',
	description: '⚙️ [الإدارة] تحديد روم الاقتراحات التلقائي (Canvas)',
	usage: '+setsuggestchannel <الروم>',

	async execute(message, args) {
		if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
			return message.reply(errorContainer('صلاحيات غير كافية', 'هذا الأمر مخصص للإدارة فقط!'));
		}

		if (!args[0]) {
			return message.reply(errorContainer('خطأ', 'الرجاء منشن الروم المطلوب.\n**الاستخدام:** `+setsuggestchannel #channel`'));
		}

		const mention = args[0].replace(/<#|>/g, '');
		const channel = message.guild.channels.cache.get(mention);

		if (!channel) {
			return message.reply(errorContainer('خطأ', 'الروم غير صحيح. تأكد من منشن الروم بشكل صحيح.'));
		}

		config.suggestionChannelId = channel.id;

		const configPath = path.join(__dirname, '..', '..', 'config.json');
		try {
			fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
			await message.reply(successContainer('تم بنجاح', `تم تعيين روم الاقتراحات التلقائي إلى: ${channel}`));
		} catch (error) {
			console.error(error);
			await message.reply(errorContainer('خطأ', 'حدث خطأ أثناء حفظ الإعدادات.'));
		}
	},
};
