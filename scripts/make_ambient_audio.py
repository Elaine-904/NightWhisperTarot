"""
Generate a soft night wind + wind chime bed and store it in public/night-wind-chimes.wav.
Uses only the standard library so it can run anywhere.
"""
import math
import random
import struct
import wave
from pathlib import Path


def make_wind_chimes(path: Path, seconds: float = 36.0, seed: int = 11) -> None:
    rate = 44_100
    frames = int(rate * seconds)
    random.seed(seed)

    # Randomize chime strikes (start, frequency, decay)
    events = []
    for _ in range(7):
        start = random.randint(int(rate * 2.5), frames - int(rate * 4))
        freq = random.uniform(640.0, 1150.0)
        decay = random.uniform(0.85, 1.35)
        events.append((start, freq, decay))

    wind = 0.0

    with wave.open(str(path), "wb") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(rate)

        for n in range(frames):
            noise = random.uniform(-1.0, 1.0)
            # Gentle low-pass to keep the wind soft.
            wind += (noise - wind) * 0.0065

            breeze = math.sin(2 * math.pi * n / (rate * 9.5)) * 0.12
            drift = math.sin(2 * math.pi * n / (rate * 33.0)) * 0.25
            sample = (wind * 0.42) + (breeze * 0.18) + (drift * 0.15)

            chime = 0.0
            for start, freq, decay in events:
                t = n - start
                if 0 <= t < rate * 3.3:
                    env = math.exp(-t / (rate * decay))
                    chime += math.sin(2 * math.pi * freq * t / rate) * 0.08 * env
                    chime += math.sin(2 * math.pi * (freq * 1.5) * t / rate) * 0.05 * env

            sample += chime
            sample = max(-0.97, min(0.97, sample))

            wf.writeframes(struct.pack("<h", int(sample * 32767)))

    print(f"Generated {path.name} ({seconds:.0f}s)")


if __name__ == "__main__":
    out_path = Path(__file__).resolve().parent.parent / "public" / "night-wind-chimes.wav"
    out_path.parent.mkdir(parents=True, exist_ok=True)
    make_wind_chimes(out_path)
