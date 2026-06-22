import { Bell, User as UserIcon } from 'lucide-react';
import { User, WorkOrder } from '../types';

interface HeaderProps {
  activeTab: string;
  currentUser: User | null;
  workOrders: WorkOrder[];
}

export default function Header({ activeTab, currentUser, workOrders }: HeaderProps) {
  // map active item to title
  const getTabTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'PHTM | Panel de Control';
      case 'ot':
        return 'PHTM | Gestión de Órdenes de Trabajo';
      case 'ingresar':
        return 'PHTM | Ingresar Vehículo';
      case 'inventario':
        return 'PHTM | Gestión de Inventario';
      case 'clientes':
        return 'PHTM | Registro de Clientes';
      case 'facturacion':
        return 'PHTM | Facturación';
      case 'usuarios':
        return 'PHTM | Gestión de Usuarios';
      default:
        return 'PHTM | Taller Mecánico';
    }
  };

  const pendingCount = workOrders.filter(w => w.status === 'PENDIENTE').length;

  return (
    <header id="app-header" className="h-16 bg-white border-b border-[#dee8ff] flex items-center justify-between px-8 py-3 font-sans">
      <div className="flex items-center">
        <h1 className="text-lg font-bold text-[#004ac6] tracking-tight">{getTabTitle()}</h1>
      </div>

      <div className="flex items-center space-x-6">
        {/* Notification bell */}
        <div className="relative">
          <button id="notification-bell" className="p-2 text-[#434655] hover:text-[#004ac6] rounded-full hover:bg-[#f0f3ff] transition-all relative">
            <Bell className="w-5 h-5" />
            {pendingCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#ffdad6] border border-[#ba1a1a] rounded-full flex items-center justify-center">
                <span className="w-1.5 h-1.5 bg-[#ba1a1a] rounded-full animate-ping absolute"></span>
                <span className="w-1 h-1 bg-[#ba1a1a] rounded-full relative"></span>
              </span>
            )}
          </button>
        </div>

        {/* User identification capsule */}
        {currentUser && (
          <div className="flex items-center space-x-2.5 border-l border-[#dee8ff] pl-6">
            <span className="text-xs font-semibold text-[#434655]">
              {currentUser.name} {currentUser.role ? ` - ${currentUser.role}` : ''}
            </span>
            <div className="w-8 h-8 rounded-full bg-[#f0f3ff] text-[#004ac6] flex items-center justify-center border border-[#dee8ff]" title="Usuario Activo">
              <UserIcon className="w-4 h-4" />
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
