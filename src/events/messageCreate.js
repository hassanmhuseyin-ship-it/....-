const { Events, ContainerBuilder, SeparatorSpacingSize, MessageFlags } = require('discord.js');
const { errorContainer, khatContainer } = require('../utils/components');
const { addXP } = require('../utils/leveling');
const { getSetting } = require('../utils/settings');
const config = require('../../config.json');


const spamTracker = new Map();

module.exports = {
	name: Events.MessageCreate,
	async execute(message) {
		if (message.author.bot) return;
		if (!message.guild) return;

		const guildId = message.guild.id;

		
		if (getSetting(guildId, 'antilink')) {
			const linkRegex = /(https?:\/\/[^\s]+)|(discord\.gg\/[^\s]+)|(www\.[^\s]+)/gi;
			if (linkRegex.test(message.content) && !message.member.permissions.has('ManageMessages')) {
				try {
					await message.delete();
					const warn = await message.channel.send(errorContainer('حماية', `${message.author} الروابط ممنوعة هنا!`));
					setTimeout(() => warn.delete().catch(() => { }), 3000);
					return;
				} catch (e) {  }
			}
		}

		
		if (getSetting(guildId, 'antispam') && !message.member.permissions.has('ManageMessages')) {
			const userId = message.author.id;
			const now = Date.now();
			const userData = spamTracker.get(userId) || { count: 0, lastTime: now };

			if (now - userData.lastTime < 3000) {
				userData.count++;
			} else {
				userData.count = 1;
			}
			userData.lastTime = now;
			spamTracker.set(userId, userData);

			if (userData.count >= 5) {
				try {
					await message.member.timeout(60000, 'Anti-Spam');
					await message.channel.send(errorContainer('حماية', `${message.author} تم كتمه لمدة دقيقة بسبب السبام.`));
					spamTracker.delete(userId);
					return;
				} catch (e) {  }
			}
		}

		
		if (config.autoResponders && Array.isArray(config.autoResponders)) {
			const match = config.autoResponders.find(ar => ar.trigger.toLowerCase() === message.content.toLowerCase());
			if (match) {
				return message.reply({ content: match.response }).catch(() => { });
			}
		}

		
		const result = addXP(guildId, message.author.id);
		if (result.leveledUp) {
			try {
				const levelMessage = {
					content: `مبروك ${message.author} !`,
					components: [
						new ContainerBuilder()
							.setAccentColor(0xf1c40f)
							.addTextDisplayComponents(
								(text) => text.setContent(`## 🎉 ليفل أب !`),
							)
							.addSeparatorComponents((sep) => sep.setDivider(true).setSpacing(SeparatorSpacingSize.Small))
							.addTextDisplayComponents(
								(text) => text.setContent(`مبروك ${message.author}! وصلت **ليفل ${result.level}** 🏆`),
							),
					],
					flags: MessageFlags.IsComponentsV2,
				};

				if (config.levelChannelId) {
					const lvlChannel = message.guild.channels.cache.get(config.levelChannelId);
					if (lvlChannel) await lvlChannel.send(levelMessage);
				} else {
					await message.channel.send(levelMessage);
				}

				
				const levelRoles = config.levelRoles || {};
				const roleId = levelRoles[String(result.level)];
				if (roleId) {
					const role = message.guild.roles.cache.get(roleId);
					if (role && !message.member.roles.cache.has(roleId)) {
						await message.member.roles.add(role);
					}
				}
			} catch (e) {  }
		}

		
		if (config.suggestionChannelId && message.channel.id === config.suggestionChannelId && !message.author.bot) {
			try {
				const suggestionText = message.content;
				if (!suggestionText) return; 

				
				await message.delete().catch(() => { });

				
				const { createCanvas, loadImage, GlobalFonts } = require('@napi-rs/canvas');
				const { AttachmentBuilder } = require('discord.js');

				
				const width = 900;
				const padding = 40;
				const avatarSize = 100;

				
				const getLines = (ctx, text, maxWidth) => {
					const words = text.split(' ');
					const lines = [];
					let currentLine = words[0];

					for (let i = 1; i < words.length; i++) {
						const word = words[i];
						const width = ctx.measureText(currentLine + ' ' + word).width;
						if (width < maxWidth) {
							currentLine += ' ' + word;
						} else {
							lines.push(currentLine);
							currentLine = word;
						}
					}
					lines.push(currentLine);
					return lines;
				};

				
				let ctx = createCanvas(width, 100).getContext('2d');
				ctx.font = 'bold 35px sans-serif'; 
				const lines = getLines(ctx, suggestionText, width - (padding * 2));
				const lineHeight = 50;

				const height = 200 + (lines.length * lineHeight) + padding;

				
				const canvas = createCanvas(width, height);
				ctx = canvas.getContext('2d');

				
				ctx.fillStyle = '#1e1f22'; 
				ctx.beginPath();
				ctx.roundRect(0, 0, width, height, 25);
				ctx.fill();

				
				ctx.fillStyle = '#2b2d31';
				ctx.beginPath();
				ctx.roundRect(20, 20, width - 40, 120, 20);
				ctx.fill();

				
				try {
					const avatarUrl = message.author.displayAvatarURL({ extension: 'png', size: 128 });
					const avatar = await loadImage(avatarUrl);
					ctx.save();
					ctx.beginPath();
					ctx.arc(40 + avatarSize / 2, 30 + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2, true);
					ctx.closePath();
					ctx.clip();
					ctx.drawImage(avatar, 40, 30, avatarSize, avatarSize);
					ctx.restore();
				} catch (e) {
					console.error('Failed to load avatar for suggestion', e);
				}

				
				ctx.fillStyle = '#ffffff';
				ctx.font = 'bold 45px sans-serif';
				ctx.fillText(message.author.username, 160, 75);

				
				ctx.fillStyle = '#5865F2'; 
				ctx.beginPath();
				ctx.roundRect(160, 90, 180, 40, 10);
				ctx.fill();
				ctx.fillStyle = '#ffffff';
				ctx.font = 'bold 22px sans-serif';
				ctx.fillText('💡 اقتراح جديد', 185, 118);

				
				ctx.fillStyle = '#dbdee1'; 
				ctx.font = 'bold 36px sans-serif';
				ctx.textAlign = 'right'; 
				let y = 200;
				for (const line of lines) {
					ctx.fillText(line, width - padding, y);
					y += lineHeight;
				}

				const attachment = new AttachmentBuilder(await canvas.encode('png'), { name: 'suggestion.png' });

				
				const suggestionMsg = await message.channel.send({
					content: `اقتراح مقدم من: ${message.author}`,
					files: [attachment]
				});

				
				await suggestionMsg.react('👍');
				await suggestionMsg.react('👎');

				return; 
			} catch (error) {
				console.error('[Suggestion Error]', error);
			}
		}

		
		const prefix = message.client.prefix;
		const rawArgs = message.content.trim().split(/ +/);
		let firstWord = rawArgs.shift().toLowerCase();
		
		let isPrefixCmd = false;
		if (firstWord.startsWith(prefix)) {
			isPrefixCmd = true;
			firstWord = firstWord.slice(prefix.length);
		}

		
		let configAliases = [];
		try {
			const liveConfig = JSON.parse(require('fs').readFileSync(require('path').join(__dirname, '../../config.json'), 'utf-8'));
			if (liveConfig.commandAliases) configAliases = liveConfig.commandAliases;
		} catch (e) {
			console.error("[Aliases] Error reading config file:", e);
		}

		const aliasMatch = configAliases.find(a => a.alias === firstWord);
		let targetCommandName = null;

		if (aliasMatch) {
			targetCommandName = aliasMatch.command;
		} else if (isPrefixCmd) {
			targetCommandName = firstWord;
		}

		if (targetCommandName) {
			const command = message.client.commands.get(targetCommandName);
			if (command) {
				try {
					await command.execute(message, rawArgs);
				} catch (error) {
					console.error(`[❌] خطأ في تنفيذ الأمر ${targetCommandName}:`, error);
					try {
						await message.reply(errorContainer('خطأ', 'حدث خطأ أثناء تنفيذ هذا الأمر.'));
					} catch (e) {  }
				}
				return;
			}
		}

		
		if (message.client.autoKhatChannels.has(message.channel.id)) {
			try {
				await message.channel.send(khatContainer());
			} catch (error) {
				console.error('[❌] خطأ في إرسال خط تلقائي:', error);
			}
		}

	},
};
