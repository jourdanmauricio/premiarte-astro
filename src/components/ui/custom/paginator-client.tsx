'use client';

import React from 'react';
import {
  Pagination as UIPagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Button } from '@/components/ui/button';

interface PaginationProps<TData> {
  totalPages: number;
  currentPage?: number;
  setPageIndex: (value: number) => void;
}

function PaginatorClient<TData>({
  totalPages,
  currentPage = 1,
  setPageIndex,
}: PaginationProps<TData>) {
  const renderPages = () => {
    let pages = [];

    if (totalPages <= 10) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(
          <PaginationItem key={i}>
            <Button
              size='sm'
              className='px-3 py-0'
              variant={i === currentPage + 1 ? 'primary' : 'ghost'}
              onClick={() => {
                setPageIndex(i - 1);
              }}
              type='button'
            >
              {i}
            </Button>
          </PaginationItem>
        );
      }
    } else {
      let startPage = Math.max(currentPage - 4, 1);
      let endPage = Math.min(currentPage + 5, totalPages);

      if (startPage > 1) {
        pages.push(
          <PaginationItem key={1}>
            <Button
              size='sm'
              className='px-3 py-0'
              variant={'ghost'}
              onClick={() => {
                setPageIndex(0);
              }}
              type='button'
            >
              1
            </Button>
          </PaginationItem>
        );
        pages.push(<PaginationEllipsis key='start-ellipsis' />);
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(
          <PaginationItem key={i}>
            <Button
              size='sm'
              className='px-3 py-0'
              variant={i === currentPage + 1 ? 'primary' : 'ghost'}
              onClick={() => {
                setPageIndex(i - 1);
              }}
              type='button'
            >
              {i}
            </Button>
          </PaginationItem>
        );
      }

      if (endPage < totalPages) {
        pages.push(<PaginationEllipsis key='end-ellipsis' />);
        pages.push(
          <PaginationItem key={totalPages}>
            <Button
              size='sm'
              className='px-3 py-0'
              variant={'ghost'}
              onClick={() => {
                setPageIndex(totalPages - 1);
              }}
              type='button'
            >
              {totalPages}
            </Button>
          </PaginationItem>
        );
      }
    }

    return pages;
  };

  return (
    <UIPagination className='pt-4'>
      <PaginationContent>
        <PaginationPrevious
          onClick={() => {
            setPageIndex(Math.max(currentPage - 1, 0));
          }}
        ></PaginationPrevious>

        {renderPages()}

        <PaginationItem>
          <PaginationNext
            onClick={() => {
              setPageIndex(Math.min(currentPage + 1, totalPages - 1));
            }}
          ></PaginationNext>
        </PaginationItem>
      </PaginationContent>
    </UIPagination>
  );
}

export default PaginatorClient;
