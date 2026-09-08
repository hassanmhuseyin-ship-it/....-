const fs = require('node:fs');
const path = require('node:path');

const levelFile = path.join(__dirname, '..', '..', 'data', 'levels.json');

function ensureDataDir() {
	const dir = path.dirname(levelFile);
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir, { recursive: true });
	}
}

function loadLevels() {
	ensureDataDir();
	if (!fs.existsSync(levelFile)) {
		fs.writeFileSync(levelFile, '{}', 'utf-8');
		return {};
	}
	try {
		return JSON.parse(fs.readFileSync(levelFile, 'utf-8'));
	} catch {
		return {};
	}
}

function saveLevels(data) {
	ensureDataDir();
	fs.writeFileSync(levelFile, JSON.stringify(data, null, 2), 'utf-8');
}


function xpForLevel(level) {
	return level * level * 100;
}


function getUserData(guildId, userId) {
	const data = loadLevels();
	const key = `${guildId}_${userId}`;
	if (!data[key]) {
		data[key] = { xp: 0, level: 0, totalMessages: 0 };
		saveLevels(data);
	}
	return data[key];
}


function addXP(guildId, userId, amount = null) {
	const data = loadLevels();
	const key = `${guildId}_${userId}`;
	if (!data[key]) data[key] = { xp: 0, level: 0, totalMessages: 0 };

	
	const xpGain = amount || Math.floor(Math.random() * 11) + 15;
	data[key].xp += xpGain;
	data[key].totalMessages++;

	let leveledUp = false;
	const neededXP = xpForLevel(data[key].level + 1);

	if (data[key].xp >= neededXP) {
		data[key].level++;
		data[key].xp -= neededXP;
		leveledUp = true;
	}

	saveLevels(data);
	return { ...data[key], leveledUp, xpGain };
}


function getLeaderboard(guildId, limit = 10) {
	const data = loadLevels();
	const entries = [];

	for (const [key, value] of Object.entries(data)) {
		if (key.startsWith(`${guildId}_`)) {
			const userId = key.split('_')[1];
			entries.push({ userId, ...value, totalXP: xpForLevel(value.level) + value.xp });
		}
	}

	return entries.sort((a, b) => b.totalXP - a.totalXP).slice(0, limit);
}

module.exports = { getUserData, addXP, getLeaderboard, xpForLevel };
