export class Formatter {
  static currency(amount: number, decimals: number = 2): string {
    return new Intl.NumberFormat('es-AR ', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: decimals,
    }).format(amount);
  }
}
