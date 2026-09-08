const { PermissionFlagsBits } = require('discord.js');
const { successContainer, errorContainer } = require('../utils/components');
const fs = require('node:fs');
const path = require('node:path');

const configPath = path.join(__dirname, '..', '..', 'config.json');

module.exports = {
	name: 'setlevelchannel',
	aliases: ['setlevelch'],
	description: '📈 تحديد روم إشعارات التلفيل',
	usage: '+setlevelchannel #channel',

	async execute(message, args) {
		if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
			return message.reply(errorContainer('خطأ', 'هذا الأمر للأدمن فقط.'));
		}

		const channel = message.mentions.channels.first();
		if (!channel) {
			return message.reply(errorContainer('خطأ', 'منشن الروم.\n**الاستخدام:** `+setlevelchannel #channel`'));
		}

		const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
		config.levelChannelId = channel.id;
		fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');
		require('../../config.json').levelChannelId = channel.id;

		await message.reply(
			successContainer(
				'تم تفعيل روم التلفيل', 
				`الآن سيتم إرسال إشعارات (ليفل أب) الخاصة بالأعضاء في روم ${channel}`
			)
		);
	},
};
