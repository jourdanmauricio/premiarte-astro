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

// Datos de categorías
const categoriesData = [
  {
    name: 'Banderas',
    slug: 'banderas',
    description: 'Banderas institucionales, corporativas y promocionales para eventos especiales y representación de marcas con calidad premium',
    featured: false,
  },
  {
    name: 'Boligrafos',
    slug: 'boligrafos',
    description: 'Bolígrafos personalizados de alta calidad ideales para regalos corporativos, eventos y promociones empresariales duraderas',
    featured: false,
  },
  {
    name: 'Copas',
    slug: 'copas',
    description: 'Copas trofeo elegantes para competencias deportivas, ceremonias de premiación y reconocimientos especiales con diseño exclusivo',
    featured: false,
  },
  {
    name: 'Cristales',
    slug: 'cristales',
    description: 'Figuras, premios y piezas en cristal de alta calidad con grabados precisos para ocasiones especiales y reconocimientos',
    featured: false,
  },
  {
    name: 'Cuadros',
    slug: 'cuadros',
    description: 'Cuadros conmemorativos, diplomas y reconocimientos enmarcados con materiales premium para decoración y homenajes especiales',
    featured: false,
  },
  {
    name: 'Enmarcado',
    slug: 'enmarcado',
    description: 'Servicio profesional de enmarcado para diplomas, fotografías y obras de arte con variedad de estilos y materiales disponibles',
    featured: false,
  },
  {
    name: 'Escritura',
    slug: 'escritura',
    description: 'Artículos de escritura personalizados incluyendo portaminas, marcadores y sets ejecutivos para regalos empresariales de calidad',
    featured: false,
  },
  {
    name: 'Grabado',
    slug: 'grabado',
    description: 'Servicios de grabado láser y tradicional sobre metales, cristales y plásticos para personalización precisa de productos',
    featured: false,
  },
  {
    name: 'Indumentaria',
    slug: 'indumentaria',
    description: 'Ropa corporativa, uniformes y prendas promocionales personalizadas con bordado y estampado de alta durabilidad y calidad',
    featured: false,
  },
  {
    name: 'Llaveros',
    slug: 'llaveros',
    description: 'Llaveros personalizados en diversos materiales y diseños ideales para regalos promocionales, eventos y recuerdos corporativos',
    featured: false,
  },
  {
    name: 'Mates',
    slug: 'mates',
    description: 'Mates personalizados, sets de mate y yerbera con diseños exclusivos para regalos tradicionales y promociones especiales',
    featured: false,
  },
  {
    name: 'Medallas',
    slug: 'medallas',
    description: 'Medallas deportivas, conmemorativas y de reconocimiento en metales nobles con terminaciones de alta calidad y durabilidad',
    featured: false,
  },
  {
    name: 'Merchandising',
    slug: 'merchandising',
    description: 'Productos promocionales y merchandising corporativo para estrategias de marketing, fidelización de clientes y eventos especiales',
    featured: false,
  },
  {
    name: 'Placas',
    slug: 'placas',
    description: 'Placas recordatorias, identificatorias y conmemorativas en bronce, aluminio y acero para interiores y exteriores duraderas',
    featured: false,
  },
  {
    name: 'Placas Profesionales',
    slug: 'placas-profesionales',
    description: 'Placas para consultorios, profesionales independientes y empresas con diseños elegantes y información grabada permanentemente',
    featured: false,
  },
  {
    name: 'Plaquetas',
    slug: 'plaquetas',
    description: 'Plaquetas conmemorativas en metales nobles para reconocimientos, aniversarios y homenajes especiales con grabados precisos',
    featured: false,
  },
  {
    name: 'Plaquetas Enmarcadas',
    slug: 'plaquetas-enmarcadas',
    description: 'Plaquetas enmarcadas en madera con vidrio para reconocimientos institucionales, jubilaciones y eventos corporativos importantes',
    featured: false,
  },
  {
    name: 'Platos y Bandejas',
    slug: 'platos-y-bandejas',
    description: 'Platos y bandejas grabadas para aniversarios, bodas y eventos especiales con diseños personalizados y elegancia distintiva',
    featured: false,
  },
  {
    name: 'Premios',
    slug: 'premios',
    description: 'Premios y reconocimientos especiales en diversos materiales para ceremonias, logros destacados y eventos corporativos memorables',
    featured: false,
  },
  {
    name: 'Protección Sanitaria',
    slug: 'proteccion-sanitaria',
    description: 'Elementos de protección e higiene personalizados para empresas, instituciones y cumplimiento de protocolos sanitarios actuales',
    featured: false,
  },
  {
    name: 'Regaleria',
    slug: 'regaleria',
    description: 'Amplia variedad de regalos corporativos y personales para todas las ocasiones con opciones de personalización y calidad garantizada',
    featured: false,
  },
  {
    name: 'Sellos',
    slug: 'sellos',
    description: 'Sellos personalizados para oficinas, profesionales y empresas con diferentes tipos de entintado y diseños a medida',
    featured: false,
  },
  {
    name: 'Trofeos',
    slug: 'trofeos',
    description: 'Trofeos deportivos, académicos y corporativos en diversos estilos y tamaños para reconocer logros y competencias importantes',
    featured: false,
  },
];

async function seedCategories() {
  console.log('📂 Creando categorías con imagen ID = 1...');
  
  const categoryIds = [];
  const imageId = 1; // Usar la imagen existente
  
  for (const category of categoriesData) {
    try {
      const { rows } = await turso.execute({
        sql: `INSERT INTO Category (name, slug, description, imageId, featured) VALUES (?, ?, ?, ?, ?) RETURNING id`,
        args: [category.name, category.slug, category.description, imageId, category.featured]
      });
      
      const categoryId = rows[0]?.id;
      categoryIds.push(categoryId);
      console.log(`  ✅ Categoría creada: ${category.name} (ID: ${categoryId})`);
    } catch (error) {
      console.error(`  ❌ Error creando categoría ${category.name}:`, error);
      throw error;
    }
  }
  
  return categoryIds;
}

async function main() {
  try {
    console.log('🌱 Creando categorías...\n');
    
    const categoryIds = await seedCategories();
    console.log('');
    
    // Resumen
    console.log('📊 Resumen:');
    console.log(`  • ${categoryIds.length} categorías creadas`);
    console.log(`  • ${categoriesData.filter(c => c.featured).length} categorías destacadas`);
    console.log(`  • Usando imagen ID = 1`);
    console.log('');
    console.log('🎉 ¡Categorías creadas exitosamente!');
    
  } catch (error) {
    console.error('💥 Error creando categorías:', error);
    process.exit(1);
  }
}

main();
