"""
Memory Service for Rizik Agent
Async integration with Cloudflare Durable Objects for persistent user memory.
"""

import os
import asyncio
import logging
import aiohttp
from typing import Optional

logger = logging.getLogger("rizik-memory")

# Cloudflare Backend URL (local dev or production)
# Set to empty to use local file storage instead
MEMORY_API_URL = os.getenv("MEMORY_API_URL", "")  # Empty = use local fallback

# Local memory file (fallback when cloud not available)
MEMORY_FILE = os.path.join(os.path.dirname(__file__), ".user_memories.json")


import json

async def get_user_memory(user_id: str) -> Optional[str]:
    """
    Fetch previous conversation summary for a user.
    Uses local file if cloud not configured, graceful degradation on errors.
    """
    if not user_id:
        return None
    
    # Local file mode if cloud not configured
    if not MEMORY_API_URL:
        try:
            if os.path.exists(MEMORY_FILE):
                with open(MEMORY_FILE, 'r', encoding='utf-8') as f:
                    memories = json.load(f)
                    memory = memories.get(user_id)
                    if memory:
                        logger.info(f"📚 Local memory found for {user_id}: {memory[:50]}...")
                        return memory
            return None
        except Exception as e:
            logger.error(f"Local memory read error: {e}")
            return None
        
    # Cloud mode
    try:
        async with aiohttp.ClientSession() as session:
            url = f"{MEMORY_API_URL}/api/memory/{user_id}"
            async with session.get(url, timeout=aiohttp.ClientTimeout(total=2.0)) as response:
                if response.status == 200:
                    data = await response.json()
                    memory = data.get("summary", "")
                    if memory:
                        logger.info(f"📚 Memory found for {user_id}: {memory[:50]}...")
                        return memory
                    return None
                else:
                    logger.warning(f"Memory fetch failed: {response.status}")
                    return None
    except asyncio.TimeoutError:
        logger.warning(f"Memory fetch timeout for {user_id}")
        return None
    except Exception as e:
        logger.error(f"Memory fetch error: {e}")
        return None


async def save_user_memory(user_id: str, summary: str) -> None:
    """
    Save conversation summary for a user.
    Uses local file if cloud not configured, fire-and-forget pattern.
    """
    if not user_id or not summary:
        return
    
    # Local file mode if cloud not configured
    if not MEMORY_API_URL:
        try:
            memories = {}
            if os.path.exists(MEMORY_FILE):
                with open(MEMORY_FILE, 'r', encoding='utf-8') as f:
                    memories = json.load(f)
            memories[user_id] = summary
            with open(MEMORY_FILE, 'w', encoding='utf-8') as f:
                json.dump(memories, f, ensure_ascii=False, indent=2)
            logger.info(f"💾 Local memory saved for {user_id}")
            return
        except Exception as e:
            logger.error(f"Local memory save error: {e}")
            return
        
    # Cloud mode
    try:
        async with aiohttp.ClientSession() as session:
            url = f"{MEMORY_API_URL}/api/memory/{user_id}"
            payload = {"summary": summary}
            async with session.post(
                url, 
                json=payload, 
                timeout=aiohttp.ClientTimeout(total=3.0)
            ) as response:
                if response.status == 200:
                    logger.info(f"💾 Memory saved for {user_id}")
                else:
                    logger.warning(f"Memory save failed: {response.status}")
    except Exception as e:
        logger.error(f"Memory save error: {e}")


def save_memory_async(user_id: str, summary: str) -> None:
    """
    Fire-and-forget memory save (use in background).
    """
    asyncio.create_task(save_user_memory(user_id, summary))


def build_memory_prompt(past_memory: Optional[str]) -> str:
    """
    Build dynamic system prompt with memory injection.
    """
    base_prompt = """তুমি "রিজিক" - একটি বাংলা ভয়েস এআই সহকারী। তুমি বন্ধুত্বপূর্ণ এবং সহায়ক।

গুরুত্বপূর্ণ নিয়ম:
1. সবসময় বাংলায় উত্তর দাও।
2. সংক্ষেপে উত্তর দাও - সর্বোচ্চ ১-২ বাক্যে।
3. User যা বলে তার সরাসরি উত্তর দাও।
4. "Hello" বা "হ্যালো" শুনলে বলো "হ্যালো! আমি রিজিক। আপনাকে কীভাবে সাহায্য করতে পারি?"
5. ভুল বানান বা ভাঙা কথা শুনলেও অর্থ বুঝে উত্তর দাও।

তুমি Rizik App এর AI সহকারী। App সম্পর্কে প্রশ্ন করলে সাহায্য করো।
"""
    
    if past_memory:
        return base_prompt + f"""

আগের কথোপকথন থেকে মনে রাখো:
{past_memory}

এই context ব্যবহার করে personalized উত্তর দাও।
"""
    return base_prompt
