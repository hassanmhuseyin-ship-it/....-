const { PermissionFlagsBits } = require('discord.js');
const { successContainer, errorContainer } = require('../utils/components');
const config = require('../../config.json');
const { sendLog } = require('../utils/logger');

module.exports = {
	name: 'unmute',
	description: '🔊 فك كتم عضو في السيرفر',
	usage: '+unmute @user',

	async execute(message, args) {
		if (!message.member.permissions.has(PermissionFlagsBits.ManageRoles)) {
			return message.reply(errorContainer('خطأ', 'ما عندك صلاحية استخدام هذا الأمر.'));
		}

		const target = message.mentions.members.first();
		const mutedRole = message.guild.roles.cache.get(config.mutedRoleId);

		if (!target) {
			return message.reply(errorContainer('خطأ', 'منشن العضو المراد فك كتمه.\n**الاستخدام:** `+unmute @user`'));
		}

		if (!mutedRole) {
			return message.reply(errorContainer('خطأ', 'لم يتم العثور على رتبة الميوت.'));
		}

		if (!target.roles.cache.has(config.mutedRoleId)) {
			return message.reply(errorContainer('خطأ', 'هذا العضو غير مكتوم.'));
		}

		try {
			await target.roles.remove(mutedRole, 'تم فك الكتم');
			await message.reply(
				successContainer(
					'تم فك الكتم',
					`**العضو:** ${target}\n**بواسطة:** ${message.author}`,
				),
			);
			await sendLog(message.client, {
				title: 'فك كتم',
				color: 0x2ecc71,
				fields: { 'العضو': `${target}`, 'بواسطة': `${message.author}` },
			});
		} catch (error) {
			await message.reply(errorContainer('خطأ', `فشل فك كتم العضو: ${error.message}`));
		}
	},
};
