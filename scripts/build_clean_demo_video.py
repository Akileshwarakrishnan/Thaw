import os
import subprocess

BUILD_DIR = "video_build"
PUBLIC_DIR = "public"
OUTPUT_VIDEO = os.path.join(PUBLIC_DIR, "thaw-demo-video.mp4")

os.makedirs(BUILD_DIR, exist_ok=True)
os.makedirs(PUBLIC_DIR, exist_ok=True)

def get_audio_duration(audio_path):
    cmd = [
        "ffprobe", "-v", "quiet",
        "-show_entries", "format=duration",
        "-of", "csv=p=0",
        audio_path
    ]
    res = subprocess.check_output(cmd).decode().strip()
    return float(res)

def build_master_video():
    print("\n=======================================================")
    print("🎬 Building Clean Master Demo Video (Zero Overlays)")
    print("Voice: South Indian English (en-IN-PrabhatNeural)")
    print("=======================================================\n")

    clip_list_path = os.path.join(BUILD_DIR, "clean_clips.txt")
    clip_files = []

    for i in range(1, 7):
        frame_png = os.path.join(BUILD_DIR, f"clean_scene{i}.png")
        audio_mp3 = os.path.join(BUILD_DIR, f"clean_scene{i}.mp3")
        clip_mp4 = os.path.join(BUILD_DIR, f"clean_clip{i}.mp4")

        if not os.path.exists(frame_png):
            raise FileNotFoundError(f"Missing frame: {frame_png}")
        if not os.path.exists(audio_mp3):
            raise FileNotFoundError(f"Missing audio: {audio_mp3}")

        duration = get_audio_duration(audio_mp3) + 0.6
        print(f"Scene {i}: Duration = {duration:.2f}s | Frame: {frame_png}")

        # Encode crisp 1080p H.264 video with AAC audio
        # Pure screen recording look: no artificial templates or overlays blocking the UI
        cmd = [
            "ffmpeg", "-y",
            "-loop", "1",
            "-i", frame_png,
            "-i", audio_mp3,
            "-t", str(duration),
            "-vf", "scale=1920:1080,format=yuv420p",
            "-c:v", "libx264",
            "-tune", "stillimage",
            "-preset", "fast",
            "-c:a", "aac",
            "-b:a", "192k",
            "-shortest",
            "-pix_fmt", "yuv420p",
            clip_mp4
        ]
        subprocess.run(cmd, check=True)
        clip_files.append(f"file '{os.path.abspath(clip_mp4)}'")

    with open(clip_list_path, "w") as f:
        f.write("\n".join(clip_files) + "\n")

    print("\n--- Concatenating Scenes into Master MP4 ---")
    concat_cmd = [
        "ffmpeg", "-y",
        "-f", "concat",
        "-safe", "0",
        "-i", clip_list_path,
        "-c", "copy",
        OUTPUT_VIDEO
    ]
    subprocess.run(concat_cmd, check=True)

    # Also keep a copy for indian-english filename
    alt_copy = os.path.join(PUBLIC_DIR, "thaw-demo-video-indian-english.mp4")
    try:
        import shutil
        shutil.copyfile(OUTPUT_VIDEO, alt_copy)
    except Exception as e:
        print("Copy notice:", e)

    print(f"\n🎉 SUCCESS! Broadcast Demo Video Generated at: {OUTPUT_VIDEO}")

if __name__ == "__main__":
    build_master_video()
