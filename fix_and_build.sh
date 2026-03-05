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

# 利用可能なシミュレータを取得
SIMULATOR=$(xcrun simctl list devices available | grep "iPhone" | grep -v "unavailable" | tail -1 | sed 's/.*(\(.*\)) (Booted.*/\1/' | sed 's/.*(\(.*\)).*/\1/')
echo "使用するシミュレータ ID: $SIMULATOR"

xcodebuild \
  -workspace GengoApp.xcworkspace \
  -scheme GengoApp \
  -configuration Debug \
  -destination "id=$SIMULATOR" \
  -allowProvisioningUpdates \
  build 2>&1 | grep -E "(error:|warning:|Build succeeded|Build FAILED|❌|✅)" | tail -30

echo ""
echo "ビルド完了。シミュレータで起動するには:"
echo "  npx expo start --ios"
