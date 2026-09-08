const { PermissionFlagsBits } = require('discord.js');
const { joinVoiceChannel } = require('@discordjs/voice');
const { successContainer, errorContainer } = require('../utils/components');

module.exports = {
	name: 'join',
	aliases: ['connect', 'vc'],
	description: '🎤 إدخال البوت للروم الصوتي',
	usage: '+join [channel]',

	async execute(message, args) {
		if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
			return message.reply(errorContainer('خطأ', 'ما عندك صلاحية إدخال البوت للرومات الصوتیة.'));
		}

		
		let voiceChannel = message.mentions.channels.first();
		if (!voiceChannel && args[0]) {
			voiceChannel = message.guild.channels.cache.get(args[0]);
		}
		if (!voiceChannel) {
			voiceChannel = message.member.voice.channel;
		}

		if (!voiceChannel || !voiceChannel.isVoiceBased()) {
			return message.reply(errorContainer('تنبيه', 'يجب أن تكون في روم صوتي أو تقوم بمنشن روم صوتي لكى أدخله.'));
		}

		try {
			joinVoiceChannel({
				channelId: voiceChannel.id,
				guildId: voiceChannel.guild.id,
				adapterCreator: voiceChannel.guild.voiceAdapterCreator,
				selfDeaf: false,
				selfMute: false
			});

			await message.reply(successContainer('تم بنجاح', `🎤 دخلت الروم الصوتي: ${voiceChannel}`));
		} catch (error) {
			console.error(error);
			await message.reply(errorContainer('خطأ', `لم أتمكن من الدخول: ${error.message}`));
		}
	},
};
