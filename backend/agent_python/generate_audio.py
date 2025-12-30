import wave
import math
import struct

# Parameters
duration = 3.0       # seconds
sample_rate = 48000  # Hz
frequency = 440.0    # Hz (A4)
amplitude = 16000    # 16-bit PCM amplitude

# Generate frames
num_samples = int(duration * sample_rate)
data = []
for i in range(num_samples):
    value = int(amplitude * math.sin(2 * math.pi * frequency * i / sample_rate))
    data.append(struct.pack('<h', value))

# Write to file
with wave.open("test_audio.wav", "w") as wav_file:
    wav_file.setnchannels(1)
    wav_file.setsampwidth(2)
    wav_file.setframerate(sample_rate)
    wav_file.writeframes(b''.join(data))

print("✅ Generated test_audio.wav (3s, 440Hz, 48kHz)")
