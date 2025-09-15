import type { IMediaGlobalFilter } from '@/components/dashboard/media/MediaPage';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { imageTagsList } from '@/shared/consts';

interface FilterImagesProps {
  globalFilter: IMediaGlobalFilter;
  setGlobalFilter: (value: IMediaGlobalFilter) => void;
}

const FilterImages = ({ globalFilter, setGlobalFilter }: FilterImagesProps) => {
  return (
    <Select
      value={globalFilter.tag}
      onValueChange={(value) =>
        setGlobalFilter({ ...globalFilter, tag: value })
      }
    >
      <SelectTrigger className='w-[180px]'>
        <SelectValue placeholder='Selecciona' />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {imageTagsList.map((tag) => (
            <SelectItem key={tag.id} value={tag.id}>
              {tag.description}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

export { FilterImages };
