const express = require('express');
const session = require('express-session');
const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
const path = require('path');
const fs = require('fs');

module.exports = (client) => {
    const configPath = path.join(__dirname, '..', '..', 'config.json');
    let config = require(configPath);
    
    if (!config.clientSecret || config.clientSecret === 'YOUR_CLIENT_SECRET_HERE') {
        console.log('[Dashboard] Client Secret is not set in config.json. Discord Login will FAIL.');
    }

    const app = express();

    
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(session({
        secret: 'enzobot-dashboard-super-secure-key',
        resave: false,
        saveUninitialized: false
    }));

    
    passport.serializeUser((user, done) => done(null, user));
    passport.deserializeUser((obj, done) => done(null, obj));

    passport.use(new DiscordStrategy({
        clientID: config.clientId,
        clientSecret: config.clientSecret,
        callbackURL: config.callbackUrl,
        scope: ['identify', 'guilds']
    }, (accessToken, refreshToken, profile, done) => {
        process.nextTick(() => done(null, profile));
    }));

    app.use(passport.initialize());
    app.use(passport.session());

    
    app.use(express.static(path.join(__dirname, 'public')));

    
    app.get('/auth/discord', passport.authenticate('discord'));
    app.get('/auth/discord/callback', passport.authenticate('discord', { failureRedirect: '/' }), (req, res) => {
        res.redirect('/dashboard.html');
    });
    
    app.get('/api/auth/status', (req, res) => {
        if (req.isAuthenticated()) {
            res.json({ loggedIn: true, user: req.user });
        } else {
            res.json({ loggedIn: false });
        }
    });

    app.get('/api/logout', (req, res) => {
        req.logout((err) => {
            res.redirect('/');
        });
    });

    
    const { getLeaderboard } = require('../utils/leveling');
    app.get('/api/leaderboard', async (req, res) => {
        try {
            const topUsers = getLeaderboard(config.guildId, 10);
            
            
            const populated = [];
            for (const u of topUsers) {
                try {
                    const user = await client.users.fetch(u.userId);
                    populated.push({
                        userId: u.userId,
                        username: user.username,
                        avatar: user.displayAvatarURL({ extension: 'png', size: 128 }),
                        level: u.level,
                        totalXP: u.totalXP
                    });
                } catch {
                    populated.push({
                        userId: u.userId,
                        username: 'Unknown User',
                        avatar: 'https://cdn.discordapp.com/embed/avatars/0.png',
                        level: u.level,
                        totalXP: u.totalXP
                    });
                }
            }
            res.json({ success: true, leaderboard: populated, guildName: client.guilds.cache.get(config.guildId)?.name });
        } catch (err) {
            console.error('[Dashboard] Error fetching leaderboard', err);
            res.status(500).json({ error: 'Failed to fetch leaderboard' });
        }
    });

    
    app.get('/api/data', (req, res) => {
        if (!req.isAuthenticated()) return res.status(401).json({ error: 'Unauthorized. Please login.' });
        
        
        const userGuild = req.user.guilds.find(g => g.id === config.guildId);
        
        const isAdmin = userGuild && ((userGuild.permissions & 8) === 8 || userGuild.owner);

        if (!isAdmin) {
            return res.status(403).json({ error: 'Access Denied. You must be an Administrator in the bot server to view settings.' });
        }

        
        const guild = client.guilds.cache.get(config.guildId);
        
        
        const channels = guild ? guild.channels.cache.map(c => ({ id: c.id, name: c.name, type: c.type })).sort((a,b) => a.type - b.type) : [];
        const roles = guild ? guild.roles.cache.map(r => ({ id: r.id, name: r.name, color: r.hexColor })) : [];
        
        
        const uniqueCommands = Array.from(client.commands.keys());

        
        res.json({ config, channels, roles, commands: uniqueCommands, botAvatar: client.user.displayAvatarURL(), botName: client.user.username });
    });

    app.post('/api/config', (req, res) => {
        if (!req.isAuthenticated()) return res.status(401).json({ error: 'Unauthorized' });
        
        const userGuild = req.user.guilds.find(g => g.id === config.guildId);
        const isAdmin = userGuild && ((userGuild.permissions & 8) === 8 || userGuild.owner);
        if (!isAdmin) return res.status(403).json({ error: 'Access Denied' });

        
        Object.assign(config, req.body);
        
        try {
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
            console.log('[Dashboard] Configuration successfully updated via Web Dashboard!');
            res.json({ success: true, config });
        } catch (err) {
            console.error('[Dashboard] Error saving config', err);
            res.status(500).json({ error: 'Internal Server Error saving config.' });
        }
    });

    
    
    const { EmbedBuilder } = require('discord.js');
    
    app.post('/api/send-embed', async (req, res) => {
        if (!req.isAuthenticated()) return res.status(401).json({ error: 'Unauthorized' });
        
        const userGuild = req.user.guilds.find(g => g.id === config.guildId);
        const isAdmin = userGuild && ((userGuild.permissions & 8) === 8 || userGuild.owner);
        if (!isAdmin) return res.status(403).json({ error: 'Access Denied' });

        const { channelId, title, description, color, image } = req.body;
        if (!channelId || !description) return res.status(400).json({ error: 'Missing required fields (channel, description).' });

        const channel = client.channels.cache.get(channelId);
        if (!channel || !channel.isTextBased()) return res.status(404).json({ error: 'Channel not found or not a text channel.' });

        try {
            const embed = new EmbedBuilder()
                .setDescription(description)
                .setColor(color || '#5865F2');
            
            if (title) embed.setTitle(title);
            if (image) embed.setImage(image);

            await channel.send({ embeds: [embed] });
            console.log(`[Dashboard] Custom embed sent to #${channel.name} by ${req.user.username}`);
            res.json({ success: true });
        } catch (err) {
            console.error('[Dashboard] Error sending custom embed:', err);
            res.status(500).json({ error: 'Failed to send embed. Check bot permissions.' });
        }
    });

    
    const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

    app.post('/api/send-role-embed', async (req, res) => {
        if (!req.isAuthenticated()) return res.status(401).json({ error: 'Unauthorized' });
        
        const userGuild = req.user.guilds.find(g => g.id === config.guildId);
        const isAdmin = userGuild && ((userGuild.permissions & 8) === 8 || userGuild.owner);
        if (!isAdmin) return res.status(403).json({ error: 'Access Denied' });

        const { channelId, title, description, color, image, roles } = req.body;
        if (!channelId || !description || !roles || roles.length === 0) {
            return res.status(400).json({ error: 'Missing fields.' });
        }

        const channel = client.channels.cache.get(channelId);
        if (!channel || !channel.isTextBased()) return res.status(404).json({ error: 'Channel not found.' });

        try {
            const embed = new EmbedBuilder()
                .setDescription(description)
                .setColor(color || '#23a559'); 
            
            if (title) embed.setTitle(title);
            if (image) embed.setImage(image);

            const row = new ActionRowBuilder();

            roles.forEach(roleConf => {
                const styleMap = {
                    'Primary': ButtonStyle.Primary,
                    'Success': ButtonStyle.Success,
                    'Danger': ButtonStyle.Danger,
                    'Secondary': ButtonStyle.Secondary
                };
                
                row.addComponents(
                    new ButtonBuilder()
                        .setCustomId(`roleassign_${roleConf.roleId}`)
                        .setLabel(roleConf.label)
                        .setStyle(styleMap[roleConf.color] || ButtonStyle.Primary)
                );
            });

            await channel.send({ embeds: [embed], components: [row] });
            console.log(`[Dashboard] Role assign embed sent to #${channel.name}`);
            res.json({ success: true });
        } catch (err) {
            console.error('[Dashboard] Error sending role embed:', err);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });

    const PORT = config.dashboardPort || 3000;
    app.listen(PORT, () => {
        console.log(`[Dashboard] Server is actively running on http://localhost:${PORT}`);
    });
};
