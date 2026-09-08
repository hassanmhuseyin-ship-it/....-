const { PermissionFlagsBits, ContainerBuilder, SeparatorSpacingSize, MessageFlags } = require('discord.js');
const { successContainer, errorContainer } = require('../utils/components');
const { sendLog } = require('../utils/logger');


const activeGiveaways = new Map();

module.exports = {
	name: 'giveaway',
	aliases: ['gstart', 'gw'],
	description: '🎁 بدء قيف أواي',
	usage: '+giveaway <duration> <prize>',

	async execute(message, args) {
		if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
			return message.reply(errorContainer('خطأ', 'ما عندك صلاحية استخدام هذا الأمر.'));
		}

		const durationArg = args[0];
		const prize = args.slice(1).join(' ');

		if (!durationArg || !prize) {
			return message.reply(errorContainer('خطأ', '**الاستخدام:** `+giveaway <duration> <prize>`\n**مثال:** `+giveaway 1h نايترو`\n**المدد:** `1m` `5m` `30m` `1h` `6h` `12h` `1d` `3d` `7d`'));
		}

		const durationMap = {
			'1m': 60000, '5m': 300000, '10m': 600000, '30m': 1800000,
			'1h': 3600000, '6h': 21600000, '12h': 43200000,
			'1d': 86400000, '3d': 259200000, '7d': 604800000,
		};

		const duration = durationMap[durationArg.toLowerCase()];
		if (!duration) {
			return message.reply(errorContainer('خطأ', `مدة غير صالحة.\n**المدد:** \`1m\` \`5m\` \`30m\` \`1h\` \`6h\` \`12h\` \`1d\` \`3d\` \`7d\``));
		}

		const endTime = Math.floor((Date.now() + duration) / 1000);

		const giveawayMsg = await message.channel.send({
			components: [
				new ContainerBuilder()
					.setAccentColor(0xf1c40f)
					.addTextDisplayComponents(
						(text) => text.setContent(`## 🎁 قيف أواي!`),
					)
					.addSeparatorComponents((sep) => sep.setDivider(true).setSpacing(SeparatorSpacingSize.Small))
					.addTextDisplayComponents(
						(text) => text.setContent(
							`**🎉 الجائزة:** ${prize}\n` +
							`**👤 بواسطة:** ${message.author}\n` +
							`**⏰ ينتهي:** <t:${endTime}:R>\n\n` +
							`> تفاعل بـ 🎉 للمشاركة!`,
						),
					),
			],
			flags: MessageFlags.IsComponentsV2,
		});

		await giveawayMsg.react('🎉');

		
		activeGiveaways.set(giveawayMsg.id, {
			messageId: giveawayMsg.id,
			channelId: message.channel.id,
			prize,
			endTime: Date.now() + duration,
			hostId: message.author.id,
		});

		
		setTimeout(async () => {
			try {
				const msg = await message.channel.messages.fetch(giveawayMsg.id);
				const reaction = msg.reactions.cache.get('🎉');
				const users = await reaction?.users.fetch();
				const participants = users?.filter(u => !u.bot);

				if (!participants || participants.size === 0) {
					await message.channel.send(
						errorContainer('انتهى القيف أواي', `لا يوجد مشاركين للجائزة **${prize}** 😢`),
					);
				} else {
					const winner = participants.random();
					await message.channel.send({
						components: [
							new ContainerBuilder()
								.setAccentColor(0x2ecc71)
								.addTextDisplayComponents(
									(text) => text.setContent(`## 🎉 مبروك!`),
								)
								.addSeparatorComponents((sep) => sep.setDivider(true).setSpacing(SeparatorSpacingSize.Small))
								.addTextDisplayComponents(
									(text) => text.setContent(
										`**🏆 الفائز:** ${winner}\n` +
										`**🎁 الجائزة:** ${prize}\n` +
										`**👥 المشاركين:** ${participants.size}`,
									),
								),
						],
						flags: MessageFlags.IsComponentsV2,
					});
				}

				activeGiveaways.delete(giveawayMsg.id);
			} catch (error) {
				console.error('[❌] خطأ في إنهاء القيف أواي:', error);
			}
		}, duration);
	},
};


module.exports.activeGiveaways = activeGiveaways;
