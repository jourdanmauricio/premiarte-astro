import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from '@react-pdf/renderer';
import type { Budget, Customer, Responsible } from '@/shared/types';

interface PDFProps {
  budget: Budget;
  responsible: Responsible | undefined;
  customerData: Customer | undefined;
}

const styles = StyleSheet.create({
  page: {
    padding: 40,
    width: '100%',
  },
  headerContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    width: '100%',
  },
  headerLeftContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 10,
    width: '100%',
  },
  logoContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoImg: {
    width: '48',
    height: '48',
  },
  logoText: {
    fontSize: 30,
    fontFamily: 'Helvetica',
    fontWeight: '500',
  },
  rightContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 10,
    width: '100%',
  },
  budgetText: {
    fontSize: 16,
    fontFamily: 'Helvetica',
    fontWeight: '600',
    paddingHorizontal: 50,
    paddingVertical: 10,
    backgroundColor: '#c0c0c0',
    color: '#fff',
  },
  text: {
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  // Estilos para la tabla de productos
  productsTable: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    marginTop: 30,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  tableHeader: {
    display: 'flex',
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  tableRow: {
    display: 'flex',
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tableCell: {
    fontSize: 9,
    padding: 8,
    fontFamily: 'Helvetica',
  },
  cellProduct: {
    flex: 6,
  },
  cellQuantity: {
    flex: 1.5,
    textAlign: 'right',
  },
  cellPrice: {
    flex: 1.5,
    textAlign: 'right',
  },
  cellTotal: {
    flex: 1,
    textAlign: 'right',
  },
  headerCell: {
    fontWeight: 'bold',
    fontSize: 9,
  },
  // Estilos para el total
  totalContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
  },
  totalText: {
    fontSize: 12,
    fontFamily: 'Helvetica',
    fontWeight: '500',
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  customerContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 5,
    width: '100%',
  },
  customerText: {
    fontSize: 12,
    fontFamily: 'Helvetica',
  },
  localContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 5,
    width: '100%',
    marginTop: 30,
  },
  localText: {
    fontSize: 8,
    fontFamily: 'Helvetica',
  },
});

export const PDF = ({ budget, responsible, customerData }: PDFProps) => {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <Document>
      <Page size='A4' style={styles.page}>
        <View style={styles.headerContainer}>
          <View style={styles.headerLeftContainer}>
            <View style={styles.logoContainer}>
              <Image
                src='https://res.cloudinary.com/dn7npxeof/image/upload/v1758745993/premiarte/zwk5kvupzxwgna5s8uxx.png'
                style={styles.logoImg}
              />
              <Text style={styles.logoText}>PremiArte</Text>
            </View>
            <View>
              <Text style={[styles.text, { paddingBottom: 5 }]}>
                {responsible?.name}
              </Text>
              <Text style={styles.text}>
                {responsible?.cuit} {responsible?.condition}
              </Text>
            </View>
          </View>
          <View style={styles.rightContainer}>
            <Text style={styles.budgetText}>Presupuesto</Text>
            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'flex-start',
                gap: 10,
                width: '70%',
              }}
            >
              <Text style={[styles.text, { width: '50%' }]}>Fecha:</Text>
              <Text style={[styles.text, { width: '50%', textAlign: 'right' }]}>
                {formatDate(budget.createdAt)}
              </Text>
            </View>
            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'flex-end',
                gap: 10,
                width: '70%',
              }}
            >
              <Text style={[styles.text, { width: '50%' }]}>
                N° de presupuesto:
              </Text>
              <Text style={[styles.text, { width: '50%', textAlign: 'right' }]}>
                {budget.id}
              </Text>
            </View>
          </View>
        </View>
        {/* Cliente */}
        <View style={styles.customerContainer}>
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'flex-start',
              width: '100%',
              marginTop: 30,
              gap: 10,
            }}
          >
            <Text
              style={[styles.text, { width: '15%', fontWeight: 'semibold' }]}
            >
              Presupuesto a:
            </Text>
            <Text style={[styles.text, { width: '85%' }]}>
              {customerData?.name}
            </Text>
          </View>
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'flex-start',
              gap: 10,
              width: '100%',
            }}
          >
            <Text
              style={[styles.text, { width: '15%', fontWeight: 'semibold' }]}
            >
              Email:
            </Text>
            <Text style={[styles.text, { width: '80%' }]}>
              {customerData?.email}
            </Text>
          </View>
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'flex-start',
              gap: 10,
              width: '100%',
            }}
          >
            <Text
              style={[styles.text, { width: '15%', fontWeight: 'semibold' }]}
            >
              Teléfono:
            </Text>
            <Text style={[styles.text, { width: '85%' }]}>
              {customerData?.phone}
            </Text>
          </View>

          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'flex-start',
              gap: 10,
              width: '100%',
            }}
          >
            <Text
              style={[styles.text, { width: '15%', fontWeight: 'semibold' }]}
            >
              Dirección:
            </Text>
            <Text style={[styles.text, { width: '85%' }]}>
              {customerData?.address}
            </Text>
          </View>

          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'flex-start',
              gap: 10,
              width: '100%',
            }}
          >
            <Text
              style={[styles.text, { width: '15%', fontWeight: 'semibold' }]}
            >
              Observación:
            </Text>
            <Text style={[styles.text, { width: '85%' }]}>
              {budget.observation}
            </Text>
          </View>
        </View>
        {/* Tabla de productos */}
        {budget.items && budget.items.length > 0 && (
          <View style={styles.productsTable}>
            {/* Header de la tabla */}
            <View style={styles.tableHeader}>
              <Text
                style={[
                  styles.tableCell,
                  styles.headerCell,
                  styles.cellProduct,
                ]}
              >
                DESCRIPCIÓN
              </Text>

              <Text
                style={[
                  styles.tableCell,
                  styles.headerCell,
                  styles.cellQuantity,
                ]}
              >
                CANTIDAD
              </Text>
              <Text
                style={[styles.tableCell, styles.headerCell, styles.cellPrice]}
              >
                PRECIO UNIT.
              </Text>
              <Text
                style={[styles.tableCell, styles.headerCell, styles.cellTotal]}
              >
                TOTAL
              </Text>
            </View>

            {/* Filas de productos */}
            {budget.items.map((item, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={[styles.tableCell, styles.cellProduct]}>
                  {item.name}
                </Text>

                <Text style={[styles.tableCell, styles.cellQuantity]}>
                  {item.quantity}
                </Text>
                <Text style={[styles.tableCell, styles.cellPrice]}>
                  {item.price}
                </Text>
                <Text style={[styles.tableCell, styles.cellTotal]}>
                  {item.amount}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Total del presupuesto */}
        <View style={styles.totalContainer}>
          <Text style={styles.totalText}>Total: {budget.totalAmount}</Text>
        </View>

        {/* Datos del local */}
        <View style={styles.localContainer}>
          <Text style={styles.localText}>Calle 70 N° 999 e/ 14 y 15</Text>
          <Text style={styles.localText}>
            La Plata, Buenos Aires - C.P. 1900
          </Text>
          <Text style={styles.localText}>Teléfono: (221) 619-6520</Text>
          <Text style={styles.localText}>Email: premiartelp@gmail.com</Text>
          <Text style={styles.localText}>www.premiarte.com.ar</Text>
        </View>
      </Page>
    </Document>
  );
};
