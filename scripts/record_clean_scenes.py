import os
import time
from playwright.sync_api import sync_playwright

BUILD_DIR = "video_build"
os.makedirs(BUILD_DIR, exist_ok=True)

def capture_clean_screens():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # 1920x1080 Full HD
        page = browser.new_page(viewport={"width": 1920, "height": 1080}, device_scale_factor=1)
        
        print("Navigating to http://localhost:3000...")
        page.goto("http://localhost:3000")
        page.wait_for_selector("h1", timeout=15000)
        time.sleep(1)

        # 1. SCENE 1: Clean Hero Section
        print("Capturing Clean Scene 1: Top Navbar & Hero...")
        page.evaluate("window.scrollTo(0, 0)")
        time.sleep(0.5)
        page.screenshot(path=os.path.join(BUILD_DIR, "clean_scene1.png"))

        # 2. SCENE 2: Clean Risk Gauge & Cash-Flow Shield
        print("Capturing Clean Scene 2: Risk Gauge & Cash-Flow Shield...")
        page.evaluate("window.scrollTo(0, 360)")
        time.sleep(0.5)
        page.screenshot(path=os.path.join(BUILD_DIR, "clean_scene2.png"))

        # 3. SCENE 3: Clean AI Diagnosis & Action Queue
        print("Capturing Clean Scene 3: AI Diagnosis & Action Queue...")
        page.evaluate("window.scrollTo(0, 720)")
        time.sleep(0.5)
        page.screenshot(path=os.path.join(BUILD_DIR, "clean_scene3.png"))

        # 4. SCENE 4: Click Approve & Execute and capture live execution
        print("Capturing Clean Scene 4: Approve & Execute Live Execution...")
        try:
            approve_btn = page.locator("button:has-text('Approve & Execute')").first
            if approve_btn.is_visible():
                approve_btn.click()
                time.sleep(1.5)
            page.evaluate("window.scrollTo(0, 280)")
            time.sleep(0.5)
            page.screenshot(path=os.path.join(BUILD_DIR, "clean_scene4.png"))
        except Exception as e:
            print("Notice for scene 4:", e)
            page.screenshot(path=os.path.join(BUILD_DIR, "clean_scene4.png"))

        # 5. SCENE 5: Clean Sandbox Proof Modal Opened
        print("Capturing Clean Scene 5: Real PayPal Sandbox Proof Modal...")
        try:
            page.evaluate("window.scrollTo(0, 0)")
            time.sleep(0.5)
            proof_btn = page.locator("button:has-text('Verify Sandbox Proof'), button:has-text('PayPal Proof')").first
            if proof_btn.is_visible():
                proof_btn.click()
                time.sleep(1.2)
            page.screenshot(path=os.path.join(BUILD_DIR, "clean_scene5.png"))
            
            # Close modal
            close_btn = page.locator("button:has-text('Close'), button[aria-label='Close']").first
            if close_btn.is_visible():
                close_btn.click()
                time.sleep(0.5)
        except Exception as e:
            print("Notice for scene 5:", e)
            page.screenshot(path=os.path.join(BUILD_DIR, "clean_scene5.png"))

        # 6. SCENE 6: Pre-Promotion Simulator Tab
        print("Capturing Clean Scene 6: Pre-Promotion Simulator...")
        try:
            sim_tab = page.locator("button:has-text('Pre-Promotion')").first
            if sim_tab.is_visible():
                sim_tab.click()
                time.sleep(1)
            page.evaluate("window.scrollTo(0, 320)")
            time.sleep(0.5)
            page.screenshot(path=os.path.join(BUILD_DIR, "clean_scene6.png"))
        except Exception as e:
            print("Notice for scene 6:", e)
            page.screenshot(path=os.path.join(BUILD_DIR, "clean_scene6.png"))

        browser.close()
        print("All 6 clean screenshots captured with ZERO overlays!")

if __name__ == "__main__":
    capture_clean_screens()
