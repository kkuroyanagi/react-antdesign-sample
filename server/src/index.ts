import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const app = express();
const PORT = 3001;
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// GET /api/products - 商品一覧取得（ページネーション、フィルタリング対応）
app.get('/api/products', async (req, res) => {
  try {
    const {
      current = '1',
      pageSize = '10',
      limit = '1000',
      name,
      category,
      status,
      sortField,
      sortOrder,
    } = req.query;

    const currentPage = parseInt(current as string, 10);
    const size = parseInt(pageSize as string, 10);
    const maxLimit = Math.min(parseInt(limit as string, 10), 10000);
    const skip = (currentPage - 1) * size;

    // フィルタ条件を構築
    const where: {
      name?: { contains: string };
      category?: string;
      status?: string;
    } = {};

    if (name && typeof name === 'string') {
      where.name = { contains: name };
    }
    if (category && typeof category === 'string') {
      where.category = category;
    }
    if (status && typeof status === 'string') {
      where.status = status;
    }

    // ソート条件を構築
    const allowedSortFields = ['id', 'price', 'stock', 'createdAt'];
    let orderBy: Record<string, 'asc' | 'desc'> = { id: 'asc' };

    if (sortField && typeof sortField === 'string' && allowedSortFields.includes(sortField)) {
      const order = sortOrder === 'descend' ? 'desc' : 'asc';
      orderBy = { [sortField]: order };
    }

    // 上限を超えている場合は空配列を返す
    if (skip >= maxLimit) {
      const total = await prisma.product.count({ where });
      return res.json({
        data: [],
        total: Math.min(total, maxLimit),
        success: true,
        current: currentPage,
        pageSize: size,
      });
    }

    // 取得件数を上限で制限
    const effectiveSize = Math.min(size, maxLimit - skip);

    // データ取得とカウントを並列実行
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: effectiveSize,
        orderBy,
      }),
      prisma.product.count({ where }),
    ]);

    // 日付をフォーマット
    const formattedProducts = products.map((p) => ({
      ...p,
      createdAt: p.createdAt.toISOString().split('T')[0],
      updatedAt: p.updatedAt.toISOString().split('T')[0],
    }));

    res.json({
      data: formattedProducts,
      total: Math.min(total, maxLimit),
      success: true,
      current: currentPage,
      pageSize: size,
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ success: false, message: 'サーバーエラー' });
  }
});

// GET /api/products/:id - 商品詳細取得
app.get('/api/products/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const product = await prisma.product.findUnique({ where: { id } });

    if (!product) {
      return res.status(404).json({ success: false, message: '商品が見つかりません' });
    }

    res.json({
      data: {
        ...product,
        createdAt: product.createdAt.toISOString().split('T')[0],
        updatedAt: product.updatedAt.toISOString().split('T')[0],
      },
      success: true,
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ success: false, message: 'サーバーエラー' });
  }
});

// POST /api/products - 商品追加
app.post('/api/products', async (req, res) => {
  try {
    const { name, category, price, stock, status } = req.body;

    if (!name || !category || price === undefined) {
      return res.status(400).json({ success: false, message: '必須項目が不足しています' });
    }

    const product = await prisma.product.create({
      data: {
        name,
        category,
        price,
        stock: stock ?? 0,
        status: status ?? 'active',
      },
    });

    res.status(201).json({
      data: {
        ...product,
        createdAt: product.createdAt.toISOString().split('T')[0],
        updatedAt: product.updatedAt.toISOString().split('T')[0],
      },
      success: true,
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ success: false, message: 'サーバーエラー' });
  }
});

// PUT /api/products/:id - 商品更新
app.put('/api/products/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { name, category, price, stock, status } = req.body;

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: '商品が見つかりません' });
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(category && { category }),
        ...(price !== undefined && { price }),
        ...(stock !== undefined && { stock }),
        ...(status && { status }),
      },
    });

    res.json({
      data: {
        ...product,
        createdAt: product.createdAt.toISOString().split('T')[0],
        updatedAt: product.updatedAt.toISOString().split('T')[0],
      },
      success: true,
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ success: false, message: 'サーバーエラー' });
  }
});

// DELETE /api/products/:id - 商品削除
app.delete('/api/products/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: '商品が見つかりません' });
    }

    const deleted = await prisma.product.delete({ where: { id } });

    res.json({
      data: {
        ...deleted,
        createdAt: deleted.createdAt.toISOString().split('T')[0],
        updatedAt: deleted.updatedAt.toISOString().split('T')[0],
      },
      success: true,
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ success: false, message: 'サーバーエラー' });
  }
});

// DELETE /api/products - 一括削除
app.delete('/api/products', async (req, res) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: '削除対象のIDを指定してください' });
    }

    const result = await prisma.product.deleteMany({
      where: { id: { in: ids } },
    });

    res.json({ deletedCount: result.count, success: true });
  } catch (error) {
    console.error('Error deleting products:', error);
    res.status(500).json({ success: false, message: 'サーバーエラー' });
  }
});

// サーバー終了時にPrisma接続を閉じる
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`API Server running at http://localhost:${PORT}`);
  console.log('Database: SQLite (Prisma)');
  console.log('Endpoints:');
  console.log('  GET    /api/products      - 商品一覧');
  console.log('  GET    /api/products/:id  - 商品詳細');
  console.log('  POST   /api/products      - 商品追加');
  console.log('  PUT    /api/products/:id  - 商品更新');
  console.log('  DELETE /api/products/:id  - 商品削除');
  console.log('  DELETE /api/products      - 一括削除');
});
