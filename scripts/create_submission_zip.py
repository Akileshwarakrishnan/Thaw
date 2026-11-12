import os
import zipfile

OUTPUT_ZIP = "thaw-submission-package.zip"
MAX_SIZE_MB = 35

EXCLUDE_DIRS = {
    "node_modules",
    ".next",
    ".git",
    "video_build",
    "__pycache__",
    ".system_generated",
    ".user_uploaded"
}

EXCLUDE_EXTENSIONS = {
    ".pyc",
    ".tmp",
    ".log"
}

def create_zip():
    print(f"📦 Packaging Thaw submission package into {OUTPUT_ZIP}...")
    file_count = 0
    total_uncompressed = 0

    with zipfile.ZipFile(OUTPUT_ZIP, "w", zipfile.ZIP_DEFLATED, compresslevel=9) as zipf:
        for root, dirs, files in os.walk("."):
            # Exclude directories
            dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS and not d.startswith(".")]

            for file in files:
                ext = os.path.splitext(file)[1].lower()
                if ext in EXCLUDE_EXTENSIONS:
                    continue
                if file == OUTPUT_ZIP:
                    continue
                if file.startswith("test-") and ext in [".png", ".mp3", ".srt"]:
                    continue

                full_path = os.path.join(root, file)
                rel_path = os.path.relpath(full_path, ".")

                # Add to zip
                zipf.write(full_path, rel_path)
                file_count += 1
                total_uncompressed += os.path.getsize(full_path)

    zip_size_bytes = os.path.getsize(OUTPUT_ZIP)
    zip_size_mb = zip_size_bytes / (1024 * 1024)
    print(f"✅ Success! Packed {file_count} files.")
    print(f"📊 Uncompressed: {total_uncompressed / (1024*1024):.2f} MB")
    print(f"📦 Final Zip Size: {zip_size_mb:.2f} MB (Limit is {MAX_SIZE_MB} MB)")

    if zip_size_mb > MAX_SIZE_MB:
        print(f"⚠️ Warning: Zip exceeds {MAX_SIZE_MB} MB limit!")
    else:
        print(f"🎉 Fully compliant with Devpost 35 MB upload limit!")

if __name__ == "__main__":
    create_zip()
