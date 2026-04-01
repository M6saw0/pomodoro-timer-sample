# Changelog

すべての主要な変更はこのファイルに記載されます。

## [1.0.0] - 2026-03-30

### 追加機能

- **タイマーシーケンス設定** - 複数のタイマーを連続実行する機能
- **プリセットテンプレート**
  - クラシック 25分作業 / 5分休憩（標準的なポモドーロ・テクニック）
  - ショート 15分作業 / 3分休憩（短時間の集中向け）
  - ロング 50分作業 / 10分休憩（深い集中作業向け）
- **カスタムタイマー作成** - タイマー時間、ラベル、サイクル数を自由に設定可能
- **リピート制御** - 1〜10回のサイクル繰り返し機能
- **タイマーコントロール** - 開始・一時停止・再開・リセット機能
- **サウンドアラート + バイブレーション** - タイマー終了時に音声とバイブレーションで通知
- **PWA対応**
  - オフライン動作（Service Worker）
  - ホーム画面へのショートカット追加
  - Web App Manifestサポート
- **Wake Lock API** - タイマー実行中は画面スリープを防止
- **モバイルファースト UI** - スマートフォン、タブレット、デスクトップに対応
- **ダークモード対応** - OSの設定に自動追従
- **自動保存機能** - タイマー設定はlocalStorageに自動保存

### 技術仕様

- **フレームワーク**
  - React 19.2.4
  - TypeScript 5.9.3
  - Vite 8.0.1

- **PWA・ブラウザAPI**
  - vite-plugin-pwa 1.2.0
  - Workbox (Vite PWA plugin経由)
  - Service Worker (自動登録・自動更新)
  - Wake Lock API
  - Vibration API
  - Web Audio API

- **テスト**
  - Vitest 4.1.2
  - React Testing Library 16.3.2
  - @testing-library/user-event 14.6.1
  - jsdom 29.0.1
  - coverage 80%以上

- **UI Components**
  - TimerDisplay - タイマー表示・進行状況表示
  - TimerControls - 開始・一時停止・再開・リセットボタン
  - TimerSetup - プリセット選択・カスタム設定画面

- **Custom Hooks**
  - useTimerSequence - タイマーシーケンス管理
  - useTimer - 個別タイマーロジック
  - useWakeLock - Screen Wake Lock API統合

- **ユーティリティ**
  - storage.ts - localStorage基盤の設定保存・復元
  - alert.ts - サウンド・バイブレーション通知
  - timer.ts - タイマー型定義・プリセット定義

### デプロイ・ホスティング

- **推奨**: Vercel（無料）
- **代替**: Netlify、GitHub Pages対応
- **PWA対応**: HTTPS必須、自動Service Worker更新

### ブラウザ対応

- iOS Safari 12.2以降（PWA機能フル対応）
- Android Chrome・Firefox（PWA対応）
- MacOS Safari・Chrome・Firefox（デスクトップ版）

### ライセンス

MIT License

---

## バージョニング

このプロジェクトは [Semantic Versioning](https://semver.org/lang/ja/) に従っています。

- **MAJOR**: 互換性を破る変更
- **MINOR**: 新機能追加（互換性維持）
- **PATCH**: バグ修正

---

**初回リリース**: 2026-03-30
