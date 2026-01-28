import { ConfigProvider, App as AntApp, Layout, Typography } from 'antd';
import { ProConfigProvider } from '@ant-design/pro-components';
import jaJP from 'antd/locale/ja_JP';
import ProductList from '@/pages/ProductList';
import 'dayjs/locale/ja';

const { Header, Content } = Layout;
const { Title } = Typography;

function App() {
  return (
    <ConfigProvider locale={jaJP}>
      <ProConfigProvider>
        <AntApp>
          <Layout style={{ minHeight: '100vh' }}>
            <Header
              style={{
                display: 'flex',
                alignItems: 'center',
                background: '#001529',
                padding: '0 24px',
              }}
            >
              <Title level={3} style={{ color: '#fff', margin: 0 }}>
                商品管理システム
              </Title>
            </Header>
            <Content style={{ padding: 24, background: '#f0f2f5' }}>
              <div
                style={{
                  background: '#fff',
                  padding: 24,
                  borderRadius: 8,
                  minHeight: 'calc(100vh - 64px - 48px)',
                }}
              >
                <ProductList />
              </div>
            </Content>
          </Layout>
        </AntApp>
      </ProConfigProvider>
    </ConfigProvider>
  );
}

export default App;
