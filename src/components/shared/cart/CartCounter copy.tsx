import { useEffect, useState } from 'react';
import { useStore } from '@nanostores/react';

import { itemsInCart } from '@/store';
import { CartCookiesClient } from '@/utils';

const CartCounter = () => {
  const $itemsInCart = useStore(itemsInCart);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const cart = CartCookiesClient.getCart();
    itemsInCart.set(cart.length);
    setIsHydrated(true);
  }, []);

  return (
    <div>
      <a href='/cart' className='relative inline-block'>
        {isHydrated && $itemsInCart > 0 && (
          <span
            className='absolute -top-3 -right-3 flex justify-center items-center bg-orange-500 text-white
        text-xs rounded-full w-5 h-5'
          >
            {$itemsInCart}
          </span>
        )}

        <svg
          xmlns='http://www.w3.org/2000/svg'
          width={24}
          height={24}
          viewBox='0 0 24 24'
        >
          <g
            fill='none'
            stroke='currentColor'
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={1.5}
          >
            <path
              fill='currentColor'
              d='M19.5 22a1.5 1.5 0 1 0 0-3a1.5 1.5 0 0 0 0 3m-10 0a1.5 1.5 0 1 0 0-3a1.5 1.5 0 0 0 0 3'
            ></path>
            <path d='M5 4h17l-2 11H7zm0 0c-.167-.667-1-2-3-2m18 13H5.23c-1.784 0-2.73.781-2.73 2s.946 2 2.73 2H19.5'></path>
          </g>
        </svg>
      </a>
    </div>
  );
};

export default CartCounter;
