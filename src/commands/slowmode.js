const { PermissionFlagsBits } = require('discord.js');
const { successContainer, errorContainer } = require('../utils/components');

module.exports = {
	name: 'slowmode',
	aliases: ['slow'],
	description: '🐢 تعيين سلو مود للروم',
	usage: '+slowmode <seconds> [#channel]',

	async execute(message, args) {
		if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
			return message.reply(errorContainer('خطأ', 'ما عندك صلاحية استخدام هذا الأمر.'));
		}

		const seconds = parseInt(args[0]);
		if (isNaN(seconds) || seconds < 0 || seconds > 21600) {
			return message.reply(errorContainer('خطأ', 'حدد عدد الثواني (0-21600).\n**الاستخدام:** `+slowmode <seconds> [#channel]`\n`0` = إيقاف السلو مود'));
		}

		const channel = message.mentions.channels.first() || message.channel;

		try {
			await channel.setRateLimitPerUser(seconds);

			if (seconds === 0) {
				await message.reply(
					successContainer('تم إيقاف السلو مود', `**الروم:** ${channel}\n**بواسطة:** ${message.author}`),
				);
			} else {
				await message.reply(
					successContainer('تم تعيين السلو مود', `**الروم:** ${channel}\n**المدة:** ${seconds} ثانية\n**بواسطة:** ${message.author}`),
				);
			}
		} catch (error) {
			await message.reply(errorContainer('خطأ', `فشل تعيين السلو مود: ${error.message}`));
		}
	},
};
