import type { Service, Services } from '@/components/home/HomePage.astro';
import { Card, CardContent } from '@/components/ui/card';

// import { Image } from 'astro:assets';

interface ServicesProps {
  title?: string;
  subtitle?: string;
  services: Service[];
}

const ServicesSection = ({ title, subtitle, services }: ServicesProps) => {
  return (
    <section className='py-20'>
      <div className='container px-4 md:px-6'>
        <h2 className='mb-8 text-center text-2xl font-semibold tracking-tight text-orange-500 md:text-3xl'>
          {title || 'Nuestros Servicios'}
        </h2>
        {subtitle && (
          <p className='mb-8 text-center text-xl font-normal tracking-tight text-orange-100 md:text-xl'>
            {subtitle || 'Servicios destacados'}
          </p>
        )}
        <div className='flex flex-wrap justify-center gap-6'>
          {services.map((serv, index) => (
            <Card
              key={index}
              className='max-w-64 bg-gradient-to-br from-violet-800 to-purple-900 shadow-lg shadow-purple-900/30'
            >
              <CardContent className='flex flex-col items-center px-2 !py-0 text-center'>
                <img
                  src={serv.imageDet.url}
                  alt={serv.imageDet.alt || serv.title}
                  width={100}
                  height={100}
                  className='mb-4 h-10 w-10 brightness-0 invert filter'
                />
                <h3 className='mb-2 text-lg font-semibold'>{serv.title}</h3>
                <div className='text-muted-foreground md:text-sm'>
                  <p>{serv.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export { ServicesSection };
