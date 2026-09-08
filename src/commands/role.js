const { PermissionFlagsBits } = require('discord.js');
const { successContainer, errorContainer } = require('../utils/components');

module.exports = {
	name: 'role',
	description: '🎭 إعطاء/إزالة رتبة',
	usage: '+role <@user> <@role>',

	async execute(message, args) {
		if (!message.member.permissions.has(PermissionFlagsBits.ManageRoles)) {
			return message.reply(errorContainer('خطأ', 'ما عندك صلاحية.'));
		}

		const target = message.mentions.members.first();
		const role = message.mentions.roles.first();

		if (!target || !role) {
			return message.reply(errorContainer('خطأ', '**الاستخدام:** `+role <@user> <@role>`'));
		}

		if (role.position >= message.member.roles.highest.position && message.author.id !== message.guild.ownerId) {
			return message.reply(errorContainer('خطأ', 'لا يمكنك التحكم برتبة أعلى منك أو مساوية لك.'));
		}

		try {
			if (target.roles.cache.has(role.id)) {
				await target.roles.remove(role);
				await message.reply(successContainer('تم الإزالة', `تمت إزالة رتبة ${role} من ${target}`));
			} else {
				await target.roles.add(role);
				await message.reply(successContainer('تم الإعطاء', `تم إعطاء رتبة ${role} لـ ${target}`));
			}
		} catch (error) {
			await message.reply(errorContainer('خطأ', `فشل التنفيذ: ${error.message}`));
		}
	},
};
