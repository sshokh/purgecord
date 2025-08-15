from requests.exceptions import RequestException
import requests
import time
import os

from logger import logger


class Session:
    def __init__(self, base_url, token):
        self.base_url = base_url
        self.token = token

    def get(self, path, **kwargs):
        return requests.get(
            f"{self.base_url}{path}", headers={"Authorization": self.token}, **kwargs
        )

    def post(self, path, **kwargs):
        return requests.post(
            f"{self.base_url}{path}", headers={"Authorization": self.token}, **kwargs
        )

    def delete(self, path, **kwargs):
        return requests.delete(
            f"{self.base_url}{path}", headers={"Authorization": self.token}, **kwargs
        )


class PurgeCord:
    def __init__(self):
        token = logger.input("Enter your discord account token: ")
        self.session = Session("https://discord.com/api/v9", token)

    def login(self):
        while True:
            response = self.session.get("/users/@me")
            if not response.ok:
                logger.error("Invalid token. Try again")
                new_token = logger.input("Enter your discord account token: ")
                self.session.token = new_token

    def offset_numbers(self, message_count):
        return list(range(0, message_count + 1, 25))

    def fetch_channel(self):
        id = logger.input(
            "In which channel would you like to bulk delete messages: "
        )

        response = self.session.get(f"/channels/{id}")
        if response.ok:
            return response.json()

    def fetch_phrase(self):
        phrase = None

        while not phrase:
            phrase = logger.input("What phrase would you like to bulk delete messages with? ")
            if phrase == None:
                logger.error("You must provide at least one word.")

        return phrase

    def fetch_message_count(self, guild_id, channel_id, phrase):
        try:
            response = self.session.get(
                f"/guilds/{guild_id}/messages/search",
                params={"channel_id": channel_id, "content": phrase},
            )
            return response.json()["total_results"]
        except RequestException as e:
            logger.error(f"Error fetching messages amount: {e}")

    def fetch_message_set(self, offset, phrase, channel_id, guild_id):
        try:
            response = self.session.get(
                f"/guilds/{guild_id}/messages/search",
                params={"channel_id": channel_id, "content": phrase, "offset": offset},
            )

            return map(
                lambda msg: {"id": msg[0]["id"], "content": msg[0]["content"]},
                response.json()["messages"],
            )
        except RequestException as e:
            logger.error(f"Error fetching message set: {e}")

    def delete_message(self, message_id, channel_id, content):
        try:
            response = self.session.delete(
                f"/channels/{channel_id}/messages/{message_id}"
            )
            response.raise_for_status()
            logger.success(f"Deleted message: {content}")
        except RequestException as e:
            logger.error(f"Error deleting a message: {e}")

    def delete_all(self):
        phrase = self.fetch_phrase()
        channel = self.fetch_channel()
        message_count = self.fetch_message_count(
            channel["guild_id"], channel["id"], phrase
        )
        logger.success(
            f"Found {message_count} message{'s' if message_count == 1 else ''} containing the phrase {phrase} in #{channel["name"]}."
        )

        if message_count:
            offset_nums = self.offset_numbers(message_count)

            for offset in offset_nums:
                message_set = self.fetch_message_set(
                    offset,
                    phrase,
                    channel_id=channel["id"],
                    guild_id=channel["guild_id"],
                )
                for message in message_set:
                    self.delete_message(
                        message_id=message["id"],
                        channel_id=channel["id"],
                        content=message["content"],
                    )
                    time.sleep(0.2)


if __name__ == "__main__":
    os.system("cls" or "clear")
    purgecord = PurgeCord()
    purgecord.login()
    purgecord.delete_all()