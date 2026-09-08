const { PermissionFlagsBits } = require('discord.js');
const { successContainer, errorContainer } = require('../utils/components');

module.exports = {
	name: 'lock',
	description: '🔒 قفل الروم للجميع',
	usage: '+lock [#channel]',

	async execute(message, args) {
		if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
			return message.reply(errorContainer('خطأ', 'ما عندك صلاحية.'));
		}

		const channel = message.mentions.channels.first() || message.channel;

		try {
			await channel.permissionOverwrites.edit(message.guild.roles.everyone, {
				SendMessages: false,
				Connect: false, 
			});

			await message.reply(
				successContainer('تم قفل الروم', `**الروم:** ${channel}\n**بواسطة:** ${message.author}`),
			);
		} catch (error) {
			await message.reply(errorContainer('خطأ', `فشل: ${error.message}`));
		}
	},
};
