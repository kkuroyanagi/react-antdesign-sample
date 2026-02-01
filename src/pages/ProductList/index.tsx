import { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import { ProTable, type ActionType, type ProColumns } from '@ant-design/pro-components';
import { Button, Space, Tag, message, InputNumber, Typography } from 'antd';
import { PlusOutlined, ExportOutlined } from '@ant-design/icons';

const { Text } = Typography;
import type { Product, ProductStatus } from '@/types/product';
import { ProductStatusMap, CategoryOptions } from '@/types/product';
import { fetchProducts, fetchProductsForExport } from '@/services/productService';
import { exportProductsToExcel } from '@/utils/exportExcel';

// キャッシュデータの型定義
interface CacheData {
  data: Product[];
  total: number;
  cacheKey: string;
}

// 検索パラメータの型定義
interface SearchParams {
  name?: string;
  category?: string;
  status?: ProductStatus;
}

// ソート情報の型定義
interface SortInfo {
  field?: string;
  order?: 'ascend' | 'descend';
}

const ProductList = () => {
  const actionRef = useRef<ActionType>(null);

  // キャッシュ管理
  const cacheRef = useRef<CacheData | null>(null);
  const [cacheVersion, setCacheVersion] = useState(0);

  // ページネーション
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // 検索・ソート条件
  const [searchParams, setSearchParams] = useState<SearchParams>({});
  const [sortInfo, setSortInfo] = useState<SortInfo>({});

  // ローディング・エクスポート状態
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportingAll, setExportingAll] = useState(false);

  // 取得上限
  const [fetchLimit, setFetchLimit] = useState<number>(() => {
    const saved = localStorage.getItem('productList.fetchLimit');
    return saved ? parseInt(saved, 10) : 1000;
  });

  // localStorage に保存
  useEffect(() => {
    localStorage.setItem('productList.fetchLimit', String(fetchLimit));
  }, [fetchLimit]);

  // キャッシュキーを生成
  const generateCacheKey = useCallback(
    (params: SearchParams, sort: SortInfo, limit: number): string => {
      return JSON.stringify({
        name: params.name || '',
        category: params.category || '',
        status: params.status || '',
        sortField: sort.field || '',
        sortOrder: sort.order || '',
        limit,
      });
    },
    []
  );

  // データ取得関数
  const loadCacheData = useCallback(async () => {
    const newCacheKey = generateCacheKey(searchParams, sortInfo, fetchLimit);

    // キャッシュが有効な場合はスキップ
    if (cacheRef.current && cacheRef.current.cacheKey === newCacheKey) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetchProducts({
        current: 1,
        pageSize: fetchLimit,
        limit: fetchLimit,
        name: searchParams.name,
        category: searchParams.category,
        status: searchParams.status,
        sortField: sortInfo.field,
        sortOrder: sortInfo.order,
      });

      cacheRef.current = {
        data: response.data,
        total: response.total,
        cacheKey: newCacheKey,
      };

      setCacheVersion((v) => v + 1);
      setCurrentPage(1);
    } catch (error) {
      console.error('Data fetch error:', error);
      message.error('データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }, [searchParams, sortInfo, fetchLimit, generateCacheKey]);

  // 条件変更時にデータを取得
  useEffect(() => {
    loadCacheData();
  }, [loadCacheData]);

  // 表示データを計算
  const displayData = useMemo(() => {
    if (!cacheRef.current) return [];
    const start = (currentPage - 1) * pageSize;
    return cacheRef.current.data.slice(start, start + pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pageSize, cacheVersion]);

  // 総件数
  const total = cacheRef.current?.total ?? 0;

  // 取得上限変更
  const handleLimitChange = (value: number | null) => {
    if (value) {
      setFetchLimit(value);
    }
  };

  // エクスポート処理（キャッシュ内データ）
  const handleExport = async () => {
    if (!cacheRef.current || cacheRef.current.data.length === 0) {
      message.warning('エクスポートするデータがありません');
      return;
    }

    setExporting(true);
    try {
      await exportProductsToExcel(cacheRef.current.data);
      message.success(
        `${cacheRef.current.data.length.toLocaleString()}件のデータをエクスポートしました`
      );
    } catch (error) {
      console.error('Export error:', error);
      message.error('エクスポートに失敗しました');
    } finally {
      setExporting(false);
    }
  };

  // 全件エクスポート処理（上限なし）
  const handleExportAll = async () => {
    setExportingAll(true);
    try {
      const products = await fetchProductsForExport({
        name: searchParams.name,
        category: searchParams.category,
        status: searchParams.status,
        sortField: sortInfo.field,
        sortOrder: sortInfo.order,
        limit: 100000,
      });

      if (products.length === 0) {
        message.warning('エクスポートするデータがありません');
        return;
      }

      const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      await exportProductsToExcel(products, `商品一覧_全件_${date}.xlsx`);
      message.success(`${products.length.toLocaleString()}件のデータをエクスポートしました`);
    } catch (error) {
      console.error('Export all error:', error);
      message.error('エクスポートに失敗しました');
    } finally {
      setExportingAll(false);
    }
  };

  const columns: ProColumns<Product>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 60,
      search: false,
      sorter: true,
    },
    {
      title: '商品名',
      dataIndex: 'name',
      ellipsis: true,
      width: 200,
      copyable: true,
    },
    {
      title: 'カテゴリ',
      dataIndex: 'category',
      width: 120,
      valueType: 'select',
      valueEnum: CategoryOptions.reduce(
        (acc, item) => {
          acc[item.value] = { text: item.label };
          return acc;
        },
        {} as Record<string, { text: string }>
      ),
      render: (_, record) => {
        const category = CategoryOptions.find((c) => c.value === record.category);
        return category?.label ?? record.category;
      },
    },
    {
      title: '価格',
      dataIndex: 'price',
      width: 120,
      search: false,
      sorter: true,
      render: (_, record) => `¥${record.price.toLocaleString()}`,
    },
    {
      title: '在庫数',
      dataIndex: 'stock',
      width: 100,
      search: false,
      sorter: true,
      render: (_, record) => (
        <span style={{ color: record.stock === 0 ? '#ff4d4f' : undefined }}>
          {record.stock}
        </span>
      ),
    },
    {
      title: 'ステータス',
      dataIndex: 'status',
      width: 100,
      valueType: 'select',
      valueEnum: {
        active: { text: '販売中', status: 'Success' },
        inactive: { text: '非公開', status: 'Default' },
        soldout: { text: '売り切れ', status: 'Error' },
      },
      render: (_, record) => {
        const statusInfo = ProductStatusMap[record.status];
        return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
      },
    },
    {
      title: '作成日',
      dataIndex: 'createdAt',
      width: 120,
      valueType: 'date',
      search: false,
      sorter: true,
    },
    {
      title: '更新日',
      dataIndex: 'updatedAt',
      width: 120,
      valueType: 'date',
      search: false,
    },
    {
      title: '操作',
      valueType: 'option',
      width: 150,
      render: (_, record) => [
        <a key="view" onClick={() => message.info(`商品ID: ${record.id} を表示`)}>
          詳細
        </a>,
        <a key="edit" onClick={() => message.info(`商品ID: ${record.id} を編集`)}>
          編集
        </a>,
        <a
          key="delete"
          style={{ color: '#ff4d4f' }}
          onClick={() => message.warning(`商品ID: ${record.id} を削除`)}
        >
          削除
        </a>,
      ],
    },
  ];

  return (
    <ProTable<Product>
      headerTitle="商品一覧"
      actionRef={actionRef}
      rowKey="id"
      columns={columns}
      dataSource={displayData}
      loading={loading}
      pagination={{
        current: currentPage,
        pageSize: pageSize,
        total: total,
        showSizeChanger: true,
        showQuickJumper: true,
        pageSizeOptions: ['5', '10', '20', '50', '100'],
        showTotal: (t) => `全 ${t.toLocaleString()} 件 (上限: ${fetchLimit.toLocaleString()} 件)`,
        onChange: (page, size) => {
          setCurrentPage(page);
          if (size !== pageSize) {
            setPageSize(size);
            setCurrentPage(1);
          }
        },
      }}
      search={{
        labelWidth: 'auto',
        defaultCollapsed: false,
      }}
      onSubmit={(values) => {
        setSearchParams({
          name: values.name as string | undefined,
          category: values.category as string | undefined,
          status: values.status as ProductStatus | undefined,
        });
      }}
      onReset={() => {
        setSearchParams({});
      }}
      onChange={(_, __, sorter) => {
        const sorterInfo = Array.isArray(sorter) ? sorter[0] : sorter;
        if (sorterInfo?.field && sorterInfo?.order) {
          setSortInfo({
            field: sorterInfo.field as string,
            order: sorterInfo.order as 'ascend' | 'descend',
          });
        } else {
          setSortInfo({});
        }
      }}
      dateFormatter="string"
      toolBarRender={() => [
        <Space key="limit-setting" align="center">
          <Text>取得上限:</Text>
          <InputNumber
            min={10}
            max={100000}
            step={100}
            value={fetchLimit}
            onChange={handleLimitChange}
            style={{ width: 100 }}
          />
          <Text>件</Text>
        </Space>,
        <Button
          key="add"
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => message.info('商品追加ダイアログを開く')}
        >
          新規追加
        </Button>,
        <Button
          key="export"
          icon={<ExportOutlined />}
          loading={exporting}
          onClick={handleExport}
        >
          エクスポート
        </Button>,
        <Button
          key="export-all"
          icon={<ExportOutlined />}
          loading={exportingAll}
          onClick={handleExportAll}
        >
          全件エクスポート
        </Button>,
      ]}
      options={{
        density: true,
        fullScreen: true,
        reload: () => {
          // キャッシュをクリアして再取得
          cacheRef.current = null;
          loadCacheData();
        },
        setting: true,
      }}
      rowSelection={{
        selections: [
          {
            key: 'all',
            text: '全て選択',
            onSelect: () => {},
          },
        ],
      }}
      tableAlertRender={({ selectedRowKeys }) => (
        <Space size="middle">
          <span>選択中: {selectedRowKeys.length} 件</span>
        </Space>
      )}
      tableAlertOptionRender={() => (
        <Space size="middle">
          <a onClick={() => message.info('一括編集')}>一括編集</a>
          <a style={{ color: '#ff4d4f' }} onClick={() => message.warning('一括削除')}>
            一括削除
          </a>
        </Space>
      )}
    />
  );
};

export default ProductList;
