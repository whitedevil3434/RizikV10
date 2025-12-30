"""
Bengali NLP Service for Rizik Voice Agent
Production-grade text processing: Unicode normalization, stopwords, Banglish conversion.
Based on research from csebuetnlp and stopwords-iso.
"""

import re
import unicodedata
import logging
from typing import List, Set, Optional

logger = logging.getLogger("rizik-bengali-nlp")

# =============================================================================
# BENGALI STOPWORDS (391 words from stopwords-iso/stopwords-bn)
# Source: https://github.com/stopwords-iso/stopwords-bn
# =============================================================================
BENGALI_STOPWORDS: Set[str] = {
    "অতএব", "অথচ", "অথবা", "অনুযায়ী", "অনেক", "অনেকে", "অনেকেই", "অন্তত", "অন্য",
    "অবধি", "অবশ্য", "অর্থাত", "আই", "আগামী", "আগে", "আগেই", "আছে", "আজ",
    "আদ্যভাগে", "আপনার", "আপনি", "আবার", "আমরা", "আমাকে", "আমাদের", "আমার", "আমি",
    "আর", "আরও", "ই", "ইত্যাদি", "ইহা", "উচিত", "উত্তর", "উনি", "উপর", "উপরে",
    "এ", "এঁদের", "এঁরা", "এই", "একই", "একটি", "একবার", "একে", "এক্", "এখন",
    "এখনও", "এখানে", "এখানেই", "এটা", "এটাই", "এটি", "এত", "এতটাই", "এতে",
    "এদের", "এব", "এবং", "এবার", "এমন", "এমনকী", "এমনি", "এর", "এরা", "এল",
    "এস", "এসে", "ঐ", "ও", "ওঁদের", "ওঁর", "ওঁরা", "ওই", "ওকে", "ওখানে",
    "ওদের", "ওর", "ওরা", "কখনও", "কত", "কবে", "কমনে", "কয়েক", "কয়েকটি",
    "করছে", "করছেন", "করতে", "করবে", "করবেন", "করলে", "করলেন", "করা", "করাই",
    "করায়", "করার", "করি", "করিতে", "করিয়া", "করিয়ে", "করে", "করেই", "করেছিলেন",
    "করেছে", "করেছেন", "করেন", "কাউকে", "কাছ", "কাছে", "কাজ", "কাজে", "কারও",
    "কারণ", "কি", "কিংবা", "কিছু", "কিছুই", "কিন্তু", "কী", "কে", "কেউ", "কেউই",
    "কেখা", "কেন", "কোটি", "কোন", "কোনও", "কোনো", "ক্ষেত্রে", "খুব", "গিয়ে",
    "গিয়েছে", "গুলি", "গেছে", "গেল", "গেলে", "গোটা", "চলে", "চান", "চায়", "চার",
    "চালু", "চেয়ে", "চেষ্টা", "ছাড়া", "ছাড়াও", "ছিল", "ছিলেন", "জন", "জনকে",
    "জনের", "জন্য", "জানতে", "জানা", "জানানো", "জানায়", "জানিয়ে", "জানিয়েছে",
    "জে", "টি", "ঠিক", "তখন", "তত", "তথা", "তবু", "তবে", "তা", "তাঁকে", "তাঁদের",
    "তাঁর", "তাঁরা", "তাই", "তাও", "তাকে", "তাতে", "তাদের", "তার", "তারপর",
    "তারা", "তাহলে", "তাহা", "তাহাতে", "তাহার", "তিনি", "তিনিও", "তুমি", "তুলে",
    "তেমন", "তো", "তোমার", "থাকবে", "থাকবেন", "থাকা", "থাকায়", "থাকে", "থাকেন",
    "থেকে", "থেকেই", "থেকেও", "দিকে", "দিতে", "দিন", "দিয়ে", "দিয়েছে", "দিয়েছেন",
    "দিলেন", "দু", "দুই", "দুটি", "দুটো", "দেওয়া", "দেওয়ার", "দেখতে", "দেখা",
    "দেখে", "দেন", "দেয়", "দ্বারা", "ধরা", "ধরে", "নতুন", "নয়", "না", "নাই",
    "নাকি", "নাগাদ", "নানা", "নিজে", "নিজেই", "নিজেদের", "নিজের", "নিতে", "নিয়ে",
    "নেই", "নেওয়া", "নেওয়ার", "পক্ষে", "পর", "পরে", "পরেই", "পরেও", "পর্যন্ত",
    "পাওয়া", "পাচ", "পারি", "পারে", "পারেন", "পি", "পেয়ে", "প্রতি", "প্রথম",
    "প্রভৃতি", "প্রায়", "ফলে", "ফিরে", "ফের", "বক্তব্য", "বদলে", "বন", "বরং",
    "বলতে", "বলল", "বললেন", "বলা", "বলে", "বলেছেন", "বলেন", "বসে", "বহু", "বা",
    "বাদে", "বার", "বি", "বিনা", "বিভিন্ন", "বিশেষ", "বিষয়টি", "বেশ", "বেশি",
    "ব্যবহার", "ব্যাপারে", "ভাবে", "ভাবেই", "মতো", "মতোই", "মধ্যভাগে", "মধ্যে",
    "মধ্যেই", "মধ্যেও", "মনে", "মাত্র", "মাধ্যমে", "মোট", "মোটেই", "যখন", "যত",
    "যতটা", "যথেষ্ট", "যদি", "যদিও", "যা", "যাঁর", "যাঁরা", "যাওয়া", "যাওয়ার",
    "যাকে", "যাচ্ছে", "যাতে", "যাদের", "যান", "যাবে", "যায়", "যার", "যারা",
    "যিনি", "যে", "যেখানে", "যেতে", "যেন", "যেমন", "র", "রকম", "রয়েছে", "রাখা",
    "রেখে", "লক্ষ", "শুধু", "শুরু", "সঙ্গে", "সঙ্গেও", "সব", "সবার", "সমস্ত",
    "সম্প্রতি", "সহ", "সহিত", "সাধারণ", "সামনে", "সি", "সুতরাং", "সে", "সেই",
    "সেখান", "সেখানে", "সেটা", "সেটাই", "সেটাও", "সেটি", "স্পষ্ট", "স্বয়ং",
    "হইতে", "হইবে", "হইয়া", "হওয়া", "হওয়ায়", "হওয়ার", "হচ্ছে", "হত", "হতে",
    "হতেই", "হন", "হবে", "হবেন", "হয়", "হয়তো", "হয়নি", "হয়ে", "হয়েই",
    "হয়েছিল", "হয়েছে", "হয়েছেন", "হল", "হলে", "হলেই", "হলেও", "হলো", "হাজার",
    "হিসাবে", "হোক"
}

# =============================================================================
# UNICODE NORMALIZATION RULES (Based on csebuetnlp/normalizer)
# =============================================================================
UNICODE_NORMALIZATION_MAP = {
    # Composite to atomic conversions
    "\u09C7\u09BE": "\u09CB",  # ে + া -> ো
    "\u09C7\u09D7": "\u09CC",  # ে + ৗ -> ৌ
    "\u09A1\u09BC": "\u09DC",  # ড + ় -> ড়
    "\u09A2\u09BC": "\u09DD",  # ঢ + ় -> ঢ়
    "\u09AF\u09BC": "\u09DF",  # য + ় -> য়
    # Zero-width joiners cleanup
    "\u200C": "",  # ZWNJ
    "\u200D": "",  # ZWJ
    "\u200B": "",  # ZWSP
    # Common typos
    "।।": "।",    # Double দাড়ি
    ",,": ",",
    "..": ".",
}

# =============================================================================
# AVRO PHONETIC MAPPING (Banglish to Bengali)
# Based on Avro Phonetic keyboard rules
# =============================================================================
AVRO_PHONETIC_MAP = {
    # Vowels
    "a": "া", "aa": "আ", "i": "ি", "ii": "ী", "ee": "ী",
    "u": "ু", "uu": "ূ", "oo": "ূ", "e": "ে", "oi": "ৈ",
    "o": "ো", "ou": "ৌ", "O": "অ", "A": "আ", "I": "ই",
    
    # Consonants
    "k": "ক", "kh": "খ", "g": "গ", "gh": "ঘ", "ng": "ঙ",
    "c": "চ", "ch": "ছ", "j": "জ", "jh": "ঝ", "n~": "ঞ",
    "T": "ট", "Th": "ঠ", "D": "ড", "Dh": "ঢ", "N": "ণ",
    "t": "ত", "th": "থ", "d": "দ", "dh": "ধ", "n": "ন",
    "p": "প", "ph": "ফ", "f": "ফ", "b": "ব", "bh": "ভ",
    "m": "ম", "z": "য", "r": "র", "l": "ল", "sh": "শ",
    "S": "ষ", "s": "স", "h": "হ", "R": "ড়", "Rh": "ঢ়",
    "y": "য়", "w": "ও",
    
    # Common words (shortcuts)
    "ami": "আমি", "tumi": "তুমি", "apni": "আপনি",
    "ke": "কে", "ki": "কি", "keno": "কেন", "kobe": "কবে",
    "haa": "হ্যাঁ", "na": "না", "hoito": "হয়তো",
    "accha": "আচ্ছা", "thik": "ঠিক", "bhalo": "ভালো",
    "kemon": "কেমন", "achen": "আছেন", "achi": "আছি",
    "bolo": "বলো", "bolun": "বলুন", "jani": "জানি",
    "janina": "জানিনা", "bujhlam": "বুঝলাম", "bujhi": "বুঝি",
    
    # Rizik app specific terms (keep English)
    "rizik": "রিজিক", "login": "login", "password": "password",
    "balance": "balance", "transaction": "transaction",
    "order": "order", "delivery": "delivery", "payment": "payment",
    "bkash": "bKash", "nagad": "Nagad", "rocket": "Rocket",
}


def normalize_unicode(text: str) -> str:
    """
    Normalize Bengali Unicode text.
    - Converts composite characters to atomic form
    - Removes zero-width characters
    - Fixes common typos
    """
    if not text:
        return ""
    
    # Apply NFC normalization first
    text = unicodedata.normalize("NFC", text)
    
    # Apply Bengali-specific rules
    for pattern, replacement in UNICODE_NORMALIZATION_MAP.items():
        text = text.replace(pattern, replacement)
    
    # Remove extra whitespace
    text = re.sub(r'\s+', ' ', text).strip()
    
    return text


def remove_stopwords(text: str) -> str:
    """
    Remove Bengali stopwords from text.
    Useful for improving RAG search quality.
    """
    words = text.split()
    filtered = [w for w in words if w not in BENGALI_STOPWORDS]
    return " ".join(filtered)


def banglish_to_bengali(text: str) -> str:
    """
    Convert Romanized Bengali (Banglish) to Bengali script.
    Uses Avro phonetic rules with common word shortcuts.
    """
    if not text:
        return ""
    
    result = text
    
    # Sort by length (longer patterns first to avoid partial matches)
    sorted_patterns = sorted(AVRO_PHONETIC_MAP.keys(), key=len, reverse=True)
    
    for pattern in sorted_patterns:
        result = result.replace(pattern, AVRO_PHONETIC_MAP[pattern])
    
    return result


def is_bengali_text(text: str) -> bool:
    """
    Check if text contains Bengali characters.
    """
    bengali_pattern = re.compile(r'[\u0980-\u09FF]')
    return bool(bengali_pattern.search(text))


def clean_transcript(text: str) -> str:
    """
    Clean and normalize STT transcript for processing.
    - Unicode normalization
    - Remove extra punctuation
    - Trim whitespace
    """
    if not text:
        return ""
    
    # Normalize unicode
    text = normalize_unicode(text)
    
    # Remove repeated punctuation
    text = re.sub(r'([।,?!])\1+', r'\1', text)
    
    # Remove leading/trailing punctuation
    text = text.strip('।, ')
    
    return text


def extract_keywords(text: str) -> List[str]:
    """
    Extract keywords from Bengali text (for RAG search).
    Removes stopwords and returns list of significant words.
    """
    clean = normalize_unicode(text)
    words = clean.split()
    
    # Remove stopwords and short words
    keywords = [
        w for w in words 
        if w not in BENGALI_STOPWORDS 
        and len(w) > 1 
        and not w.isdigit()
    ]
    
    return keywords


# =============================================================================
# GLOSSARY INJECTION FOR WHISPER
# =============================================================================
def build_whisper_glossary(intent: str = "general") -> str:
    """
    Build context prompt for Whisper STT based on intent.
    This helps Whisper understand domain-specific terms.
    """
    glossaries = {
        "general": (
            "উচ্চারণ মিশ্রিত হবে। Bengali and English mix (Banglish). "
            "Sample: 'আমি actually অফিসে যাচ্ছি কিন্তু road block আছে।' "
            "Rizik App conversation."
        ),
        "transaction": (
            "Transaction discussion. Technical terms: Transaction ID, bKash, Nagad, "
            "Rocket, Pending, Failed, Balance, Payment, Refund. "
            "Bengali numbers: এক, দুই, তিন, চার, পাঁচ। "
            "Focus on numeric accuracy."
        ),
        "order": (
            "Food order discussion. Terms: Menu, Cart, Checkout, Delivery, "
            "Address, Time, COD, Online Payment. "
            "Bengali: অর্ডার, খাবার, ডেলিভারি।"
        ),
        "support": (
            "Customer support conversation. Terms: Problem, Issue, Help, "
            "Account, Password, Login, Error. "
            "Bengali: সমস্যা, সাহায্য, ঠিক করুন।"
        ),
    }
    
    return glossaries.get(intent, glossaries["general"])


# Test function
if __name__ == "__main__":
    # Test normalization
    test_text = "আমি   বাংলায় গান   গাই।।"
    print(f"Normalized: {normalize_unicode(test_text)}")
    
    # Test stopword removal
    print(f"Keywords: {extract_keywords('আমি আজ বাজারে যাব এবং সবজি কিনব')}")
    
    # Test Banglish
    print(f"Banglish: {banglish_to_bengali('ami thik achi')}")
    
    # Test glossary
    print(f"Glossary: {build_whisper_glossary('transaction')}")
