import MainLayout from '../layouts/MainLayout';
import Home from '../pages/Home';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import ForgotPassword from '../pages/auth/ForgotPassword';

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
];

export default mainRoutes;
