const { PermissionFlagsBits } = require('discord.js');
const { successContainer, errorContainer } = require('../utils/components');
const { getSetting, setSetting } = require('../utils/settings');

module.exports = {
	name: 'antiraid',
	description: '🛡️ تفعيل/تعطيل حماية الريد',
	usage: '+antiraid <on/off>',

	async execute(message, args) {
		if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
			return message.reply(errorContainer('خطأ', 'هذا الأمر للأدمن فقط.'));
		}

		const action = args[0]?.toLowerCase();
		if (!action || !['on', 'off'].includes(action)) {
			return message.reply(errorContainer('خطأ', '**الاستخدام:** `+antiraid on/off`'));
		}

		const enabled = action === 'on';
		setSetting(message.guild.id, 'antiraid', enabled);

		await message.reply(
			successContainer(
				enabled ? 'تم تفعيل الحماية' : 'تم تعطيل الحماية',
				enabled
					? '🛡️ حماية الريد مفعّلة.\n> سيتم حظر الحسابات الجديدة التي تدخل بسرعة.'
					: '🛡️ حماية الريد معطّلة.',
			),
		);
	},
};
