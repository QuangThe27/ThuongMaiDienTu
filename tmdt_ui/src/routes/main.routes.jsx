import MainLayout from '../layouts/MainLayout';
import Home from '../pages/Home';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import ForgotPassword from '../pages/auth/ForgotPassword';
import ProductDetail from '../pages/ProductDetail';
import Cart from '../pages/Cart';
import Checkout from '../pages/Checkout';
import History from '../pages/History';
import OrderDetail from '../pages/OrderDetail';
import Store from '../pages/seller/Store';
import Settings from '../pages/Settings';

const mainRoutes = [
    {
        path: '/',
        element: (
            <MainLayout showHeader showFooter>
                <Home />
            </MainLayout>
        ),
    },
    {
        path: '/dang-nhap',
        element: <Login />,
    },
    {
        path: '/dang-ky',
        element: <Register />,
    },
    {
        path: '/quen-mat-khau',
        element: <ForgotPassword />,
    },
    {
        path: '/chi-tiet-san-pham/:id',
        element: (
            <MainLayout showHeader showFooter>
                <ProductDetail />
            </MainLayout>
        ),
    },
    {
        path: '/gio-hang',
        element: (
            <MainLayout showHeader showFooter>
                <Cart />
            </MainLayout>
        ),
    },
     {
        path: '/thanh-toan',
        element: (
            <MainLayout showHeader showFooter>
                <Checkout />
            </MainLayout>
        ),
    },
    {
        path: '/lich-su-don-hang',
        element: (
            <MainLayout showHeader showFooter>
                <History />
            </MainLayout>
        ),
    },
    {
        path: '/thong-tin-don-hang/:id',
        element: (
            <MainLayout showHeader showFooter>
                <OrderDetail />
            </MainLayout>
        ),
    },
     {
        path: '/cua-hang/:id',
        element: (
            <MainLayout showHeader showFooter>
                <Store />
            </MainLayout>
        ),
    },
    {
        path: '/cai-dat',
        element: (
            <MainLayout showHeader showFooter>
                <Settings />
            </MainLayout>
        ),
    },
];

export default mainRoutes;
