const print = require('./print');
const axios = require('axios');
const readline = require('readline');
require('dotenv').config();

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const color = {
    lightBlue: '\x1B[38;5;51m',
    reset: '\x1b[0m',
    bold: '\x1b[1m',
};

const DISCORD_API_BASE_URL = 'https://discord.com/api/v9';

process.on('unhandledRejection', (reason) => {
    print.error(`Unhandled Rejection: ${reason}`);
});

process.on('uncaughtException', (err) => {
    print.error(`Uncaught Exception: ${err}`);
});

function askQuestion(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function checkAuthToken() {
    try {
        const response = await axios.get(`${DISCORD_API_BASE_URL}/users/@me`, {
            headers: { Authorization: process.env.TOKEN }
        });
        print.success(`Authentication successful! Logged in as: ${response.data.username}`);
        return true;
    } catch (err) {
        print.error('Invalid authentication token. Exiting application.');
        return false;
    }
}

async function checkChannelExists(channelId) {
    try {
        const response = await axios.get(`${DISCORD_API_BASE_URL}/channels/${channelId}`, {
            headers: { Authorization: process.env.TOKEN }
        });
        return { status: true, data: response.data };
    } catch (err) {
        return { status: false };
    }
}

async function askForWord() {
    let word;
    do {
        word = await askQuestion(`${color.lightBlue}[ ${color.bold}?${color.reset}${color.lightBlue} ]${color.reset} What word would you like to bulk delete messages with? `);
        if (!word.trim()) {
            print.error('You must provide a word!');
        }
    } while (!word.trim());

    return word.trim();
}

async function askForChannelId() {
    let channelId;
    let validChannel;

    do {
        channelId = await askQuestion(`${color.lightBlue}[ ${color.bold}?${color.reset}${color.lightBlue} ]${color.reset} In which channel would you like to bulk delete messages? (Enter channel ID) `);
        validChannel = await checkChannelExists(channelId);

        if (validChannel.status) {
            print.success(`Found channel: #${validChannel.data.name}`);
        } else {
            print.error('Invalid Channel ID. Please try again.');
        }
    } while (!validChannel.status);

    return validChannel.data;
}

async function getMessageCount(word, channelId, guildId) {
    try {
        const response = await axios.get(`${DISCORD_API_BASE_URL}/guilds/${guildId}/messages/search`, {
            params: { channel_id: channelId, content: word },
            headers: { Authorization: process.env.TOKEN }
        });
        return response.data.total_results;
    } catch (err) {
        print.error(`Error fetching message count: ${err.message}`);
        throw err;
    }
}

async function findMessagesSet(offset, word, channelId, guildId) {
    try {
        const response = await axios.get(`${DISCORD_API_BASE_URL}/guilds/${guildId}/messages/search`, {
            params: { channel_id: channelId, content: word, offset },
            headers: { Authorization: process.env.TOKEN }
        });

        return response.data.messages.map(msg => ({ id: msg[0].id, content: msg[0].content }));
    } catch (err) {
        print.error(`Error fetching messages: ${err.message}`);
        throw err;
    }
}

async function deleteMessage(messageId, channelId, content) {
    try {
        await axios.delete(`${DISCORD_API_BASE_URL}/channels/${channelId}/messages/${messageId}`, {
            headers: { Authorization: process.env.TOKEN }
        });
        print.success(`Deleted message: ${content}`);
    } catch (err) {
        print.error(`${err.response?.data?.message || 'Error deleting message'}: ${content}`);
    }
}

function getOffsetNumbers(totalMessages, pageSize = 25) {
    const offsets = [];
    for (let i = 0; i <= totalMessages; i += pageSize) {
        offsets.push(i);
    }
    return offsets;
}

async function bulkDeleteMessages() {

    const isAuthenticated = await checkAuthToken();
    if (!isAuthenticated) {
        rl.close();
        return;
    }

    const word = await askForWord();
    const channelData = await askForChannelId();

    const messageCount = await getMessageCount(word, channelData.id, channelData.guild_id);
    print.info(`Found ${messageCount} messages containing the word "${color.bold}${word}${color.reset}" in #${channelData.name}.`);

    const offsetNumbers = getOffsetNumbers(messageCount);

    for (const offset of offsetNumbers) {
        const messagesSet = await findMessagesSet(offset, word, channelData.id, channelData.guild_id);
        for (const message of messagesSet) {
            await deleteMessage(message.id, channelData.id, message.content);
            await sleep(1000);
        }
    }

    print.success(`All matching messages deleted successfully from #${channelData.name}.`);
    rl.close();
}

bulkDeleteMessages().catch(err => {
    print.error(`An unexpected error occurred: ${err.message}`);
    rl.close();
});
