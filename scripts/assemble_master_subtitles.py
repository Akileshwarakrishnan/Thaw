import os
import sys

BUILD_DIR = "video_build"
PUBLIC_DIR = "public"
SRT_OUT = os.path.join(PUBLIC_DIR, "thaw-demo-video.srt")
VTT_OUT = os.path.join(PUBLIC_DIR, "thaw-demo-video.vtt")

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from generate_video_subtitles import SCENES_TEXT, get_audio_duration

def parse_time(ts_str):
    # Format: HH:MM:SS,mmm
    parts = ts_str.strip().replace(",", ".").split(":")
    h = float(parts[0])
    m = float(parts[1])
    s = float(parts[2])
    return h * 3600 + m * 60 + s

def format_srt_time(seconds):
    h = int(seconds // 3600)
    m = int((seconds % 3600) // 60)
    s = seconds % 60
    return f"{h:02d}:{m:02d}:{s:06.3f}".replace(".", ",")

def format_vtt_time(seconds):
    h = int(seconds // 3600)
    m = int((seconds % 3600) // 60)
    s = seconds % 60
    return f"{h:02d}:{m:02d}:{s:06.3f}"

def assemble_master_subtitles():
    master_entries = []
    current_offset = 0.0
    counter = 1

    from generate_video_subtitles import SCENES_TEXT, get_audio_duration

    for s_id, _ in SCENES_TEXT:
        srt_file = os.path.join(BUILD_DIR, f"sub_{s_id}.srt")
        audio_file = os.path.join(BUILD_DIR, f"sub_audio_{s_id}.mp3")
        duration = get_audio_duration(audio_file) + 0.6

        if os.path.exists(srt_file):
            with open(srt_file, "r", encoding="utf-8") as f:
                content = f.read().strip()
                blocks = content.split("\n\n")
                for block in blocks:
                    lines = block.split("\n")
                    if len(lines) >= 3:
                        time_line = lines[1]
                        text_lines = "\n".join(lines[2:])
                        if "-->" in time_line:
                            start_str, end_str = time_line.split("-->")
                            start_sec = parse_time(start_str) + current_offset
                            end_sec = parse_time(end_str) + current_offset
                            master_entries.append({
                                "id": counter,
                                "start": start_sec,
                                "end": end_sec,
                                "text": text_lines
                            })
                            counter += 1

        current_offset += duration

    # Write Master SRT
    with open(SRT_OUT, "w", encoding="utf-8") as f:
        for e in master_entries:
            f.write(f"{e['id']}\n")
            f.write(f"{format_srt_time(e['start'])} --> {format_srt_time(e['end'])}\n")
            f.write(f"{e['text']}\n\n")

    # Write Master VTT
    with open(VTT_OUT, "w", encoding="utf-8") as f:
        f.write("WEBVTT\n\n")
        for e in master_entries:
            f.write(f"{e['id']}\n")
            f.write(f"{format_vtt_time(e['start'])} --> {format_vtt_time(e['end'])}\n")
            f.write(f"{e['text']}\n\n")

    print(f"Generated Master SRT: {SRT_OUT}")
    print(f"Generated Master VTT: {VTT_OUT}")

if __name__ == "__main__":
    assemble_master_subtitles()
