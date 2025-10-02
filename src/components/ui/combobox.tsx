import { cn } from "@/lib/utils"
import { type FieldValues, type UseFormReturn } from "react-hook-form"
import { Check, ChevronsUpDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useState, useRef, useEffect } from "react"


export type ComboboxFilter = {
  [key: string]: any;
};

export type ComboboxItem = {
  label: string;
  value: string | number;
};

interface ComboboxFormProps<T extends ComboboxItem = ComboboxItem> {
  form: UseFormReturn<any>;
  name: string;
  placeholder: string;
  field: FieldValues;
  deboundTime?: number;
  filters?: ComboboxFilter;
  data?: T[];
  onChange?: (item: T) => void;
}

export function ComboboxForm<T extends ComboboxItem = ComboboxItem>({ 
  form, 
  name, 
  placeholder, 
  field, 
  data,
  onChange
}: ComboboxFormProps<T>) {

  const [open, setOpen] = useState(false);
  const commandListRef = useRef<HTMLDivElement>(null);

  // Filtrar datos basado en la búsqueda y luego limitar a 8
  // const filteredData = data?.filter((item) => 
  //   item.label.toLowerCase().includes(commandInput.toLowerCase())
  // ).slice(0, 10) || [];

   const filteredData = data || [];

//  Agregar evento de scroll personalizado
  useEffect(() => {
    if (open) {
      const handleWheel = (e: WheelEvent) => {
        const target = e.target as HTMLElement;
        const scrollableElement = target.closest('[data-radix-scroll-area-viewport]') || 
                                 target.closest('.overflow-y-auto') ||
                                 target.closest('[cmdk-list]');
        
        if (scrollableElement) {
          e.preventDefault();
          scrollableElement.scrollTop += e.deltaY;
        }
      };
      
      document.addEventListener('wheel', handleWheel, { passive: false });
      
      return () => {
        document.removeEventListener('wheel', handleWheel);
      };
    }
  }, [open]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            className={cn(
              "w-full justify-between",
              !field.value && "text-muted-foreground"
            )}
          >
            {field.value
              ? data?.find(
                (item) => item.value === field.value
              )?.label
              : "Seleccionar"}
            <ChevronsUpDown className="opacity-50" />
          </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[var(--radix-popover-trigger-width)] max-w-[var(--radix-popover-trigger-width)] p-0 overflow-hidden" 
        align="start"
        side="bottom"
        sideOffset={4}
        style={{ width: 'var(--radix-popover-trigger-width)', maxWidth: 'var(--radix-popover-trigger-width)' }}
      >
        <Command className="max-h-[300px] w-full">
          <CommandInput
            placeholder={placeholder}
            className="h-9"
          />
          <CommandList 
            ref={commandListRef}
            className="max-h-[300px] overflow-y-auto w-full"
            tabIndex={0}
            style={{ 
              scrollbarWidth: 'thin',
              scrollbarColor: 'hsl(var(--border)) transparent',
              overscrollBehavior: 'contain',
              scrollBehavior: 'smooth'
            }}
          >
            <CommandEmpty>No se encontraron resultados</CommandEmpty>
            <CommandGroup className="w-full">
              {filteredData.map((item) => (
                <CommandItem
                  value={item.label}
                  key={item.value}
                  onSelect={() => {
                    form.setValue(name, item.value);
                    setOpen(false);
                    if (onChange) {
                      onChange(item as T);
                    }
                  }}
                  className="flex items-center justify-between w-full min-w-0 px-2 py-1.5 cursor-pointer"
                >
                  <span className="truncate flex-1 min-w-0 text-left">
                    {item.label}
                  </span>
                  <Check
                    className={cn(
                      "ml-2 h-4 w-4 flex-shrink-0",
                      item.value === field.value
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>

  )
}
