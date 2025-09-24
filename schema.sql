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
CREATE TABLE IF NOT EXISTS Quote (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  lastName TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  observation TEXT, -- mensaje/observaciones del cliente
  totalAmount INTEGER DEFAULT 0, -- monto total en centavos
  status TEXT DEFAULT 'pending', -- pending, approved, rejected, expired
  userId TEXT, -- ID del usuario de Clerk si está autenticado
  isRead BOOLEAN DEFAULT FALSE,
  expiresAt DATETIME, -- fecha de expiración del presupuesto
  approvedAt DATETIME, -- fecha de aprobación
  rejectedAt DATETIME, -- fecha de rechazo
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabla para los items del presupuesto
CREATE TABLE IF NOT EXISTS QuoteItem (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  quoteId INTEGER NOT NULL,
  productId INTEGER NOT NULL,
  sku TEXT NOT NULL,
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  imageUrl TEXT NOT NULL, -- URL de la imagen del producto
  imageAlt TEXT NOT NULL, -- Alt text de la imagen
  price INTEGER NOT NULL, -- precio unitario en centavos
  quantity INTEGER NOT NULL,
  amount INTEGER NOT NULL, -- precio total del item (price * quantity)
  observation TEXT, -- observaciones específicas del item
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (quoteId) REFERENCES Quote(id) ON DELETE CASCADE,
  FOREIGN KEY (productId) REFERENCES Product(id)
);

-- Índices adicionales
CREATE UNIQUE INDEX IF NOT EXISTS idx_product_sku_unique ON Product(sku) WHERE sku IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_newsletter_email_unique ON NewsletterSubscriber(email);
CREATE INDEX IF NOT EXISTS idx_quote_email ON Quote(email);
CREATE INDEX IF NOT EXISTS idx_quote_status ON Quote(status);
CREATE INDEX IF NOT EXISTS idx_quote_created_at ON Quote(createdAt);
CREATE INDEX IF NOT EXISTS idx_quote_user_id ON Quote(userId);
CREATE INDEX IF NOT EXISTS idx_quote_item_quote_id ON QuoteItem(quoteId);

