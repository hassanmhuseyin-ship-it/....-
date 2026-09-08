const { PermissionFlagsBits } = require('discord.js');
const { successContainer, errorContainer, warningContainer } = require('../utils/components');
const { addWarning, getWarnings } = require('../utils/warnings');
const { sendLog } = require('../utils/logger');

module.exports = {
	name: 'warn',
	description: '⚠️ إنذار عضو',
	usage: '+warn @user <reason>',

	async execute(message, args) {
		if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
			return message.reply(errorContainer('خطأ', 'ما عندك صلاحية استخدام هذا الأمر.'));
		}

		const target = message.mentions.members.first();
		const reason = args.slice(1).join(' ');

		if (!target) {
			return message.reply(errorContainer('خطأ', 'منشن العضو المراد إنذاره.\n**الاستخدام:** `+warn @user <reason>`'));
		}

		if (!reason) {
			return message.reply(errorContainer('خطأ', 'حدد سبب الإنذار.'));
		}

		const warning = addWarning(message.guild.id, target.id, message.author.id, reason);
		const totalWarns = getWarnings(message.guild.id, target.id).length;

		
		try {
			await target.send({
				components: [
					new (require('discord.js').ContainerBuilder)()
						.setAccentColor(0xe74c3c)
						.addTextDisplayComponents(
							(text) => text.setContent(`## ⚠️ لقد تلقيت إنذاراً!`)
						)
						.addSeparatorComponents((sep) => sep.setDivider(true).setSpacing(require('discord.js').SeparatorSpacingSize.Small))
						.addTextDisplayComponents(
							(text) => text.setContent(`تم إنذارك في سيرفر **${message.guild.name}**.\n\n**السبب:** ${reason}\n**الإنذار رقم:** #${warning.id}`)
						)
				],
				flags: require('discord.js').MessageFlags.IsComponentsV2
			});
		} catch (error) {
			console.log(`[Warn] Could not DM user ${target.user.tag}`);
		}

		await message.reply(
			warningContainer(
				'تم الإنذار',
				`**العضو:** ${target}\n**الإنذار رقم:** #${warning.id}\n**إجمالي الإنذارات:** ${totalWarns}\n**السبب:** ${reason}\n**بواسطة:** ${message.author}`,
			),
		);

		await sendLog(message.client, {
			title: 'إنذار عضو',
			color: 0xf39c12,
			fields: { 'العضو': `${target}`, 'الإنذار': `#${warning.id} (${totalWarns} إجمالي)`, 'السبب': reason, 'بواسطة': `${message.author}` },
		});
	},
};
