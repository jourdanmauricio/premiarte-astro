import { navItems } from '@/shared/consts';
// import { BlocksRenderer } from '@strapi/blocks-react-renderer';

// type FooterProps = {
//   logoUrl?: string;
//   footer: FooterDto;
// };

export default function Footer() {
  return (
    <footer className='border-t text-muted-foreground'>
      <div className='container px-4 py-8 md:px-6 md:pt-20'>
        <div className='grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4'>
          <div className='space-y-4'>
            <a href='/' className='flex items-center gap-2'>
              {/*  <Image
                src={logoUrl || '/default-logo.png'}
                alt={'Premiearte Logo'}
                width={187}
                height={40}
              /> */}
            </a>
            <p className='text-sm'>
              Your one-stop shop for all pet needs. Quality products for your
              furry friends.
            </p>
            <div className='flex gap-4'>
              {/*  {footer.socialLinks.map((social) => (
                <a
                  key={social.id}
                  href={social.href}
                  className='hover:text-primary'
                  target={social.isExternal ? '_blank' : '_self'}
                >
                  <Image
                    src={`${process.env.STRAPI_HOST}${social.image?.url}`}
                    alt={social.label}
                    width={24}
                    height={24}
                    className='h-5 w-5'
                  />
                  <span className='sr-only'>{social.label}</span>
                </a>
              ))} */}
            </div>
          </div>
          <div className='space-y-4'>
            <h3 className='text-base font-medium text-muted-foreground'>
              Links
            </h3>
            <nav className='flex flex-col space-y-2'>
              {navItems.map((link) => (
                <a
                  key={link.id}
                  href={link.href}
                  className={`text-sm hover:text-primary`}
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>
          <div className='space-y-4'>
            <h3 className='text-base font-medium text-muted-foreground'>
              Acerca de premiarte
            </h3>
            <div className='max-w-[600px] text-muted-foreground md:text-sm'>
              {/* <BlocksRenderer content={footer.description} /> */}
              <p>Acerca de premiarte</p>
              <p>
                Somos una empresa dedicada a brindar asesoramiento a clientes
                con la necesidad de transmitir sentimientos, agasajar personas,
                homenajear instituciones o posicionar una marca. El
                asesoramiento, junto con la creación y el diseño del producto
                adecuado forman parte de nuestra misión y respuesta
                diferenciada. Por lo tanto trabajamos para brindar una respuesta
                personalizada y acorde a cada cliente, pensamos que es la única
                manera de otorgarle valor a nuestros servicios.
              </p>
            </div>
          </div>

          <div className='space-y-4'>
            <h3 className='text-base font-medium text-muted-foreground'>
              Contacto
            </h3>
            <div className='flex flex-col space-y-2 text-sm text-muted-foreground'>
              <p>Calle 70 N° 999 e/ 14 y 15</p>
              <p>La Plata, Buenos Aires - C.P. 1900</p>
              <p>Teléfono: (221) 619-6520</p>
              <p>Email: info@premiarte.com.ar</p>
            </div>
          </div>
        </div>
        <div className='mt-8 border-t pt-8'>
          <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
            <p className='text-xs text-muted-foreground'>
              &copy; {new Date().getFullYear()}{' '}
              {/*{footer.textReserved || 'Premiearte'}.*/}© 2025 Premiarte
              derechos reservados.
            </p>
            <div className='flex gap-4'>
              <a
                href='#'
                className='text-xs text-muted-foreground hover:text-primary'
              >
                Privacy Policy
              </a>
              <a
                href='#'
                className='text-xs text-muted-foreground hover:text-primary'
              >
                Terms of Service
              </a>
              <a
                href='#'
                className='text-xs text-muted-foreground hover:text-primary'
              >
                Cookies Policy
              </a>
            </div>
            <div className='flex items-center gap-2 text-xs text-muted-foreground'>
              Desarrollo
              <a
                href='#'
                target='_blank'
                className='text-xs text-muted-foreground hover:text-primary'
              >
                LumauDev
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
