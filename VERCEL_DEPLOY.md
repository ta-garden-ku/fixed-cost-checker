# Vercelで公開する手順

前回の占いサイトは `Next.js + TypeScript + Tailwind CSS` の構成でした。今回の固定費削減診断は、まず静的HTMLのままVercelで公開できます。

## いちばん簡単な進め方

1. Vercelにログイン
2. 右上の `Add New...` から `Project`
3. `Import Git Repository` ではなく、可能なら `Deploy` / `Upload` でこのフォルダを選ぶ
4. フォルダは `C:\Users\takum\Documents\Codex\2026-05-12\new-chat`
5. Framework Preset は `Other`
6. Build Command は空欄
7. Output Directory も空欄
8. Deploy

## GitHub経由でやる場合

1. GitHubに新しいリポジトリを作る
2. このフォルダの中身をアップロード
3. VercelでそのリポジトリをImport
4. Framework Presetは `Other`
5. Deploy

## 公開後にやること

1. 公開URLをコピー
2. `index.html` の canonical を公開URLに変更
3. LINEのメッセージ内に公開URLを入れる
4. スマホで診断からLINE登録、見直しナビまでテスト

## 将来Next.js化する場合

前回の占いサイトと同じ構成にするなら、次のように移行します。

- `index.html` の内容を `src/app/page.tsx` に移す
- `script.js` の計算ロジックを `src/lib/calculator.ts` に移す
- 各ページを `src/app/consultation/page.tsx` などに分割する
- SEOは `metadata`、FAQ構造化データ、`sitemap.ts`、`robots.ts` で管理する

まずはVercelで静的公開し、反応が出てからNext.js化するのが安全です。
