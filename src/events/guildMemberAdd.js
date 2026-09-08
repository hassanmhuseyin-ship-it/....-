const { Events, ContainerBuilder, SeparatorSpacingSize, MessageFlags, AttachmentBuilder } = require('discord.js');
const { createCanvas, loadImage } = require('@napi-rs/canvas');
const config = require('../../config.json');

module.exports = {
	name: Events.GuildMemberAdd,
	async execute(member) {
		const channelId = config.welcomeChannelId;
		if (!channelId) return;

		const channel = member.guild.channels.cache.get(channelId);
		if (!channel) return;

		try {
			
			const width = 1000;
			const height = 400;
			const canvas = createCanvas(width, height);
			const ctx = canvas.getContext('2d');
			const welcomeColor = config.welcomeColor || '#5865F2';

			
			ctx.fillStyle = '#1e1f22'; 
			ctx.beginPath();
			ctx.roundRect(0, 0, width, height, 30);
			ctx.fill();
			ctx.clip(); 

			if (config.welcomeBgUrl) {
				try {
					const bgImage = await loadImage(config.welcomeBgUrl);
					ctx.drawImage(bgImage, 0, 0, width, height);
					
					
					ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
					ctx.fillRect(0, 0, width, height);
				} catch (err) {
					console.error('Failed to load welcomeBgUrl', err);
				}
			}

			
			ctx.fillStyle = '#ffffff';
			ctx.font = 'bold 80px sans-serif';
			ctx.textAlign = 'center';
			ctx.fillText('WELCOME', width / 2, 280);

			ctx.fillStyle = welcomeColor;
			ctx.font = 'bold 50px sans-serif';
			ctx.fillText(member.user.username.toUpperCase(), width / 2, 340);

			ctx.fillStyle = '#b5bac1';
			ctx.font = '30px sans-serif';
			ctx.fillText(`Member #${member.guild.memberCount}`, width / 2, 380);

			
			const avatarSize = 160;
			const avatarX = (width / 2) - (avatarSize / 2);
			const avatarY = 50;
			
			
			ctx.beginPath();
			ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, (avatarSize / 2) + 8, 0, Math.PI * 2, true);
			ctx.fillStyle = welcomeColor;
			ctx.fill();

			
			try {
				const avatarUrl = member.user.displayAvatarURL({ extension: 'png', size: 256 });
				const avatar = await loadImage(avatarUrl);
				ctx.save();
				ctx.beginPath();
				ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2, true);
				ctx.closePath();
				ctx.clip();
				ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
				ctx.restore();
			} catch (e) {
				console.error('Failed to load avatar for welcome', e);
			}

			const attachment = new AttachmentBuilder(await canvas.encode('png'), { name: 'welcome-image.png' });

			await channel.send({
				content: `مرحباً ${member} في **${member.guild.name}**! 🎉`,
				files: [attachment]
			});
		} catch (error) {
			console.error('[❌] خطأ في رسالة الترحيب:', error);
		}

        
        if (config.autoRoleId) {
            const autoRole = member.guild.roles.cache.get(config.autoRoleId);
            if (autoRole) {
                
                member.roles.add(autoRole).catch(() => {});
            }
        }

		
		try {
			if (config.memberStatChannelId && config.botStatChannelId) {
				const members = member.guild.memberCount;
				const bots = member.guild.members.cache.filter((m) => m.user.bot).size;
				const memberChannel = member.guild.channels.cache.get(config.memberStatChannelId);
				const botChannel = member.guild.channels.cache.get(config.botStatChannelId);

				if (memberChannel) await memberChannel.setName(`👥 الأعضاء: ${members}`);
				if (botChannel) await botChannel.setName(`🤖 البوتات: ${bots}`);
			}
		} catch (error) {
			console.error('[❌] خطأ في تحديث الإحصائيات:', error);
		}
	},
};
