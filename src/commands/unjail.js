const { PermissionFlagsBits } = require('discord.js');
const { successContainer, errorContainer } = require('../utils/components');
const config = require('../../config.json');
const { sendLog } = require('../utils/logger');

module.exports = {
	name: 'unjail',
	description: '🔓 فك سجن عضو وإرجاع حالته',
	usage: '+unjail @user',

	async execute(message, args) {
		if (!message.member.permissions.has(PermissionFlagsBits.ManageRoles)) {
			return message.reply(errorContainer('خطأ', 'ما عندك صلاحية استخدام هذا الأمر.'));
		}

		const target = message.mentions.members.first();
		const jailRole = message.guild.roles.cache.get(config.jailRoleId);

		if (!target) {
			return message.reply(errorContainer('خطأ', 'منشن العضو المراد فك سجنه.\n**الاستخدام:** `+unjail @user`'));
		}

		if (!jailRole) {
			return message.reply(errorContainer('خطأ', 'لم يتم العثور على رتبة الجيل.'));
		}

		if (!target.roles.cache.has(config.jailRoleId)) {
			return message.reply(errorContainer('خطأ', 'هذا العضو غير مسجون.'));
		}

		try {
			await target.roles.remove(jailRole, 'تم فك السجن');
			await message.reply(
				successContainer(
					'تم فك السجن',
					`**العضو:** ${target}\n**بواسطة:** ${message.author}\n\n> تم إزالة رتبة السجن. يمكنك إعادة رتبه يدوياً.`,
				),
			);
			await sendLog(message.client, {
				title: 'فك سجن',
				color: 0x2ecc71,
				fields: { 'العضو': `${target}`, 'بواسطة': `${message.author}` },
			});
		} catch (error) {
			await message.reply(errorContainer('خطأ', `فشل فك السجن: ${error.message}`));
		}
	},
};
