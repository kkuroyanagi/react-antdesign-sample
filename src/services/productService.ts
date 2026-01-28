import type { Product, ProductStatus } from '@/types/product';
import { api, type PaginatedResponse, type ApiResponse } from './api';

export interface FetchProductsParams {
  current?: number;
  pageSize?: number;
  name?: string;
  category?: string;
  status?: ProductStatus;
}

export interface FetchProductsResponse {
  data: Product[];
  total: number;
  success: boolean;
}

// 商品一覧取得
export const fetchProducts = async (
  params: FetchProductsParams
): Promise<FetchProductsResponse> => {
  const searchParams = new URLSearchParams();

  if (params.current) searchParams.set('current', String(params.current));
  if (params.pageSize) searchParams.set('pageSize', String(params.pageSize));
  if (params.name) searchParams.set('name', params.name);
  if (params.category) searchParams.set('category', params.category);
  if (params.status) searchParams.set('status', params.status);

  const query = searchParams.toString();
  const endpoint = `/products${query ? `?${query}` : ''}`;

  const response = await api.get<PaginatedResponse<Product>>(endpoint);

  return {
    data: response.data,
    total: response.total,
    success: response.success,
  };
};

// 商品詳細取得
export const fetchProduct = async (id: number): Promise<Product> => {
  const response = await api.get<ApiResponse<Product>>(`/products/${id}`);
  return response.data;
};

// 商品追加
export interface CreateProductInput {
  name: string;
  category: string;
  price: number;
  stock?: number;
  status?: ProductStatus;
}

export const createProduct = async (input: CreateProductInput): Promise<Product> => {
  const response = await api.post<ApiResponse<Product>>('/products', input);
  return response.data;
};

// 商品更新
export interface UpdateProductInput {
  name?: string;
  category?: string;
  price?: number;
  stock?: number;
  status?: ProductStatus;
}

export const updateProduct = async (
  id: number,
  input: UpdateProductInput
): Promise<Product> => {
  const response = await api.put<ApiResponse<Product>>(`/products/${id}`, input);
  return response.data;
};

// 商品削除
export const deleteProduct = async (id: number): Promise<Product> => {
  const response = await api.delete<ApiResponse<Product>>(`/products/${id}`);
  return response.data;
};

// 一括削除
export const deleteProducts = async (ids: number[]): Promise<number[]> => {
  const response = await api.delete<{ deletedIds: number[]; success: boolean }>(
    '/products',
    { ids }
  );
  return response.deletedIds;
};
