const { PermissionFlagsBits } = require('discord.js');
const { successContainer, errorContainer } = require('../utils/components');
const { sendLog } = require('../utils/logger');

module.exports = {
	name: 'timeout',
	description: '⏰ عمل تايم آوت لعضو',
	usage: '+timeout @user <duration> [reason]',

	async execute(message, args) {
		if (!message.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
			return message.reply(errorContainer('خطأ', 'ما عندك صلاحية استخدام هذا الأمر.'));
		}

		const target = message.mentions.members.first();

		if (!target) {
			return message.reply(errorContainer('خطأ', 'منشن العضو المراد عمل تايم آوت له.\n**الاستخدام:** `+timeout @user <duration> [reason]`\n**المدد:** `1m` `5m` `10m` `30m` `1h` `6h` `12h` `1d` `3d` `7d`'));
		}

		const durationArg = args[1];
		if (!durationArg) {
			return message.reply(errorContainer('خطأ', 'حدد المدة.\n**المدد:** `1m` `5m` `10m` `30m` `1h` `6h` `12h` `1d` `3d` `7d`'));
		}

		
		const durations = {
			'1m': { ms: 60000, name: '1 دقيقة' },
			'5m': { ms: 300000, name: '5 دقائق' },
			'10m': { ms: 600000, name: '10 دقائق' },
			'30m': { ms: 1800000, name: '30 دقيقة' },
			'1h': { ms: 3600000, name: '1 ساعة' },
			'6h': { ms: 21600000, name: '6 ساعات' },
			'12h': { ms: 43200000, name: '12 ساعة' },
			'1d': { ms: 86400000, name: '1 يوم' },
			'3d': { ms: 259200000, name: '3 أيام' },
			'7d': { ms: 604800000, name: '7 أيام' },
		};

		const duration = durations[durationArg.toLowerCase()];
		if (!duration) {
			return message.reply(errorContainer('خطأ', `مدة غير صالحة: \`${durationArg}\`\n**المدد:** \`1m\` \`5m\` \`10m\` \`30m\` \`1h\` \`6h\` \`12h\` \`1d\` \`3d\` \`7d\``));
		}

		const reason = args.slice(2).join(' ') || 'لم يتم تحديد سبب';

		if (target.roles.highest.position >= message.member.roles.highest.position) {
			return message.reply(errorContainer('خطأ', 'لا يمكنك عمل تايم آوت لعضو لديه رتبة أعلى منك.'));
		}

		if (!target.moderatable) {
			return message.reply(errorContainer('خطأ', 'لا يمكن للبوت عمل تايم آوت لهذا العضو.'));
		}

		try {
			await target.timeout(duration.ms, reason);
			await message.reply(
				successContainer(
					'تم التايم آوت',
					`**العضو:** ${target}\n**المدة:** ${duration.name}\n**بواسطة:** ${message.author}\n**السبب:** ${reason}`,
				),
			);
			await sendLog(message.client, {
				title: 'تايم آوت',
				color: 0xe67e22,
				fields: { 'العضو': `${target}`, 'المدة': duration.name, 'بواسطة': `${message.author}`, 'السبب': reason },
			});
		} catch (error) {
			await message.reply(errorContainer('خطأ', `فشل تنفيذ التايم آوت: ${error.message}`));
		}
	},
};
