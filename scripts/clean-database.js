#!/usr/bin/env node

import { createClient } from '@libsql/client';
import { config } from 'dotenv';

// Cargar variables de entorno
config();

// Configurar cliente de Turso
const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function cleanDatabase() {
  console.log('🧹 Limpiando base de datos...');
  
  try {
    await turso.execute('DELETE FROM QuoteItem');
    await turso.execute('DELETE FROM Quote');
    await turso.execute('DELETE FROM ProductRelated');
    await turso.execute('DELETE FROM ProductCategory');
    await turso.execute('DELETE FROM ProductImage');
    await turso.execute('DELETE FROM Product');
    await turso.execute('DELETE FROM Category');
    
    await turso.execute('DELETE FROM sqlite_sequence WHERE name IN ("Product", "Category", "Quote", "QuoteItem")');
    
    console.log('✅ Base de datos limpiada exitosamente (manteniendo imágenes)');
  } catch (error) {
    console.error('❌ Error limpiando base de datos:', error);
    throw error;
  }
}

async function main() {
  try {
    await cleanDatabase();
    console.log('🎉 ¡Limpieza completada!');
  } catch (error) {
    console.error('💥 Error ejecutando limpieza:', error);
    process.exit(1);
  }
}

main();
