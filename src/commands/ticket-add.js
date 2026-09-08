const { PermissionFlagsBits } = require('discord.js');
const { successContainer, errorContainer } = require('../utils/components');

module.exports = {
	name: 'ticket-add',
	aliases: ['ticketadd', 'tadd'],
	description: '➕ إضافة عضو للتيكت',
	usage: '+ticket-add @user',

	async execute(message, args) {
		if (!message.channel.name.startsWith('ticket-')) {
			return message.reply(errorContainer('خطأ', 'هذا الأمر يعمل فقط داخل تيكت.'));
		}

		const target = message.mentions.members.first();
		if (!target) {
			return message.reply(errorContainer('خطأ', 'منشن العضو.\n**الاستخدام:** `+ticket-add @user`'));
		}

		try {
			await message.channel.permissionOverwrites.edit(target, {
				ViewChannel: true,
				SendMessages: true,
				ReadMessageHistory: true,
			});

			await message.reply(successContainer('تم', `تمت إضافة ${target} للتيكت.`));
		} catch (error) {
			await message.reply(errorContainer('خطأ', `فشل إضافة العضو: ${error.message}`));
		}
	},
};
