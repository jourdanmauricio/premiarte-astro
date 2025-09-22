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
import RegenerateButton from '@/components/ui/custom/RegenerateButton';
import { NewsletterPage } from '@/components/dashboard/newsletter/NewsletterPage';

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
        <div className='h-screen overflow-hidden'>
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

          {/* Contenido principal */}
          <div className='h-full lg:ml-48 flex flex-col'>
            {/* Header */}
            <header className='bg-white border-b px-4 py-3 flex items-center justify-between flex-shrink-0'>
              {/* Botón de menú móvil */}
              <button
                onClick={() => setSidebarOpen(true)}
                className='p-2 rounded-md hover:bg-gray-100 lg:hidden'
              >
                ☰ Dashboard
              </button>

              {/* Título para desktop */}
              <h1 className='hidden lg:block text-xl font-semibold text-gray-800'>
                Panel de Administración
              </h1>

              {/* Botón de regeneración */}
              <div className='ml-auto'>
                <RegenerateButton />
              </div>
            </header>

            <main className='flex-1 overflow-y-auto'>
              <div className='p-10 max-w-[1400px] mx-auto w-full'>
                <Routes>
                  <Route path='/' element={<DashboardHomePage />} />
                  <Route path='/config' element={<ConfigPage />} />
                  <Route path='/products' element={<ProductsPage />} />
                  <Route path='/categories' element={<CategoriesPage />} />
                  <Route path='/media' element={<MediaPage />} />
                  <Route path='/newsletter' element={<NewsletterPage />} />
                </Routes>
              </div>
            </main>
          </div>
        </div>
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} />
      <Toaster />
    </QueryClientProvider>
  );
}
