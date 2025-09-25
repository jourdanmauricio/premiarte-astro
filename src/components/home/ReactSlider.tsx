import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel';
import { useEffect, useState } from 'react';
import Autoplay from 'embla-carousel-autoplay';
// import { cn } from '@/lib/utils';
import type { Slide } from '@/components/home/HomePage.astro';

interface props {
  slider: Slide[];
}

const ReactSlider = ({ slider }: props) => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) {
      return;
    }
    setCurrent(api.selectedScrollSnap() + 1);
    api.on('select', () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  return (
    <section className='relative'>
      <div className='w-full'>
        <Carousel
          setApi={setApi}
          className='relative w-full overflow-hidden shadow-2xl'
          opts={{ loop: true }}
          plugins={[
            Autoplay({
              delay: 5000,
              stopOnInteraction: true,
            }) as any,
          ]}
        >
          <CarouselContent>
            {slider.map((slide, index: number) => (
              <CarouselItem key={index}>
                <Card className='relative overflow-hidden rounded-none border-0 p-0 m-0 bg-transparent'>
                  <CardContent className='relative flex aspect-auto h-auto items-center'>
                    <div className='absolute inset-0'>
                      <img
                        src={slide.imageDet.url}
                        alt={slide.imageDet.alt || 'Slide Image'}
                        // fill
                        className='object-cover object-center transition-transform duration-700 hover:scale-105 h-full w-full'
                        // priority
                      />
                      {/* Gradiente dinámico más sofisticado */}
                      <div className='absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent'></div>
                      <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20'></div>
                    </div>

                    {/* Contenido principal con animaciones */}
                    <div className='relative z-10 flex flex-col gap-6 p-8 text-white duration-1000 animate-in slide-in-from-left-8 md:pl-40 lg:pl-40'>
                      {/* Badge opcional para categoría */}
                      <div className='inline-flex w-fit'>
                        {slide.recommended ? (
                          <span className='rounded-full bg-gradient-to-r from-red-500 to-orange-500 px-4 py-1.5 text-sm font-medium text-white shadow-lg'>
                            Destacado
                          </span>
                        ) : (
                          ''
                        )}
                      </div>

                      <h1 className='font-montserrat text-3xl font-semibold leading-tight tracking-tight drop-shadow-2xl md:text-4xl lg:text-5xl xl:text-6xl'>
                        <span className='bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent'>
                          {slide.title}
                        </span>
                      </h1>

                      <div className='max-w-lg text-lg leading-relaxed text-gray-200 drop-shadow-lg md:text-xl'>
                        {slide.text}
                      </div>

                      <div className='mt-4 flex flex-col gap-4 sm:flex-row'>
                        <Button
                          className='group relative overflow-hidden rounded-lg border-0 bg-gradient-to-r from-red-600 to-orange-600 px-8 py-4 font-semibold text-white shadow-xl transition-all duration-300 hover:scale-105 hover:from-red-700 hover:to-orange-700 hover:shadow-2xl'
                          asChild
                        >
                          <a href={slide.buttonLink || '/productos'}>
                            <span className='relative z-10'>
                              {slide.buttonText || 'Ver Productos'}
                            </span>
                            <div className='absolute inset-0 translate-x-[-100%] bg-white/20 transition-transform duration-500 group-hover:translate-x-0'></div>
                          </a>
                        </Button>

                        <Button
                          variant='outline'
                          className='rounded-lg border-white/30 bg-white/10 px-8 py-4 font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:border-white/50 hover:bg-white/20'
                          asChild
                        >
                          <a href='/contacto'>Más Información</a>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>

          <CarouselPrevious className='absolute left-2 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 border-0 bg-white/20 text-white shadow-lg backdrop-blur-sm transition-all duration-300 hover:bg-white/30 md:flex' />

          <CarouselNext className='absolute right-2 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 border-0 bg-white/20 text-white shadow-lg backdrop-blur-sm transition-all duration-300 hover:bg-white/30 md:flex' />
        </Carousel>

        {/* <div className='relative flex items-center justify-center py-6'>
          <div className='absolute -top-10 flex gap-6'>
            {api?.scrollSnapList().map((_, index) => (
              <button
                key={index}
                onClick={() => api?.scrollTo(index)}
                className={cn(
                  'h-3 w-3 rounded-full shadow-lg transition-all duration-300 hover:scale-125',
                  index === current - 1
                    ? 'scale-110 bg-gradient-to-r from-red-500 to-orange-500'
                    : 'bg-white/50 backdrop-blur-sm hover:bg-white/70'
                )}
                aria-label={`Ir al slide ${index + 1}`}
              />
            ))}
          </div>
        </div> */}
      </div>
    </section>
  );
};

export { ReactSlider };
