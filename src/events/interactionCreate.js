const { Events, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, ChannelType, PermissionFlagsBits, EmbedBuilder, ButtonBuilder, ButtonStyle, ContainerBuilder, SeparatorSpacingSize, MessageFlags } = require('discord.js');
const { errorContainer, successContainer, infoContainer } = require('../utils/components');
const config = require('../../config.json');

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		
		if (interaction.isButton()) {
			const customId = interaction.customId;
			const [action, ...args] = customId.split('_');

			
			if (action === 'confirm-ban') {
				const userId = args[0];
				const guild = interaction.guild;

				try {
					await guild.members.ban(userId, { reason: 'تم التأكيد بواسطة الأدمن' });
					await interaction.update(
						successContainer('تم الحظر', `تم حظر <@${userId}> بنجاح.`),
					);
				} catch (error) {
					await interaction.update(
						errorContainer('خطأ', `فشل حظر العضو: ${error.message}`),
					);
				}
			}

			if (action === 'cancel-ban') {
				await interaction.update(
					infoContainer('تم الإلغاء', 'تم إلغاء عملية الحظر.'),
				);
			}

			
			if (action === 'roleassign') {
				const roleId = args[0];
				
				await interaction.deferReply({ ephemeral: true });

				const role = interaction.guild.roles.cache.get(roleId);
				if (!role) {
					return interaction.editReply({
						components: [new ContainerBuilder().setAccentColor(0xe74c3c).addTextDisplayComponents(t => t.setContent(`الرتبة لم تعد موجودة في السيرفر!`))],
						flags: MessageFlags.IsComponentsV2
					});
				}
				
				try {
					if (interaction.member.roles.cache.has(roleId)) {
						await interaction.member.roles.remove(roleId);
						await interaction.editReply({
							components: [new ContainerBuilder().setAccentColor(0xe74c3c).addTextDisplayComponents(t => t.setContent(`➖ تم إزالة رتبة **${role.name}** منك.`))],
							flags: MessageFlags.IsComponentsV2
						});
					} else {
						await interaction.member.roles.add(roleId);
						await interaction.editReply({
							components: [new ContainerBuilder().setAccentColor(0x2ecc71).addTextDisplayComponents(t => t.setContent(`➕ حصلت على رتبة **${role.name}** بنجاح.`))],
							flags: MessageFlags.IsComponentsV2
						});
					}
				} catch (err) {
					await interaction.editReply({
						components: [new ContainerBuilder().setAccentColor(0xe74c3c).addTextDisplayComponents(t => t.setContent(`❌ حدث خطأ، تأكد من صلاحيات البوت وأنه أعلى من الرتبة المحددة.`))],
						flags: MessageFlags.IsComponentsV2
					});
				}
			}

			
			if (customId === 'open-ticket') {
				try {
					const channelName = `ticket-${interaction.user.username}`;
					const existingChannel = interaction.guild.channels.cache.find(c => c.name === channelName);
					if (existingChannel) {
						return interaction.reply(errorContainer('تنبيه', `لديك تيكت مفتوح بالفعل: ${existingChannel}`, { ephemeral: true }));
					}

					const channel = await interaction.guild.channels.create({
						name: channelName,
						type: ChannelType.GuildText,
						permissionOverwrites: [
							{ id: interaction.guild.roles.everyone.id, deny: [PermissionFlagsBits.ViewChannel] },
							{ id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] }
						]
					});

					await channel.send({
						content: `${interaction.user} أهلاً بك!\nالإدارة ستتواصل معك قريباً. لإغلاق التيكت استخدم أمر \`+ticket-close\``,
					});

					await interaction.reply({ content: `تم فتح التيكت الخاص بك: ${channel}`, ephemeral: true });
				} catch (error) {
					console.error('[Ticket Error]', error);
					await interaction.reply({ content: 'فشل إنشاء التيكت. تواصل مع الإدارة.', ephemeral: true });
				}
			}

			
			if (customId === 'apply-open-modal') {
				const modal = new ModalBuilder()
					.setCustomId('modal-apply')
					.setTitle('تقديم طلب الإدارة');

				const nameInput = new TextInputBuilder()
					.setCustomId('apply-name')
					.setLabel('الاسم الحقيقي:')
					.setStyle(TextInputStyle.Short);

				const ageInput = new TextInputBuilder()
					.setCustomId('apply-age')
					.setLabel('العمر:')
					.setStyle(TextInputStyle.Short);

				const expInput = new TextInputBuilder()
					.setCustomId('apply-exp')
					.setLabel('خبراتك السابقة:')
					.setStyle(TextInputStyle.Paragraph);

				modal.addComponents(
					new ActionRowBuilder().addComponents(nameInput),
					new ActionRowBuilder().addComponents(ageInput),
					new ActionRowBuilder().addComponents(expInput)
				);

				await interaction.showModal(modal);
			}

			
			if (action === 'apply-accept' || action === 'apply-reject') {
				if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
					return interaction.reply({ content: 'لست أدمن لاتخاذ هذا القرار!', ephemeral: true });
				}

				const isAccept = action === 'apply-accept';
				const applicantId = args[0];

				try {
					const applicant = await interaction.guild.members.fetch(applicantId);
					await applicant.send({
						components: [
							new ContainerBuilder()
								.setAccentColor(isAccept ? 0x2ecc71 : 0xe74c3c)
								.addTextDisplayComponents(
									t => t.setContent(isAccept ? `## 🎉 تم قبولك!` : `## ❌ نأسف لرفضك.`)
								)
								.addSeparatorComponents(sep => sep.setDivider(true).setSpacing(SeparatorSpacingSize.Small))
								.addTextDisplayComponents(
									t => t.setContent(isAccept ? `لقد تم قبول تقديمك للإدارة في السيرفر!` : `لم يتم قبولك هذه المرة. حظاً أوفر المرة القادمة.`)
								)
						],
						flags: MessageFlags.IsComponentsV2
					}).catch(() => {});
				} catch (e) {  }

				
				const msg = interaction.message;
				const embed = EmbedBuilder.from(msg.embeds[0]);
				embed.setColor(isAccept ? 0x2ecc71 : 0xe74c3c);
				embed.setFooter({ text: `تم ${isAccept ? 'القبول' : 'الرفض'} بواسطة ${interaction.user.tag}` });
				
				await interaction.update({ embeds: [embed], components: [] });
			}
		}

		
		if (interaction.isModalSubmit()) {
			if (interaction.customId === 'modal-apply') {
				const name = interaction.fields.getTextInputValue('apply-name');
				const age = interaction.fields.getTextInputValue('apply-age');
				const exp = interaction.fields.getTextInputValue('apply-exp');

				const logChannelId = config.applicationLogChannelId;
				if (!logChannelId) {
					return interaction.reply({ content: 'لم يتم إعداد روم التقديمات! استخدم العرض لاحقاً.', ephemeral: true });
				}

				const logChannel = interaction.guild.channels.cache.get(logChannelId);
				if (!logChannel) {
					return interaction.reply({ content: 'الروم غير موجود.', ephemeral: true });
				}

				const embed = new EmbedBuilder()
					.setColor(0xf1c40f)
					.setTitle(`تقديم جديد من ${interaction.user.tag}`)
					.addFields(
						{ name: 'الاسم', value: name, inline: true },
						{ name: 'العمر', value: age, inline: true },
						{ name: 'الخبرة', value: exp },
						{ name: 'حساب ديسكورد', value: `${interaction.user} (\`${interaction.user.id}\`)` }
					)
					.setTimestamp();

				const row = new ActionRowBuilder()
					.addComponents(
						new ButtonBuilder()
							.setCustomId(`apply-accept_${interaction.user.id}`)
							.setLabel('✅ قبول')
							.setStyle(ButtonStyle.Success),
						new ButtonBuilder()
							.setCustomId(`apply-reject_${interaction.user.id}`)
							.setLabel('❌ رفض')
							.setStyle(ButtonStyle.Danger)
					);

				await logChannel.send({ embeds: [embed], components: [row] });
				await interaction.reply({ content: 'تم إرسال تقديمك بنجاح! سيتم إشعارك بالقرار.', ephemeral: true });
			}
			
			
			if (interaction.customId === 'modal_tempvc_rename') {
				const newName = interaction.fields.getTextInputValue('tempvc_newname');
				const channel = interaction.channel;
				
				if (!interaction.member.permissionsIn(channel).has(PermissionFlagsBits.ManageChannels)) {
					return interaction.reply({ content: '❌ ليس لديك صلاحية.', ephemeral: true });
				}
				
				await interaction.deferReply({ ephemeral: true });

				try {
					await channel.setName(newName);
					await interaction.editReply({
						components: [new ContainerBuilder().setAccentColor(0x2ecc71).addTextDisplayComponents(t => t.setContent(`✅ تم تغيير اسم الروم إلى **${newName}**.`))],
						flags: MessageFlags.IsComponentsV2
					});
				} catch (err) {
					console.error('Rename VC Error', err);
					await interaction.editReply({
						components: [new ContainerBuilder().setAccentColor(0xe74c3c).addTextDisplayComponents(t => t.setContent(`❌ حدث خطأ، ديلي الليمت الخاص بتغيير الأسماء (مرتين كل 10 دقائق).`))],
						flags: MessageFlags.IsComponentsV2
					});
				}
			}
		}

		
		if (interaction.isButton() && interaction.customId.startsWith('tempvc_')) {
			const action = interaction.customId;
			
			
			if (action !== 'tempvc_rename') {
				await interaction.deferReply({ ephemeral: true });
			}

			const channel = interaction.channel;
			
			if (!interaction.member.permissionsIn(channel).has(PermissionFlagsBits.ManageChannels)) {
				if (action === 'tempvc_rename') {
					return interaction.reply({
						components: [new ContainerBuilder().setAccentColor(0xe74c3c).addTextDisplayComponents(t => t.setContent(`❌ ليس لديك صلاحية للتحكم بهذا الروم.`))],
						flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral
					});
				} else {
					return interaction.editReply({
						components: [new ContainerBuilder().setAccentColor(0xe74c3c).addTextDisplayComponents(t => t.setContent(`❌ ليس لديك صلاحية للتحكم بهذا الروم.`))],
						flags: MessageFlags.IsComponentsV2
					});
				}
			}

			try {
				if (action === 'tempvc_lock') {
					await channel.permissionOverwrites.edit(interaction.guild.roles.everyone.id, { Connect: false });
					await interaction.editReply({
						components: [new ContainerBuilder().setAccentColor(0xe74c3c).addTextDisplayComponents(t => t.setContent(`🔒 تم قفل الروم للمشتركين.`))],
						flags: MessageFlags.IsComponentsV2
					});
				} 
				else if (action === 'tempvc_unlock') {
					await channel.permissionOverwrites.edit(interaction.guild.roles.everyone.id, { Connect: null });
					await interaction.editReply({
						components: [new ContainerBuilder().setAccentColor(0x2ecc71).addTextDisplayComponents(t => t.setContent(`🔓 تم فتح الروم للجميع.`))],
						flags: MessageFlags.IsComponentsV2
					});
				}
				else if (action === 'tempvc_hide') {
					await channel.permissionOverwrites.edit(interaction.guild.roles.everyone.id, { ViewChannel: false });
					await interaction.editReply({
						components: [new ContainerBuilder().setAccentColor(0x95a5a6).addTextDisplayComponents(t => t.setContent(`🙈 تم إخفاء الروم.`))],
						flags: MessageFlags.IsComponentsV2
					});
				}
				else if (action === 'tempvc_show') {
					await channel.permissionOverwrites.edit(interaction.guild.roles.everyone.id, { ViewChannel: null });
					await interaction.editReply({
						components: [new ContainerBuilder().setAccentColor(0x3498db).addTextDisplayComponents(t => t.setContent(`👁️ أصبح الروم مرئياً.`))],
						flags: MessageFlags.IsComponentsV2
					});
				}
				else if (action === 'tempvc_rename') {
					const modal = new ModalBuilder()
						.setCustomId('modal_tempvc_rename')
						.setTitle('تغيير اسم الروم');

					const nameInput = new TextInputBuilder()
						.setCustomId('tempvc_newname')
						.setLabel('الاسم الجديد')
						.setStyle(TextInputStyle.Short)
						.setRequired(true)
						.setMaxLength(32);

					modal.addComponents(new ActionRowBuilder().addComponents(nameInput));
					return interaction.showModal(modal); 
				}
			} catch (err) {
				console.error('Temp VC Control Error', err);
				await interaction.editReply({
					components: [new ContainerBuilder().setAccentColor(0xe74c3c).addTextDisplayComponents(t => t.setContent(`❌ حدث خطأ، يرجى التأكد من صلاحيات البوت.`))],
					flags: MessageFlags.IsComponentsV2
				});
			}
		}

		
		if (interaction.isUserSelectMenu()) {
			if (interaction.customId === 'tempvc_whitelist') {
				await interaction.deferReply({ ephemeral: true });
				const channel = interaction.channel;
				
				if (!interaction.member.permissionsIn(channel).has(PermissionFlagsBits.ManageChannels)) {
					return interaction.editReply({
						components: [new ContainerBuilder().setAccentColor(0xe74c3c).addTextDisplayComponents(t => t.setContent(`❌ ليس لديك صلاحية للتحكم بهذا الروم.`))],
						flags: MessageFlags.IsComponentsV2
					});
				}

				try {
					const users = [...interaction.users.values()];
					for (const user of users) {
						await channel.permissionOverwrites.create(user.id, {
							Connect: true,
							ViewChannel: true
						});
					}

					await interaction.editReply({
						components: [new ContainerBuilder().setAccentColor(0x2ecc71).addTextDisplayComponents(t => t.setContent(`✅ تم إضافة **${users.length}** أشخاص بنجاح ليتمكنوا من دخول الروم.`))],
						flags: MessageFlags.IsComponentsV2
					});
				} catch (err) {
					console.error('Whitelist Error', err);
					await interaction.editReply({ content: '❌ خطأ أثناء إضافة الأشخاص.' });
				}
			}
		}

		
		if (interaction.isStringSelectMenu()) {
			if (interaction.customId === 'help-menu') {
				const value = interaction.values[0];
				
				
				const commands = interaction.client.commands;
				const uniqueCommands = new Map();
				commands.forEach(cmd => { if (!uniqueCommands.has(cmd.name)) uniqueCommands.set(cmd.name, cmd); });

				const categories = {
					cat_moderation: { title: '🛡️ الإدارة', cmds: ['mute', 'unmute', 'ban', 'kick', 'timeout', 'jail', 'unjail', 'warn', 'warnings', 'clearwarns', 'role', 'nickname'] },
					cat_channels: { title: '📝 الرومات', cmds: ['open', 'hide', 'unhide', 'close', 'lock', 'unlock', 'slowmode', 'purge', 'nuke', 'autoline', 'line', 'join', 'leave'] },
					cat_info: { title: 'ℹ️ المعلومات', cmds: ['userinfo', 'serverinfo', 'avatar', 'banner', 'help'] },
					cat_interaction: { title: '🎭 التفاعل مع البوت', cmds: ['say', 'embed', 'announce', 'poll', 'copy'] },
					cat_protection: { title: '🔐 الحماية', cmds: ['antiraid', 'antispam', 'antilink'] },
					cat_giveaway: { title: '🎁 القيف أواي', cmds: ['giveaway', 'gend', 'greroll'] },
					cat_levelstats: { title: '📈 التلفيل والإحصائيات', cmds: ['rank', 'leaderboard', 'setlevelrole', 'setupstats'] },
					cat_tickets: { title: '🎫 التيكت والتقديمات', cmds: ['ticket-setup', 'ticket-close', 'ticket-add', 'apply-setup'] },
					cat_config: { title: '⚙️ الإعدادات', cmds: ['setlog', 'setwelcome', 'setleave', 'setlevelchannel', 'setsuggestchannel'] }
				};

				const cat = categories[value];
				if (!cat) return;

				const activeCmds = cat.cmds.filter(n => uniqueCommands.has(n));
				const listText = activeCmds.map(n => {
					const cmd = uniqueCommands.get(n);
					return `\`+${cmd.name}\` — ${cmd.description}`;
				}).join('\n');

				const row = interaction.message.components[1]; 

				await interaction.update({
					components: [
						new ContainerBuilder()
							.setAccentColor(0x5865F2)
							.addTextDisplayComponents(t => t.setContent(`## ${cat.title}`))
							.addSeparatorComponents((sep) => sep.setDivider(true).setSpacing(SeparatorSpacingSize.Small))
							.addTextDisplayComponents(t => t.setContent(listText)),
						row
					],
					flags: MessageFlags.IsComponentsV2
				});
			}
		}
	},
};
