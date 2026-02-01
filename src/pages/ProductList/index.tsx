import { useRef, useState, useEffect } from 'react';
import { ProTable, type ActionType, type ProColumns } from '@ant-design/pro-components';
import { Button, Space, Tag, message, InputNumber, Typography } from 'antd';
import { PlusOutlined, ExportOutlined } from '@ant-design/icons';

const { Text } = Typography;
import type { Product } from '@/types/product';
import { ProductStatusMap, CategoryOptions } from '@/types/product';
import { fetchProducts, fetchProductsForExport, type FetchProductsParams } from '@/services/productService';
import { exportProductsToExcel } from '@/utils/exportExcel';

const ProductList = () => {
  const actionRef = useRef<ActionType>(null);
  const searchParamsRef = useRef<Omit<FetchProductsParams, 'current' | 'pageSize'>>({});
  const [fetchLimit, setFetchLimit] = useState<number>(() => {
    const saved = localStorage.getItem('productList.fetchLimit');
    return saved ? parseInt(saved, 10) : 1000;
  });
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    localStorage.setItem('productList.fetchLimit', String(fetchLimit));
  }, [fetchLimit]);

  const handleLimitChange = (value: number | null) => {
    if (value) {
      setFetchLimit(value);
      actionRef.current?.reload();
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const products = await fetchProductsForExport({
        ...searchParamsRef.current,
        limit: fetchLimit,
      });

      if (products.length === 0) {
        message.warning('エクスポートするデータがありません');
        return;
      }

      await exportProductsToExcel(products);
      message.success(`${products.length.toLocaleString()}件のデータをエクスポートしました`);
    } catch (error) {
      console.error('Export error:', error);
      message.error('エクスポートに失敗しました');
    } finally {
      setExporting(false);
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
      request={async (params, sort) => {
        const sortField = Object.keys(sort)[0];
        const sortOrderValue = sortField ? sort[sortField] : undefined;
        const sortOrder = sortOrderValue === 'ascend' || sortOrderValue === 'descend' ? sortOrderValue : undefined;

        // エクスポート用に検索条件を保存
        searchParamsRef.current = {
          name: params.name,
          category: params.category,
          status: params.status,
          sortField,
          sortOrder,
        };

        const response = await fetchProducts({
          current: params.current,
          pageSize: params.pageSize,
          ...searchParamsRef.current,
          limit: fetchLimit,
        });
        return {
          data: response.data,
          total: response.total,
          success: response.success,
        };
      }}
      pagination={{
        defaultPageSize: 10,
        showSizeChanger: true,
        showQuickJumper: true,
        pageSizeOptions: ['5', '10', '20', '50', '100'],
        showTotal: (total) => `全 ${total.toLocaleString()} 件 (上限: ${fetchLimit.toLocaleString()} 件)`,
      }}
      search={{
        labelWidth: 'auto',
        defaultCollapsed: false,
      }}
      dateFormatter="string"
      toolBarRender={() => [
        <Space key="limit-setting" align="center">
          <Text>取得上限:</Text>
          <InputNumber
            min={10}
            max={10000}
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
      ]}
      options={{
        density: true,
        fullScreen: true,
        reload: true,
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
