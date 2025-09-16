import { useState } from 'react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HomePanels } from '@/components/dashboard/settings/sections/home/HomePanels';

const ConfigPage = () => {
  const [activeTab, setActiveTab] = useState('home');

  return (
    <div className='bg-white rounded-lg shadow-md py-6 p-6 w-full'>
      <div className='flex justify-between items-center mb-6'>
        <h2 className='text-2xl font-bold text-gray-900'>
          Configuración de Páginas
        </h2>
      </div>

      <div className='flex-1 flex flex-col min-h-0 overflow-x-auto'>
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className='flex flex-col h-full'
        >
          <TabsList className='grid w-full grid-cols-3 flex-shrink-0'>
            <TabsTrigger value='home'>Home</TabsTrigger>
            <TabsTrigger value='categories'>Categorias</TabsTrigger>
            <TabsTrigger value='products'>Productos</TabsTrigger>
          </TabsList>

          <TabsContent value='home' className='flex-1 mt-4 overflow-hidden'>
            <HomePanels />
          </TabsContent>

          <TabsContent value='categories' className='flex-1 mt-4 overflow-auto'>
            <span>Categorias</span>
          </TabsContent>

          <TabsContent value='products' className='flex-1 mt-4 overflow-auto'>
            <span>Productos</span>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export { ConfigPage };
