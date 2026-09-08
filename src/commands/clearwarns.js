const { PermissionFlagsBits } = require('discord.js');
const { successContainer, errorContainer } = require('../utils/components');
const { clearWarnings } = require('../utils/warnings');
const { sendLog } = require('../utils/logger');

module.exports = {
	name: 'clearwarns',
	aliases: ['clearwarn'],
	description: '🗑️ مسح جميع إنذارات عضو',
	usage: '+clearwarns @user',

	async execute(message, args) {
		if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
			return message.reply(errorContainer('خطأ', 'ما عندك صلاحية استخدام هذا الأمر.'));
		}

		const target = message.mentions.users.first();
		if (!target) {
			return message.reply(errorContainer('خطأ', 'منشن العضو.\n**الاستخدام:** `+clearwarns @user`'));
		}

		const count = clearWarnings(message.guild.id, target.id);

		if (count === 0) {
			return message.reply(errorContainer('خطأ', `${target} ما عنده أي إنذارات.`));
		}

		await message.reply(
			successContainer(
				'تم مسح الإنذارات',
				`**العضو:** ${target}\n**عدد الإنذارات المحذوفة:** ${count}\n**بواسطة:** ${message.author}`,
			),
		);

		await sendLog(message.client, {
			title: 'مسح إنذارات',
			color: 0x2ecc71,
			fields: { 'العضو': `${target}`, 'عدد المحذوفة': `${count}`, 'بواسطة': `${message.author}` },
		});
	},
};
