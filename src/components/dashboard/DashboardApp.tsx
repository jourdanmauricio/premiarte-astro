import { CategoriesPage } from '@/components/dashboard/categories/CategoriesPage';
import { ConfigPage } from '@/components/dashboard/config/ConfigPage';
import { DashboardHomePage } from '@/components/dashboard/home/DashboardHomePage';
import { ProductsPage } from '@/components/dashboard/products/ProductsPage';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  BrowserRouter,
  Route,
  Routes,
  Link,
  useLocation,
} from 'react-router-dom';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      refetchOnWindowFocus: false,
    },
  },
});

export default function DashboardApp() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter basename='/dashboard'>
        <div className='flex flex-col h-screen'>
          {/* Menú de navegación transitorio */}
          <nav className='bg-gray-800 text-white p-4'>
            <div className='flex items-center justify-between'>
              <h1 className='text-xl font-bold'>Dashboard Administrativo</h1>
              <NavigationMenu />
            </div>
          </nav>

          {/* Contenido principal */}
          <main className='flex-1 overflow-auto'>
            <Routes>
              <Route path='/' element={<DashboardHomePage />} />
              <Route path='/config' element={<ConfigPage />} />
              <Route path='/products' element={<ProductsPage />} />
              <Route path='/categories' element={<CategoriesPage />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

function NavigationMenu() {
  const location = useLocation();

  const menuItems = [
    { path: '/', label: 'Inicio' },
    { path: '/config', label: 'Configuración' },
    { path: '/products', label: 'Productos' },
    { path: '/categories', label: 'Categorías' },
  ];

  return (
    <div className='flex space-x-4'>
      {menuItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            location.pathname === item.path
              ? 'bg-gray-900 text-white'
              : 'text-gray-300 hover:bg-gray-700 hover:text-white'
          }`}
        >
          {item.label}
        </Link>
      ))}
    </div>
  );
}
