import { LoaderIcon, PlusIcon } from 'lucide-react';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import Dropdown from '@/components/ui/custom/dropdown';
import InputField from '@/components/ui/custom/input-field';
import SubmitButton from '@/components/ui/custom/submit-button';
import { CustomTable } from '@/components/ui/custom/CustomTable';
import TextareaField from '@/components/ui/custom/textarea-field';
import { budgetStatusList, customerTypeList } from '@/shared/consts';
import InputRadioGroup from '@/components/ui/custom/input-radio-group';
import { navigate } from 'astro/virtual-modules/transitions-router.js';
import InputNumberField from '@/components/ui/custom/input-number-field';
import CustomAlertDialog from '@/components/ui/custom/custom-alert-dialog';
import { CustomDatePicker } from '@/components/ui/custom/custom-date-picker';
import { ItemModal } from '@/components/dashboard/budgets/budget-form/ItemModal';
import { useBudgetForm } from '@/components/dashboard/budgets/budget-form/useBudgetForm';
import CustomersCombobox from '@/components/ui/custom/customer-combobox';
import { CustomerModal } from '@/components/dashboard/customers/CustomerModal';
import { ResponsibilityDropdown } from '@/components/ui/custom/dropdowns/ResponsibilityDropdown';

const BudgetForm = () => {
  const {
    budget,
    form,
    isLoading,
    mode,
    itemColumns,
    currentItem,
    showItemModal,
    deleteModalIsOpen,
    isPending,
    customerModalIsOpen,
    handleShowItemModal,
    handleAddItem,
    handleEditItem,
    setShowItemModal,
    onSubmit,
    onError,
    setDeleteModalIsOpen,
    setCurrentItem,
    handleConfirmDelete,
    setCustomerModalIsOpen,
  } = useBudgetForm();

  return (
    <div className='bg-white rounded-lg shadow-md py-6 p-6 w-full'>
      <h2 className='text-2xl font-bold text-gray-900'>
        {mode === 'CREATE'
          ? 'Nuevo presupuesto'
          : `Modificar presupuesto ${budget?.name ?? ''}`}
      </h2>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit, onError)}
          className='grid grid-cols-2 gap-12 w-full items-center mt-6'
        >
          {isLoading ? (
            <div className='flex justify-center items-center h-[250px] col-span-2'>
              <LoaderIcon className='h-5 w-5 animate-spin' />
            </div>
          ) : (
            <>
              {mode === 'CREATE' ? (
                <div className='flex gap-6 items-end'>
                  <CustomersCombobox
                    label='Cliente'
                    className='w-full h-auto'
                    name='customerId'
                    placeholder='Cliente'
                    form={form}
                    onChange={(value) => {
                      form.setValue('customerId', value.value);
                      form.setValue('name', value.label);
                      form.setValue('email', value.email);
                      form.setValue('phone', value.phone);
                      form.setValue('type', value.type);
                    }}
                  />
                  <Button
                    variant='outline'
                    type='button'
                    onClick={() => setCustomerModalIsOpen(true)}
                    className='mb-1'
                  >
                    <PlusIcon className='size-5' />
                  </Button>
                </div>
              ) : (
                <InputField
                  label='Nombre'
                  name='name'
                  placeholder='Nombre'
                  form={form}
                  readOnly
                />
              )}
              <InputField
                label='Email'
                name='email'
                placeholder='Email'
                form={form}
                readOnly
              />
              <InputField
                label='Teléfono'
                name='phone'
                placeholder='Teléfono'
                form={form}
                readOnly
              />
              <div></div>
              <ResponsibilityDropdown
                name='responsibleId'
                form={form}
                className='w-full'
                labelClassName='w-full'
              />
              <Dropdown
                label='Estado'
                name='status'
                placeholder='Estado'
                form={form}
                list={budgetStatusList}
              />
              <TextareaField
                label='Observación'
                name='observation'
                placeholder='Observación'
                form={form}
                className='col-span-2'
              />
              <CustomDatePicker
                className='w-full'
                label='Fecha de creación'
                name='createdAt'
                form={form}
                labelClassName='w-full'
                readOnly={true}
              />
              <CustomDatePicker
                className='w-full'
                label='Fecha de expiración'
                name='expiresAt'
                form={form}
                labelClassName='w-full'
                disabled={(date) => date <= new Date()}
              />
              <InputRadioGroup
                orientation='horizontal'
                name='type'
                form={form}
                list={customerTypeList}
              />
              <InputNumberField
                label='Total'
                name='totalAmount'
                placeholder='Total'
                form={form}
                integerDigits={9}
                decimalDigits={2}
                disabled
              />
              <div className='col-span-2 mt-6'>
                <div className='flex justify-between items-center'>
                  <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                    Items del Presupuesto
                  </h3>
                  <Button
                    type='button'
                    onClick={handleShowItemModal}
                    variant='outline'
                    className='min-w-[150px]'
                  >
                    Agregar producto
                  </Button>
                </div>
                <CustomTable
                  data={form.watch('items') || []}
                  columns={itemColumns}
                  isLoading={false}
                  error={false}
                  sorting={[]}
                  handleSorting={() => {}}
                  pageIndex={0}
                  setPageIndex={() => {}}
                  globalFilter={{}}
                  globalFilterFn={() => true}
                />
              </div>

              <div className='flex justify-end gap-8 col-span-2'>
                <Button
                  type='button'
                  onClick={() => navigate('/dashboard/budgets')}
                  variant='outline'
                  className='min-w-[150px]'
                  disabled={isPending || isLoading}
                >
                  Cancelar
                </Button>
                <SubmitButton
                  label={mode === 'CREATE' ? 'Crear presupuesto' : 'Guardar'}
                  className='min-w-[150px]'
                  showSpinner={isPending}
                  disabled={isPending || !form.formState.isDirty || isLoading}
                />
              </div>
            </>
          )}
        </form>
      </Form>

      {showItemModal && (
        <ItemModal
          open={showItemModal}
          closeModal={() => setShowItemModal(false)}
          item={currentItem}
          type={form.watch('type')}
          addItem={handleAddItem}
          editItem={handleEditItem}
        />
      )}

      {deleteModalIsOpen && (
        <CustomAlertDialog
          title='Eliminar item'
          description={`¿Estás seguro de querer eliminar el item "${currentItem?.name}"? Esta acción no se puede deshacer.`}
          cancelButtonText='Cancelar'
          continueButtonText='Eliminar'
          onContinueClick={handleConfirmDelete}
          open={deleteModalIsOpen}
          onCloseDialog={() => {
            setDeleteModalIsOpen(false);
            setCurrentItem(null);
          }}
        />
      )}

      {customerModalIsOpen && (
        <CustomerModal
          open={customerModalIsOpen}
          closeModal={() => {
            setCustomerModalIsOpen(false);
          }}
          customer={null}
        />
      )}
    </div>
  );
};

export { BudgetForm };
