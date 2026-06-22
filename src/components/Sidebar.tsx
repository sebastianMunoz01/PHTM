import {
  LayoutDashboard,
  Wrench,
  Car,
  Package,
  Users,
  FileSpreadsheet,
  UsersRound,
  LogOut
} from 'lucide-react';
import { User } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: User | null;
  onLogout: () => void;
}

export default function Sidebar({ activeTab, setActiveTab, currentUser, onLogout }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Panel de Control', icon: LayoutDashboard },
    { id: 'ot', label: 'OT', icon: Wrench },
    { id: 'ingresar', label: 'Ingresar Vehículo', icon: Car },
    { id: 'inventario', label: 'Inventario', icon: Package },
    { id: 'clientes', label: 'Clientes', icon: Users },
    { id: 'facturacion', label: 'Facturación', icon: FileSpreadsheet },
    { id: 'usuarios', label: 'Usuarios', icon: UsersRound },
  ];

  const filteredMenuItems = menuItems.filter((item) => {
    if (item.id === 'usuarios') {
      return currentUser?.role !== 'Mecánico' && currentUser?.role !== 'Recepcionista';
    }
    return true;
  });

  return (
    <aside id="app-sidebar" className="w-64 bg-white border-r border-[#dee8ff] flex flex-col justify-between h-screen sticky top-0 font-sans text-brand-on-surface">
      {/* Brand Logo header */}
      <div className="p-6 border-b border-[#dee8ff]">
        <div className="flex items-center space-x-2">
          <span className="text-2xl font-bold tracking-tight text-[#004ac6]">PHTM</span>
        </div>
        <p className="text-xs font-semibold tracking-wider text-[#54647a] mt-1">TALLER MECÁNICO</p>
      </div>

      {/* Navigation menu */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {filteredMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`sidebar-tab-${item.id}`}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-lg text-sm font-semibold transition-all duration-150 text-left ${
                isActive
                  ? 'bg-[#e7eeff] text-[#004ac6]'
                  : 'text-[#434655] hover:bg-[#f0f3ff] hover:text-[#111c2d]'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-[#004ac6]' : 'text-[#737686]'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Live logged in User info inside sidebar footer */}
      <div className="p-4 border-t border-[#dee8ff] bg-[#f9f9ff] flex flex-col gap-3">
        {currentUser ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5 overflow-hidden">
              <div className="w-10 h-10 rounded-full bg-[#dee8ff] flex items-center justify-center text-[#004ac6] font-bold shrink-0 border border-[#b4c5ff]">
                {currentUser.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-[#111c2d] truncate">{currentUser.name}</p>
                <p className="text-[10px] text-[#54647a] font-semibold tracking-wider uppercase truncate">{currentUser.role === 'Encargado' ? 'ENCARGADO DEL TALLER' : currentUser.role}</p>
              </div>
            </div>
            <button
              id="logout-button"
              onClick={onLogout}
              title="Cerrar Sesión"
              className="p-2 text-[#737686] hover:text-[#ba1a1a] rounded-lg hover:bg-red-50 transition-colors shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <p className="text-xs text-center font-bold text-[#434655]">Sin sesión activa</p>
        )}
      </div>
    </aside>
  );
}
