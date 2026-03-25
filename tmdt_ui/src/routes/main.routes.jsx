import MainLayout from '../layouts/MainLayout';
import Home from '../pages/Home';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import ForgotPassword from '../pages/auth/ForgotPassword';
import ProductDetail from '../pages/ProductDetail';
import Cart from '../pages/Cart';

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
];

export default mainRoutes;
