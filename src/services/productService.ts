import type { Product, ProductStatus } from '@/types/product';

const mockProducts: Product[] = [
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

export interface FetchProductsParams {
  current?: number;
  pageSize?: number;
  name?: string;
  category?: string;
  status?: ProductStatus;
  priceRange?: [number, number];
}

export interface FetchProductsResponse {
  data: Product[];
  total: number;
  success: boolean;
}

export const fetchProducts = async (
  params: FetchProductsParams
): Promise<FetchProductsResponse> => {
  // APIリクエストをシミュレート
  await new Promise((resolve) => setTimeout(resolve, 500));

  let filteredData = [...mockProducts];

  // 名前でフィルタ
  if (params.name) {
    filteredData = filteredData.filter((item) =>
      item.name.toLowerCase().includes(params.name!.toLowerCase())
    );
  }

  // カテゴリでフィルタ
  if (params.category) {
    filteredData = filteredData.filter((item) => item.category === params.category);
  }

  // ステータスでフィルタ
  if (params.status) {
    filteredData = filteredData.filter((item) => item.status === params.status);
  }

  const total = filteredData.length;
  const current = params.current ?? 1;
  const pageSize = params.pageSize ?? 10;

  // ページネーション
  const start = (current - 1) * pageSize;
  const end = start + pageSize;
  const paginatedData = filteredData.slice(start, end);

  return {
    data: paginatedData,
    total,
    success: true,
  };
};
