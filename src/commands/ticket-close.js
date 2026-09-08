const { PermissionFlagsBits } = require('discord.js');
const { successContainer, errorContainer } = require('../utils/components');

module.exports = {
	name: 'ticket-close',
	aliases: ['ticketclose', 'tclose'],
	description: '🔒 إغلاق التيكت الحالي',
	usage: '+ticket-close',

	async execute(message, args) {
		if (!message.channel.name.startsWith('ticket-')) {
			return message.reply(errorContainer('خطأ', 'هذا الأمر يعمل فقط داخل تيكت.'));
		}

		if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
			return message.reply(errorContainer('خطأ', 'ما عندك صلاحية إغلاق التيكت.'));
		}

		await message.reply(successContainer('إغلاق التيكت', 'سيتم حذف هذا التيكت خلال 5 ثواني...'));

		setTimeout(async () => {
			try {
				await message.channel.delete('Ticket closed');
			} catch (error) {
				console.error('[❌] فشل حذف التيكت:', error);
			}
		}, 5000);
	},
};
