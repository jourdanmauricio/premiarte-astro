export const getFolderIcon = (folderId: string) => {
  const icons: Record<string, string> = {
    Todas: '📁',
    Categorías: '📂',
    Productos: '📦',
    Páginas: '📄',
    Otros: '🗂️',
  };
  return icons[folderId] || '📁';
};
