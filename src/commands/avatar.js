const { ContainerBuilder, SeparatorSpacingSize, MessageFlags } = require('discord.js');
const { errorContainer } = require('../utils/components');

module.exports = {
	name: 'avatar',
	aliases: ['av', 'pfp'],
	description: '🖼️ عرض صورة عضو',
	usage: '+avatar [@user]',

	async execute(message, args) {
		const user = message.mentions.users.first() || message.author;
		const avatarURL = user.displayAvatarURL({ size: 1024, dynamic: true });

		await message.reply({
			components: [
				new ContainerBuilder()
					.setAccentColor(0x9b59b6)
					.addTextDisplayComponents(
						(text) => text.setContent(`## 🖼️ صورة ${user.username}`),
					)
					.addSeparatorComponents((sep) => sep.setDivider(true).setSpacing(SeparatorSpacingSize.Small))
					.addTextDisplayComponents(
						(text) => text.setContent(`[🔗 رابط الصورة الكاملة](${avatarURL})`),
					)
					.addMediaGalleryComponents((gallery) =>
						gallery.addItems((item) =>
							item.setURL(avatarURL),
						),
					),
			],
			flags: MessageFlags.IsComponentsV2,
		});
	},
};
