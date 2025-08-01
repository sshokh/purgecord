import logging
from colorama import Fore, Style, init

LEVEL_COLORS = {
    "DEBUG": Fore.CYAN,
    "INFO": Fore.GREEN,
    "WARNING": Fore.YELLOW,
    "ERROR": Fore.RED,
    "CRITICAL": Fore.MAGENTA,
}


class ColorFormatter(logging.Formatter):
    def __init__(self, fmt, datefmt=None):
        super().__init__(fmt, datefmt=datefmt)

    def format(self, record):
        record.color = LEVEL_COLORS.get(record.levelname, Fore.WHITE)
        record.reset = Style.RESET_ALL
        message = super().format(record)
        return f"{Style.BRIGHT}{message}{Style.RESET_ALL}"


def ask(prompt_text):
    answer = input(
        f"{Fore.MAGENTA}{Style.BRIGHT}INPT{Fore.RESET} ~ {Style.RESET_ALL}{prompt_text}"
    )
    return answer


init(autoreset=False)

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)

console_handler = logging.StreamHandler()
template = "%(color)s%(levelname)s ~ %(reset)s%(message)s%(reset)s"
formatter = ColorFormatter(fmt=template, datefmt="%H:%M:%S")
console_handler.setFormatter(formatter)
logger.addHandler(console_handler)
