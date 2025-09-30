import React from 'react';
import { Input } from '../input';
import { Search, X, XCircle } from 'lucide-react';

interface SearchInputProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  placeholder = 'Buscar...',
  value,
  onChange,
  className = '',
}) => {
  return (
    <div className={`relative ${className}`}>
      <Input
        type='text'
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <Search className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 size-4' />
      {value && (
        <XCircle
          className=' cursor-pointer absolute right-1 -top-3 transform -translate-y-1/2 size-3 text-red-500'
          onClick={() => onChange('')}
        />
      )}
    </div>
  );
};
