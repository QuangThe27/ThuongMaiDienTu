import SellerLayout from '../layouts/SellerLayout';
import Dashboard from "../pages/seller/Dashboard";
import Product from "../pages/seller/Product";
import ProductCreate from '../pages/seller/ProductCreate';
import ProductEdit from '../pages/seller/ProductEdit';

import ProtectedRoute from '../components/ProtectedRoute';

// Helper dành riêng cho Seller (Role = 2)
const protectSeller = (element) => (
    <ProtectedRoute allowedRoles={[2]}> 
        {element}
    </ProtectedRoute>
);

const sellerRoutes = [
    {
        path: '/seller',
        element: protectSeller(
            <SellerLayout>
                <Dashboard />
            </SellerLayout>
        ),
    },
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
];

export default sellerRoutes;