const { PermissionFlagsBits } = require('discord.js');
const { successContainer, errorContainer } = require('../utils/components');
const { sendLog } = require('../utils/logger');

module.exports = {
	name: 'kick',
	description: '👢 طرد عضو من السيرفر',
	usage: '+kick @user [reason]',

	async execute(message, args) {
		if (!message.member.permissions.has(PermissionFlagsBits.KickMembers)) {
			return message.reply(errorContainer('خطأ', 'ما عندك صلاحية استخدام هذا الأمر.'));
		}

		const target = message.mentions.members.first();
		const reason = args.slice(1).join(' ') || 'لم يتم تحديد سبب';

		if (!target) {
			return message.reply(errorContainer('خطأ', 'منشن العضو المراد طرده.\n**الاستخدام:** `+kick @user [reason]`'));
		}

		if (target.roles.highest.position >= message.member.roles.highest.position) {
			return message.reply(errorContainer('خطأ', 'لا يمكنك طرد عضو لديه رتبة أعلى منك أو مساوية لك.'));
		}

		if (!target.kickable) {
			return message.reply(errorContainer('خطأ', 'لا يمكن للبوت طرد هذا العضو.'));
		}

		try {
			await target.kick(reason);
			await message.reply(
				successContainer(
					'تم الطرد',
					`**العضو:** ${target.user.tag}\n**بواسطة:** ${message.author}\n**السبب:** ${reason}`,
				),
			);
			await sendLog(message.client, {
				title: 'طرد عضو',
				color: 0xe67e22,
				fields: { 'العضو': target.user.tag, 'بواسطة': `${message.author}`, 'السبب': reason },
			});
		} catch (error) {
			await message.reply(errorContainer('خطأ', `فشل طرد العضو: ${error.message}`));
		}
	},
};
