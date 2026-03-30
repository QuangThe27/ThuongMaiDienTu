import AdminLayout from '../layouts/AdminLayout';
import Dashboard from '../pages/admin/Dashboard';
import User from '../pages/admin/User';
import UserCreate from '../pages/admin/UserCreate';
import UserEdit from '../pages/admin/UserEdit';
import Store from '../pages/admin/Store';
import StoreCreate from '../pages/admin/StoreCreate';
import StoreEdit from '../pages/admin/StoreEdit';
import Category from '../pages/admin/Category';
import CategoryCreate from '../pages/admin/CategoryCreate';
import CategoryEdit from '../pages/admin/CategoryEdit';
import Product from '../pages/admin/Product';
import ProductDetail from '../pages/admin/ProductDetail';
import Review from '../pages/admin/Review';

import ProtectedRoute from '../components/ProtectedRoute';

// Hàm helper để bọc bảo vệ route 
const protect = (element) => (
    <ProtectedRoute allowedRoles={[1]}>
        {element}
    </ProtectedRoute>
);

const adminRoutes = [
    {
        path: '/admin',
        element: protect(
            <AdminLayout>
                <Dashboard />
            </AdminLayout>
        ),
    },
    {
        path: '/quan-ly/nguoi-dung',
        element: protect(
            <AdminLayout>
                <User />
            </AdminLayout>
        ),
    },
    {
        path: '/quan-ly/them-nguoi-dung',
        element: protect(
            <AdminLayout>
                <UserCreate />
            </AdminLayout>
        ),
    },
    {
        path: '/quan-ly/sua-nguoi-dung/:id',
        element: protect(
            <AdminLayout>
                <UserEdit />
            </AdminLayout>
        ),
    },
    {
        path: '/quan-ly/cua-hang',
        element: protect(
            <AdminLayout>
                <Store />
            </AdminLayout>
        ),
    },
    {
        path: '/quan-ly/them-cua-hang',
        element: protect(
            <AdminLayout>
                <StoreCreate />
            </AdminLayout>
        ),
    },
    {
        path: '/quan-ly/sua-cua-hang/:id',
        element: protect(
            <AdminLayout>
                <StoreEdit />
            </AdminLayout>
        ),
    },
    {
        path: '/quan-ly/danh-muc',
        element: protect(
            <AdminLayout>
                <Category />
            </AdminLayout>
        ),
    },
    {
        path: '/quan-ly/them-danh-muc',
        element: protect(
            <AdminLayout>
                <CategoryCreate />
            </AdminLayout>
        ),
    },
    {
        path: '/quan-ly/sua-danh-muc/:id',
        element: protect(
            <AdminLayout>
                <CategoryEdit />
            </AdminLayout>
        ),
    },
     {
        path: '/quan-ly/san-pham',
        element: protect(
            <AdminLayout>
                <Product />
            </AdminLayout>
        ),
    },
    {
        path: '/quan-ly/chi-tiet-san-pham/:id',
        element: protect(
            <AdminLayout>
                <ProductDetail />
            </AdminLayout>
        ),
    },
    {
        path: '/quan-ly/danh-gia',
        element: protect(
            <AdminLayout>
                <Review />
            </AdminLayout>
        ),
    },
];

export default adminRoutes;
