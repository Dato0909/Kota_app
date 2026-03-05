#!/bin/bash
set -e

GENGO="$HOME/Documents/Kota_app/GengoApp"
PODFILE="$GENGO/ios/Podfile"
PROVIDER="$GENGO/ios/Pods/Target Support Files/Pods-GengoApp/ExpoModulesProvider.swift"

echo "=== Step 1: Podfile の壊れたパッチを除去 ==="
python3 - "$PODFILE" <<'PYEOF'
import sys, re

path = sys.argv[1]
with open(path, 'r') as f:
    content = f.read()

# 前回のスクリプトが誤挿入したブロックを削除
bad_patch = re.compile(
    r'\n\s*# Fix: Swift 6 ambiguous import of Expo\n.*?provider_path.*?end\n',
    re.DOTALL
)
content = bad_patch.sub('\n', content)

with open(path, 'w') as f:
    f.write(content)
print("✅ 壊れたパッチを除去しました")
PYEOF

echo ""
echo "=== Step 2: Podfile 末尾に新しい post_install ブロックを追加 ==="
if grep -q "Fix: Swift 6 ambiguous import" "$PODFILE"; then
  echo "✅ Podfile は既にパッチ済み"
else
  cat >> "$PODFILE" <<'RUBY'

# Fix: Swift 6 / Xcode 16 - ambiguous implicit access level for import of 'Expo'
post_install do |installer|
  provider_path = "#{installer.sandbox.root}/Target Support Files/Pods-GengoApp/ExpoModulesProvider.swift"
  if File.exist?(provider_path)
    content = File.read(provider_path)
    content = content.gsub(/^import Expo$/, 'internal import Expo')
    File.write(provider_path, content)
  end
end
RUBY
  echo "✅ Podfile にパッチを追加しました"
fi

echo ""
echo "=== Step 3: pod install を実行 ==="
cd "$GENGO/ios"
pod install --repo-update

echo ""
echo "=== Step 4: ExpoModulesProvider.swift を直接修正（念のため） ==="
if [ -f "$PROVIDER" ]; then
  sed -i '' 's/^import Expo$/internal import Expo/' "$PROVIDER"
  echo "✅ ExpoModulesProvider.swift を修正しました"
  echo "確認:"
  grep "import Expo" "$PROVIDER"
else
  echo "⚠️  ExpoModulesProvider.swift が見つかりません"
  find "$GENGO/ios/Pods" -name "ExpoModulesProvider.swift" 2>/dev/null
fi

echo ""
echo "=== Step 5: ビルド（pod install をスキップ） ==="
cd "$GENGO"
npx expo run:ios --no-install
