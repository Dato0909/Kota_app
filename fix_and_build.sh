#!/bin/bash
set -e

GENGO="$HOME/Documents/Kota_app/GengoApp"
PODFILE="$GENGO/ios/Podfile"
PROVIDER="$GENGO/ios/Pods/Target Support Files/Pods-GengoApp/ExpoModulesProvider.swift"

echo "=== Step 1: Podfile を修正 ==="
python3 - "$PODFILE" <<'PYEOF'
import sys, re

path = sys.argv[1]
with open(path, 'r') as f:
    lines = f.readlines()

# まず前回追加した余分な post_install ブロックを削除
cleaned = []
skip = False
for line in lines:
    if '# Fix: Swift 6 / Xcode 16' in line or "Fix: Swift 6 ambiguous import" in line:
        skip = True
    if skip:
        if line.strip() == 'end':
            skip = False
        continue
    cleaned.append(line)
lines = cleaned

content = ''.join(lines)

# 既にパッチ済みか確認
if 'internal import Expo' in content:
    print("✅ Podfile は既にパッチ済み")
    with open(path, 'w') as f:
        f.write(content)
    sys.exit(0)

# post_install do |installer| ブロックを見つけて、その end の直前に挿入
patch_code = """\
  # Fix: Swift 6 / Xcode 16 ambiguous import of Expo
  provider_path = "\#{installer.sandbox.root}/Target Support Files/Pods-GengoApp/ExpoModulesProvider.swift"
  if File.exist?(provider_path)
    content = File.read(provider_path)
    content = content.gsub(/^import Expo$/, 'internal import Expo')
    File.write(provider_path, content)
  end
"""

new_lines = []
i = 0
depth = 0
in_post_install = False
insert_done = False

while i < len(lines):
    line = lines[i]
    stripped = line.strip()

    if not insert_done and re.match(r'post_install\s+do\s+\|', stripped):
        in_post_install = True
        depth = 1
        new_lines.append(line)
        i += 1
        continue

    if in_post_install:
        # do/end のネスト深度を追跡
        opens = len(re.findall(r'\bdo\b|\bbegin\b', stripped))
        closes = len(re.findall(r'\bend\b', stripped))
        depth += opens - closes

        if depth <= 0:
            # この end が post_install の閉じ end
            new_lines.append(patch_code)
            in_post_install = False
            insert_done = True

    new_lines.append(line)
    i += 1

if not insert_done:
    print("❌ post_install ブロックが見つかりませんでした")
    sys.exit(1)

with open(path, 'w') as f:
    f.writelines(new_lines)

print("✅ Podfile にパッチを適用しました")
PYEOF

echo ""
echo "=== Step 2: pod install を実行 ==="
cd "$GENGO/ios"
pod install --repo-update

echo ""
echo "=== Step 3: ExpoModulesProvider.swift を直接修正（念のため） ==="
if [ -f "$PROVIDER" ]; then
  sed -i '' 's/^import Expo$/internal import Expo/' "$PROVIDER"
  echo "✅ 修正済み:"
  grep "import Expo" "$PROVIDER"
else
  echo "⚠️  ファイルが見つかりません。検索中..."
  find "$GENGO/ios/Pods" -name "ExpoModulesProvider.swift" 2>/dev/null
fi

echo ""
echo "=== Step 4: ビルド（pod install をスキップ） ==="
cd "$GENGO"
npx expo run:ios --no-install
