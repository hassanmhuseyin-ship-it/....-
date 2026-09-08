const { Events, EmbedBuilder } = require('discord.js');
const config = require('../../config.json');

module.exports = {
	name: Events.MessageDelete,
	async execute(message) {
		if (message.author?.bot) return;
		if (!message.guild || !config.logMessageDeleteId) return;

		const logChannel = message.guild.channels.cache.get(config.logMessageDeleteId);
		if (!logChannel) return;

		const embed = new EmbedBuilder()
			.setColor('#e74c3c')
			.setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL() })
			.setTitle('🗑️ رسالة محذوفة')
			.addFields(
				{ name: 'الروم:', value: `${message.channel}`, inline: true },
				{ name: 'المرسل:', value: `${message.author}`, inline: true },
				{ name: 'المحتوى:', value: message.content || '*(لا يوجد نص، ربما صورة أو إيمبد)*' }
			)
			.setFooter({ text: `Message ID: ${message.id}` })
			.setTimestamp();

		
		if (message.attachments.size > 0) {
			const attachments = message.attachments.map(a => a.url).join('\n');
			embed.addFields({ name: 'المرفقات:', value: attachments.substring(0, 1024) });
		}

		await logChannel.send({ embeds: [embed] }).catch(() => {});
	},
};
