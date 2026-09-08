const { Events, EmbedBuilder } = require('discord.js');
const config = require('../../config.json');

module.exports = {
	name: Events.MessageUpdate,
	async execute(oldMessage, newMessage) {
		if (newMessage.author?.bot) return;
		if (!newMessage.guild || !config.logMessageUpdateId) return;
		
		
		if (oldMessage.content === newMessage.content) return;

		const logChannel = newMessage.guild.channels.cache.get(config.logMessageUpdateId);
		if (!logChannel) return;

		const embed = new EmbedBuilder()
			.setColor('#f1c40f')
			.setAuthor({ name: newMessage.author.tag, iconURL: newMessage.author.displayAvatarURL() })
			.setTitle('📝 رسالة معدلة')
			.addFields(
				{ name: 'الروم:', value: `${newMessage.channel}`, inline: true },
				{ name: 'الرسالة الأصلية:', value: `[الانتقال للرسالة](${newMessage.url})`, inline: true },
				{ name: 'المحتوى القديم:', value: oldMessage.content || '*(فارغ)*' },
				{ name: 'المحتوى الجديد:', value: newMessage.content || '*(فارغ)*' }
			)
			.setFooter({ text: `Message ID: ${newMessage.id}` })
			.setTimestamp();

		await logChannel.send({ embeds: [embed] }).catch(() => {});
	},
};
