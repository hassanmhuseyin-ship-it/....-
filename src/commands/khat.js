const { khatContainer } = require('../utils/components');

module.exports = {
	name: 'line',
	aliases: ['خط', 'khat'],
	description: '➖ إرسال خط فاصل ',
	usage: '+line',

	async execute(message, args) {
		await message.channel.send(khatContainer());
	},
};
