const { PermissionFlagsBits, ContainerBuilder, SeparatorSpacingSize, MessageFlags, ButtonBuilder, ButtonStyle } = require('discord.js');
const { errorContainer } = require('../utils/components');
const fs = require('node:fs');
const path = require('node:path');

const configPath = path.join(__dirname, '..', '..', 'config.json');

module.exports = {
	name: 'apply-setup',
	description: '📝 إنشاء رسالة التقديم للإدارة',
	usage: '+apply-setup #log_channel',

	async execute(message, args) {
		if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
			return message.reply(errorContainer('خطأ', 'هذا الأمر للأدمن فقط.'));
		}

		const logChannel = message.mentions.channels.first();
		if (!logChannel) {
			return message.reply(errorContainer('خطأ', 'منشن روم اللوق لاستلام التقديمات.\n**الاستخدام:** `+apply-setup #channel`'));
		}

		
		const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
		config.applicationLogChannelId = logChannel.id;
		fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');
		require('../../config.json').applicationLogChannelId = logChannel.id;

		await message.delete().catch(() => {});

		await message.channel.send({
			components: [
				new ContainerBuilder()
					.setAccentColor(0x9b59b6)
					.addTextDisplayComponents(
						(text) => text.setContent(`## 📝 تقديم للإدارة`),
					)
					.addSeparatorComponents((sep) => sep.setDivider(true).setSpacing(SeparatorSpacingSize.Small))
					.addTextDisplayComponents(
						(text) => text.setContent(
							'هل تطمح لأن تكون جزءاً من فريق الإدارة؟\n' +
							'اضغط على الزر أدناه لتعبئة نموذج التقديم. سيتم مراجعة طلبك من قبل الإدارة العليا في أقرب وقت.'
						),
					)
					.addActionRowComponents((row) =>
						row.addComponents(
							new ButtonBuilder()
								.setCustomId('apply-open-modal')
								.setLabel('📝 تقديم طلب')
								.setStyle(ButtonStyle.Primary),
						),
					),
			],
			flags: MessageFlags.IsComponentsV2,
		});
	},
};
