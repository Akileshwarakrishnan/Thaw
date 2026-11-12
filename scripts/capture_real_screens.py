import os
import time
from playwright.sync_api import sync_playwright

BUILD_DIR = "video_build"
os.makedirs(BUILD_DIR, exist_ok=True)

def capture_screens():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # 1920x1080 full HD viewport
        page = browser.new_page(viewport={"width": 1920, "height": 1080}, device_scale_factor=1)
        
        print("Navigating to http://localhost:3000...")
        page.goto("http://localhost:3000")
        page.wait_for_selector("h1", timeout=15000)
        time.sleep(1)

        # 1. SCENE 1: Hero & Problem Hook
        print("Capturing Screen 1: Hero & Problem...")
        page.evaluate("window.scrollTo(0, 0)")
        time.sleep(0.5)
        page.screenshot(path=os.path.join(BUILD_DIR, "screen_scene1_raw.png"))

        # 2. SCENE 2: Risk Gauge & Cash-Flow Shield
        print("Capturing Screen 2: Risk Gauge & Cash Flow...")
        page.evaluate("window.scrollTo(0, 420)")
        time.sleep(0.5)
        page.screenshot(path=os.path.join(BUILD_DIR, "screen_scene2_raw.png"))

        # 3. SCENE 3: AI Diagnosis & Action Queue
        print("Capturing Screen 3: AI Diagnosis & Actions...")
        page.evaluate("window.scrollTo(0, 780)")
        time.sleep(0.5)
        page.screenshot(path=os.path.join(BUILD_DIR, "screen_scene3_raw.png"))

        # 4. SCENE 4: Click Approve & Execute on first action to get the Hero Moment
        print("Capturing Screen 4: Approve & Execute...")
        try:
            # Find the Approve & Execute button in the action queue
            approve_btn = page.locator("button:has-text('Approve & Execute')").first
            if approve_btn.is_visible():
                approve_btn.click()
                time.sleep(1.5)
            page.evaluate("window.scrollTo(0, 320)")
            time.sleep(0.5)
            page.screenshot(path=os.path.join(BUILD_DIR, "screen_scene4_raw.png"))
        except Exception as e:
            print("Notice for scene 4:", e)
            page.screenshot(path=os.path.join(BUILD_DIR, "screen_scene4_raw.png"))

        # 5. SCENE 5: Sandbox Proof Modal
        print("Capturing Screen 5: Sandbox Proof Modal...")
        try:
            page.evaluate("window.scrollTo(0, 0)")
            proof_btn = page.locator("button:has-text('Verify Sandbox Proof'), button:has-text('PayPal Proof')").first
            if proof_btn.is_visible():
                proof_btn.click()
                time.sleep(1)
            page.screenshot(path=os.path.join(BUILD_DIR, "screen_scene5_raw.png"))
            # Close modal if open
            close_btn = page.locator("button:has-text('Close'), button[aria-label='Close']").first
            if close_btn.is_visible():
                close_btn.click()
                time.sleep(0.5)
        except Exception as e:
            print("Notice for scene 5:", e)
            page.screenshot(path=os.path.join(BUILD_DIR, "screen_scene5_raw.png"))

        # 6. SCENE 6: Architecture / Overview
        print("Capturing Screen 6: Pre-Promotion Simulator Tab...")
        try:
            # Switch to Pre-Promotion Simulator tab
            sim_tab = page.locator("button:has-text('Pre-Promotion')").first
            if sim_tab.is_visible():
                sim_tab.click()
                time.sleep(1)
            page.evaluate("window.scrollTo(0, 300)")
            time.sleep(0.5)
            page.screenshot(path=os.path.join(BUILD_DIR, "screen_scene6_raw.png"))
        except Exception as e:
            print("Notice for scene 6:", e)
            page.screenshot(path=os.path.join(BUILD_DIR, "screen_scene6_raw.png"))

        browser.close()
        print("All raw screens captured successfully!")

if __name__ == "__main__":
    capture_screens()
