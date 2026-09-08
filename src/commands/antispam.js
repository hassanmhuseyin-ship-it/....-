const { PermissionFlagsBits } = require('discord.js');
const { successContainer, errorContainer } = require('../utils/components');
const { getSetting, setSetting } = require('../utils/settings');

module.exports = {
	name: 'antispam',
	description: '🛡️ تفعيل/تعطيل حماية السبام',
	usage: '+antispam <on/off>',

	async execute(message, args) {
		if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
			return message.reply(errorContainer('خطأ', 'هذا الأمر للأدمن فقط.'));
		}

		const action = args[0]?.toLowerCase();
		if (!action || !['on', 'off'].includes(action)) {
			return message.reply(errorContainer('خطأ', '**الاستخدام:** `+antispam on/off`'));
		}

		const enabled = action === 'on';
		setSetting(message.guild.id, 'antispam', enabled);

		await message.reply(
			successContainer(
				enabled ? 'تم تفعيل الحماية' : 'تم تعطيل الحماية',
				enabled
					? '🛡️ حماية السبام مفعّلة.\n> 5 رسائل خلال 3 ثواني = تايم آوت دقيقة.'
					: '🛡️ حماية السبام معطّلة.',
			),
		);
	},
};
