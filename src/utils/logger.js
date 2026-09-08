const { ContainerBuilder, SeparatorSpacingSize, MessageFlags } = require('discord.js');
const config = require('../../config.json');

async function sendLog(client, { title, color, fields }) {
	if (!config.logChannelId) return;

	const channel = client.channels.cache.get(config.logChannelId);
	if (!channel) return;

	let description = '';
	for (const [key, value] of Object.entries(fields)) {
		description += `**${key}:** ${value}\n`;
	}

	try {
		await channel.send({
			components: [
				new ContainerBuilder()
					.setAccentColor(color || 0x3498db)
					.addTextDisplayComponents(
						(text) => text.setContent(`## 📋 ${title}`),
					)
					.addSeparatorComponents((sep) => sep.setDivider(true).setSpacing(SeparatorSpacingSize.Small))
					.addTextDisplayComponents(
						(text) => text.setContent(description),
					)
					.addSeparatorComponents((sep) => sep.setDivider(true).setSpacing(SeparatorSpacingSize.Small))
					.addTextDisplayComponents(
						(text) => text.setContent(`🕐 <t:${Math.floor(Date.now() / 1000)}:F>`),
					),
			],
			flags: MessageFlags.IsComponentsV2,
		});
	} catch (error) {
		console.error('[❌] فشل إرسال اللوق:', error);
	}
}

module.exports = { sendLog };
