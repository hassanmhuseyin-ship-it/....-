const fs = require('node:fs');
const path = require('node:path');

const settingsFile = path.join(__dirname, '..', '..', 'data', 'settings.json');

function ensureDataDir() {
	const dir = path.dirname(settingsFile);
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir, { recursive: true });
	}
}

function loadSettings() {
	ensureDataDir();
	if (!fs.existsSync(settingsFile)) {
		fs.writeFileSync(settingsFile, '{}', 'utf-8');
		return {};
	}
	try {
		return JSON.parse(fs.readFileSync(settingsFile, 'utf-8'));
	} catch {
		return {};
	}
}

function saveSettings(data) {
	ensureDataDir();
	fs.writeFileSync(settingsFile, JSON.stringify(data, null, 2), 'utf-8');
}

function getSetting(guildId, key) {
	const data = loadSettings();
	return data[`${guildId}_${key}`] ?? null;
}

function setSetting(guildId, key, value) {
	const data = loadSettings();
	data[`${guildId}_${key}`] = value;
	saveSettings(data);
}

module.exports = { getSetting, setSetting };
