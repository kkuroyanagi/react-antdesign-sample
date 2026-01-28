import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// カテゴリごとの商品名テンプレート
const productTemplates: Record<string, string[]> = {
  electronics: [
    'ワイヤレスイヤホン', 'スマートウォッチ', 'タブレット', 'ノートPC', 'モニター',
    'キーボード', 'マウス', 'Webカメラ', 'スピーカー', 'ヘッドホン',
    '充電器', 'モバイルバッテリー', 'USBハブ', 'SSD', 'メモリカード',
    'スマートフォン', 'ゲーミングPC', 'プロジェクター', 'ルーター', 'NAS',
  ],
  clothing: [
    'Tシャツ', 'ジーンズ', 'ジャケット', 'コート', 'セーター',
    'パーカー', 'シャツ', 'スカート', 'ワンピース', 'カーディガン',
    'ダウンジャケット', 'トレンチコート', 'チノパン', 'スラックス', 'ブラウス',
    'ポロシャツ', 'スウェット', 'ベスト', 'ショートパンツ', 'レギンス',
  ],
  food: [
    'オーガニックコーヒー', '紅茶セット', '抹茶', 'ワイン', 'オリーブオイル',
    'はちみつ', 'チョコレート', 'ナッツ詰め合わせ', 'ドライフルーツ', 'グラノーラ',
    'パスタセット', 'スパイスセット', 'ジャム', 'メープルシロップ', '緑茶',
    'ハーブティー', 'クッキー', 'チーズ', 'ソーセージ', 'ベーコン',
  ],
  furniture: [
    'オフィスチェア', 'デスク', 'ソファ', 'ベッド', '本棚',
    'テレビ台', 'ダイニングテーブル', 'キャビネット', 'シェルフ', 'ドレッサー',
    'サイドテーブル', 'リクライニングチェア', 'スツール', 'ハンガーラック', 'シューズラック',
    'パソコンデスク', 'ゲーミングチェア', 'フロアランプ', 'カーペット', 'クッション',
  ],
  books: [
    'プログラミング入門', 'ビジネス書', '小説', '料理本', '旅行ガイド',
    '技術書', '自己啓発本', 'マンガ', '絵本', '辞書',
    'AI入門', 'データサイエンス', 'Web開発', 'デザイン思考', 'マーケティング',
    '心理学入門', '歴史書', '科学読み物', '健康本', '投資入門',
  ],
};

const brands = ['プレミアム', 'スタンダード', 'プロ', 'ベーシック', 'デラックス', 'エコ', 'ハイエンド', 'エントリー'];
const adjectives = ['高品質', '最新', '人気', '限定', '特選', 'おすすめ', '新作', '定番'];
const statuses = ['active', 'active', 'active', 'active', 'inactive', 'soldout'] as const;
const categories = Object.keys(productTemplates);

// 価格帯（カテゴリ別）
const priceRanges: Record<string, [number, number]> = {
  electronics: [3000, 300000],
  clothing: [2000, 100000],
  food: [500, 30000],
  furniture: [5000, 200000],
  books: [800, 10000],
};

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function generateProduct(id: number) {
  const category = randomElement(categories);
  const baseName = randomElement(productTemplates[category]);
  const brand = randomElement(brands);
  const adjective = randomElement(adjectives);

  // 商品名のバリエーション
  const namePatterns = [
    `${baseName} ${brand}`,
    `${adjective}${baseName}`,
    `${brand} ${baseName} ${randomInt(1, 9)}`,
    `${baseName} Ver.${randomInt(1, 5)}`,
    `${adjective}${baseName} ${brand}`,
  ];
  const name = randomElement(namePatterns);

  const [minPrice, maxPrice] = priceRanges[category];
  const price = Math.round(randomInt(minPrice, maxPrice) / 100) * 100; // 100円単位

  const status = randomElement(statuses);
  const stock = status === 'soldout' ? 0 : randomInt(0, 200);

  const createdAt = randomDate(new Date('2023-01-01'), new Date('2024-06-01'));
  const updatedAt = randomDate(createdAt, new Date('2024-12-31'));

  return {
    name,
    category,
    price,
    stock,
    status,
    createdAt,
    updatedAt,
  };
}

async function main() {
  console.log('Seeding database with 1000 products...');

  // 既存データを削除
  await prisma.product.deleteMany();
  console.log('Existing data cleared.');

  // 1000件のデータを生成
  const products = Array.from({ length: 1000 }, (_, i) => generateProduct(i + 1));

  // バッチで挿入（100件ずつ）
  const batchSize = 100;
  for (let i = 0; i < products.length; i += batchSize) {
    const batch = products.slice(i, i + batchSize);
    await prisma.product.createMany({ data: batch });
    console.log(`Inserted ${Math.min(i + batchSize, products.length)} / ${products.length} products`);
  }

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
