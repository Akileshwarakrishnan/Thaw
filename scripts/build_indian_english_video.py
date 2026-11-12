import os
import sys
import subprocess
import asyncio
import edge_tts

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from build_demo_video import SCENES, get_audio_duration

BUILD_DIR = "video_build"
VOICE = "en-IN-PrabhatNeural"
OUTPUT = "public/thaw-demo-video-indian-english.mp4"

async def gen_all():
    print("Generating Indian English (en-IN-PrabhatNeural) voiceover...")
    clip_files = []
    clip_list_path = os.path.join(BUILD_DIR, "clips_prabhat.txt")
    
    for scene in SCENES:
        s_id = scene["id"]
        audio_mp3 = os.path.join(BUILD_DIR, f"scene{s_id}_prabhat.mp3")
        frame_png = os.path.join(BUILD_DIR, f"scene{s_id}.png")
        clip_mp4 = os.path.join(BUILD_DIR, f"clip{s_id}_prabhat.mp4")
        
        comm = edge_tts.Communicate(scene["voiceover"], VOICE, rate="-4%")
        await comm.save(audio_mp3)
        duration = get_audio_duration(audio_mp3) + 1.0
        
        cmd = [
            "ffmpeg", "-y", "-loop", "1",
            "-i", frame_png, "-i", audio_mp3,
            "-t", str(duration),
            "-vf", "scale=1920:1080,format=yuv420p",
            "-c:v", "libx264", "-tune", "stillimage", "-preset", "fast",
            "-c:a", "aac", "-b:a", "192k", "-shortest", "-pix_fmt", "yuv420p",
            clip_mp4
        ]
        subprocess.run(cmd, check=True)
        clip_files.append(f"file '{os.path.abspath(clip_mp4)}'")

    with open(clip_list_path, "w") as f:
        f.write("\n".join(clip_files) + "\n")

    subprocess.run(["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", clip_list_path, "-c", "copy", OUTPUT], check=True)
    print("Generated alternative video successfully at:", OUTPUT)

if __name__ == "__main__":
    asyncio.run(gen_all())
