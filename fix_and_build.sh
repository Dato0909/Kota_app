#!/bin/bash
set -e

GENGO="$HOME/Documents/Kota_app/GengoApp"
PODFILE="$GENGO/ios/Podfile"
PROVIDER="$GENGO/ios/Pods/Target Support Files/Pods-GengoApp/ExpoModulesProvider.swift"

echo "=== Step 1: Podfile にパッチを適用 ==="
if grep -q "internal import Expo" "$PODFILE"; then
  echo "✅ Podfile は既にパッチ済み"
else
  # post_install ブロックの最後の end 直前に挿入
  python3 - "$PODFILE" <<'PYEOF'
import sys, re

path = sys.argv[1]
with open(path, 'r') as f:
    content = f.read()

patch = '''
  # Fix: Swift 6 ambiguous import of Expo
  provider_path = "#{installer.sandbox.root}/Target Support Files/Pods-GengoApp/ExpoModulesProvider.swift"
  if File.exist?(provider_path)
    content = File.read(provider_path)
    content = content.gsub(/^import Expo$/, 'internal import Expo')
    File.write(provider_path, content)
  end
'''

# 最後の "end" の直前に挿入
content = re.sub(r'(\nend\s*$)', patch + r'\1', content, count=1)
with open(path, 'w') as f:
    f.write(content)
print("✅ Podfile にパッチを適用しました")
PYEOF
fi

echo ""
echo "=== Step 2: pod install を実行（パッチが自動適用される） ==="
cd "$GENGO/ios"
pod install --repo-update

echo ""
echo "=== Step 3: ExpoModulesProvider.swift を直接確認・修正 ==="
if [ -f "$PROVIDER" ]; then
  sed -i '' 's/^import Expo$/internal import Expo/' "$PROVIDER"
  echo "✅ ExpoModulesProvider.swift を修正しました"
  grep "import Expo" "$PROVIDER"
else
  echo "⚠️  ExpoModulesProvider.swift が見つかりません（パスを確認）"
fi

echo ""
echo "=== Step 4: ビルド（pod install をスキップ） ==="
cd "$GENGO"
npx expo run:ios --no-install
