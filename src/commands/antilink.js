const { PermissionFlagsBits } = require('discord.js');
const { successContainer, errorContainer } = require('../utils/components');
const { getSetting, setSetting } = require('../utils/settings');

module.exports = {
	name: 'antilink',
	description: '🛡️ تفعيل/تعطيل حذف الروابط',
	usage: '+antilink <on/off>',

	async execute(message, args) {
		if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
			return message.reply(errorContainer('خطأ', 'هذا الأمر للأدمن فقط.'));
		}

		const action = args[0]?.toLowerCase();
		if (!action || !['on', 'off'].includes(action)) {
			return message.reply(errorContainer('خطأ', '**الاستخدام:** `+antilink on/off`'));
		}

		const enabled = action === 'on';
		setSetting(message.guild.id, 'antilink', enabled);

		await message.reply(
			successContainer(
				enabled ? 'تم تفعيل الحماية' : 'تم تعطيل الحماية',
				enabled
					? '🛡️ حذف الروابط مفعّل.\n> سيتم حذف أي رابط يرسله عضو بدون صلاحيات.'
					: '🛡️ حذف الروابط معطّل.',
			),
		);
	},
};
