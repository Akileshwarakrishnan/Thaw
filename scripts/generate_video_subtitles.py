import os
import subprocess

BUILD_DIR = "video_build"
PUBLIC_DIR = "public"
VOICE = "en-IN-PrabhatNeural"
OUTPUT_VIDEO_SUB = os.path.join(PUBLIC_DIR, "thaw-demo-video.mp4")

SCENES_TEXT = [
    (
        1,
        "Every single month, thousands of profitable e-commerce merchants wake up to a devastating email from PayPal: Your account has been placed on a 21-day hold, or a rolling reserve. "
        "In an instant, incoming revenue is frozen. Merchants cannot pay suppliers, and payroll is paralyzed. "
        "Worst of all, PayPal risk algorithms never disclose why until it is already too late. "
        "This is Thaw: the early-warning and cash-flow shield built specifically for PayPal sellers. "
        "Our promise is simple: Know before PayPal freezes your money."
    ),
    (
        2,
        "Instead of leaving merchants in the dark, Thaw continuously analyzes seller account telemetry across six publicly documented underwriting triggers. "
        "In this live store, our Hold Risk Gauge is sitting at 63 out of 100, in the Medium Risk drifting band. "
        "Down in the Cash-Flow Shield, Thaw immediately reveals the financial reality: out of 5,400 dollars in sales, "
        "exactly 303 dollars is vulnerable to a 10 percent rolling reserve, locked for up to 21 days by PayPals automated risk bots."
    ),
    (
        3,
        "Why is this account drifting? Thaws AI engine analyzes the deterministic risk signals and breaks them down into plain, actionable English: "
        "14 physical orders dispatched over three days ago are completely missing carrier tracking numbers, "
        "and customer dispute rates are trending upward toward the critical 1.5 percent threshold. "
        "In the Action Queue, our agent proposes ranked, prioritized solutions. "
        "Notice the Weight Impact Badge: fulfilling this action removes 6 risk points directly from the missing tracking trigger upon dispatch."
    ),
    (
        4,
        "Now, here is our core philosophy: Strict Human-in-the-Loop Guardrails. "
        "The AI proposes actions, but zero money and zero tracking moves without explicit merchant approval. "
        "When the merchant clicks Approve and Execute, the remediation is dispatched instantly through the PayPal Agent Toolkit using Model Context Protocol tools. "
        "Carrier tracking is submitted directly to PayPals live Shipment Tracking API. "
        "Immediately, our risk engine re-evaluates: the risk score drops by 6 points, the cash-flow shield updates, and held funds are cleared for withdrawal."
    ),
    (
        5,
        "Merchants can also hedge against future risk. "
        "With our Pre-Promotion Simulator, sellers planning a flash sale can simulate a 2.5 times volume spike "
        "and generate pre-notification documentation for PayPal underwriting to prevent automated velocity freezes. "
        "And everything you see is real. "
        "In our Sandbox Proof suite, Thaw executes an authentic five-step verification cycle across PayPals live REST APIs: "
        "creating real orders, uploading real shipment trackers, executing refunds, reading disputes, and cryptographically verifying webhook signatures."
    ),
    (
        6,
        "Under the hood, Thaw is built on Next.js 14, TypeScript, Prisma, and Zod schema validation, "
        "backed by 21 automated unit tests with strict idempotency and refund cap safeguards. "
        "PayPal protects buyers. Thaw protects merchants. "
        "Know before PayPal freezes your money. Thank you."
    )
]

def get_audio_duration(audio_path):
    cmd = [
        "ffprobe", "-v", "quiet",
        "-show_entries", "format=duration",
        "-of", "csv=p=0",
        audio_path
    ]
    res = subprocess.check_output(cmd).decode().strip()
    return float(res)

def generate_subtitled_video():
    print("\n--- Generating Audio & Line-by-Line Subtitles with edge-tts ---")
    clip_files = []
    clip_list_path = os.path.join(BUILD_DIR, "clips_subtitled.txt")

    for s_id, text in SCENES_TEXT:
        audio_mp3 = os.path.join(BUILD_DIR, f"sub_audio_{s_id}.mp3")
        srt_path = os.path.join(BUILD_DIR, f"sub_{s_id}.srt")
        frame_png = os.path.join(BUILD_DIR, f"clean_scene{s_id}.png")
        clip_mp4 = os.path.join(BUILD_DIR, f"sub_clip_{s_id}.mp4")

        # 1. Generate audio + SRT subtitle via edge-tts CLI
        print(f"Generating Scene {s_id} audio and captions...")
        cmd_tts = [
            "edge-tts",
            "--voice", VOICE,
            "--text", text,
            "--write-media", audio_mp3,
            "--write-subtitles", srt_path
        ]
        subprocess.run(cmd_tts, check=True)

        duration = get_audio_duration(audio_mp3) + 0.6
        print(f"Scene {s_id}: Duration = {duration:.2f}s")

        # Clean Windows path for ffmpeg subtitles filter (replace backslash with forward slash and escape colon)
        # In ffmpeg subtitles filter on Windows: filename must escape ':' as '\:' and '\' as '/'
        escaped_srt = srt_path.replace("\\", "/").replace(":", "\\:")
        
        # Style: Clean Netflix/YouTube style subtitle at bottom
        # Yellowish-white text with black semi-transparent bounding box, perfectly positioned at bottom edge
        sub_style = (
            "Fontname=Arial,Fontsize=18,Bold=1,"
            "PrimaryColour=&H00FFFFFF,OutlineColour=&H00000000,"
            "BackColour=&HB0000000,BorderStyle=4,Outline=0,Shadow=0,"
            "MarginV=25,Alignment=2"
        )
        vf_filter = f"scale=1920:1080,format=yuv420p,subtitles={escaped_srt}:force_style='{sub_style}'"

        cmd_ffmpeg = [
            "ffmpeg", "-y",
            "-loop", "1",
            "-i", frame_png,
            "-i", audio_mp3,
            "-t", str(duration),
            "-vf", vf_filter,
            "-c:v", "libx264",
            "-preset", "fast",
            "-tune", "stillimage",
            "-c:a", "aac",
            "-b:a", "192k",
            "-shortest",
            "-pix_fmt", "yuv420p",
            clip_mp4
        ]
        subprocess.run(cmd_ffmpeg, check=True)
        clip_files.append(f"file '{os.path.abspath(clip_mp4)}'")

    with open(clip_list_path, "w") as f:
        f.write("\n".join(clip_files) + "\n")

    print("\n--- Concatenating Subtitled Clips into Master MP4 ---")
    concat_cmd = [
        "ffmpeg", "-y",
        "-f", "concat",
        "-safe", "0",
        "-i", clip_list_path,
        "-c", "copy",
        OUTPUT_VIDEO_SUB
    ]
    subprocess.run(concat_cmd, check=True)
    print(f"\n🎉 SUCCESS! Master Subtitled Video Generated at: {OUTPUT_VIDEO_SUB}")

if __name__ == "__main__":
    generate_subtitled_video()
