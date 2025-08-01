# Purgecord

Purgecord allows you to bulk delete messages in a Discord channel that contain specific words or phrases. It's designed to make message management easier by automating the deletion process.

## Features

- **Bulk delete** messages containing specific keywords in any channel or DM.
- **Targeted deletion** by channel ID.
- **User authentication** with a Discord token for secure access.
- **Rate limit handling** to ensure efficient API usage.
- **Detailed logging** of successful and failed deletions.

## Account Token

1. Open Discord in your web browser and press `F12` to access the Developer Tools.
2. Navigate to the **Network** tab in the Developer Tools.
3. Perform an action on Discord (e.g., send a message or open DMs) to capture a network request.
4. Locate a request and click on it. In the **Request Headers** section, find the `Authorization` key and copy its value. This is your account token.

> **Important:** Keep your token private, as it provides full access to your Discord account.

## Getting Started

### Setup

1. Clone this repository to your local machine:

   ```bash
   git clone https://github.com/sshokh/purgecord.git .
   ```

2. Install the required dependencies:

   ```bash
   pip install colorama logging requests
   ```

3. Start the application:

   ```bash
   python main.py
   ```

   The tool will guide you through entering the specific word or phrase to delete and the channel/server ID.

## Usage

After starting the application, you will be prompted to:

1. **Enter your discord account token**: Paste the token value you copied earlier.  
1. **What phrase would you like to bulk delete messages with?**: Specify the word or phrase you'd like to search for and delete.
2. **In which channel would you like to bulk delete messages?**: Provide the ID of the specific channel where you want to bulk delete messages.

The application will then scan for messages and begin deletion, handling rate limits to avoid overwhelming Discord's API.

## Security

- **Token privacy**: Your token is not stored anywhere and is never exposed publicly. Ensure you do not commit this file to version control.

## Contributing

If you have ideas to improve this tool or find any issues, feel free to submit a pull request or open an issue!

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
