const { PermissionFlagsBits } = require('discord.js');
const { successContainer, errorContainer, confirmContainer } = require('../utils/components');
const { sendLog } = require('../utils/logger');


const pendingNukes = new Set();

module.exports = {
	name: 'nuke',
	aliases: ['مسح-شامل', 'clearall'],
	description: '💣 مسح شامل لجميع رسائل الروم',
	usage: '+nuke',

	async execute(message, args) {
		if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
			return message.reply(errorContainer('خطأ', 'ما عندك صلاحية استخدام هذا الأمر.'));
		}

		const channelId = message.channel.id;


		if (args[0] === 'confirm' && pendingNukes.has(channelId)) {
			pendingNukes.delete(channelId);

			try {
				const channel = message.channel;
				const position = channel.position;
				const newChannel = await channel.clone();
				await newChannel.setPosition(position);
				await channel.delete('Nuke command');

				await newChannel.send(
					successContainer('💣 تم المسح الشامل', `تم مسح جميع رسائل الروم بواسطة ${message.author}`),
				);

				await sendLog(message.client, {
					title: 'مسح شامل للروم',
					color: 0xe74c3c,
					fields: { 'الروم': newChannel.name, 'بواسطة': `${message.author}` },
				});
			} catch (error) {
				await message.reply(errorContainer('خطأ', `فشل المسح الشامل: ${error.message}`));
			}
			return;
		}

		if (args[0] === 'cancel' && pendingNukes.has(channelId)) {
			pendingNukes.delete(channelId);
			const { infoContainer } = require('../utils/components');
			return message.reply(infoContainer('تم الإلغاء', 'تم إلغاء عملية المسح الشامل.'));
		}


		pendingNukes.add(channelId);
		await message.reply(
			confirmContainer(
				'تأكيد المسح الشامل',
				`هل أنت متأكد من مسح **جميع رسائل** هذا الروم نهائياً؟\n\nأرسل \`+nuke confirm\` للتأكيد أو \`+nuke cancel\` للإلغاء.`,
				`nuke-confirm_${channelId}`,
				`nuke-cancel_${channelId}`,
			),
		);

		// Button Collector
		const filter = i => ['nuke-confirm_' + channelId, 'nuke-cancel_' + channelId].includes(i.customId) && i.user.id === message.author.id;
		const collector = message.channel.createMessageComponentCollector({ filter, time: 30000, max: 1 });

		collector.on('collect', async i => {
			pendingNukes.delete(channelId);
			if (i.customId.startsWith('nuke-cancel')) {
				const { infoContainer } = require('../utils/components');
				await i.update(infoContainer('تم الإلغاء', 'تم إلغاء عملية المسح الشامل.'));
				return;
			}

			if (i.customId.startsWith('nuke-confirm')) {
				try {
					const channel = message.channel;
					const position = channel.position;
					const newChannel = await channel.clone();
					await newChannel.setPosition(position);
					await channel.delete('Nuke command via Button');

					await newChannel.send(
						successContainer('💣 تم المسح الشامل', `تم مسح جميع رسائل الروم بواسطة ${message.author}`)
					);

					await sendLog(message.client, {
						title: 'مسح شامل للروم',
						color: 0xe74c3c,
						fields: { 'الروم': newChannel.name, 'بواسطة': `${message.author}` },
					});
				} catch (error) {
					if (!message.channel.deleted) {
						await message.channel.send(errorContainer('خطأ', `فشل المسح الشامل: ${error.message}`));
					}
				}
			}
		});

		collector.on('end', collected => {
			if (collected.size === 0 && pendingNukes.has(channelId)) {
				pendingNukes.delete(channelId);
				message.channel.send({ content: '⏳ انتهى وقت تأكيد المسح الشامل.' }).catch(()=>{});
			}
		});
	},
};
