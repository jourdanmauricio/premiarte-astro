import * as XLSX from 'xlsx';
import { toast } from 'sonner';
import { DownloadIcon } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import type { SortingState } from '@tanstack/react-table';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { Button } from '@/components/ui/button';
import type { Contact } from '@/shared/types/contact';
import { contactService } from '@/lib/services/contactService';
import { CustomTable } from '@/components/ui/custom/CustomTable';
import CustomAlertDialog from '@/components/ui/custom/custom-alert-dialog';
import ViewContactModal from '@/components/dashboard/contacts/ViewContactModal';
import { getContactColumns } from '@/components/dashboard/contacts/table/contactColumns';

const ContactsPage = () => {
  const [deleteModalIsOpen, setDeleteModalIsOpen] = useState(false);
  const [currentContact, setCurrentContact] = useState<Contact | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [viewModalIsOpen, setViewModalIsOpen] = useState(false);

  const queryClient = useQueryClient();

  const { data, error, isLoading } = useQuery({
    queryKey: ['contacts'],
    queryFn: async () => {
      const response = await contactService.getContacts();
      return response;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (contactId: number) => contactService.deleteContact(contactId),
    onError: (err) => {
      console.error('Error al eliminar contacto:', err);
      toast.error('Error al eliminar el contacto');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      toast.success('Contacto eliminado exitosamente');
      setDeleteModalIsOpen(false);
      setCurrentContact(null);
    },
  });

  const handleDeleteContact = useCallback((contact: Contact) => {
    setCurrentContact(contact);
    setDeleteModalIsOpen(true);
  }, []);

  const handleViewContact = useCallback((contact: Contact) => {
    setCurrentContact(contact);
    setViewModalIsOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (currentContact !== null) {
      deleteMutation.mutate(currentContact.id);
    }
  }, [currentContact]);

  const columns = useMemo(
    () =>
      getContactColumns({
        onDelete: handleDeleteContact,
        onView: handleViewContact,
      }),
    [handleDeleteContact]
  );

  const handleDownloadContacts = () => {
    if (!data || data.length === 0) {
      toast.error('No hay newsletter para descargar');
      return;
    }
    try {
      const excelData = data.map((newsletter) => ({
        Id: newsletter.id,
        Nombre: newsletter.name,
        Email: newsletter.email,
        Telefono: newsletter.phone,
        Mensaje: newsletter.message,
        Fecha_Creacion: newsletter.createdAt
          ? new Date(newsletter.createdAt).toLocaleDateString()
          : '',
      }));

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);

      // Función para ajustar automáticamente el ancho de las columnas
      const autoFitColumns = (
        worksheet: XLSX.WorkSheet,
        worksheetData: (string | number | null | undefined)[][]
      ) => {
        const colWidths = worksheetData[0].map((_, colIndex) => {
          const maxWidth = Math.max(
            ...worksheetData.map((row) => {
              const cell = row[colIndex];
              return cell ? cell.toString().length + 2 : 10;
            })
          );

          if (colIndex === 4) {
            return { wch: Math.min(maxWidth, 150) };
          }

          return { wch: maxWidth };
        });
        worksheet['!cols'] = colWidths;
      };

      // Convertir datos a array 2D para autoFitColumns
      const worksheetData = [
        Object.keys(excelData[0]), // Encabezados
        ...excelData.map((row) => Object.values(row)), // Datos
      ];

      autoFitColumns(ws, worksheetData);

      // Agregar hoja al workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Contactos');

      // Generar archivo y descargar
      const fileName = `contactos-${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);

      toast.success('Contactos descargado exitosamente');
    } catch (error) {
      toast.error('Error al descargar el contacto');
    }
  };

  return (
    <>
      <div className='bg-white rounded-lg shadow-md py-6 p-6 w-full'>
        <div className='flex justify-between items-center mb-6'>
          <h2 className='text-2xl font-bold text-gray-900'>
            Gestión de Contactos
          </h2>

          <Button variant='outline' onClick={handleDownloadContacts}>
            <DownloadIcon className='size-5' />
          </Button>
        </div>

        <CustomTable
          data={data || []}
          columns={columns}
          isLoading={isLoading || deleteMutation.isPending}
          error={!!error}
          sorting={sorting}
          handleSorting={setSorting}
          pageIndex={pageIndex}
          setPageIndex={setPageIndex}
          globalFilter={''}
          globalFilterFn={() => true}
        />
      </div>

      {/* Modal de confirmación de eliminación */}
      {deleteModalIsOpen && currentContact !== null && (
        <CustomAlertDialog
          title='Eliminar contacto'
          description={`¿Estás seguro de querer eliminar el contacto "${currentContact.name}"? Esta acción no se puede deshacer.`}
          cancelButtonText='Cancelar'
          continueButtonText='Eliminar'
          onContinueClick={handleConfirmDelete}
          open={deleteModalIsOpen}
          onCloseDialog={() => {
            setDeleteModalIsOpen(false);
            setCurrentContact(null);
          }}
        />
      )}

      {viewModalIsOpen && currentContact !== null && (
        <ViewContactModal
          open={viewModalIsOpen}
          closeModal={() => {
            setViewModalIsOpen(false);
            setCurrentContact(null);
          }}
          contact={currentContact}
        />
      )}
    </>
  );
};

export { ContactsPage };
