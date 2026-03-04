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
