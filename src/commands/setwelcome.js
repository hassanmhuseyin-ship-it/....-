const { PermissionFlagsBits } = require('discord.js');
const { successContainer, errorContainer } = require('../utils/components');
const fs = require('node:fs');
const path = require('node:path');

const configPath = path.join(__dirname, '..', '..', 'config.json');

module.exports = {
	name: 'setwelcome',
	description: '👋 تحديد روم الترحيب',
	usage: '+setwelcome #channel',

	async execute(message, args) {
		if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
			return message.reply(errorContainer('خطأ', 'هذا الأمر للأدمن فقط.'));
		}

		const channel = message.mentions.channels.first();
		if (!channel) {
			return message.reply(errorContainer('خطأ', 'منشن الروم.\n**الاستخدام:** `+setwelcome #channel`'));
		}

		const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
		config.welcomeChannelId = channel.id;
		fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');
		require('../../config.json').welcomeChannelId = channel.id;

		await message.reply(successContainer('تم', `تم تعيين روم الترحيب: ${channel}`));
	},
};
