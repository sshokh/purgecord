# 🔐 Obtaining Your Account Token
1. Open Discord in your web browser and press the `F12` key to open the Developer Tools.
2. In the Developer Tools tab, navigate to the **Network** section.
3. To capture a request with the authorization token, perform any action (e.g., send a message, open DMs).
4. Once a request is captured, click on it and scroll down to the **Request Headers** section. Look for the `Authorization` header, then copy the value—it will be needed later.

# 🧭 Setting Up
1. Install all necessary packages by running `npm i` in your terminal.
2. This Node.js application requires your Discord account token for authorization. Create a new `.env` file in the project directory.
3. In the `.env` file, add the following: `TOKEN="<YOUR_DISCORD_ACCOUNT_TOKEN>"` (e.g., `TOKEN="M1Vd.....mJy6"`).
4. Run `node .` to start the application, and follow the prompts to proceed.

# 🤔 Purpose
This tool is perfect for bulk-deleting messages in a specific channel, DM, or server that contain a particular word or phrase.

# ⭐ Don't Forget to Star This Project!
If you find this tool useful, please consider giving it a star! ⭐