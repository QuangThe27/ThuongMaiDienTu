import { useRoutes } from 'react-router-dom';
import mainRoutes from './main.routes';
import adminRoutes from './admin.routes';

export default function AppRoutes() {
    const routes = useRoutes([...mainRoutes, ...adminRoutes]);

    return routes;
}
