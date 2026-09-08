const { PermissionFlagsBits } = require('discord.js');
const { successContainer, errorContainer } = require('../utils/components');
const { sendLog } = require('../utils/logger');

module.exports = {
	name: 'unhide',
	description: '👁️‍🗨️ إظهار الروم للأعضاء',
	usage: '+unhide [channel]',

	async execute(message, args) {
		if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
			return message.reply(errorContainer('خطأ', 'ما عندك صلاحية استخدام هذا الأمر.'));
		}

		const channel = message.mentions.channels.first() || message.channel;

		try {
			await channel.permissionOverwrites.edit(message.guild.roles.everyone, {
				ViewChannel: true,
			});

			await message.reply(
				successContainer('تم الإظهار', `تم إظهار روم ${channel} بنجاح.`),
			);

			await sendLog(message.client, {
				title: 'إظهار روم',
				color: 0x2ecc71,
				fields: { 'الروم': `${channel}`, 'بواسطة': `${message.author}` },
			});
		} catch (error) {
			await message.reply(errorContainer('خطأ', `فشل إظهار الروم: ${error.message}`));
		}
	},
};
