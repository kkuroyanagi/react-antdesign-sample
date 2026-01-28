export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: 'active' | 'inactive' | 'soldout';
  createdAt: string;
  updatedAt: string;
}

export type ProductStatus = Product['status'];

export const ProductStatusMap: Record<ProductStatus, { text: string; color: string }> = {
  active: { text: '販売中', color: 'green' },
  inactive: { text: '非公開', color: 'default' },
  soldout: { text: '売り切れ', color: 'red' },
};

export const CategoryOptions = [
  { label: '電子機器', value: 'electronics' },
  { label: '衣類', value: 'clothing' },
  { label: '食品', value: 'food' },
  { label: '家具', value: 'furniture' },
  { label: '書籍', value: 'books' },
];
