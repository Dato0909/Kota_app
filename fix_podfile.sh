#!/bin/bash

PODFILE="$HOME/Documents/Kota_app/GengoApp/ios/Podfile"

if [ ! -f "$PODFILE" ]; then
  echo "❌ Podfile が見つかりません: $PODFILE"
  exit 1
fi

# すでに修正済みか確認
if grep -q "internal import Expo" "$PODFILE"; then
  echo "✅ すでに修正済みです"
  exit 0
fi

# post_install ブロックの最後の end の直前に挿入
PATCH='
  # Fix: ambiguous implicit access level for import of Expo (Swift 6 / Xcode 16)
  provider_path = "#{installer.sandbox.root}/Target Support Files/Pods-GengoApp/ExpoModulesProvider.swift"
  if File.exist?(provider_path)
    content = File.read(provider_path)
    content = content.gsub(/^import Expo$/, '"'"'internal import Expo'"'"')
    File.write(provider_path, content)
  end'

# 最後の "end" の直前に挿入
perl -i -0pe 's/(end\s*\z)/'"$PATCH"'\n$1/' "$PODFILE"

echo "✅ Podfile を修正しました"
echo ""
echo "次のコマンドを実行してください："
echo "  cd ~/Documents/Kota_app/GengoApp/ios"
echo "  pod install --repo-update"
echo "  cd .."
echo "  npx expo run:ios"
