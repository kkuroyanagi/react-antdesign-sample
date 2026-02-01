import { useRef } from 'react';
import { ProTable, type ActionType, type ProColumns } from '@ant-design/pro-components';
import { Button, Space, Tag, message } from 'antd';
import { PlusOutlined, ExportOutlined } from '@ant-design/icons';
import type { Product } from '@/types/product';
import { ProductStatusMap, CategoryOptions } from '@/types/product';
import { fetchProducts } from '@/services/productService';

const ProductList = () => {
  const actionRef = useRef<ActionType>(null);

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

        const response = await fetchProducts({
          current: params.current,
          pageSize: params.pageSize,
          name: params.name,
          category: params.category,
          status: params.status,
          sortField,
          sortOrder,
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
        pageSizeOptions: ['5', '10', '20', '50'],
      }}
      search={{
        labelWidth: 'auto',
        defaultCollapsed: false,
      }}
      dateFormatter="string"
      toolBarRender={() => [
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
          onClick={() => message.info('CSVエクスポート')}
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
