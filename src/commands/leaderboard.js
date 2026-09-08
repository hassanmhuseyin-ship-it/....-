const { AttachmentBuilder } = require('discord.js');
const { getLeaderboard } = require('../utils/leveling');
const { createCanvas, loadImage } = require('canvas');

module.exports = {
	name: 'leaderboard',
	aliases: ['lb', 'top'],
	description: '🏅 ترتيب الأعضاء بالنقاط بصورة',
	usage: '+leaderboard',

	async execute(message, args) {
		const leaderboard = getLeaderboard(message.guild.id, 10);

		if (leaderboard.length === 0) {
			const { infoContainer } = require('../utils/components');
			return message.reply(infoContainer('ليدربورد', 'لا يوجد بيانات حتى الآن.'));
		}

		await message.channel.sendTyping();

		const height = 150 + (leaderboard.length * 90);
		const canvas = createCanvas(800, height);
		const ctx = canvas.getContext('2d');

		
		ctx.fillStyle = '#1e1e24';
		ctx.fillRect(0, 0, canvas.width, canvas.height);

		
		ctx.fillStyle = '#2c2c36';
		ctx.fillRect(0, 0, canvas.width, 100);

		
		ctx.fillStyle = '#f1c40f';
		ctx.fillRect(0, 100, canvas.width, 4);

		
		ctx.fillStyle = '#ffffff';
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.font = 'bold 45px "Segoe UI", sans-serif';
		ctx.fillText(`🏆 Server Leaderboard`, 400, 50);

		
		for (let i = 0; i < leaderboard.length; i++) {
			const entry = leaderboard[i];
			const yPos = 120 + (i * 90);

			
			ctx.fillStyle = i % 2 === 0 ? '#22222a' : '#1e1e24';
			ctx.fillRect(20, yPos, 760, 80);

			
			ctx.textAlign = 'left';
			ctx.font = 'bold 36px "Segoe UI", sans-serif';
			ctx.fillStyle = i === 0 ? '#f1c40f' : i === 1 ? '#e67e22' : i === 2 ? '#95a5a6' : '#8e8e9c';
			ctx.fillText(`#${i + 1}`, 40, yPos + 40);

			try {
				const user = await message.client.users.fetch(entry.userId);
				const avatarURL = user.displayAvatarURL({ extension: 'png', size: 64 });
				const avatar = await loadImage(avatarURL);
				
				
				ctx.save();
				ctx.beginPath();
				ctx.arc(150, yPos + 40, 30, 0, Math.PI * 2, true);
				ctx.closePath();
				ctx.clip();
				ctx.drawImage(avatar, 120, yPos + 10, 60, 60);
				ctx.restore();

				
				ctx.font = 'bold 28px "Segoe UI", sans-serif';
				ctx.fillStyle = '#ffffff';
				ctx.fillText(user.username.substring(0, 15), 200, yPos + 40);
			} catch (e) {
				ctx.font = 'bold 28px "Segoe UI", sans-serif';
				ctx.fillStyle = '#ffffff';
				ctx.fillText(`Unknown User`, 200, yPos + 40);
			}

			
			ctx.textAlign = 'right';
			ctx.font = '24px "Segoe UI", sans-serif';
			
			ctx.fillStyle = '#f1c40f';
			ctx.fillText(`LVL ${entry.level}`, 580, yPos + 40);
			
			ctx.fillStyle = '#8e8e9c';
			ctx.fillText(`${entry.totalXP} XP`, 750, yPos + 40);
		}

		const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: 'leaderboard.png' });
		await message.reply({ files: [attachment] });
	},
};
