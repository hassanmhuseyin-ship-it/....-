const { Events, EmbedBuilder } = require('discord.js');
const config = require('../../config.json');

module.exports = {
	name: Events.GuildMemberUpdate,
	async execute(oldMember, newMember) {
		if (!newMember.guild || !config.logRoleUpdateId) return;

		const logChannel = newMember.guild.channels.cache.get(config.logRoleUpdateId);
		if (!logChannel) return;

		const embed = new EmbedBuilder()
			.setAuthor({ name: newMember.user.tag, iconURL: newMember.user.displayAvatarURL() })
			.setTimestamp();

		
		if (oldMember.roles.cache.size !== newMember.roles.cache.size) {
			const removed = oldMember.roles.cache.filter(role => !newMember.roles.cache.has(role.id));
			const added = newMember.roles.cache.filter(role => !oldMember.roles.cache.has(role.id));

			if (added.size > 0) {
				embed.setColor('#2ecc71')
					.setTitle('🛡️ رتبة مضافة')
					.setDescription(`تم إضافة رتبة لـ ${newMember}`)
					.addFields({ name: 'الرتبة:', value: added.map(r => `${r}`).join(', ') });
				await logChannel.send({ embeds: [embed] }).catch(() => {});
			}
			
			if (removed.size > 0) {
				embed.setColor('#e74c3c')
					.setTitle('🛡️ رتبة مسحوبة')
					.setDescription(`تم سحب رتبة من ${newMember}`)
					.addFields({ name: 'الرتبة:', value: removed.map(r => `${r}`).join(', ') });
				await logChannel.send({ embeds: [embed] }).catch(() => {});
			}
		}

		
		if (oldMember.nickname !== newMember.nickname) {
			embed.setColor('#3498db')
				.setTitle('✏️ تغيير اللقب (Nickname)')
				.setDescription(`قام ${newMember} بتغيير لقبه في السيرفر`)
				.addFields(
					{ name: 'اللقب القديم:', value: oldMember.nickname || 'لا يوجد' },
					{ name: 'اللقب الجديد:', value: newMember.nickname || 'لا يوجد' }
				);
			await logChannel.send({ embeds: [embed] }).catch(() => {});
		}
	},
};
