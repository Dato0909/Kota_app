#!/bin/bash
set -e

GENGO="$HOME/Documents/Kota_app/GengoApp"
PODFILE="$GENGO/ios/Podfile"
PROVIDER="$GENGO/ios/Pods/Target Support Files/Pods-GengoApp/ExpoModulesProvider.swift"

echo "=== Step 1: Podfile の破損を修復 ==="
python3 - "$PODFILE" <<'PYEOF'
import sys, re

path = sys.argv[1]
with open(path, 'r') as f:
    content = f.read()

# 過去スクリプトが追加したブロックをすべて削除
# パターン1: 末尾の余分な post_install ブロック
content = re.sub(
    r'\n# Fix: Swift 6 / Xcode 16.*?^end\s*$',
    '',
    content,
    flags=re.DOTALL | re.MULTILINE
)

# パターン2: post_install 内に挿入されたコード
content = re.sub(
    r'\n\s*# Fix: Swift 6.*?end\n',
    '\n',
    content,
    flags=re.DOTALL
)

# パターン3: 末尾の孤立した "end"（2つ連続する end を1つに）
content = re.sub(r'(\bend\b\s*\n)\s*\bend\b\s*$', r'\1', content, flags=re.MULTILINE)

with open(path, 'w') as f:
    f.write(content)
print("✅ Podfile を修復しました")
PYEOF

echo "Podfile の末尾:"
tail -5 "$PODFILE"

echo ""
echo "=== Step 2: ExpoModulesProvider.swift を直接修正 ==="
if [ -f "$PROVIDER" ]; then
  sed -i '' 's/^import Expo$/internal import Expo/' "$PROVIDER"
  echo "✅ 修正済み:"
  grep "import Expo" "$PROVIDER"
else
  echo "⚠️  ファイルが見つかりません:"
  find "$GENGO/ios/Pods" -name "ExpoModulesProvider.swift" 2>/dev/null || echo "  存在しません"
fi

echo ""
echo "=== Step 3: ビルド（pod install をスキップ） ==="
cd "$GENGO"
npx expo run:ios --no-install
