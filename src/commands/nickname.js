const { PermissionFlagsBits } = require('discord.js');
const { successContainer, errorContainer } = require('../utils/components');

module.exports = {
	name: 'nickname',
	aliases: ['nick', 'setnick'],
	description: '🏷️ تغيير لقب شخص',
	usage: '+nickname <@user> <name|reset>',

	async execute(message, args) {
		if (!message.member.permissions.has(PermissionFlagsBits.ManageNicknames)) {
			return message.reply(errorContainer('خطأ', 'ما عندك صلاحية.'));
		}

		const target = message.mentions.members.first();
		const nick = args.slice(1).join(' ');

		if (!target || !nick) {
			return message.reply(errorContainer('خطأ', '**الاستخدام:** `+nickname <@user> <name>`\nلإزالة اللقب، اكتب `reset` بدل الاسم.'));
		}

		if (target.roles.highest.position >= message.member.roles.highest.position && message.author.id !== message.guild.ownerId) {
			return message.reply(errorContainer('خطأ', 'لا يمكنك تغيير لقب شخص أعلى منك.'));
		}

		try {
			const newNick = nick.toLowerCase() === 'reset' ? null : nick;
			await target.setNickname(newNick);
			await message.reply(
				successContainer('تم تغيير اللقب', `**العضو:** ${target}\n**اللقب الجديد:** ${newNick || target.user.username}`),
			);
		} catch (error) {
			await message.reply(errorContainer('خطأ', `فشل التنفيذ: ${error.message}`));
		}
	},
};
