// components/AuthSection.tsx
import {
  SignedIn,
  SignedOut,
  UserButton,
  SignInButton,
} from '@clerk/astro/react';
import type { JSX } from 'astro/jsx-runtime';
import { useEffect, useState } from 'react';

export default function AuthSection(): JSX.Element {
  const [mounted, setMounted] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  useEffect(() => {
    // Esperar a que todo esté montado
    setMounted(true);

    const checkAdmin = () => {
      if (window.Clerk?.user?.publicMetadata?.role === 'admin') {
        setIsAdmin(true);
      }
    };

    // Verificar admin después de un delay
    setTimeout(checkAdmin, 0);
  }, []);

  if (!mounted) {
    return <div style={{ minHeight: '40px' }} />;
  }

  return (
    <div
      style={{
        opacity: mounted ? 1 : 0,
        transition: 'opacity 0.2s',
      }}
    >
      <SignedOut>
        <SignInButton mode='modal' />
      </SignedOut>

      <SignedIn>
        <div className='flex gap-2 items-center'>
          <UserButton showName />
          {isAdmin && <a href='/dashboard'>Dashboard</a>}
        </div>
      </SignedIn>
    </div>
  );
}
