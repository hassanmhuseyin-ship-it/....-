const { PermissionFlagsBits } = require('discord.js');
const { successContainer, errorContainer } = require('../utils/components');
const fs = require('node:fs');
const path = require('node:path');

const configPath = path.join(__dirname, '..', '..', 'config.json');

module.exports = {
	name: 'setleave',
	description: '👋 تحديد روم الوداع',
	usage: '+setleave #channel',

	async execute(message, args) {
		if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
			return message.reply(errorContainer('خطأ', 'هذا الأمر للأدمن فقط.'));
		}

		const channel = message.mentions.channels.first();
		if (!channel) {
			return message.reply(errorContainer('خطأ', 'منشن الروم.\n**الاستخدام:** `+setleave #channel`'));
		}

		const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
		config.leaveChannelId = channel.id;
		fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');
		require('../../config.json').leaveChannelId = channel.id;

		await message.reply(successContainer('تم', `تم تعيين روم الوداع: ${channel}`));
	},
};
