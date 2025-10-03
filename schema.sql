-- Schema para Turso (basado en schema.prisma)

CREATE TABLE IF NOT EXISTS Setting (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Image (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  url TEXT NOT NULL,
  alt TEXT NOT NULL,
  tag TEXT,
  observation TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Category (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  imageId INTEGER NOT NULL,
  featured BOOLEAN DEFAULT FALSE,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (imageId) REFERENCES Image(id)
);

CREATE TABLE IF NOT EXISTS Product (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  price INTEGER NOT NULL,
  description TEXT NOT NULL,
  stock INTEGER NOT NULL,
  isActive BOOLEAN DEFAULT TRUE,
  isFeatured BOOLEAN DEFAULT FALSE,
  retailPrice INTEGER NOT NULL,
  wholesalePrice INTEGER NOT NULL,
  discount INTEGER NOT NULL,
  discountType TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  sku TEXT UNIQUE,
  priceUpdatedAt DATETIME,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabla intermedia para la relación muchos a muchos entre Product e Image
CREATE TABLE IF NOT EXISTS ProductImage (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  productId INTEGER NOT NULL,
  imageId INTEGER NOT NULL,
  order_index INTEGER DEFAULT 0, -- Para ordenar las imágenes del producto
  isPrimary BOOLEAN DEFAULT FALSE, -- Para marcar la imagen principal
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (productId) REFERENCES Product(id) ON DELETE CASCADE,
  FOREIGN KEY (imageId) REFERENCES Image(id) ON DELETE CASCADE,
  UNIQUE(productId, imageId) -- Evita duplicados
);

-- Tabla intermedia para la relación muchos a muchos entre Product y Category
CREATE TABLE IF NOT EXISTS ProductCategory (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  productId INTEGER NOT NULL,
  categoryId INTEGER NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (productId) REFERENCES Product(id) ON DELETE CASCADE,
  FOREIGN KEY (categoryId) REFERENCES Category(id) ON DELETE CASCADE,
  UNIQUE(productId, categoryId) -- Evita duplicados
);

-- Tabla intermedia para productos relacionados
CREATE TABLE IF NOT EXISTS ProductRelated (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  productId INTEGER NOT NULL,
  relatedProductId INTEGER NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (productId) REFERENCES Product(id) ON DELETE CASCADE,
  FOREIGN KEY (relatedProductId) REFERENCES Product(id) ON DELETE CASCADE,
  UNIQUE(productId, relatedProductId) -- Evita duplicados
);

-- Tabla para suscriptores del newsletter
CREATE TABLE IF NOT EXISTS NewsletterSubscriber (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  isActive BOOLEAN DEFAULT TRUE,
  subscribedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  unsubscribedAt DATETIME,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabla para mensajes de contacto
CREATE TABLE IF NOT EXISTS Contact (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT NOT NULL,
  isRead BOOLEAN DEFAULT FALSE,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabla principal para presupuestos
CREATE TABLE IF NOT EXISTS Budget (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customerId INTEGER NOT NULL, 
  responsibleId INTEGER, -- FK al responsable del presupuesto
  type TEXT, 
  observation TEXT, 
  totalAmount INTEGER DEFAULT 0, 
  status TEXT DEFAULT 'pending',
  userId TEXT, 
  isRead BOOLEAN DEFAULT FALSE,
  expiresAt DATETIME, 
  approvedAt DATETIME,
  rejectedAt DATETIME,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customerId) REFERENCES Customer(id),
  FOREIGN KEY (responsibleId) REFERENCES Responsible(id)
);

-- Tabla para los items del presupuesto
CREATE TABLE IF NOT EXISTS BudgetItem (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  budgetId INTEGER NOT NULL,
  productId INTEGER NOT NULL,
  price INTEGER NOT NULL, 
  retailPrice INTEGER NOT NULL, 
  wholesalePrice INTEGER NOT NULL, 
  quantity INTEGER NOT NULL,
  amount INTEGER NOT NULL, 
  observation TEXT, 
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (budgetId) REFERENCES Budget(id) ON DELETE CASCADE,
  FOREIGN KEY (productId) REFERENCES Product(id)
);

-- Índices adicionales
CREATE UNIQUE INDEX IF NOT EXISTS idx_product_sku_unique ON Product(sku) WHERE sku IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_newsletter_email_unique ON NewsletterSubscriber(email);
CREATE INDEX IF NOT EXISTS idx_budget_customer_id ON Budget(customerId);
CREATE INDEX IF NOT EXISTS idx_budget_responsible_id ON Budget(responsibleId);
CREATE INDEX IF NOT EXISTS idx_budget_status ON Budget(status);
CREATE INDEX IF NOT EXISTS idx_budget_created_at ON Budget(createdAt);
CREATE INDEX IF NOT EXISTS idx_budget_user_id ON Budget(userId);
CREATE INDEX IF NOT EXISTS idx_budget_item_budget_id ON BudgetItem(budgetId);

-- Tabla para clientes
CREATE TABLE IF NOT EXISTS Customer (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'retail' CHECK (type IN ('wholesale', 'retail')),
  document TEXT, -- opcional
  address TEXT, -- opcional
  observation TEXT, -- opcional
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Índices para la tabla Customer
CREATE UNIQUE INDEX IF NOT EXISTS idx_customer_email_unique ON Customer(email);
CREATE INDEX IF NOT EXISTS idx_customer_type ON Customer(type);
CREATE INDEX IF NOT EXISTS idx_customer_created_at ON Customer(createdAt);

-- Tabla para responsables
CREATE TABLE IF NOT EXISTS Responsible (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  cuit TEXT NOT NULL UNIQUE,
  condition TEXT NOT NULL,
  observation TEXT, -- opcional
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Índices para la tabla Responsible
CREATE UNIQUE INDEX IF NOT EXISTS idx_responsible_cuit_unique ON Responsible(cuit);
CREATE INDEX IF NOT EXISTS idx_responsible_created_at ON Responsible(createdAt);
