const { Events, ChannelType, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { addXP } = require('../utils/leveling');
const config = require('../../config.json');


const voiceTimers = new Map();

module.exports = {
	name: Events.VoiceStateUpdate,
	async execute(oldState, newState) {
		const guild = oldState.guild || newState.guild;
		if (!guild) return;
		const member = newState.member || oldState.member;

		
		if (!member.user.bot) {
			
			if (!oldState.channelId && newState.channelId) {
				voiceTimers.set(member.id, Date.now());
			}
			
			else if (oldState.channelId && !newState.channelId) {
				const joinTime = voiceTimers.get(member.id);
				if (joinTime) {
					const durationMs = Date.now() - joinTime;
					const minutes = Math.floor(durationMs / 60000);
					
					
					if (minutes > 0) {
						addXP(guild.id, member.id, minutes * 10);
					}
					voiceTimers.delete(member.id);
				}
			}
		}

		
		if (config.logVoiceChannelId) {
			const logChannel = guild.channels.cache.get(config.logVoiceChannelId);
			if (logChannel) {
				const embed = new EmbedBuilder().setTimestamp().setAuthor({ name: member.user.tag, iconURL: member.user.displayAvatarURL() });

				
				if (!oldState.channelId && newState.channelId) {
					embed.setColor('#2ecc71')
						.setTitle('🎤 الجروب الصوتي: انضمام')
						.setDescription(`انضم ${member} إلى الروم الصوتي ${newState.channel}`);
					logChannel.send({ embeds: [embed] }).catch(() => {});
				}
				
				else if (oldState.channelId && !newState.channelId) {
					embed.setColor('#e74c3c')
						.setTitle('🎤 الجروب الصوتي: مغادرة')
						.setDescription(`غادر ${member} الروم الصوتي ${oldState.channel}`);
					logChannel.send({ embeds: [embed] }).catch(() => {});
				}
				
				else if (oldState.channelId && newState.channelId && oldState.channelId !== newState.channelId) {
					embed.setColor('#f1c40f')
						.setTitle('🎤 الجروب الصوتي: انتقال')
						.setDescription(`انتقل ${member} من ${oldState.channel} إلى ${newState.channel}`);
					logChannel.send({ embeds: [embed] }).catch(() => {});
				}
			}
		}

		
		if (newState.channelId === config.tempVcHubId && config.tempVcHubId && config.tempVcCategoryId) {
			const member = newState.member;
			const categoryId = config.tempVcCategoryId;
			
			
			try {
				const newChannel = await guild.channels.create({
					name: `مملكة ${member.user.username}`,
					type: ChannelType.GuildVoice,
					parent: categoryId,
					permissionOverwrites: [
						{
							id: guild.roles.everyone.id,
							allow: [],
						},
						{
							id: member.user.id,
							allow: [
								PermissionFlagsBits.ViewChannel, 
								PermissionFlagsBits.Connect, 
								PermissionFlagsBits.ManageChannels
							],
						}
					]
				});

				
				await newState.setChannel(newChannel);

				
				const embed = new EmbedBuilder()
					.setTitle('🎙️ لوحة تحكم الروم الصوتي')
					.setDescription(`أهلاً بك يا ${member} في رومك الصوتي المؤقت!\nاستخدم الأزرار والقوائم أدناه للتحكم بخصائص الروم.`)
					.setColor('#5865F2');
				
				const row1 = new ActionRowBuilder()
					.addComponents(
						new ButtonBuilder()
							.setCustomId('tempvc_lock')
							.setLabel('قفل الروم')
							.setEmoji('🔒')
							.setStyle(ButtonStyle.Danger),
						new ButtonBuilder()
							.setCustomId('tempvc_unlock')
							.setLabel('فتح الروم')
							.setEmoji('🔓')
							.setStyle(ButtonStyle.Success),
						new ButtonBuilder()
							.setCustomId('tempvc_hide')
							.setLabel('إخفاء')
							.setEmoji('🙈')
							.setStyle(ButtonStyle.Secondary),
						new ButtonBuilder()
							.setCustomId('tempvc_show')
							.setLabel('إظهار')
							.setEmoji('👁️')
							.setStyle(ButtonStyle.Secondary),
						new ButtonBuilder()
							.setCustomId('tempvc_rename')
							.setLabel('تغيير الاسم')
							.setEmoji('📝')
							.setStyle(ButtonStyle.Primary)
					);

				const { UserSelectMenuBuilder } = require('discord.js');
				const row2 = new ActionRowBuilder()
					.addComponents(
						new UserSelectMenuBuilder()
							.setCustomId('tempvc_whitelist')
							.setPlaceholder('➕ اختر أشخاص للسماح لهم بالدخول للروم')
							.setMinValues(1)
							.setMaxValues(10)
					);

				
				await newChannel.send({ embeds: [embed], components: [row1, row2] });
				
			} catch (error) {
				console.error('[❌] خطأ في إنشاء روم مؤقت:', error);
			}
		}

		
		
		if (oldState.channelId && oldState.channelId !== newState.channelId) {
			const channel = oldState.channel;
			
			if (channel && channel.parentId === config.tempVcCategoryId && channel.id !== config.tempVcHubId) {
				
				if (channel.members.size === 0) {
					try {
						await channel.delete('Temp VC Empty');
					} catch (error) {
						
					}
				}
			}
		}
	},
};
