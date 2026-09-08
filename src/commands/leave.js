const { PermissionFlagsBits } = require('discord.js');
const { getVoiceConnection } = require('@discordjs/voice');
const { successContainer, errorContainer } = require('../utils/components');

module.exports = {
	name: 'leave',
	aliases: ['disconnect', 'quit', 'dc'],
	description: '👋 إخراج البوت من الروم الصوتي',
	usage: '+leave',

	async execute(message, args) {
		if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
			return message.reply(errorContainer('خطأ', 'ما عندك صلاحية إخراج البوت من الرومات الصوتیة.'));
		}

		const connection = getVoiceConnection(message.guild.id);
		if (!connection) {
			return message.reply(errorContainer('تنبيه', 'أنا لست في روم صوتي حالياً!'));
		}

		try {
			connection.destroy();
			await message.reply(successContainer('تم بنجاح', `👋 خرجت من الروم الصوتي.`));
		} catch (error) {
			console.error(error);
			await message.reply(errorContainer('خطأ', `لم أتمكن من الخروج: ${error.message}`));
		}
	},
};
