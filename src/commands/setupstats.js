const { PermissionFlagsBits, ChannelType } = require('discord.js');
const { successContainer, errorContainer } = require('../utils/components');
const fs = require('node:fs');
const path = require('node:path');

const configPath = path.join(__dirname, '..', '..', 'config.json');

module.exports = {
	name: 'setupstats',
	description: '📊 إعداد رومات الإحصائيات (Server Stats)',
	usage: '+setupstats',

	async execute(message, args) {
		if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
			return message.reply(errorContainer('خطأ', 'هذا الأمر للأدمن فقط.'));
		}

		await message.channel.sendTyping();

		try {
			
			const category = await message.guild.channels.create({
				name: '📊 الإحصائيات',
				type: ChannelType.GuildCategory,
				permissionOverwrites: [
					{
						id: message.guild.roles.everyone.id,
						deny: [PermissionFlagsBits.Connect], 
					},
				],
			});

			const members = message.guild.memberCount;
			const bots = message.guild.members.cache.filter((m) => m.user.bot).size;
			const humans = members - bots;

			
			const memberChannel = await message.guild.channels.create({
				name: `👥 الأعضاء: ${members}`,
				type: ChannelType.GuildVoice,
				parent: category.id,
			});

			const botChannel = await message.guild.channels.create({
				name: `🤖 البوتات: ${bots}`,
				type: ChannelType.GuildVoice,
				parent: category.id,
			});

			
			const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
			config.statsCategoryId = category.id;
			config.memberStatChannelId = memberChannel.id;
			config.botStatChannelId = botChannel.id;
			fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');

			
			const cachedConfig = require('../../config.json');
			cachedConfig.statsCategoryId = category.id;
			cachedConfig.memberStatChannelId = memberChannel.id;
			cachedConfig.botStatChannelId = botChannel.id;

			await message.reply(
				successContainer(
					'تم الإعداد',
					`تم إنشاء تصنيف الإحصائيات والرومات بنجاح.\n سيتم تحديث الأرقام تلقائياً عند دخول/خروج الأعضاء.`
				)
			);
		} catch (error) {
			console.error(error);
			await message.reply(errorContainer('خطأ', `فشل في إنشاء الرومات: ${error.message}`));
		}
	},
};
