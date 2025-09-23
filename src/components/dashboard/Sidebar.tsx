import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { UserButton } from '@clerk/astro/react'; // o donde esté importado

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();

  const menuItems = [
    { path: '/', label: 'Inicio', icon: '🏠' },
    { path: '/config', label: 'Configuración', icon: '⚙️' },
    { path: '/products', label: 'Productos', icon: '📦' },
    { path: '/categories', label: 'Categorías', icon: '📂' },
    { path: '/media', label: 'Galería', icon: '🖼️' },
    { path: '/newsletter', label: 'Newsletter', icon: '📧' },
    { path: '/contact', label: 'Contacto', icon: '💬' },
  ];

  return (
    <>
      {/* Overlay para móvil */}
      {isOpen && (
        <div
          className='fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden'
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
        fixed inset-y-0 left-0 z-50 w-48 bg-gray-900 text-white transform transition-transform duration-300 ease-in-out
        lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
      >
        <div className='flex flex-col h-full'>
          {/* Header */}
          <div className='p-4 border-b border-gray-700'>
            <div className='flex items-center justify-between'>
              <h1 className='text-xl font-bold'>Premiarte</h1>
              <button
                onClick={onClose}
                className='lg:hidden p-1 rounded hover:bg-gray-800'
              >
                ✕
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className='flex-1 p-4'>
            <ul className='space-y-2'>
              {menuItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={() => onClose()}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      location.pathname === item.path
                        ? 'bg-gray-800 text-white'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Footer con UserButton y link */}
          <div className='p-4 border-t border-gray-700 space-y-3'>
            <div className='flex items-center justify-center'>
              <UserButton showName />
            </div>
            <a
              href='/'
              className='block text-center text-sm text-gray-400 hover:text-white transition-colors'
            >
              ← Volver al sitio
            </a>
          </div>
        </div>
      </aside>
    </>
  );
}
