
import React from 'react';
import { ChartBarIcon, TableCellsIcon, BuildingStorefrontIcon, UsersIcon, ChevronLeftIcon, ChevronRightIcon, BuildingOfficeIcon, InformationCircleIcon, CarIcon, ArchiveBoxIcon, PresentationChartLineIcon, MapPinIcon, CommandLineIcon } from './icons/Icons';

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  currentView: string;
  setCurrentView: (view: string) => void;
  isOfflineMode: boolean;
  setIsOfflineMode: (isOffline: boolean) => void;
}

interface NavItemProps {
  icon: React.ReactNode;
  text: string;
  active: boolean;
  isCollapsed: boolean;
  onClick: () => void;
  extraContent?: React.ReactNode;
}

const NavItem: React.FC<NavItemProps> = ({ icon, text, active, isCollapsed, onClick, extraContent }) => (
  <li
    onClick={onClick}
    className={`flex items-center p-3 my-1 rounded-lg cursor-pointer transition-colors duration-200 ${
      active ? 'text-brand-primary' : 'text-brand-text-secondary hover:text-brand-primary'
    }`}
  >
    {icon}
    <span className={`ml-4 transition-opacity duration-300 flex-1 flex items-center justify-between ${isCollapsed ? 'opacity-0 hidden' : 'opacity-100'}`}>
        {text}
        {extraContent}
    </span>
  </li>
);

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, setIsCollapsed, currentView, setCurrentView, isOfflineMode, setIsOfflineMode }) => {
  const navItems = [
    { id: 'general', text: 'Datos Generales', icon: <InformationCircleIcon /> },
    { id: 'dashboard', text: 'Gráficos', icon: <ChartBarIcon /> },
    { id: 'financial', text: 'Finanzas', icon: <PresentationChartLineIcon /> },
    { id: 'table', text: 'Datos de Proyecto', icon: <TableCellsIcon /> },
    { id: 'reservations', text: 'Reservas', icon: <BuildingStorefrontIcon /> },
    { id: 'interactive-map', text: 'Plano Interactivo', icon: <MapPinIcon /> },
    { id: 'garages', text: 'Garajes', icon: <CarIcon /> },
    { id: 'storages', text: 'Trasteros', icon: <ArchiveBoxIcon /> },
    { id: 'clients', text: 'Clientes', icon: <UsersIcon /> },
  ];

  return (
    <aside className={`fixed top-0 left-0 h-full bg-brand-bg-dark text-white flex flex-col transition-all duration-300 z-30 ${isCollapsed ? 'w-20' : 'w-64'}`}>
      <div className="flex items-center justify-between p-4 border-b border-brand-surface h-16">
        {!isCollapsed && <BuildingOfficeIcon className="h-8 w-8 text-brand-primary" />}
        <span className={`text-xl font-bold transition-opacity duration-300 ${isCollapsed ? 'opacity-0 hidden' : 'opacity-100'}`}>AXIS-Z GPI</span>
        <button onClick={() => setIsCollapsed(!isCollapsed)} className="p-1 rounded-full hover:bg-brand-surface">
          {isCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
        </button>
      </div>
      <nav className="flex-1 p-3 overflow-y-auto scrollbar-thin scrollbar-thumb-brand-surface">
        <ul>
          {navItems.map(item => (
            <NavItem
              key={item.id}
              icon={item.icon}
              text={item.text}
              isCollapsed={isCollapsed}
              active={currentView === item.id}
              onClick={() => setCurrentView(item.id)}
            />
          ))}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-brand-surface mt-auto">
        {/* Programmer Item Section */}
         <ul className="mb-4">
            <NavItem
                icon={<CommandLineIcon className={`h-6 w-6 ${currentView === 'programmer' ? 'text-green-400' : 'text-gray-500'}`} />}
                text="Programador"
                active={currentView === 'programmer'}
                isCollapsed={isCollapsed}
                onClick={() => setCurrentView('programmer')}
                extraContent={
                    <span className="relative flex h-3 w-3 ml-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </span>
                }
            />
         </ul>

        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          {!isCollapsed && <span className="text-sm font-semibold">{isOfflineMode ? 'Modo Local' : 'Conectado a Supabase'}</span>}
          <label htmlFor="offline-toggle" className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              id="offline-toggle" 
              className="sr-only peer" 
              checked={isOfflineMode}
              onChange={(e) => setIsOfflineMode(e.target.checked)}
            />
            <div className="w-11 h-6 bg-green-600 rounded-full peer peer-focus:ring-2 peer-focus:ring-green-400 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
          </label>
        </div>
        {!isCollapsed && (
            isOfflineMode ? (
              <p className="text-xs text-yellow-400 mt-2 text-center">
                Modo local activado. Los cambios no se guardarán en la nube.
              </p>
            ) : (
              <p className="text-xs text-green-400 mt-2 text-center">
                Conectado. Cambios guardados en la nube.
              </p>
            )
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
