export const imageTagsList = [
  { id: 'Todas', description: 'Todas' },
  { id: 'Categorías', description: 'Categorías' },
  { id: 'Productos', description: 'Productos' },
  { id: 'Páginas', description: 'Páginas' },
  { id: 'Otros', description: 'Otros' },
];

export const navItems = [
  { id: 1, label: 'Inicio', href: '/' },
  { id: 2, label: 'Productos', href: '/categoria/productos' },
  { id: 3, label: 'Categorías', href: '/categoria' },
  // { id: 4, label: 'Nosotros', href: '/nosotros' },
  { id: 5, label: 'Contacto', href: '/contacto' },
];

export const navBarLinks = [
  { name: 'Inicio', href: '/' },
  { name: 'Categorías', href: '/categorias' },
  { name: 'Productos', href: '/categoria/productos' },
  // { name: 'Sobre nosotros', href: '/sobre-nosotros' },
  { name: 'Contacto', href: '/contacto' },
];

export const budgetStatusList = [
  {
    id: 'pending',
    description: 'Pendiente',
  },
  {
    id: 'sent',
    description: 'Enviado',
  },
  {
    id: 'approved',
    description: 'Aprobado',
  },
  {
    id: 'closed',
    description: 'Cerrado',
  },
];

export const orderStatusList = [
  { id: 'pending', description: 'Pendiente' },
  { id: 'approved', description: 'Aprobado' },
  { id: 'rejected', description: 'Rechazado' },
  { id: 'expired', description: 'Expirado' },
];

export const customerTypeList = [
  { id: 'wholesale', description: 'Mayorista' },
  { id: 'retail', description: 'Minorista' },
];

export const operationsList = [
  { id: 'add', description: 'Incrementar' },
  { id: 'subtract', description: 'Decrementar' },
];
