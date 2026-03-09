import os
from dotenv import load_dotenv

load_dotenv()

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")
BUILTWITH_API_KEY = os.getenv("BUILTWITH_API_KEY", "")
SERPAPI_KEY = os.getenv("SERPAPI_KEY", "")
