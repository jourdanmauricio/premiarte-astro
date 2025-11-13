import { useQuery } from '@tanstack/react-query';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

import { PDFDownloadLink, PDFViewer } from '@react-pdf/renderer';
import { PDF } from '@/components/dashboard/budgets/pdf/PDF';
import type { Budget } from '@/shared/types';
import { responsiblesService } from '@/lib/services/responsiblesService';
import { budgetsService } from '@/lib/services/budgetsService';
import { customersService } from '@/lib/services/customersServices';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

interface PdfModalProps {
  open: boolean;
  closeModal: () => void;
  budget: Budget;
}

const PdfModal = ({ open, closeModal, budget }: PdfModalProps) => {
  const { data: responsible } = useQuery({
    queryKey: ['responsible', budget.responsibleId],
    queryFn: () =>
      responsiblesService.getResponsibleById(parseInt(budget.responsibleId)),
  });

  const { data: budgetData } = useQuery({
    queryKey: ['budget', budget.id.toString()],
    queryFn: () => budgetsService.getBudgetById(budget.id),
  });

  const { data: customerData } = useQuery({
    queryKey: ['customer', budget.customerId],
    queryFn: () => customersService.getCustomerById(budget.customerId),
  });

  if (!budgetData || !responsible || !customerData) return null;

  // Generar nombre del archivo personalizado
  const fileName = `Presupuesto_${budgetData.name}_${new Date(budgetData.createdAt).toLocaleDateString('es-ES').replace(/\//g, '-')}.pdf`;

  return (
    <Dialog open={open} onOpenChange={closeModal}>
      <DialogContent
        className='max-h-[95%] sm:max-w-7xl h-full overflow-y-auto w-full'
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className='dialog-title'>{`Presupuesto: ${budgetData.name}`}</DialogTitle>
          <DialogDescription />

          <PDFViewer className='h-full' showToolbar={false}>
            <PDF
              budget={budgetData}
              responsible={responsible}
              customerData={customerData}
            />
          </PDFViewer>
          <div className='flex justify-end gap-8 mt-8'>
            <PDFDownloadLink
              document={
                <PDF
                  budget={budgetData}
                  responsible={responsible}
                  customerData={customerData}
                />
              }
              fileName={fileName}
            >
              {({ loading }) => (
                <Button disabled={loading} className='gap-2'>
                  <Download className='h-4 w-4' />
                  {loading ? 'Generando PDF...' : 'Descargar PDF'}
                </Button>
              )}
            </PDFDownloadLink>
            <Button variant='default' onClick={closeModal}>
              Cerrar
            </Button>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export { PdfModal };
