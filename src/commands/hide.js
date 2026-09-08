const { PermissionFlagsBits } = require('discord.js');
const { successContainer, errorContainer } = require('../utils/components');
const { sendLog } = require('../utils/logger');

module.exports = {
	name: 'hide',
	description: '👁️ إخفاء الروم عن الأعضاء',
	usage: '+hide [channel]',

	async execute(message, args) {
		if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
			return message.reply(errorContainer('خطأ', 'ما عندك صلاحية استخدام هذا الأمر.'));
		}

		const channel = message.mentions.channels.first() || message.channel;

		try {
			await channel.permissionOverwrites.edit(message.guild.roles.everyone, {
				ViewChannel: false,
			});

			await message.reply(
				successContainer('تم الإخفاء', `تم إخفاء روم ${channel} بنجاح.`),
			);

			await sendLog(message.client, {
				title: 'إخفاء روم',
				color: 0xe74c3c,
				fields: { 'الروم': `${channel}`, 'بواسطة': `${message.author}` },
			});
		} catch (error) {
			await message.reply(errorContainer('خطأ', `فشل إخفاء الروم: ${error.message}`));
		}
	},
};
