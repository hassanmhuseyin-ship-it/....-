const { PermissionFlagsBits } = require('discord.js');
const { infoContainer, errorContainer } = require('../utils/components');
const { getWarnings } = require('../utils/warnings');

module.exports = {
	name: 'warnings',
	aliases: ['warns'],
	description: '📋 عرض إنذارات عضو',
	usage: '+warnings @user',

	async execute(message, args) {
		if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
			return message.reply(errorContainer('خطأ', 'ما عندك صلاحية استخدام هذا الأمر.'));
		}

		const target = message.mentions.users.first();
		if (!target) {
			return message.reply(errorContainer('خطأ', 'منشن العضو.\n**الاستخدام:** `+warnings @user`'));
		}

		const warnings = getWarnings(message.guild.id, target.id);

		if (warnings.length === 0) {
			return message.reply(infoContainer('الإنذارات', `${target} ما عنده أي إنذارات. ✨`));
		}

		let list = '';
		for (const w of warnings) {
			list += `**#${w.id}** — ${w.reason}\n> بواسطة <@${w.moderator}> • <t:${Math.floor(new Date(w.date).getTime() / 1000)}:R>\n\n`;
		}

		await message.reply(
			infoContainer(
				`إنذارات ${target.tag}`,
				`**الإجمالي:** ${warnings.length}\n\n${list}`,
			),
		);
	},
};
