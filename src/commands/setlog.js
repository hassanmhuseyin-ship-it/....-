const { PermissionFlagsBits, ChannelType } = require('discord.js');
const { successContainer, errorContainer } = require('../utils/components');
const fs = require('node:fs');
const path = require('node:path');

const configPath = path.join(__dirname, '..', '..', 'config.json');

module.exports = {
	name: 'setlog',
	aliases: ['setlogs', 'logchannel'],
	description: '📋 تحديد روم اللوقات',
	usage: '+setlog #channel',

	async execute(message, args) {
		if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
			return message.reply(errorContainer('خطأ', 'هذا الأمر للأدمن فقط.'));
		}

		const channel = message.mentions.channels.first();
		if (!channel) {
			return message.reply(errorContainer('خطأ', 'منشن روم اللوقات.\n**الاستخدام:** `+setlog #channel`'));
		}

		if (channel.type !== ChannelType.GuildText) {
			return message.reply(errorContainer('خطأ', 'يجب أن يكون روم نصي.'));
		}

		try {
			const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
			config.logChannelId = channel.id;
			fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');

			
			require('../../config.json').logChannelId = channel.id;

			await message.reply(
				successContainer(
					'تم تعيين اللوقات',
					`**الروم:** ${channel}\n**بواسطة:** ${message.author}\n\n> سيتم إرسال سجلات الإدارة في هذا الروم.`,
				),
			);
		} catch (error) {
			await message.reply(errorContainer('خطأ', `فشل تعيين اللوقات: ${error.message}`));
		}
	},
};
