import { CategoriesPage } from '@/components/dashboard/categories/CategoriesPage';
import { ConfigPage } from '@/components/dashboard/settings/ConfigPage';
import { DashboardHomePage } from '@/components/dashboard/home/DashboardHomePage';
import { ProductsPage } from '@/components/dashboard/products/ProductsPage';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { MediaPage } from '@/components/dashboard/media/MediaPage';
import { Toaster } from '@/components/ui/sonner';

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
        <div className='flex min-h-screen h-full'>
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

          {/* Contenido principal */}
          <div className='flex-1 flex flex-col overflow-hidden'>
            {/* Header solo visible en móvil */}
            <header className='bg-white border-b px-4 py-3 lg:hidden'>
              <button
                onClick={() => setSidebarOpen(true)}
                className='p-2 rounded-md hover:bg-gray-100'
              >
                ☰ Dashboard
              </button>
            </header>

            <main className='p-10 max-w-[1400px] mx-auto w-full overflow-y-auto h-full'>
              <Routes>
                <Route path='/' element={<DashboardHomePage />} />
                <Route path='/config' element={<ConfigPage />} />
                <Route path='/products' element={<ProductsPage />} />
                <Route path='/categories' element={<CategoriesPage />} />
                <Route path='/media' element={<MediaPage />} />
              </Routes>
            </main>
          </div>
        </div>
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} />
      <Toaster />
    </QueryClientProvider>
  );
}
