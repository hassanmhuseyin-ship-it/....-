const { PermissionFlagsBits } = require('discord.js');
const { confirmContainer, errorContainer } = require('../utils/components');

module.exports = {
	name: 'ban',
	description: '🔨 حظر عضو من السيرفر',
	usage: '+ban @user [reason]',

	async execute(message, args) {
		if (!message.member.permissions.has(PermissionFlagsBits.BanMembers)) {
			return message.reply(errorContainer('خطأ', 'ما عندك صلاحية استخدام هذا الأمر.'));
		}

		const target = message.mentions.members.first();
		const reason = args.slice(1).join(' ') || 'لم يتم تحديد سبب';

		if (!target) {
			return message.reply(errorContainer('خطأ', 'منشن العضو المراد حظره.\n**الاستخدام:** `+ban @user [reason]`'));
		}

		if (target.roles.highest.position >= message.member.roles.highest.position) {
			return message.reply(errorContainer('خطأ', 'لا يمكنك حظر عضو لديه رتبة أعلى منك أو مساوية لك.'));
		}

		if (!target.bannable) {
			return message.reply(errorContainer('خطأ', 'لا يمكن للبوت حظر هذا العضو.'));
		}

		await message.reply(
			confirmContainer(
				'تأكيد الحظر',
				`هل أنت متأكد من حظر **${target.user.tag}**?\n**السبب:** ${reason}`,
				`confirm-ban_${target.user.id}`,
				`cancel-ban_${target.user.id}`,
			),
		);
	},
};
