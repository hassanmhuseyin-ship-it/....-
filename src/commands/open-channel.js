const { PermissionFlagsBits } = require('discord.js');
const { successContainer, errorContainer } = require('../utils/components');

module.exports = {
	name: 'open',
	description: '🔓 فتح روم للكتابة',
	usage: '+open [#channel]',

	async execute(message, args) {
		if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
			return message.reply(errorContainer('خطأ', 'ما عندك صلاحية استخدام هذا الأمر.'));
		}

		const channel = message.mentions.channels.first() || message.channel;

		try {
			await channel.permissionOverwrites.edit(message.guild.roles.everyone, {
				SendMessages: true,
			});

			await message.reply(
				successContainer(
					'تم فتح الروم',
					`**الروم:** ${channel}\n**بواسطة:** ${message.author}\n\n> يمكن للأعضاء الآن الكتابة في هذا الروم.`,
				),
			);
		} catch (error) {
			await message.reply(errorContainer('خطأ', `فشل فتح الروم: ${error.message}`));
		}
	},
};
