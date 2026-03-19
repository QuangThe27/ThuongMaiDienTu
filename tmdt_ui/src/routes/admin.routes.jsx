import AdminLayout from '../layouts/AdminLayout';
import Dashboard from '../pages/admin/Dashboard';
import User from '../pages/admin/User';
import UserCreate from '../pages/admin/UserCreate';
import UserEdit from '../pages/admin/UserEdit';
import Store from '../pages/admin/Store';
import StoreCreate from '../pages/admin/StoreCreate';
import StoreEdit from '../pages/admin/StoreEdit';

import ProtectedRoute from '../components/ProtectedRoute';

// Hàm helper để bọc bảo vệ route 
const protect = (element) => <ProtectedRoute>{element}</ProtectedRoute>;

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
];

export default adminRoutes;
