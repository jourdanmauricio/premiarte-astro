const DashboardHomePage = () => {
  return (
    <div>
      <div className='container mx-auto px-4 py-8'>
        <div className='bg-white rounded-lg shadow-md p-6'>
          <div className='flex justify-between items-center mb-6'>
            <h1 className='text-3xl font-bold text-gray-900'>
              Dashboard Administrativo
            </h1>
            {/* <div className='flex items-center space-x-4'>
         <span className='text-gray-600'>Bienvenido, {user.firstName}</span>
         <UserButton />
       </div> */}
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
            <div className='bg-blue-50 p-6 rounded-lg border border-blue-200'>
              <h3 className='text-lg font-semibold text-blue-900 mb-2'>
                Configuración
              </h3>
              <p className='text-blue-700'>
                Gestionar configuración de la página
              </p>
            </div>

            <div className='bg-green-50 p-6 rounded-lg border border-green-200'>
              <h3 className='text-lg font-semibold text-green-900 mb-2'>
                Clientes
              </h3>
              <p className='text-green-700'>Administrar clientes registrados</p>
            </div>

            <div className='bg-yellow-50 p-6 rounded-lg border border-yellow-200'>
              <h3 className='text-lg font-semibold text-yellow-900 mb-2'>
                Presupuestos
              </h3>
              <p className='text-yellow-700'>
                Gestionar solicitudes de presupuestos
              </p>
            </div>

            <div className='bg-purple-50 p-6 rounded-lg border border-purple-200'>
              <h3 className='text-lg font-semibold text-purple-900 mb-2'>
                Órdenes
              </h3>
              <p className='text-purple-700'>Administrar órdenes de compra</p>
            </div>
          </div>

          <div className='bg-gray-50 p-4 rounded-lg'>
            <h2 className='text-xl font-semibold mb-2'>
              Información de sesión:
            </h2>
            <div className='text-sm text-gray-600 space-y-1'>
              {/* <div><strong>Usuario ID:</strong> {user.id}</div>
         <div><strong>Nombre:</strong> {user.firstName}</div>
         <div><strong>Email:</strong> {user.emailAddresses[0].emailAddress}</div>
         <div><strong>Rol:</strong> {user.publicMetadata.role}</div> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { DashboardHomePage };
