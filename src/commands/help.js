const { ContainerBuilder, SeparatorSpacingSize, MessageFlags } = require('discord.js');

module.exports = {
	name: 'help',
	aliases: ['h', 'commands', 'cmds'],
	description: '📖 عرض جميع الأوامر',
	usage: '+help',

	async execute(message, args) {
		const commands = message.client.commands;

		
		const uniqueCommands = new Map();
		commands.forEach(cmd => {
			if (!uniqueCommands.has(cmd.name)) {
				uniqueCommands.set(cmd.name, cmd);
			}
		});

		const moderation = ['mute', 'unmute', 'ban', 'kick', 'timeout', 'jail', 'unjail', 'warn', 'warnings', 'clearwarns', 'role', 'nickname'];
		const channels = ['open', 'hide', 'unhide', 'close', 'lock', 'unlock', 'slowmode', 'purge', 'nuke', 'autoline', 'line', 'join', 'leave'];
		const info = ['userinfo', 'serverinfo', 'avatar', 'banner', 'help'];
		const interaction = ['say', 'embed', 'announce', 'poll', 'copy'];
		const protection = ['antiraid', 'antispam', 'antilink'];
		const giveaway = ['giveaway', 'gend', 'greroll'];
		const leveling = ['rank', 'leaderboard', 'setlevelrole'];
		const tickets = ['ticket-setup', 'ticket-close', 'ticket-add'];
		const stats = ['setupstats'];
		const application = ['apply-setup'];
		const configGrp = ['setlog', 'setwelcome', 'setleave', 'setlevelchannel', 'setsuggestchannel'];

		const { ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');

		const selectMenu = new StringSelectMenuBuilder()
			.setCustomId('help-menu')
			.setPlaceholder('اختر قسماً لعرض أوامره...')
			.addOptions(
				new StringSelectMenuOptionBuilder()
					.setLabel('الإدارة')
					.setDescription('أوامر الطرد والحظر والميوت')
					.setEmoji('🛡️')
					.setValue('cat_moderation'),
				new StringSelectMenuOptionBuilder()
					.setLabel('الرومات')
					.setDescription('أوامر التحكم بالرومات')
					.setEmoji('📝')
					.setValue('cat_channels'),
				new StringSelectMenuOptionBuilder()
					.setLabel('المعلومات')
					.setDescription('أوامر عرض معلومات السيرفر والأعضاء')
					.setEmoji('ℹ️')
					.setValue('cat_info'),
				new StringSelectMenuOptionBuilder()
					.setLabel('التفاعل مع البوت')
					.setDescription('أوامر مساعدة والدردشة والتفاعل')
					.setEmoji('🎭')
					.setValue('cat_interaction'),
				new StringSelectMenuOptionBuilder()
					.setLabel('الحماية')
					.setDescription('إعدادات مضاد سبام وريد وروابط')
					.setEmoji('🔐')
					.setValue('cat_protection'),
				new StringSelectMenuOptionBuilder()
					.setLabel('القيف أواي')
					.setDescription('أنظمة السحوبات')
					.setEmoji('🎁')
					.setValue('cat_giveaway'),
				new StringSelectMenuOptionBuilder()
					.setLabel('التلفيل والإحصائيات')
					.setDescription('أوامر الـ XP وإحصائيات السيرفر')
					.setEmoji('📈')
					.setValue('cat_levelstats'),
				new StringSelectMenuOptionBuilder()
					.setLabel('التيكت والتقديمات')
					.setDescription('أوامر الدعم الفني ونظام التقديم')
					.setEmoji('🎫')
					.setValue('cat_tickets'),
				new StringSelectMenuOptionBuilder()
					.setLabel('الإعدادات')
					.setDescription('إعدادات الترحيب واللوق للآدمن')
					.setEmoji('⚙️')
					.setValue('cat_config')
			);

		const row = new ActionRowBuilder().addComponents(selectMenu);

		await message.reply({
			components: [
				new ContainerBuilder()
					.setAccentColor(0x5865F2)
					.addTextDisplayComponents(
						(text) => text.setContent(`## 📖 قائمة أوامر EnzoBot`),
					)
					.addSeparatorComponents((sep) => sep.setDivider(true).setSpacing(SeparatorSpacingSize.Small))
					.addTextDisplayComponents(
						(text) => text.setContent(`اختر القسم من القائمة المنسدلة أدناه لعرض تفاصيل الأوامر.\n> إجمالي الأوامر: **${uniqueCommands.size}**`),
					),
				row
			],
			flags: MessageFlags.IsComponentsV2,
		});
	},
};
