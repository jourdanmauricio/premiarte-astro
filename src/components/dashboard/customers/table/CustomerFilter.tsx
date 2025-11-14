import { z } from "zod"
import { useForm } from "react-hook-form"
import { SearchIcon } from "lucide-react"
import { zodResolver } from "@hookform/resolvers/zod"

import { Form } from "@/components/ui/form"
import { customerTypeList } from "@/shared/consts"
import Dropdown from "@/components/ui/custom/dropdown"
import InputForm from "@/components/ui/custom/input-field"
import { useEffect } from "react"

const CustomerFilterSchema = z.object({
  search: z.string().optional(),
  type: z.string().optional(),
});

interface CustomerFilterProps {
  globalFilter: { search: string; type: string };
  handleSearch: (key: string, value: string) => void;
}

const CustomerFilter = ({
  globalFilter,
  handleSearch,
}: CustomerFilterProps) => {
  const form = useForm({
    resolver: zodResolver(CustomerFilterSchema),
    defaultValues: globalFilter,
  });

  useEffect(() => {
    const subscription = form.watch((value, { name, type }) => {
      if (name === 'search') {
        handleSearch('search', value.search || '');
      }
      if (name === 'type') {
        handleSearch('type', value.type || '');
      }
    });
    return () => subscription.unsubscribe();
  }, [form, handleSearch]);


  return (
    <Form {...form}>
      <form>
        <div className='flex items-center gap-4'>
          <InputForm
            label=''
            name='search'
            className='min-w-[250px]'
            placeholder='Buscar cliente'
            form={form}
            enableClean
            icon={<SearchIcon className='size-4' />}
          />
          <Dropdown
            label=''
            name='type'
            placeholder='Tipo de cliente'
            form={form}
            list={customerTypeList}
            className='min-w-[250px]'
            enableClean
          />
        </div>
      </form>
    </Form>
  )
}

export default CustomerFilter