import random

def generate_log_entry(i):
    names = ["Clinton", "Andrew", "Gates", "Musk", "Mandelson", "Trump", "Branson", "Wexner"]
    locations = ["Little St. James", "Palisades", "Palm Beach", "Zorro Ranch", "Paris", "London"]
    dates = [f"{random.randint(1996, 2026)}-{random.randint(1,12):02d}-{random.randint(1,28):02d}" for _ in range(10)]
    entry = f"ENTRY_{i:07d}: DATE={random.choice(dates)} | SUBJECT={random.choice(names)} | ACTION=DECLASSIFIED | SOURCE=FBI_CACHE_0{random.randint(1,9)}\n"
    content = "DATA_STREAM: " + " ".join([hex(random.getrandbits(32)) for _ in range(20)]) + "\n"
    return entry + content

def create_chunk(filename, size_mb):
    with open(filename, 'w') as f:
        current_size = 0
        i = 0
        while current_size < size_mb * 1024 * 1024:
            entry = generate_log_entry(i)
            f.write(entry)
            current_size += len(entry)
            i += 1

if __name__ == "__main__":
    for part in range(1, 4):
        create_chunk(f"AGENTS/EPSTEIN_RAW_PART_{part}.txt", 5)
        print(f"Created PART {part}")
