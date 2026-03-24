import { useRoutes } from 'react-router-dom';
import mainRoutes from './main.routes';
import adminRoutes from './admin.routes';
import sellerRoutes from './seller.routes';

export default function AppRoutes() {
    const routes = useRoutes([...mainRoutes, ...adminRoutes, ...sellerRoutes]);

    return routes;
}
