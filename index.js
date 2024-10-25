import lowcon from 'lowkey-console'
import axios from 'axios'
import readline from 'readline'
import 'dotenv/config'

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const DISCORD_API_BASE_URL = 'https://discord.com/api/v9';

process.on('unhandledRejection', (reason) => {
    lowcon.error(`Unhandled Rejection: ${reason}`);
});

process.on('uncaughtException', (err) => {
    lowcon.error(`Uncaught Exception: ${err}`);
});

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function askQuestion(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

async function checkAuthToken() {
    try {
        await axios.get(`${DISCORD_API_BASE_URL}/users/@me`, {
            headers: { Authorization: process.env.TOKEN }
        }).then((data) => {
            lowcon.success(`Authentication successful! Logged in as: ${data.data.username}`)
        })

        return true;
    } catch (error) {
        lowcon.error(`Invalid authentication token. Exiting application.`)
        return false;
    }
}

async function checkChannelExists(channelId) {
    try {
        const response = await axios.get(`${DISCORD_API_BASE_URL}/channels/${channelId}`, {
            headers: { Authorization: process.env.TOKEN }
        });
        return { status: true, data: response };
    } catch (err) {
        return { status: true };
    }
}

async function askForWord() {
    let word;

    do {
        word = await askQuestion(`${lowcon.ansiColors.magentaBright(lowcon.ansiColors.bold('?'))}  What word would you like to bulk delete messages with? `);
        if (!word.trim()) lowcon.error('You must provide a word!');
    } while (!word.trim());

    return word.trim();
}

async function askForChannelId() {
    let channelId;
    let validChannel;

    do {
        channelId = await askQuestion(`${lowcon.ansiColors.magentaBright(lowcon.ansiColors.bold('?'))}  In which channel would you like to bulk delete messages? (Enter channel ID) `);
        validChannel = (await checkChannelExists(channelId)).data;

        if (validChannel.status) lowcon.success(`Found channel: ${lowcon.ansiColors.bold.blue(`#${validChannel.data.name}`)}`);
        else lowcon.error('Invalid Channel ID. Please try again.');
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
        lowcon.error(`Error fetching message count: ${err.message}`);
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
        lowcon.error(`Error fetching messages: ${err.message}`);
        throw err;
    }
}

async function deleteMessage(messageId, channelId, content) {
    try {
        await axios.delete(`${DISCORD_API_BASE_URL}/channels/${channelId}/messages/${messageId}`, {
            headers: { Authorization: process.env.TOKEN }
        });
        lowcon.info(`Deleted message: ${content}`);
    } catch (err) {
        lowcon.error(`${err.response?.data?.message || 'Error deleting message'}: ${content}`);
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
    lowcon.info(`Found ${lowcon.ansiColors.bold(messageCount)} message${messageCount === 1 ? '' : 's'} containing the word "${lowcon.ansiColors.bold(word)}" in ${lowcon.ansiColors.bold.blue(`#${channelData.name}`)}.`);

    if (messageCount !== 0) {
        const offsetNumbers = getOffsetNumbers(messageCount);

        for (const offset of offsetNumbers) {
            const messagesSet = await findMessagesSet(offset, word, channelData.id, channelData.guild_id);
            for (const message of messagesSet) {
                await deleteMessage(message.id, channelData.id, message.content);
                await sleep(1000);
            }
        }

        lowcon.success(`All matching messages deleted successfully from ${lowcon.ansiColors.bold.blue(`#${channelData.name}`)}.`);
    }
    rl.close();
}

bulkDeleteMessages().catch(err => {
    lowcon.error(`An unexpected error occurred: ${err.message}`);
    rl.close();
});
