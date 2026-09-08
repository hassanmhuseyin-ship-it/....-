const { PermissionFlagsBits } = require('discord.js');
const { successContainer, errorContainer } = require('../utils/components');

module.exports = {
	name: 'close',
	description: '🔒 إغلاق روم عن الكتابة',
	usage: '+close [#channel]',

	async execute(message, args) {
		if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
			return message.reply(errorContainer('خطأ', 'ما عندك صلاحية استخدام هذا الأمر.'));
		}

		const channel = message.mentions.channels.first() || message.channel;

		try {
			await channel.permissionOverwrites.edit(message.guild.roles.everyone, {
				SendMessages: false,
			});

			await message.reply(
				successContainer(
					'تم إغلاق الروم',
					`**الروم:** ${channel}\n**بواسطة:** ${message.author}\n\n> لم يعد بإمكان الأعضاء الكتابة في هذا الروم.`,
				),
			);
		} catch (error) {
			await message.reply(errorContainer('خطأ', `فشل إغلاق الروم: ${error.message}`));
		}
	},
};
