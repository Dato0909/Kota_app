# Kota App — Claude 開発ガイドライン

## プロジェクト構成

```
Kota_app/
└── GengoApp/          # React Native (Expo) アプリ本体
    ├── App.tsx
    ├── src/
    │   ├── components/
    │   ├── screens/
    │   ├── data/
    │   ├── types/
    │   └── utils/
    └── package.json
```

---

## 既知エラーと対応策

### `Cannot find native module 'ExponentAV'`

**原因:**
`expo-av`（音声録音・再生）は **Expo Go では動作しない**。
Expo SDK 50 以降、`expo-av` を含む多くのネイティブモジュールが Expo Go のバンドルから除外された。

**対応策:**
Expo Go (`npx expo start`) ではなく、**Development Build** を使って実行する。

```bash
# iOS シミュレータ / 実機
npx expo run:ios

# Android エミュレータ / 実機
npx expo run:android
```

> 初回ビルドは Xcode / Android Studio によるネイティブビルドが走る（数分かかる）。
> 2回目以降は `npx expo start` → `i` / `a` で起動できる。

**ルール:**
- `expo-av`、その他カメラ・センサー系など **ネイティブモジュールを追加した場合は、必ず Development Build で動作確認すること。**
- 「Expo Go で動くか」を前提に実装してはいけない。ネイティブAPIを使う機能は Development Build 前提で設計する。

---

### `pod install` 失敗 / "sandbox is not in sync with Podfile.lock"

**原因:**
新しいネイティブパッケージ（例: `expo-av`）を追加した後、iOS の CocoaPods が未同期の状態になっている。
`npx expo run:ios` が自動で `pod install` を実行しようとするが、CocoaPods のバージョンが古いか未インストールの場合に失敗する。

**対応策:**

```bash
# 1. CocoaPods を Homebrew でインストール / 更新
brew install cocoapods
# すでに入っている場合
# brew upgrade cocoapods

# 2. iOS ディレクトリで pod install を手動実行
cd GengoApp/ios
pod install --repo-update

# 3. GengoApp に戻ってビルド
cd ..
npx expo run:ios
```

> `pod install --repo-update` は数分〜10分かかることがある。

**ルール:**
- ネイティブパッケージを追加したら、`npx expo run:ios` の前に `pod install --repo-update` が必要になる場合がある。
- CocoaPods は `gem install` ではなく **Homebrew でインストール**することを推奨（Ruby バージョン競合を避けるため）。

---

### 作業ディレクトリに注意

すべての npm / expo コマンドは `GengoApp/` ディレクトリ内で実行すること。
`Kota_app/`（リポジトリルート）では `package.json` が存在しないためエラーになる。

```bash
# 正しい
cd ~/Documents/Kota_app/GengoApp
npm install
npx expo run:ios

# NG（ルートで実行してしまうと package.json が見つからない）
cd ~/Documents/Kota_app
npm install  # → エラー
```

---

### パッケージインストール

Expo の互換バージョン解決のため、`npm install` ではなく `npx expo install` を使う。

```bash
# 推奨
npx expo install expo-av

# NG（ネットワーク制限がある環境では npm install にフォールバックしてよい）
npm install expo-av
```

---

## 開発上の注意事項

- TypeScript の型チェックは `npx tsc --noEmit` で確認する。
- 新しいネイティブパッケージを追加したら、`app.json` の `plugins` 設定が必要なものがあるか確認する。
- 音声・カメラ・位置情報など権限が必要な機能は `app.json` の `permissions` / `infoPlist` に追記が必要。
