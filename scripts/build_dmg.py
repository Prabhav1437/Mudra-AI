import os
import shutil
import subprocess
import sys

def main():
    root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    os.chdir(root_dir)

    build_dir = os.path.join(root_dir, "build")
    release_dir = os.path.join(root_dir, "release")
    app_dir = os.path.join(build_dir, "Mudra AI.app")
    contents_dir = os.path.join(app_dir, "Contents")
    macos_dir = os.path.join(contents_dir, "MacOS")
    resources_dir = os.path.join(contents_dir, "Resources")
    stage_dir = os.path.join(build_dir, "dmg_stage")
    dmg_path = os.path.join(release_dir, "Mudra AI-0.1.0-arm64.dmg")

    if os.path.exists(build_dir):
        shutil.rmtree(build_dir)
    os.makedirs(macos_dir, exist_ok=True)
    os.makedirs(resources_dir, exist_ok=True)
    os.makedirs(release_dir, exist_ok=True)

    subprocess.run(["npm", "run", "build"], check=True)

    launcher_src = os.path.join(root_dir, "scripts", "launcher.swift")
    binary_dest = os.path.join(macos_dir, "Mudra AI")
    compile_cmd = [
        "swiftc",
        "-O",
        "-target",
        "arm64-apple-macos12.0",
        launcher_src,
        "-o",
        binary_dest
    ]
    subprocess.run(compile_cmd, check=True)

    plist_path = os.path.join(contents_dir, "Info.plist")
    plist_content = """<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleExecutable</key>
    <string>Mudra AI</string>
    <key>CFBundleIconFile</key>
    <string>AppIcon</string>
    <key>CFBundleIdentifier</key>
    <string>com.mudra.ai</string>
    <key>CFBundleInfoDictionaryVersion</key>
    <string>6.0</string>
    <key>CFBundleName</key>
    <string>Mudra AI</string>
    <key>CFBundleDisplayName</key>
    <string>Mudra AI</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>CFBundleShortVersionString</key>
    <string>0.1.0</string>
    <key>CFBundleVersion</key>
    <string>1</string>
    <key>LSMinimumSystemVersion</key>
    <string>12.0</string>
    <key>NSHighResolutionCapable</key>
    <true/>
    <key>NSMicrophoneUsageDescription</key>
    <string>Mudra AI requires microphone access for speech recognition.</string>
    <key>NSCameraUsageDescription</key>
    <string>Mudra AI requires camera access for sign language gesture detection.</string>
    <key>NSAppTransportSecurity</key>
    <dict>
        <key>NSAllowsArbitraryLoads</key>
        <true/>
        <key>NSAllowsLocalNetworking</key>
        <true/>
    </dict>
</dict>
</plist>"""
    with open(plist_path, "w", encoding="utf-8") as f:
        f.write(plist_content)

    shutil.copytree(
        os.path.join(root_dir, "dist"),
        os.path.join(resources_dir, "dist")
    )

    def ignore_pycache(src, names):
        return [n for n in names if n == "__pycache__" or n.endswith(".pyc")]

    shutil.copytree(
        os.path.join(root_dir, "backend"),
        os.path.join(resources_dir, "backend"),
        ignore=ignore_pycache
    )

    shutil.copy2(
        os.path.join(root_dir, "backend_entry.py"),
        os.path.join(resources_dir, "backend_entry.py")
    )

    icon_candidates = [
        os.path.join(root_dir, "node_modules", "electron", "dist", "Electron.app", "Contents", "Resources", "electron.icns")
    ]
    for ic in icon_candidates:
        if os.path.exists(ic):
            shutil.copy2(ic, os.path.join(resources_dir, "AppIcon.icns"))
            break

    os.makedirs(stage_dir, exist_ok=True)
    shutil.move(app_dir, os.path.join(stage_dir, "Mudra AI.app"))
    os.symlink("/Applications", os.path.join(stage_dir, "Applications"))

    if os.path.exists(dmg_path):
        os.remove(dmg_path)

    hdiutil_cmd = [
        "hdiutil",
        "create",
        "-volname",
        "Mudra AI Installer",
        "-srcfolder",
        stage_dir,
        "-ov",
        "-format",
        "ULFO",
        dmg_path
    ]
    res = subprocess.run(hdiutil_cmd)
    if res.returncode != 0:
        hdiutil_cmd[-2] = "UDZO"
        subprocess.run(hdiutil_cmd, check=True)

    size_bytes = os.path.getsize(dmg_path)
    size_mb = size_bytes / (1024 * 1024)
    print(f"Successfully generated: {dmg_path}")
    print(f"DMG Size: {size_mb:.2f} MB")

if __name__ == "__main__":
    main()
