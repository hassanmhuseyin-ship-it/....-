const { PermissionFlagsBits } = require('discord.js');
const { successContainer, errorContainer } = require('../utils/components');
const config = require('../../config.json');
const { sendLog } = require('../utils/logger');

module.exports = {
	name: 'jail',
	description: '🔒 سجن عضو وتقييد صلاحياته',
	usage: '+jail @user [reason]',

	async execute(message, args) {
		if (!message.member.permissions.has(PermissionFlagsBits.ManageRoles)) {
			return message.reply(errorContainer('خطأ', 'ما عندك صلاحية استخدام هذا الأمر.'));
		}

		const target = message.mentions.members.first();
		const reason = args.slice(1).join(' ') || 'لم يتم تحديد سبب';
		const jailRole = message.guild.roles.cache.get(config.jailRoleId);

		if (!target) {
			return message.reply(errorContainer('خطأ', 'منشن العضو المراد سجنه.\n**الاستخدام:** `+jail @user [reason]`'));
		}

		if (!jailRole) {
			return message.reply(errorContainer('خطأ', 'لم يتم العثور على رتبة الجيل. تأكد من `jailRoleId` في config.json'));
		}

		if (target.roles.highest.position >= message.member.roles.highest.position) {
			return message.reply(errorContainer('خطأ', 'لا يمكنك سجن عضو لديه رتبة أعلى منك أو مساوية لك.'));
		}

		if (target.roles.cache.has(config.jailRoleId)) {
			return message.reply(errorContainer('خطأ', 'هذا العضو مسجون بالفعل.'));
		}

		try {
			
			await target.roles.set([jailRole.id], reason);

			await message.reply(
				successContainer(
					'تم السجن',
					`**العضو:** ${target}\n**بواسطة:** ${message.author}\n**السبب:** ${reason}\n\n> تم إزالة جميع الرتب وإعطاء رتبة السجن.`,
				),
			);
			await sendLog(message.client, {
				title: 'سجن عضو',
				color: 0xe74c3c,
				fields: { 'العضو': `${target}`, 'بواسطة': `${message.author}`, 'السبب': reason },
			});
		} catch (error) {
			await message.reply(errorContainer('خطأ', `فشل سجن العضو: ${error.message}`));
		}
	},
};
