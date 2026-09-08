const { PermissionFlagsBits } = require('discord.js');
const { successContainer, errorContainer } = require('../utils/components');

module.exports = {
	name: 'copy',
	description: '🥷 نسخ إيموجي وإضافته للسيرفر',
	usage: '+copy <emoji> [name]',

	async execute(message, args) {
		if (!message.member.permissions.has(PermissionFlagsBits.ManageGuildExpressions)) {
			return message.reply(errorContainer('خطأ', 'ما عندك صلاحية.'));
		}

		const emojiStr = args[0];
		if (!emojiStr) {
			return message.reply(errorContainer('خطأ', '**الاستخدام:** `+copy <emoji> [name]`'));
		}

		
		const emojiRegex = /<?(a)?:?(\w{2,32}):(\d{17,19})>?/;
		const match = emojiStr.match(emojiRegex);

		if (!match) {
			return message.reply(errorContainer('خطأ', 'يرجى إرسال إيموجي ديسكورد صحيح (مخصص، ليس من النظام).'));
		}

		const animated = match[1] === 'a';
		const name = args[1] || match[2];
		const id = match[3];
		const url = `https://cdn.discordapp.com/emojis/${id}.${animated ? 'gif' : 'png'}`;

		try {
			const emoji = await message.guild.emojis.create({ attachment: url, name: name });
			await message.reply(
				successContainer('تم السرقة بنجاح 🥷', `تمت إضافة الإيموجي: ${emoji} (\`${emoji.name}\`)`),
			);
		} catch (error) {
			await message.reply(errorContainer('خطأ', `فشل إضافة الإيموجي (تأكد من وجود مساحة كافية): ${error.message}`));
		}
	},
};
