const fs = require('node:fs');
const path = require('node:path');

const warningsFile = path.join(__dirname, '..', '..', 'data', 'warnings.json');


function ensureDataDir() {
	const dir = path.dirname(warningsFile);
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir, { recursive: true });
	}
}


function loadWarnings() {
	ensureDataDir();
	if (!fs.existsSync(warningsFile)) {
		fs.writeFileSync(warningsFile, '{}', 'utf-8');
		return {};
	}
	try {
		return JSON.parse(fs.readFileSync(warningsFile, 'utf-8'));
	} catch {
		return {};
	}
}


function saveWarnings(data) {
	ensureDataDir();
	fs.writeFileSync(warningsFile, JSON.stringify(data, null, 2), 'utf-8');
}


function addWarning(guildId, userId, moderatorId, reason) {
	const data = loadWarnings();
	const key = `${guildId}_${userId}`;
	if (!data[key]) data[key] = [];
	const warning = {
		id: data[key].length + 1,
		moderator: moderatorId,
		reason,
		date: new Date().toISOString(),
	};
	data[key].push(warning);
	saveWarnings(data);
	return warning;
}


function getWarnings(guildId, userId) {
	const data = loadWarnings();
	return data[`${guildId}_${userId}`] || [];
}


function clearWarnings(guildId, userId) {
	const data = loadWarnings();
	const key = `${guildId}_${userId}`;
	const count = (data[key] || []).length;
	delete data[key];
	saveWarnings(data);
	return count;
}

module.exports = { addWarning, getWarnings, clearWarnings };
