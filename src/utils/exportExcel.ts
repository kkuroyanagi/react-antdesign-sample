import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import type { Product } from '@/types/product';
import { ProductStatusMap, CategoryOptions } from '@/types/product';

export const exportProductsToExcel = async (
  products: Product[],
  filename?: string
): Promise<void> => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('商品一覧');

  // 列定義
  worksheet.columns = [
    { header: 'ID', key: 'id', width: 10 },
    { header: '商品名', key: 'name', width: 30 },
    { header: 'カテゴリ', key: 'category', width: 12 },
    { header: '価格', key: 'price', width: 12 },
    { header: '在庫数', key: 'stock', width: 10 },
    { header: 'ステータス', key: 'status', width: 12 },
    { header: '作成日', key: 'createdAt', width: 12 },
    { header: '更新日', key: 'updatedAt', width: 12 },
  ];

  // ヘッダー行のスタイル
  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' },
  };
  headerRow.alignment = { horizontal: 'center' };

  // データ行を追加
  products.forEach((product) => {
    const categoryLabel =
      CategoryOptions.find((c) => c.value === product.category)?.label ?? product.category;
    const statusLabel = ProductStatusMap[product.status]?.text ?? product.status;

    worksheet.addRow({
      id: product.id,
      name: product.name,
      category: categoryLabel,
      price: product.price,
      stock: product.stock,
      status: statusLabel,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    });
  });

  // ファイル名を生成（日時付き）
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const exportFilename = filename || `商品一覧_${date}.xlsx`;

  // Excelファイルをダウンロード
  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), exportFilename);
};
