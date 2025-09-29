# Tabla de Items de Presupuestos

Este directorio contiene los componentes necesarios para mostrar una tabla con todos los items de los presupuestos.

## Archivos

- `budgetItemsColumns.tsx`: Define las columnas de la tabla y la función de transformación de datos
- `BudgetItemsTable.tsx`: Componente wrapper que facilita el uso de la tabla

## Uso

### Opción 1: Usar el componente BudgetItemsTable (Recomendado)

```tsx
import { BudgetItemsTable } from './table/BudgetItemsTable';
import type { Budget } from '@/shared/types';

const MyComponent = () => {
  const budgets: Budget[] = []; // Tus datos de presupuestos

  const handleDelete = (budget: Budget) => {
    // Lógica para eliminar presupuesto
  };

  const handleEdit = (budget: Budget) => {
    // Lógica para editar presupuesto
  };

  return (
    <BudgetItemsTable
      budgets={budgets}
      onDelete={handleDelete}
      onEdit={handleEdit}
      isLoading={false}
      error={false}
    />
  );
};
```

### Opción 2: Usar directamente las columnas y transformación

```tsx
import {
  getBudgetItemColumns,
  transformBudgetsToItemRows,
} from './table/budgetItemsColumns';
import { CustomTable } from '@/components/ui/custom/CustomTable';
import type { Budget } from '@/shared/types';

const MyComponent = () => {
  const budgets: Budget[] = []; // Tus datos de presupuestos

  // Transformar los datos
  const itemRows = useMemo(() => {
    return transformBudgetsToItemRows(budgets);
  }, [budgets]);

  // Obtener las columnas
  const columns = useMemo(
    () =>
      getBudgetItemColumns({
        onDelete: handleDelete,
        onEdit: handleEdit,
      }),
    [handleDelete, handleEdit]
  );

  return (
    <CustomTable
      data={itemRows}
      columns={columns}
      isLoading={false}
      error={false}
      sorting={[]}
      handleSorting={() => {}}
      pageIndex={0}
      setPageIndex={() => {}}
      globalFilter={{}}
      globalFilterFn={() => true}
    />
  );
};
```

## Características

- **Transformación automática**: Convierte un array de `Budget` con items en un array de filas individuales
- **Columnas informativas**: Muestra producto, SKU, cantidad, precio unitario y total
- **Acciones**: Botones para ver, editar y eliminar presupuestos
- **Formato de precios**: Convierte automáticamente centavos a formato de moneda
- **Responsive**: Se adapta a diferentes tamaños de pantalla

## Estructura de datos

Cada fila de la tabla representa un `BudgetItem` individual, pero mantiene una referencia al `Budget` padre para las acciones.

```typescript
type BudgetItemRow = BudgetItem & {
  budget: Budget; // Referencia al budget padre
};
```
