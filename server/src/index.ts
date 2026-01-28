import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// 商品の型定義
interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: 'active' | 'inactive' | 'soldout';
  createdAt: string;
  updatedAt: string;
}

// サンプルデータ（メモリ内データベース）
let products: Product[] = [
  { id: 1, name: 'MacBook Pro 14インチ', category: 'electronics', price: 298000, stock: 15, status: 'active', createdAt: '2024-01-15', updatedAt: '2024-03-01' },
  { id: 2, name: 'iPhone 15 Pro', category: 'electronics', price: 179800, stock: 42, status: 'active', createdAt: '2024-02-10', updatedAt: '2024-03-05' },
  { id: 3, name: 'カシミヤセーター', category: 'clothing', price: 35000, stock: 8, status: 'active', createdAt: '2024-01-20', updatedAt: '2024-02-28' },
  { id: 4, name: 'オーガニックコーヒー豆 1kg', category: 'food', price: 3500, stock: 0, status: 'soldout', createdAt: '2024-02-01', updatedAt: '2024-03-10' },
  { id: 5, name: 'デニムジャケット', category: 'clothing', price: 18000, stock: 23, status: 'active', createdAt: '2024-01-25', updatedAt: '2024-02-15' },
  { id: 6, name: '北欧風ダイニングテーブル', category: 'furniture', price: 89000, stock: 5, status: 'active', createdAt: '2024-02-05', updatedAt: '2024-03-08' },
  { id: 7, name: 'ワイヤレスイヤホン', category: 'electronics', price: 28000, stock: 67, status: 'active', createdAt: '2024-01-30', updatedAt: '2024-03-02' },
  { id: 8, name: 'プログラミング入門書', category: 'books', price: 3200, stock: 120, status: 'active', createdAt: '2024-02-15', updatedAt: '2024-02-20' },
  { id: 9, name: '本革ビジネスバッグ', category: 'clothing', price: 45000, stock: 12, status: 'active', createdAt: '2024-01-18', updatedAt: '2024-02-25' },
  { id: 10, name: 'オフィスチェア エルゴノミクス', category: 'furniture', price: 68000, stock: 0, status: 'soldout', createdAt: '2024-02-08', updatedAt: '2024-03-12' },
  { id: 11, name: 'スマートウォッチ', category: 'electronics', price: 52000, stock: 35, status: 'active', createdAt: '2024-02-20', updatedAt: '2024-03-06' },
  { id: 12, name: '抹茶セット', category: 'food', price: 8500, stock: 18, status: 'active', createdAt: '2024-01-22', updatedAt: '2024-02-18' },
  { id: 13, name: 'ヴィンテージワイン', category: 'food', price: 25000, stock: 6, status: 'inactive', createdAt: '2024-02-12', updatedAt: '2024-03-01' },
  { id: 14, name: 'デザイン思考の本', category: 'books', price: 2800, stock: 45, status: 'active', createdAt: '2024-01-28', updatedAt: '2024-02-22' },
  { id: 15, name: 'モダンソファ 3人掛け', category: 'furniture', price: 158000, stock: 3, status: 'active', createdAt: '2024-02-18', updatedAt: '2024-03-09' },
  { id: 16, name: '4Kモニター 27インチ', category: 'electronics', price: 65000, stock: 28, status: 'active', createdAt: '2024-02-25', updatedAt: '2024-03-11' },
  { id: 17, name: 'オーガニック紅茶セット', category: 'food', price: 4200, stock: 55, status: 'active', createdAt: '2024-01-12', updatedAt: '2024-02-10' },
  { id: 18, name: 'ウールコート', category: 'clothing', price: 78000, stock: 0, status: 'soldout', createdAt: '2024-02-03', updatedAt: '2024-03-07' },
  { id: 19, name: 'AI技術解説書', category: 'books', price: 4500, stock: 32, status: 'active', createdAt: '2024-02-28', updatedAt: '2024-03-04' },
  { id: 20, name: 'スタンディングデスク', category: 'furniture', price: 45000, stock: 14, status: 'active', createdAt: '2024-01-08', updatedAt: '2024-02-12' },
];

let nextId = 21;

// GET /api/products - 商品一覧取得（ページネーション、フィルタリング対応）
app.get('/api/products', (req, res) => {
  const {
    current = '1',
    pageSize = '10',
    name,
    category,
    status,
  } = req.query;

  let filteredData = [...products];

  // 名前でフィルタ
  if (name && typeof name === 'string') {
    filteredData = filteredData.filter((item) =>
      item.name.toLowerCase().includes(name.toLowerCase())
    );
  }

  // カテゴリでフィルタ
  if (category && typeof category === 'string') {
    filteredData = filteredData.filter((item) => item.category === category);
  }

  // ステータスでフィルタ
  if (status && typeof status === 'string') {
    filteredData = filteredData.filter((item) => item.status === status);
  }

  const total = filteredData.length;
  const currentPage = parseInt(current as string, 10);
  const size = parseInt(pageSize as string, 10);

  // ページネーション
  const start = (currentPage - 1) * size;
  const end = start + size;
  const paginatedData = filteredData.slice(start, end);

  // レスポンス（少し遅延を入れてAPIらしく）
  setTimeout(() => {
    res.json({
      data: paginatedData,
      total,
      success: true,
      current: currentPage,
      pageSize: size,
    });
  }, 300);
});

// GET /api/products/:id - 商品詳細取得
app.get('/api/products/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const product = products.find((p) => p.id === id);

  if (!product) {
    return res.status(404).json({ success: false, message: '商品が見つかりません' });
  }

  res.json({ data: product, success: true });
});

// POST /api/products - 商品追加
app.post('/api/products', (req, res) => {
  const { name, category, price, stock, status } = req.body;

  if (!name || !category || price === undefined) {
    return res.status(400).json({ success: false, message: '必須項目が不足しています' });
  }

  const now = new Date().toISOString().split('T')[0];
  const newProduct: Product = {
    id: nextId++,
    name,
    category,
    price,
    stock: stock ?? 0,
    status: status ?? 'active',
    createdAt: now,
    updatedAt: now,
  };

  products.push(newProduct);
  res.status(201).json({ data: newProduct, success: true });
});

// PUT /api/products/:id - 商品更新
app.put('/api/products/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const index = products.findIndex((p) => p.id === id);

  if (index === -1) {
    return res.status(404).json({ success: false, message: '商品が見つかりません' });
  }

  const { name, category, price, stock, status } = req.body;
  const now = new Date().toISOString().split('T')[0];

  products[index] = {
    ...products[index],
    ...(name && { name }),
    ...(category && { category }),
    ...(price !== undefined && { price }),
    ...(stock !== undefined && { stock }),
    ...(status && { status }),
    updatedAt: now,
  };

  res.json({ data: products[index], success: true });
});

// DELETE /api/products/:id - 商品削除
app.delete('/api/products/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const index = products.findIndex((p) => p.id === id);

  if (index === -1) {
    return res.status(404).json({ success: false, message: '商品が見つかりません' });
  }

  const deleted = products.splice(index, 1)[0];
  res.json({ data: deleted, success: true });
});

// DELETE /api/products - 一括削除
app.delete('/api/products', (req, res) => {
  const { ids } = req.body;

  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ success: false, message: '削除対象のIDを指定してください' });
  }

  const deletedIds: number[] = [];
  ids.forEach((id: number) => {
    const index = products.findIndex((p) => p.id === id);
    if (index !== -1) {
      products.splice(index, 1);
      deletedIds.push(id);
    }
  });

  res.json({ deletedIds, success: true });
});

app.listen(PORT, () => {
  console.log(`API Server running at http://localhost:${PORT}`);
  console.log('Endpoints:');
  console.log('  GET    /api/products      - 商品一覧');
  console.log('  GET    /api/products/:id  - 商品詳細');
  console.log('  POST   /api/products      - 商品追加');
  console.log('  PUT    /api/products/:id  - 商品更新');
  console.log('  DELETE /api/products/:id  - 商品削除');
  console.log('  DELETE /api/products      - 一括削除');
});
