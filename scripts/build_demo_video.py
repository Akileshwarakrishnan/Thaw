import os
import sys
import subprocess
import asyncio
import edge_tts
from PIL import Image, ImageDraw, ImageFont

BUILD_DIR = "video_build"
PUBLIC_DIR = "public"
OUTPUT_VIDEO = os.path.join(PUBLIC_DIR, "thaw-demo-video.mp4")

os.makedirs(BUILD_DIR, exist_ok=True)
os.makedirs(PUBLIC_DIR, exist_ok=True)

# South Indian Male Voice
VOICE_NAME = "ta-IN-ValluvarNeural"

SCENES = [
    {
        "id": 1,
        "title": "THE MERCHANT CASH-FLOW PROBLEM",
        "badge": "Universal Seller Dilemma",
        "screen_img": "screen_scene1_raw.png",
        "voiceover": (
            "Every single month, thousands of profitable e-commerce merchants wake up to a devastating email from PayPal: "
            "Your account has been placed on a twenty-one day hold, or a rolling reserve. "
            "In an instant, incoming revenue is frozen. Merchants cannot pay suppliers, and payroll is paralyzed. "
            "Worst of all, PayPal risk algorithms never disclose why until it is already too late. "
            "This is Thaw: the early-warning and cash-flow shield built specifically for PayPal sellers. "
            "Our promise is simple: Know before PayPal freezes your money."
        ),
        "subtitle": "PayPal algorithms place 21-day holds without warning · Thaw detects risk before funds freeze.",
        "callout": {
            "box": [1160, 140, 1860, 420],
            "title": "THE SILENT MERCHANT FREEZE",
            "lines": [
                "• PayPal automates 21-day holds & rolling reserves",
                "• 10% to 30% of incoming revenue frozen instantly",
                "• Suppliers cannot be paid & payroll is paralyzed",
                "• $1.2 Billion merchant capital frozen annually"
            ],
            "accent": "#e11d48",
            "bg": "#fff1f2",
            "border": "#fecdd3"
        }
    },
    {
        "id": 2,
        "title": "LIVE HOLD RISK GAUGE & CASH-FLOW SHIELD",
        "badge": "Deterministic Underwriting Engine",
        "screen_img": "screen_scene2_raw.png",
        "voiceover": (
            "Instead of leaving merchants in the dark, Thaw continuously analyzes seller account telemetry across six publicly documented underwriting triggers. "
            "In this live store, our Hold Risk Gauge is sitting at sixty-three out of one hundred, in the Medium Risk drifting band. "
            "Down in the Cash-Flow Shield, Thaw immediately reveals the financial reality: out of five thousand four hundred dollars in sales, "
            "exactly three hundred and three dollars is vulnerable to a ten percent rolling reserve, locked for up to twenty-one days by PayPals automated risk bots."
        ),
        "subtitle": "Hold Risk Gauge: 63/100 (Medium Risk) · Cash-Flow Shield: $303.40 at risk (10% Rolling Reserve)",
        "callout": {
            "box": [1160, 140, 1860, 420],
            "title": "CASH-FLOW QUANTIFICATION",
            "lines": [
                "• Score: 63/100 in Medium Drifting Band",
                "• Cleared Balance: $5,437.50 available today",
                "• At-Risk Reserve: $303.40 (10% rolling reserve)",
                "• Based on $3,034 trailing 14-day sales telemetry"
            ],
            "accent": "#d97706",
            "bg": "#fffbeb",
            "border": "#fde68a"
        }
    },
    {
        "id": 3,
        "title": "AI ROOT-CAUSE DIAGNOSIS & WEIGHTED ACTIONS",
        "badge": "Plain-Language AI Intelligence",
        "screen_img": "screen_scene3_raw.png",
        "voiceover": (
            "Why is this account drifting? Thaw's AI engine analyzes the deterministic risk signals and breaks them down into plain, actionable English: "
            "Fourteen physical orders dispatched over three days ago are completely missing carrier tracking numbers, "
            "and customer dispute rates are trending upward toward the critical one point five percent threshold. "
            "In the Action Queue, our agent proposes ranked, prioritized solutions. "
            "Notice the Weight Impact Badge: fulfilling this action removes six risk points directly from the missing tracking trigger upon dispatch."
        ),
        "subtitle": "AI breaks down 6 underwriting triggers into plain English · Action Queue displays exact Weight Impact (-6 pts).",
        "callout": {
            "box": [1160, 140, 1860, 420],
            "title": "ROOT CAUSES & WEIGHT IMPACT",
            "lines": [
                "• 14 orders > 3 days lack carrier tracking numbers",
                "• Dispute rate approaching 1.5% critical threshold",
                "• Action Queue ranked by underwriting weight",
                "• Fulfilling tracking removes -6 points directly"
            ],
            "accent": "#1b63d2",
            "bg": "#e5f0ff",
            "border": "#accfff"
        }
    },
    {
        "id": 4,
        "title": "HUMAN APPROVAL-GATED DISPATCH & SCORE DROP",
        "badge": "Strict Human-in-the-Loop Safety",
        "screen_img": "screen_scene4_raw.png",
        "voiceover": (
            "Now, here is our core philosophy: Strict Human-in-the-Loop Guardrails. "
            "The AI proposes actions, but zero money and zero tracking moves without explicit merchant approval. "
            "When the merchant clicks Approve and Execute, the remediation is dispatched instantly through the PayPal Agent Toolkit using Model Context Protocol tools. "
            "Carrier tracking is submitted directly to PayPals live Shipment Tracking API. "
            "Immediately, our risk engine re-evaluates: the risk score drops by six points, the cash-flow shield updates, and held funds are cleared for withdrawal."
        ),
        "subtitle": "Human Approval-Gated: Merchant approves · Payload dispatched via PayPal Agent Toolkit · Score drops 63 ➔ 57.",
        "callout": {
            "box": [1160, 140, 1860, 420],
            "title": "REAL-TIME REMEDIATION LOOP",
            "lines": [
                "• Zero automated execution without merchant sign-off",
                "• Dispatched via @paypal/agent-toolkit MCP",
                "• Real USPS tracker added to /v1/shipping/trackers",
                "• Instant score drop: 63 ➔ 57 (-6 pts cleared)"
            ],
            "accent": "#047857",
            "bg": "#ecfdf5",
            "border": "#6ee7b7"
        }
    },
    {
        "id": 5,
        "title": "PROACTIVE DEFENSE & 5-STEP SANDBOX PROOF",
        "badge": "100% Real PayPal REST APIs",
        "screen_img": "screen_scene5_raw.png",
        "voiceover": (
            "Merchants can also hedge against future risk. "
            "With our Pre-Promotion Simulator, sellers planning a flash sale can simulate a two point five times volume spike "
            "and generate pre-notification documentation for PayPal underwriting to prevent automated velocity freezes. "
            "And everything you see is real. "
            "In our Sandbox Proof suite, Thaw executes an authentic five-step verification cycle across PayPals live REST APIs: "
            "creating real orders, uploading real shipment trackers, executing refunds, reading disputes, and cryptographically verifying webhook signatures."
        ),
        "subtitle": "Pre-Promotion Simulator defends against velocity holds · 5-Step Sandbox Proof verifies live PayPal REST APIs.",
        "callout": {
            "box": [60, 140, 760, 420],
            "title": "5 CORE PAYPAL REST APIS",
            "lines": [
                "1. Orders API (/v2/checkout/orders) — PASS",
                "2. Tracking API (/v1/shipping/trackers) — PASS",
                "3. Payments API (/v2/payments/.../refund) — PASS",
                "4. Disputes API (/v1/customer/disputes) — PASS",
                "5. Webhooks API (Signature Verification) — PASS"
            ],
            "accent": "#10b981",
            "bg": "#ffffff",
            "border": "#10b981"
        }
    },
    {
        "id": 6,
        "title": "PRODUCTION FINTECH ARCHITECTURE",
        "badge": "Enterprise Production Ready",
        "screen_img": "screen_scene6_raw.png",
        "voiceover": (
            "Under the hood, Thaw is built on Next.js fourteen, TypeScript, Prisma, and Zod schema validation, "
            "backed by twenty-one automated unit tests with strict idempotency and refund cap safeguards. "
            "PayPal protects buyers. Thaw protects merchants. "
            "Know before PayPal freezes your money. Thank you."
        ),
        "subtitle": "Built on Next.js 14 · Prisma · 21 Automated Tests Passing · PayPal protects buyers, Thaw protects merchants.",
        "callout": {
            "box": [1160, 140, 1860, 420],
            "title": "SAFETY & ARCHITECTURE",
            "lines": [
                "• Next.js 14 App Router + Tailwind CSS",
                "• Prisma ORM with SQLite / PostgreSQL",
                "• 21/21 Automated Tests (100% Passing)",
                "• Idempotency locks & refund balance caps"
            ],
            "accent": "#1f2328",
            "bg": "#f6f6f6",
            "border": "#d4d7dc"
        }
    }
]

def get_font(size, bold=False):
    font_name = "segoeuib.ttf" if bold else "segoeui.ttf"
    try:
        return ImageFont.truetype(font_name, size)
    except Exception:
        try:
            return ImageFont.truetype("arial.ttf", size)
        except Exception:
            return ImageFont.load_default()

def draw_rounded_rect(draw, bbox, radius, fill, outline=None, width=1):
    draw.rounded_rectangle(bbox, radius=radius, fill=fill, outline=outline, width=width)

def render_scene_frame(scene, output_path):
    width, height = 1920, 1080
    
    # 1. Base Layer: Real Application Screenshot
    raw_img_path = os.path.join(BUILD_DIR, scene["screen_img"])
    if os.path.exists(raw_img_path):
        base_img = Image.open(raw_img_path).convert("RGBA")
        if base_img.size != (width, height):
            base_img = base_img.resize((width, height), Image.Resampling.LANCZOS)
    else:
        base_img = Image.new("RGBA", (width, height), "#ffffff")

    overlay = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)

    # 2. Top Presenter Ribbon (70px height)
    draw.rectangle([0, 0, width, 70], fill=(255, 255, 255, 245), outline="#d4d7dc", width=1)
    
    # Top logo
    try:
        logo = Image.open("public/thaw-logo.png")
        aspect = logo.width / logo.height
        logo_w = int(38 * aspect)
        logo = logo.resize((logo_w, 38), Image.Resampling.LANCZOS)
        overlay.paste(logo, (50, 16), logo if logo.mode == "RGBA" else None)
    except Exception:
        draw.text((50, 18), "THAW", font=get_font(28, bold=True), fill="#1f2328")

    # Brand badge
    draw_rounded_rect(draw, [210, 18, 380, 52], radius=17, fill="#e5f0ff", outline="#accfff")
    draw.text((226, 24), "for PayPal Sellers", font=get_font(15, bold=True), fill="#1b63d2")

    # Center Scene Title
    scene_title_text = f"SCENE {scene['id']} · {scene['title']}"
    draw.text((430, 23), scene_title_text, font=get_font(17, bold=True), fill="#1f2328")

    # Right side badge
    badge_w = 280
    draw_rounded_rect(draw, [width - badge_w - 50, 18, width - 50, 52], radius=17, fill="#1f2328")
    draw.text((width - badge_w - 30, 24), scene["badge"], font=get_font(14, bold=True), fill="#ffffff")

    # 3. Callout Spotlight Card (Positioned with strict margins, ZERO overlapping)
    c = scene["callout"]
    c_box = c["box"]
    draw_rounded_rect(draw, c_box, radius=14, fill=c["bg"], outline=c["border"], width=2)
    # Accent top strip inside card
    draw_rounded_rect(draw, [c_box[0], c_box[1], c_box[2], c_box[1] + 44], radius=12, fill=c["accent"])
    draw.text((c_box[0] + 20, c_box[1] + 10), c["title"], font=get_font(16, bold=True), fill="#ffffff")

    # Content bullets inside callout card
    y_text = c_box[1] + 62
    for line in c["lines"]:
        draw.text((c_box[0] + 24, y_text), line, font=get_font(17, bold=False), fill="#1f2328")
        y_text += 48

    # 4. Bottom Subtitles Banner (Floating at y=950 to y=1040)
    # Never overlaps app content because it floats in footer band
    sub_text = scene["subtitle"]
    sub_box = [160, 960, width - 160, 1035]
    draw_rounded_rect(draw, sub_box, radius=22, fill=(17, 24, 39, 235), outline="#374151", width=1)
    
    # Speaker indicator icon/text
    draw_rounded_rect(draw, [180, 975, 290, 1020], radius=12, fill="#367eed")
    draw.text((195, 986), "NARRATION", font=get_font(12, bold=True), fill="#ffffff")
    
    # Text centered
    draw.text((310, 984), sub_text, font=get_font(17, bold=True), fill="#ffffff")

    # Merge overlay with base image
    final_img = Image.alpha_composite(base_img, overlay).convert("RGB")
    final_img.save(output_path, "PNG")
    print(f"Rendered polished frame: {output_path}")

async def generate_speech_for_scenes():
    print(f"\n--- Generating South Indian Neural Voiceover ({VOICE_NAME}) ---")
    
    for scene in SCENES:
        s_id = scene["id"]
        audio_path = os.path.join(BUILD_DIR, f"scene{s_id}.mp3")
        print(f"Synthesizing Scene {s_id} audio with {VOICE_NAME}...")
        comm = edge_tts.Communicate(scene["voiceover"], VOICE_NAME, rate="-4%")
        await comm.save(audio_path)
        print(f"Saved: {audio_path}")

def get_audio_duration(audio_path):
    cmd = [
        "ffprobe", "-v", "quiet",
        "-show_entries", "format=duration",
        "-of", "csv=p=0",
        audio_path
    ]
    res = subprocess.check_output(cmd).decode().strip()
    return float(res)

def build_video_clips():
    print("\n--- Rendering Scene Frames & Encoding High-Definition Clips ---")
    clip_list_path = os.path.join(BUILD_DIR, "clips.txt")
    clip_files = []

    for scene in SCENES:
        s_id = scene["id"]
        frame_png = os.path.join(BUILD_DIR, f"scene{s_id}.png")
        audio_mp3 = os.path.join(BUILD_DIR, f"scene{s_id}.mp3")
        clip_mp4 = os.path.join(BUILD_DIR, f"clip{s_id}.mp4")

        render_scene_frame(scene, frame_png)
        duration = get_audio_duration(audio_mp3) + 1.0  # 1 second natural pause between scenes
        print(f"Scene {s_id} Duration: {duration:.2f}s")

        # Encode static high-res frame with crisp h264 and aac
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

    print("\n--- Concatenating Scenes into Master Demo Video ---")
    concat_cmd = [
        "ffmpeg", "-y",
        "-f", "concat",
        "-safe", "0",
        "-i", clip_list_path,
        "-c", "copy",
        OUTPUT_VIDEO
    ]
    subprocess.run(concat_cmd, check=True)
    print(f"\n🎉 SUCCESS! Master Broadcast Demo Video Generated at: {OUTPUT_VIDEO}")

if __name__ == "__main__":
    asyncio.run(generate_speech_for_scenes())
    build_video_clips()
