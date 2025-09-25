'use client';
import { Button } from '@/components/ui/button';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

type Props = {
  totalPages: number;
  currentPage?: number;
  setPageIndex: (value: number) => void;
};

const PaginationClient = ({
  totalPages,
  currentPage = 1,
  setPageIndex,
}: Props) => {
  const isFirstPage = currentPage <= 1;
  const isLastPage = currentPage >= totalPages;

  // Generar números de página a mostrar
  const getVisiblePages = () => {
    const delta = 1;
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const visiblePages = getVisiblePages();

  if (totalPages <= 1) return null;

  return (
    <Pagination className='mt-8'>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            onClick={() => !isFirstPage && setPageIndex(currentPage - 1)}
            className={
              isFirstPage ? 'pointer-events-none opacity-50' : 'cursor-pointer'
            }
          />
        </PaginationItem>

        {visiblePages.map((pageNum, index) => (
          <PaginationItem key={index}>
            {pageNum === '...' ? (
              <PaginationEllipsis />
            ) : (
              <Button
                size='sm'
                className='px-3 py-0'
                variant={currentPage === pageNum ? 'default' : 'ghost'}
                onClick={() => setPageIndex(pageNum as number)}
                type='button'
              >
                {pageNum}
              </Button>
            )}
          </PaginationItem>
        ))}

        <PaginationItem>
          <PaginationNext
            onClick={() => !isLastPage && setPageIndex(currentPage + 1)}
            className={
              isLastPage ? 'pointer-events-none opacity-50' : 'cursor-pointer'
            }
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

export { PaginationClient };
