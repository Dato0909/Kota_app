#!/bin/bash
set -e

GENGO="$HOME/Documents/Kota_app/GengoApp"
IOS="$GENGO/ios"
PROVIDER="$IOS/Pods/Target Support Files/Pods-GengoApp/ExpoModulesProvider.swift"

# Step 1: ExpoModulesProvider.swift を直接修正
echo "=== Step 1: ExpoModulesProvider.swift を修正 ==="
if [ ! -f "$PROVIDER" ]; then
  echo "❌ ファイルが見つかりません。以下から検索:"
  find "$IOS/Pods" -name "ExpoModulesProvider.swift" 2>/dev/null
  exit 1
fi

# 修正前の確認
echo "修正前:"
grep "import Expo" "$PROVIDER" || true

# 修正
perl -i -pe 's/^import Expo$/internal import Expo/' "$PROVIDER"

echo "修正後:"
grep "import Expo" "$PROVIDER" || true

# Step 2: xcodebuild で直接ビルド（pod install をスキップ）
echo ""
echo "=== Step 2: xcodebuild でビルド ==="
cd "$IOS"

xcodebuild \
  -workspace GengoApp.xcworkspace \
  -scheme GengoApp \
  -configuration Debug \
  -sdk iphonesimulator \
  CODE_SIGNING_ALLOWED=NO \
  build 2>&1 | grep -E "(error:|warning: |Build succeeded|Build FAILED)" | grep -v "^$" | tail -40

echo ""
echo "=== ビルド成功の場合：シミュレータで起動 ==="
# シミュレータの UUID を正しく取得
SIMULATOR=$(xcrun simctl list devices available -j | python3 -c "
import sys, json
data = json.load(sys.stdin)
for runtime in sorted(data['devices'].keys(), reverse=True):
    if 'iOS' in runtime:
        for d in data['devices'][runtime]:
            if d['isAvailable'] and 'iPhone' in d['name']:
                print(d['udid'])
                exit()
")
echo "シミュレータ: $SIMULATOR"
xcrun simctl boot "$SIMULATOR" 2>/dev/null || true
cd "$GENGO"
npx expo start --ios
