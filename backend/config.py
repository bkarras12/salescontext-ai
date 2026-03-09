import os
from dotenv import load_dotenv

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
BUILTWITH_API_KEY = os.getenv("BUILTWITH_API_KEY", "")
SERPAPI_KEY = os.getenv("SERPAPI_KEY", "")
