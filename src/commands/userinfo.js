const { ContainerBuilder, SeparatorSpacingSize, MessageFlags } = require('discord.js');
const { errorContainer } = require('../utils/components');

module.exports = {
	name: 'userinfo',
	aliases: ['ui', 'whois'],
	description: 'ℹ️ معلومات عضو',
	usage: '+userinfo [@user]',

	async execute(message, args) {
		const target = message.mentions.members.first() || message.member;
		const user = target.user;

		const roles = target.roles.cache
			.filter(r => r.id !== message.guild.id)
			.sort((a, b) => b.position - a.position)
			.map(r => `${r}`)
			.join(', ') || 'لا يوجد';

		const badges = user.flags?.toArray().map(f => {
			const badgeMap = {
				ActiveDeveloper: '👨‍💻',
				BugHunterLevel1: '🐛',
				BugHunterLevel2: '🐛🐛',
				CertifiedModerator: '🛡️',
				HypeSquadOnlineHouse1: '🏠',
				HypeSquadOnlineHouse2: '🏠',
				HypeSquadOnlineHouse3: '🏠',
				Hypesquad: '🎉',
				Partner: '👑',
				PremiumEarlySupporter: '💎',
				Staff: '⚙️',
				VerifiedBot: '✅',
				VerifiedDeveloper: '🔧',
			};
			return badgeMap[f] || '';
		}).filter(Boolean).join(' ') || 'لا يوجد';

		const statusMap = {
			online: '🟢 متصل',
			idle: '🟡 مشغول',
			dnd: '🔴 لا تزعجني',
			offline: '⚫ غير متصل',
		};

		const presence = target.presence?.status || 'offline';

		const info = [
			`**👤 الاسم:** ${user.tag}`,
			`**🆔 الآيدي:** \`${user.id}\``,
			`**📛 البادجات:** ${badges}`,
			`**📊 الحالة:** ${statusMap[presence]}`,
			`**📅 إنشاء الحساب:** <t:${Math.floor(user.createdTimestamp / 1000)}:R>`,
			`**📥 دخول السيرفر:** <t:${Math.floor(target.joinedTimestamp / 1000)}:R>`,
			`**🎭 الرتب (${target.roles.cache.size - 1}):** ${roles}`,
		].join('\n');

		await message.reply({
			components: [
				new ContainerBuilder()
					.setAccentColor(target.displayColor || 0x3498db)
					.addTextDisplayComponents(
						(text) => text.setContent(`## ℹ️ معلومات ${user.username}`),
					)
					.addSeparatorComponents((sep) => sep.setDivider(true).setSpacing(SeparatorSpacingSize.Small))
					.addTextDisplayComponents(
						(text) => text.setContent(info),
					),
			],
			flags: MessageFlags.IsComponentsV2,
		});
	},
};
