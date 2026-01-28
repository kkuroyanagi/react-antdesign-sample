# React + Ant Design Pro 商品管理サンプル

React 19 と Ant Design Pro の ProTable を使用したデータ一覧表示アプリのサンプルです。
10万件のテストデータで大規模データの表示・検索・フィルタリングを体験できます。

## 技術スタック

### フロントエンド
- React 19
- TypeScript
- Ant Design 5.x
- @ant-design/pro-components (ProTable)
- Vite

### バックエンド
- Node.js + Express
- Prisma ORM
- SQLite

## セットアップ

### 1. 依存関係のインストール

```bash
# フロントエンド
npm install

# バックエンド
npm install --prefix server
```

### 2. データベースのセットアップ

```bash
# マイグレーション実行
./server/node_modules/.bin/prisma migrate dev --schema ./server/prisma/schema.prisma

# シードデータ投入（10万件）
./server/node_modules/.bin/tsx ./server/prisma/seed.ts
```

### 3. 起動

2つのターミナルで実行:

```bash
# ターミナル1: APIサーバー (port 3001)
npm run dev:server

# ターミナル2: フロントエンド (port 5173)
npm run dev
```

ブラウザで http://localhost:5173 を開く

## プロジェクト構成

```
├── src/                          # フロントエンド
│   ├── pages/
│   │   └── ProductList/          # 商品一覧ページ (ProTable)
│   ├── services/
│   │   ├── api.ts                # APIクライアント
│   │   └── productService.ts     # 商品API関数
│   ├── types/
│   │   └── product.ts            # 型定義
│   ├── App.tsx
│   └── main.tsx
│
├── server/                       # バックエンド
│   ├── prisma/
│   │   ├── schema.prisma         # DBスキーマ
│   │   ├── seed.ts               # シードデータ生成
│   │   └── dev.db                # SQLiteデータベース
│   └── src/
│       └── index.ts              # Express APIサーバー
│
├── package.json
└── README.md
```

## API エンドポイント

| メソッド | エンドポイント | 説明 |
|---------|---------------|------|
| GET | `/api/products` | 商品一覧（ページネーション、フィルタ対応） |
| GET | `/api/products/:id` | 商品詳細 |
| POST | `/api/products` | 商品追加 |
| PUT | `/api/products/:id` | 商品更新 |
| DELETE | `/api/products/:id` | 商品削除 |
| DELETE | `/api/products` | 一括削除 |

### クエリパラメータ (GET /api/products)

| パラメータ | 説明 | 例 |
|-----------|------|-----|
| current | ページ番号 | `1` |
| pageSize | 1ページあたりの件数 | `10` |
| name | 商品名で検索 | `iPhone` |
| category | カテゴリでフィルタ | `electronics` |
| status | ステータスでフィルタ | `active` |

## 機能

- **ProTable** によるデータ一覧表示
- ページネーション（5/10/20/50件）
- 検索・フィルタリング（商品名、カテゴリ、ステータス）
- カラム表示/非表示の切り替え
- 行選択と一括操作
- 密度切替、フルスクリーン表示

## テストデータ

シードスクリプトにより10万件の商品データを自動生成します。

| 項目 | 内容 |
|------|------|
| 件数 | 100,000件 |
| カテゴリ | electronics, clothing, food, furniture, books |
| 価格帯 | カテゴリに応じた現実的な価格 |
| ステータス | active, inactive, soldout |
| 日付範囲 | 2022-01-01 〜 2024-12-31 |

商品名は「プレミアム ワイヤレスイヤホン」「高品質セーター Ver.3」など、ブランド・形容詞・色・バージョンを組み合わせて自動生成されます。

## DB操作

```bash
# Prisma Studio（GUIでDB確認）
./server/node_modules/.bin/prisma studio --schema ./server/prisma/schema.prisma

# シードデータ再投入
./server/node_modules/.bin/tsx ./server/prisma/seed.ts
```

## スクリプト

| コマンド | 説明 |
|---------|------|
| `npm run dev` | フロントエンド開発サーバー起動 |
| `npm run dev:server` | APIサーバー起動 |
| `npm run build` | プロダクションビルド |
| `npm run lint` | ESLint実行 |

## ライセンス

MIT
