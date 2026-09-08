const { Events } = require('discord.js');

module.exports = {
	name: Events.ClientReady,
	once: true,
	execute(client) {
		console.log('             🤖 EnzoBot v2          ');
		console.log(` ✅ Online as: ${client.user.tag.padEnd(20)}`);
		console.log(` 📡 Servers: ${String(client.guilds.cache.size).padEnd(23)}`);
		console.log(` 📝 Commands: ${String(client.commands.size).padEnd(22)}`);

		client.user.setActivity('🔧 Enzo System | +help ');

		
		try {
			require('../dashboard/server.js')(client);
		} catch (err) {
			console.error('[Dashboard] Error starting web dashboard:', err);
		}
	},
};
