const { ContainerBuilder, SeparatorSpacingSize, MessageFlags } = require('discord.js');
const { errorContainer, infoContainer } = require('../utils/components');

module.exports = {
	name: 'banner',
	description: '🖼 عرض بانر العضو',
	usage: '+banner [@user]',

	async execute(message, args) {
		const user = message.mentions.users.first() || message.author;
		
		
		const fetchedUser = await message.client.users.fetch(user.id, { force: true });
		const bannerURL = fetchedUser.bannerURL({ size: 1024, dynamic: true });

		if (!bannerURL) {
			const color = fetchedUser.hexAccentColor;
			if (color) {
				return message.reply({
					components: [
						new ContainerBuilder()
							.setAccentColor(fetchedUser.accentColor)
							.addTextDisplayComponents(
								(text) => text.setContent(`## 🖼 بانر ${user.username}`),
							)
							.addSeparatorComponents((sep) => sep.setDivider(true).setSpacing(SeparatorSpacingSize.Small))
							.addTextDisplayComponents(
								(text) => text.setContent(`> العضو ما عنده بانر صورة، لكن لون البانر الخاص فيه هو: **${color.toUpperCase()}**`),
							),
					],
					flags: MessageFlags.IsComponentsV2,
				});
			} else {
				return message.reply(infoContainer('بانر', `${user.username} ما عنده بانر مخصص.`));
			}
		}

		await message.reply({
			components: [
				new ContainerBuilder()
					.setAccentColor( fetchedUser.accentColor || 0x9b59b6 )
					.addTextDisplayComponents(
						(text) => text.setContent(`## 🖼 بانر ${user.username}`),
					)
					.addSeparatorComponents((sep) => sep.setDivider(true).setSpacing(SeparatorSpacingSize.Small))
					.addTextDisplayComponents(
						(text) => text.setContent(`[🔗 رابط البانر الكامل](${bannerURL})`),
					)
					.addMediaGalleryComponents((gallery) =>
						gallery.addItems((item) =>
							item.setURL(bannerURL),
						),
					),
			],
			flags: MessageFlags.IsComponentsV2,
		});
	},
};
