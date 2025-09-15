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
import { useState } from 'react';
import { Sidebar } from './Sidebar';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      refetchOnWindowFocus: false,
    },
  },
});

export default function DashboardApp() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter basename='/dashboard'>
        <div className='flex min-h-screen'>
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

          {/* Contenido principal */}
          <div className='flex-1 flex flex-col lg:ml-0'>
            {/* Header solo visible en móvil */}
            <header className='bg-white border-b px-4 py-3 lg:hidden'>
              <button
                onClick={() => setSidebarOpen(true)}
                className='p-2 rounded-md hover:bg-gray-100'
              >
                ☰ Dashboard
              </button>
            </header>

            <main className='flex-1 p-10 max-w-[1400px] mx-auto'>
              <Routes>
                <Route path='/' element={<DashboardHomePage />} />
                <Route path='/config' element={<ConfigPage />} />
                <Route path='/products' element={<ProductsPage />} />
                <Route path='/categories' element={<CategoriesPage />} />
              </Routes>
            </main>
          </div>
        </div>
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
