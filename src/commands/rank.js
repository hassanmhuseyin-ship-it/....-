const { AttachmentBuilder } = require('discord.js');
const { getUserData, xpForLevel, getLeaderboard } = require('../utils/leveling');
const { createCanvas, loadImage, registerFont } = require('canvas');

module.exports = {
	name: 'rank',
	aliases: ['level', 'lvl'],
	description: '📊 عرض مستوى العضو بصورة',
	usage: '+rank [@user]',

	async execute(message, args) {
		const user = message.mentions.users.first() || message.author;
		const data = getUserData(message.guild.id, user.id);
		const neededXP = xpForLevel(data.level + 1);
		
		
		const lb = getLeaderboard(message.guild.id, 9999);
		const rank = lb.findIndex(u => u.userId === user.id) + 1;

		await message.channel.sendTyping();

		
		const canvas = createCanvas(900, 250);
		const ctx = canvas.getContext('2d');

		
		ctx.fillStyle = '#1e1e24';
		ctx.fillRect(0, 0, canvas.width, canvas.height);

		
		const gradient = ctx.createLinearGradient(0, 0, 900, 0);
		gradient.addColorStop(0, '#111115');
		gradient.addColorStop(1, '#2c2c36');
		ctx.fillStyle = gradient;
		ctx.fillRect(0, 0, canvas.width, canvas.height);

		
		ctx.fillStyle = '#3498db';
		ctx.fillRect(0, 0, 15, canvas.height);

		
		const avatarURL = user.displayAvatarURL({ extension: 'png', size: 256 });
		const avatar = await loadImage(avatarURL);

		
		ctx.save();
		ctx.beginPath();
		ctx.arc(125, 125, 80, 0, Math.PI * 2, true);
		ctx.lineWidth = 6;
		ctx.strokeStyle = '#3498db';
		ctx.stroke();
		ctx.clip();
		ctx.drawImage(avatar, 45, 45, 160, 160);
		ctx.restore();

		
		ctx.fillStyle = '#ffffff';
		ctx.textBaseline = 'middle';
		
		
		ctx.font = 'bold 36px "Segoe UI", sans-serif';
		ctx.fillText(user.username, 240, 90);

		
		ctx.textAlign = 'right';
		
		ctx.font = 'bold 45px "Segoe UI", sans-serif';
		ctx.fillStyle = '#3498db';
		ctx.fillText(`${data.level}`, 840, 80);
		
		ctx.font = '30px "Segoe UI", sans-serif';
		ctx.fillStyle = '#8e8e9c';
		ctx.fillText('LEVEL', 790, 85);

		if (rank > 0) {
			ctx.font = 'bold 45px "Segoe UI", sans-serif';
			ctx.fillStyle = '#ffffff';
			ctx.fillText(`#${rank}`, 650, 80);
			
			ctx.font = '30px "Segoe UI", sans-serif';
			ctx.fillStyle = '#8e8e9c';
			ctx.fillText('RANK', 570, 85);
		}

		
		ctx.textAlign = 'right';
		ctx.font = '22px "Segoe UI", sans-serif';
		ctx.fillStyle = '#ffffff';
		ctx.fillText(`${data.xp} / ${neededXP} XP`, 840, 150);

		
		ctx.beginPath();
		ctx.fillStyle = '#42424d';
		ctx.roundRect(240, 175, 600, 25, 12);
		ctx.fill();

		
		const percent = Math.min(data.xp / neededXP, 1);
		if (percent > 0) {
			ctx.beginPath();
			ctx.fillStyle = '#3498db';
			ctx.roundRect(240, 175, 600 * percent, 25, 12);
			ctx.fill();
		}

		
		const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: 'rank.png' });
		
		await message.reply({ files: [attachment] });
	},
};
