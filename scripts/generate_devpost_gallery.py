import os
import time
from playwright.sync_api import sync_playwright

GALLERY_DIR = "public/devpost-gallery"
os.makedirs(GALLERY_DIR, exist_ok=True)

# 3:2 Aspect Ratio: 1800 x 1200
VIEWPORT = {"width": 1800, "height": 1200}

def capture_devpost_gallery():
    print(f"\n📸 Generating Devpost Image Gallery (3:2 Aspect Ratio, 1800x1200)...")
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport=VIEWPORT, device_scale_factor=1)

        print("Navigating to http://localhost:3000...")
        page.goto("http://localhost:3000")
        page.wait_for_selector("h1", timeout=15000)
        time.sleep(1)

        # 1. Hero Landing & Overview
        print("1. Capturing 01-thaw-hero-overview.png...")
        page.evaluate("window.scrollTo(0, 0)")
        time.sleep(0.5)
        page.screenshot(path=os.path.join(GALLERY_DIR, "01-thaw-hero-overview.png"))

        # 2. Risk Gauge & Cash-Flow Shield
        print("2. Capturing 02-risk-gauge-cash-flow-shield.png...")
        page.evaluate("window.scrollTo(0, 280)")
        time.sleep(0.5)
        page.screenshot(path=os.path.join(GALLERY_DIR, "02-risk-gauge-cash-flow-shield.png"))

        # 3. AI Risk Diagnosis & 6 Signals Breakdown
        print("3. Capturing 03-ai-risk-diagnosis.png...")
        page.evaluate("window.scrollTo(0, 580)")
        time.sleep(0.5)
        page.screenshot(path=os.path.join(GALLERY_DIR, "03-ai-risk-diagnosis.png"))

        # 4. Action Queue with Weight Badges
        print("4. Capturing 04-action-queue-weight-badges.png...")
        page.evaluate("window.scrollTo(0, 720)")
        time.sleep(0.5)
        page.screenshot(path=os.path.join(GALLERY_DIR, "04-action-queue-weight-badges.png"))

        # 5. Live Action Execution & Score Drop Moment
        print("5. Capturing 05-action-executed-score-drop.png...")
        try:
            approve_btn = page.locator("button:has-text('Approve & Execute')").first
            if approve_btn.is_visible():
                approve_btn.click()
                time.sleep(1.5)
            page.evaluate("window.scrollTo(0, 240)")
            time.sleep(0.5)
            page.screenshot(path=os.path.join(GALLERY_DIR, "05-action-executed-score-drop.png"))
        except Exception as e:
            print("Notice on scene 5:", e)

        # 6. Real PayPal Sandbox Proof Modal (5 Core APIs)
        print("6. Capturing 06-paypal-sandbox-5-step-proof.png...")
        try:
            page.evaluate("window.scrollTo(0, 0)")
            proof_btn = page.locator("button:has-text('Verify Sandbox Proof'), button:has-text('PayPal Proof')").first
            if proof_btn.is_visible():
                proof_btn.click()
                time.sleep(1.2)
            page.screenshot(path=os.path.join(GALLERY_DIR, "06-paypal-sandbox-5-step-proof.png"))
            
            # Close modal
            close_btn = page.locator("button:has-text('Close'), button[aria-label='Close']").first
            if close_btn.is_visible():
                close_btn.click()
                time.sleep(0.5)
        except Exception as e:
            print("Notice on scene 6:", e)

        # 7. Pre-Promotion Spike Simulator
        print("7. Capturing 07-pre-promotion-simulator.png...")
        try:
            sim_tab = page.locator("button:has-text('Pre-Promotion')").first
            if sim_tab.is_visible():
                sim_tab.click()
                time.sleep(0.8)
            # Click 2.5x Flash spike button if available
            spike_btn = page.locator("button:has-text('2.5x'), button:has-text('Flash')").first
            if spike_btn.is_visible():
                spike_btn.click()
                time.sleep(0.5)
            page.evaluate("window.scrollTo(0, 280)")
            time.sleep(0.5)
            page.screenshot(path=os.path.join(GALLERY_DIR, "07-pre-promotion-simulator.png"))
        except Exception as e:
            print("Notice on scene 7:", e)

        # 8. Dispute Legal Rebuttal Appeal Modal
        print("8. Capturing 08-auto-drafted-dispute-appeal.png...")
        try:
            # Switch back to shield tab
            shield_tab = page.locator("button:has-text('Shield'), button:has-text('Dashboard')").first
            if shield_tab.is_visible():
                shield_tab.click()
                time.sleep(0.8)
            appeal_btn = page.locator("button:has-text('Draft Appeal'), button:has-text('Appeal'), button:has-text('Evidence')").first
            if appeal_btn.is_visible():
                appeal_btn.click()
                time.sleep(1.2)
                page.screenshot(path=os.path.join(GALLERY_DIR, "08-auto-drafted-dispute-appeal.png"))
                close_appeal = page.locator("button:has-text('Close'), button[aria-label='Close']").first
                if close_appeal.is_visible():
                    close_appeal.click()
                    time.sleep(0.5)
        except Exception as e:
            print("Notice on scene 8:", e)

        # 9. Orders & Underwriting Telemetry Ledger
        print("9. Capturing 09-orders-underwriting-ledger.png...")
        try:
            page.evaluate("window.scrollTo(0, 1100)")
            time.sleep(0.5)
            page.screenshot(path=os.path.join(GALLERY_DIR, "09-orders-underwriting-ledger.png"))
        except Exception as e:
            print("Notice on scene 9:", e)

        browser.close()
        print(f"\n🎉 Successfully captured Devpost 3:2 Gallery Images into: {GALLERY_DIR}")

if __name__ == "__main__":
    capture_devpost_gallery()
