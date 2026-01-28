import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const TOTAL_PRODUCTS = 100_000;
const BATCH_SIZE = 1000;

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

const brands = ['プレミアム', 'スタンダード', 'プロ', 'ベーシック', 'デラックス', 'エコ', 'ハイエンド', 'エントリー', 'リミテッド', 'クラシック'];
const adjectives = ['高品質', '最新', '人気', '限定', '特選', 'おすすめ', '新作', '定番', '厳選', '話題の'];
const colors = ['ブラック', 'ホワイト', 'シルバー', 'ゴールド', 'ネイビー', 'グレー', 'レッド', 'ブルー'];
const statuses = ['active', 'active', 'active', 'active', 'active', 'inactive', 'soldout'] as const;
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
  const color = randomElement(colors);

  // 商品名のバリエーション（より多様に）
  const namePatterns = [
    `${baseName} ${brand}`,
    `${adjective}${baseName}`,
    `${brand} ${baseName} ${randomInt(1, 99)}`,
    `${baseName} Ver.${randomInt(1, 10)}`,
    `${adjective}${baseName} ${brand}`,
    `${baseName} ${color}`,
    `${brand} ${baseName} ${color}`,
    `${baseName} ${brand} #${id}`,
  ];
  const name = randomElement(namePatterns);

  const [minPrice, maxPrice] = priceRanges[category];
  const price = Math.round(randomInt(minPrice, maxPrice) / 100) * 100;

  const status = randomElement(statuses);
  const stock = status === 'soldout' ? 0 : randomInt(0, 500);

  const createdAt = randomDate(new Date('2022-01-01'), new Date('2024-06-01'));
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
  console.log(`Seeding database with ${TOTAL_PRODUCTS.toLocaleString()} products...`);
  console.log(`Batch size: ${BATCH_SIZE.toLocaleString()}`);

  // 既存データを削除
  await prisma.product.deleteMany();
  console.log('Existing data cleared.\n');

  const startTime = Date.now();

  // バッチで挿入
  for (let i = 0; i < TOTAL_PRODUCTS; i += BATCH_SIZE) {
    const batch = Array.from(
      { length: Math.min(BATCH_SIZE, TOTAL_PRODUCTS - i) },
      (_, j) => generateProduct(i + j + 1)
    );

    await prisma.product.createMany({ data: batch });

    const progress = Math.min(i + BATCH_SIZE, TOTAL_PRODUCTS);
    const percent = ((progress / TOTAL_PRODUCTS) * 100).toFixed(1);
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    process.stdout.write(`\rInserted ${progress.toLocaleString()} / ${TOTAL_PRODUCTS.toLocaleString()} (${percent}%) - ${elapsed}s`);
  }

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n\nSeeding completed in ${totalTime}s!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
