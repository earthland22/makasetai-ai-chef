# まかせて！AIシェフ — Vercelデプロイ手順

## フォルダ構成（このまま GitHub にアップロードしてください）

```
makasetai/
├── app/
│   ├── layout.js               # ページレイアウト・フォント設定
│   ├── page.js                 # メインアプリ（UIすべてここに）
│   └── api/
│       ├── recipe/
│       │   └── route.js        # ★ 献立提案API（APIキーはここだけ使用）
│       └── chat/
│           └── route.js        # ★ AIシェフ会話API（APIキーはここだけ使用）
├── .env.local.example          # 環境変数のテンプレート
├── .gitignore                  # node_modules と .env.local を除外
├── next.config.js
└── package.json
```

## ✅ APIキーの確認

`app/api/recipe/route.js` と `app/api/chat/route.js` の中で：
```js
const apiKey = process.env.ANTHROPIC_API_KEY
```
と書かれています。**ブラウザには一切露出しません。**

---

## Vercelへのデプロイ手順（5ステップ）

### Step 1: GitHubにリポジトリを作成してアップロード

1. https://github.com にログイン
2. 「New repository」→ 名前は `makasetai-ai-chef` など適当でOK
3. このフォルダの中身をすべてアップロード（または git push）

```bash
# コマンドラインの場合
cd makasetai
git init
git add .
git commit -m "initial commit"
git remote add origin https://github.com/あなたのID/makasetai-ai-chef.git
git branch -M main
git push -u origin main
```

### Step 2: Vercelにアクセス

https://vercel.com にアクセスしてGitHubアカウントでログイン

### Step 3: プロジェクトをインポート

1. 「Add New Project」をクリック
2. 先ほどのGitHubリポジトリを選択
3. 「Import」をクリック

### Step 4: ★★★ 環境変数を設定（最重要）★★★

「Environment Variables」の欄に以下を追加：

| NAME | VALUE |
|------|-------|
| `ANTHROPIC_API_KEY` | `sk-ant-api03-...（あなたのAPIキー）` |

※ Anthropic APIキーは https://console.anthropic.com/ で発行できます

### Step 5: デプロイ

「Deploy」ボタンを押すだけ！2〜3分でURLが発行されます。

---

## ローカルで動かす場合

```bash
# 1. 依存パッケージをインストール
npm install

# 2. .env.local を作成
cp .env.local.example .env.local
# .env.local を編集して ANTHROPIC_API_KEY=sk-ant-... を入力

# 3. 開発サーバー起動
npm run dev
# → http://localhost:3000 で確認
```

---

## 将来の有料化について

現在 `isPaid` フラグは `useState(false)` で管理しています。
将来的に Stripe + Supabase/Firebase でユーザー認証・課金を実装し、
`isPaid` をDBから取得した値に置き換えることで本格的なサブスク機能になります。
