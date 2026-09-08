const { PermissionFlagsBits } = require('discord.js');
const { successContainer, errorContainer } = require('../utils/components');
const fs = require('node:fs');
const path = require('node:path');

const configPath = path.join(__dirname, '..', '..', 'config.json');

module.exports = {
	name: 'setlevelrole',
	aliases: ['levelrole'],
	description: '🎭 رتبة تلقائية عند وصول ليفل',
	usage: '+setlevelrole <level> @role',

	async execute(message, args) {
		if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
			return message.reply(errorContainer('خطأ', 'هذا الأمر للأدمن فقط.'));
		}

		const level = parseInt(args[0]);
		const role = message.mentions.roles.first();

		if (isNaN(level) || level < 1) {
			return message.reply(errorContainer('خطأ', 'حدد ليفل صحيح.\n**الاستخدام:** `+setlevelrole <level> @role`'));
		}

		if (!role) {
			return message.reply(errorContainer('خطأ', 'منشن الرتبة.\n**الاستخدام:** `+setlevelrole <level> @role`'));
		}

		const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
		if (!config.levelRoles) config.levelRoles = {};
		config.levelRoles[String(level)] = role.id;
		fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');
		require('../../config.json').levelRoles = config.levelRoles;

		await message.reply(successContainer('تم', `عند وصول ليفل **${level}** سيحصل العضو على ${role}`));
	},
};
