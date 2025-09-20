import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CheckCircle, XCircle, RefreshCw, Download } from 'lucide-react';
import * as XLSX from 'xlsx';

interface UploadResults {
  created: number;
  updated: number;
  errors: number;
  errorDetails: string[];
}

interface UploadResultsModalProps {
  open: boolean;
  onClose: () => void;
  results: UploadResults;
}

export const UploadResultsModal = ({
  open,
  onClose,
  results,
}: UploadResultsModalProps) => {
  const handleDownloadErrors = () => {
    if (results.errorDetails.length === 0) return;

    // Crear datos para el archivo de errores
    const errorData = results.errorDetails.map((error, index) => ({
      Fila: index + 1,
      Error: error,
    }));

    // Crear workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(errorData);

    // Ajustar ancho de columnas
    const colWidths = [
      { wch: 8 }, // Fila
      { wch: 60 }, // Error
    ];
    ws['!cols'] = colWidths;

    // Agregar hoja al workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Errores');

    // Generar archivo y descargar
    const fileName = `errores-carga-${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className='max-w-2xl'>
        <DialogHeader>
          <DialogTitle className='text-2xl font-bold text-gray-900'>
            Resultados de la Carga
          </DialogTitle>
        </DialogHeader>

        <div className='space-y-6'>
          {/* Estadísticas principales */}
          <div className='grid grid-cols-3 gap-4'>
            <div className='bg-green-50 border border-green-200 rounded-lg p-4 text-center'>
              <CheckCircle className='w-8 h-8 text-green-600 mx-auto mb-2' />
              <div className='text-2xl font-bold text-green-600'>
                {results.created}
              </div>
              <div className='text-sm text-green-700'>Productos Creados</div>
            </div>

            <div className='bg-blue-50 border border-blue-200 rounded-lg p-4 text-center'>
              <RefreshCw className='w-8 h-8 text-blue-600 mx-auto mb-2' />
              <div className='text-2xl font-bold text-blue-600'>
                {results.updated}
              </div>
              <div className='text-sm text-blue-700'>
                Productos Actualizados
              </div>
            </div>

            <div className='bg-red-50 border border-red-200 rounded-lg p-4 text-center'>
              <XCircle className='w-8 h-8 text-red-600 mx-auto mb-2' />
              <div className='text-2xl font-bold text-red-600'>
                {results.errors}
              </div>
              <div className='text-sm text-red-700'>Errores</div>
            </div>
          </div>

          {/* Detalles de errores */}
          {results.errorDetails.length > 0 && (
            <div className='space-y-3'>
              <h3 className='text-lg font-semibold text-gray-900'>
                Detalles de Errores
              </h3>
              <div className='bg-red-50 border border-red-200 rounded-lg p-4 max-h-60 overflow-y-auto'>
                <ul className='space-y-2'>
                  {results.errorDetails.map((error, index) => (
                    <li
                      key={index}
                      className='text-sm text-red-700 flex items-start'
                    >
                      <span className='font-medium mr-2 text-red-600'>
                        {index + 1}.
                      </span>
                      <span>{error}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Resumen */}
          <div className='bg-gray-50 border border-gray-200 rounded-lg p-4'>
            <h3 className='text-lg font-semibold text-gray-900 mb-2'>
              Resumen
            </h3>
            <div className='text-sm text-gray-700 space-y-1'>
              <p>
                • Total de filas procesadas:{' '}
                <strong>
                  {results.created + results.updated + results.errors}
                </strong>
              </p>
              <p>
                • Operaciones exitosas:{' '}
                <strong>{results.created + results.updated}</strong>
              </p>
              <p>
                • Tasa de éxito:{' '}
                <strong>
                  {results.created + results.updated + results.errors > 0
                    ? Math.round(
                        ((results.created + results.updated) /
                          (results.created +
                            results.updated +
                            results.errors)) *
                          100
                      )
                    : 0}
                  %
                </strong>
              </p>
            </div>
          </div>

          {/* Botones de acción */}
          <div className='flex justify-end space-x-3'>
            {results.errorDetails.length > 0 && (
              <Button
                variant='outline'
                onClick={handleDownloadErrors}
                className='flex items-center space-x-2'
              >
                <Download className='w-4 h-4' />
                <span>Descargar Errores</span>
              </Button>
            )}
            <Button onClick={onClose} className='px-6'>
              Cerrar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
