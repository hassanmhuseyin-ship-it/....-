const { PermissionFlagsBits } = require('discord.js');
const { successContainer, errorContainer } = require('../utils/components');
const { sendLog } = require('../utils/logger');

module.exports = {
	name: 'purge',
	aliases: ['clear', 'delete'],
	description: '🗑️ حذف عدد من الرسائل',
	usage: '+purge <count>',

	async execute(message, args) {
		if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
			return message.reply(errorContainer('خطأ', 'ما عندك صلاحية استخدام هذا الأمر.'));
		}

		const count = parseInt(args[0]);
		if (isNaN(count) || count < 1 || count > 100) {
			return message.reply(errorContainer('خطأ', 'حدد عدد الرسائل (1-100).\n**الاستخدام:** `+purge <count>`'));
		}

		try {
			
			await message.delete();
			const deleted = await message.channel.bulkDelete(count, true);

			const reply = await message.channel.send(
				successContainer('تم الحذف', `تم حذف **${deleted.size}** رسالة بواسطة ${message.author}`),
			);

			
			setTimeout(() => reply.delete().catch(() => {}), 3000);

			await sendLog(message.client, {
				title: 'حذف رسائل',
				color: 0xe74c3c,
				fields: { 'الروم': `${message.channel}`, 'العدد': `${deleted.size}`, 'بواسطة': `${message.author}` },
			});
		} catch (error) {
			await message.channel.send(errorContainer('خطأ', `فشل حذف الرسائل: ${error.message}`));
		}
	},
};
