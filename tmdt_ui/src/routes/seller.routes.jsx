import SellerLayout from '../layouts/SellerLayout';
import Product from "../pages/seller/Product";
import ProductCreate from '../pages/seller/ProductCreate';
import ProductEdit from '../pages/seller/ProductEdit';
import SellerReview from '../pages/seller/SellerReview';
import SellerChat from '../pages/seller/SellerChat';
import SellerOrder from '../pages/seller/SellerOrder';
import SellerOrderDetail from '../pages/seller/SellerOrderDetail';
import SellerDashboard from '../pages/seller/SellerDashboard';

import ProtectedRoute from '../components/ProtectedRoute';

// Helper dành riêng cho Seller (Role = 2)
const protectSeller = (element) => (
    <ProtectedRoute allowedRoles={[2]}> 
        {element}
    </ProtectedRoute>
);

const sellerRoutes = [
    {
        path: '/seller/san-pham',
        element: protectSeller(
            <SellerLayout>
                <Product />
            </SellerLayout>
        ),
    },
    {
        path: '/seller/them-san-pham',
        element: protectSeller(
            <SellerLayout>
                <ProductCreate />
            </SellerLayout>
        ),
    },
    {
        path: '/seller/sua-san-pham/:id',
        element: protectSeller(
            <SellerLayout>
                <ProductEdit />
            </SellerLayout>
        ),
    },
    {
        path: '/seller/danh-gia',
        element: protectSeller(
            <SellerLayout>
                <SellerReview />
            </SellerLayout>
        ),
    },
    {
        path: '/seller/danh-sach-tin-nhan',
        element: protectSeller(
            <SellerLayout>
                <SellerChat />
            </SellerLayout>
        ),
    },
    {
        path: '/seller/don-hang',
        element: protectSeller(
            <SellerLayout>
                <SellerOrder />
            </SellerLayout>
        ),
    },
    {
        path: '/seller/don-hang/:orderId',
        element: protectSeller(
            <SellerLayout>
                <SellerOrderDetail />
            </SellerLayout>
        ),
    },
    {
        path: '/seller/thong-ke',
        element: protectSeller(
            <SellerLayout>
                <SellerDashboard />
            </SellerLayout>
        ),
    },
];

export default sellerRoutes;