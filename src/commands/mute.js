const { PermissionFlagsBits } = require('discord.js');
const { successContainer, errorContainer } = require('../utils/components');
const config = require('../../config.json');
const { sendLog } = require('../utils/logger');

module.exports = {
	name: 'mute',
	description: '🔇 كتم عضو في السيرفر',
	usage: '+mute @user [reason]',

	async execute(message, args) {
		if (!message.member.permissions.has(PermissionFlagsBits.ManageRoles)) {
			return message.reply(errorContainer('خطأ', 'ما عندك صلاحية استخدام هذا الأمر.'));
		}

		const target = message.mentions.members.first();
		const reason = args.slice(1).join(' ') || 'لم يتم تحديد سبب';
		const mutedRole = message.guild.roles.cache.get(config.mutedRoleId);

		if (!target) {
			return message.reply(errorContainer('خطأ', 'منشن العضو المراد كتمه.\n**الاستخدام:** `+mute @user [reason]`'));
		}

		if (!mutedRole) {
			return message.reply(errorContainer('خطأ', 'لم يتم العثور على رتبة الميوت. تأكد من `mutedRoleId` في config.json'));
		}

		if (target.roles.highest.position >= message.member.roles.highest.position) {
			return message.reply(errorContainer('خطأ', 'لا يمكنك كتم عضو لديه رتبة أعلى منك أو مساوية لك.'));
		}

		if (target.roles.cache.has(config.mutedRoleId)) {
			return message.reply(errorContainer('خطأ', 'هذا العضو مكتوم بالفعل.'));
		}

		try {
			await target.roles.add(mutedRole, reason);
			await message.reply(
				successContainer(
					'تم الكتم',
					`**العضو:** ${target}\n**بواسطة:** ${message.author}\n**السبب:** ${reason}`,
				),
			);
			await sendLog(message.client, {
				title: 'كتم عضو',
				color: 0xe74c3c,
				fields: { 'العضو': `${target}`, 'بواسطة': `${message.author}`, 'السبب': reason },
			});
		} catch (error) {
			await message.reply(errorContainer('خطأ', `فشل كتم العضو: ${error.message}`));
		}
	},
};
