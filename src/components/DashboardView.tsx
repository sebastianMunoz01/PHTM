import { Wrench, Car, CheckCircle2, AlertTriangle, Eye, ArrowUpRight } from 'lucide-react';
import { WorkOrder, InventoryItem } from '../types';

interface DashboardViewProps {
  workOrders: WorkOrder[];
  inventory: InventoryItem[];
  setActiveTab: (tab: string) => void;
  onSelectWorkOrder: (order: WorkOrder) => void;
}

export default function DashboardView({
  workOrders,
  inventory,
  setActiveTab,
  onSelectWorkOrder
}: DashboardViewProps) {
  // Counters
  const pendingOrders = workOrders.filter((w) => w.status === 'PENDIENTE');
  const activeOrders = workOrders.filter((w) => w.status === 'EN REPARACIÓN');
  const completedOrders = workOrders.filter((w) => w.status === 'COMPLETADO');

  // Low stock items
  const lowStockItems = inventory.filter((item) => item.currentStock <= item.minStock);

  // Recent activity: last 4 orders
  const recentOrders = [...workOrders]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4);

  // Hardcoded technician workloads but dynamically rendered beautifully
  const techWorkloads = [
    { name: 'Ricardo M. (Box 1)', pct: 85, color: 'bg-[#2563eb]' },
    { name: 'Sergio V. (Box 2)', pct: 40, color: 'bg-[#10b981]' },
    { name: 'Luis G. (Box 3)', pct: 95, color: 'bg-[#ba1a1a]' }
  ];

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'PENDIENTE':
        return 'bg-[#f0f3ff] text-[#54647a] border border-[#c3c6d7]';
      case 'EN REPARACIÓN':
        return 'bg-[#dee8ff] text-[#004ac6] border border-[#b4c5ff]';
      case 'COMPLETADO':
        return 'bg-[#e6fcf5] text-[#10b981] border border-[#a7f3d0]';
      case 'ENTREGADO':
        return 'bg-[#111c2d] text-white';
      default:
        return 'bg-[#f9f9ff] text-[#111c2d]';
    }
  };

  const statusMapLocale = {
    PENDIENTE: 'PENDIENTE',
    'EN REPARACIÓN': 'EN PROCESO',
    COMPLETADO: 'COMPLETADO',
    ENTREGADO: 'ENTREGADO'
  };

  return (
    <div id="dashboard-view" className="space-y-8 font-sans">
      {/* Welcome header banner */}
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-extrabold text-[#111c2d] tracking-tight">Panel de Control</h2>
        <p className="text-[#434655] text-sm">Bienvenido, gestiona el flujo de trabajo de hoy de manera eficiente.</p>
      </div>

      {/* Stats Counter Row & Stock alert summary */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* State column pending */}
        <div id="stat-card-pending" className="bg-white border rounded-xl p-6 border-[#dee8ff] flex items-center space-x-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="p-4 bg-[#f0f3ff] text-[#54647a] rounded-xl">
            <Wrench className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-[#111c2d]">{pendingOrders.length}</p>
            <p className="text-xs font-bold text-[#54647a] uppercase tracking-wider mt-0.5">Órdenes por iniciar</p>
          </div>
        </div>

        {/* State column active */}
        <div id="stat-card-repair" className="bg-white border rounded-xl p-6 border-[#b4c5ff] flex items-center space-x-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="p-4 bg-[#dee8ff] text-[#004ac6] rounded-xl">
            <Car className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-[#004ac6]">{activeOrders.length}</p>
            <p className="text-xs font-bold text-[#54647a] uppercase tracking-wider mt-0.5">En proceso actual</p>
          </div>
        </div>

        {/* State column ready */}
        <div id="stat-card-completed" className="bg-white border rounded-xl p-6 border-[#a7f3d0] flex items-center space-x-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="p-4 bg-[#e6fcf5] text-[#10b981] rounded-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-[#10b981]">{completedOrders.length}</p>
            <p className="text-xs font-bold text-[#54647a] uppercase tracking-wider mt-0.5">Listos para entrega</p>
          </div>
        </div>

        {/* Low Stock alert panel */}
        <div id="dashboard-stock-alert-panel" className="bg-white border border-[#fcd34d] bg-[#fdfaf2] rounded-xl p-5 flex flex-col justify-between shadow-sm lg:col-span-1">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-[#f59e0b] shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-heavy tracking-wider uppercase text-[#f59e0b] font-extrabold">Stock Crítico</span>
              <div className="mt-2 space-y-1">
                {lowStockItems.slice(0, 2).map((item) => (
                  <div key={item.id} className="text-xs text-[#434655]">
                    <span className="font-bold">{item.name}</span>
                    <p className="text-[10px] text-red-600 font-bold">
                      {item.currentStock === 0 ? 'Sin stock' : `Quedan ${item.currentStock} unidades`}
                    </p>
                  </div>
                ))}
                {lowStockItems.length === 0 && (
                  <p className="text-xs text-green-700 font-semibold">Todo el stock está al día</p>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('inventario')}
            className="mt-4 bg-[#f59e0b] hover:bg-[#d97706] text-white text-xs font-bold py-2 px-3 rounded-lg flex items-center justify-center space-x-1.5 transition-colors"
          >
            <span>Ir a Inventario</span>
            <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Main Grid: Actividad Reciente & Sidebar Carga/Eficiencia */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left side: Actividad Reciente */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-[#dee8ff] p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-[#111c2d]">Actividad Reciente</h3>
              <button
                onClick={() => setActiveTab('ot')}
                className="text-[#004ac6] hover:text-[#2563eb] text-xs font-bold hover:underline py-1 px-2 rounded hover:bg-[#f0f3ff]"
              >
                Ver todas
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-[#dee8ff]">
                    <th className="py-3 font-semibold text-[#54647a] text-xs uppercase tracking-wider">ID</th>
                    <th className="py-3 font-semibold text-[#54647a] text-xs uppercase tracking-wider">Vehículo / Patente</th>
                    <th className="py-3 font-semibold text-[#54647a] text-xs uppercase tracking-wider">Cliente</th>
                    <th className="py-3 font-semibold text-[#54647a] text-xs uppercase tracking-wider">Estado</th>
                    <th className="py-3 text-right font-semibold text-[#54647a] text-xs uppercase tracking-wider">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentOrders.map((order, index) => (
                    <tr
                      key={order.id}
                      className={`hover:bg-[#f8fafc] transition-colors ${
                        index % 2 === 0 ? 'bg-white' : 'bg-[#F8FAFC]'
                      }`}
                    >
                      <td className="py-3.5 font-bold text-[#004ac6]">#{order.id}</td>
                      <td className="py-3.5">
                        <div className="font-semibold text-slate-800">
                          {order.vehicleBrand} {order.vehicleModel}
                        </div>
                        <span className="text-[10px] font-bold bg-slate-100 border text-slate-600 px-1.5 py-0.5 rounded uppercase mt-1 inline-block">
                          {order.vehiclePatent}
                        </span>
                      </td>
                      <td className="py-3.5 text-slate-600 font-semibold">{order.clientName}</td>
                      <td className="py-3.5">
                        <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full ${getStatusStyle(order.status)}`}>
                          {statusMapLocale[order.status] || order.status}
                        </span>
                      </td>
                      <td className="py-3.5 text-right">
                        <button
                          onClick={() => {
                            onSelectWorkOrder(order);
                            setActiveTab('ot');
                          }}
                          className="p-1.5 hover:bg-[#e7eeff] text-[#004ac6] hover:text-[#2563eb] rounded-lg transition-colors inline-flex"
                          title="Ver detalle"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right side: Carga de trabajo & Eficiencia */}
        <div className="space-y-6">
          {/* Carga de trabajo card */}
          <div className="bg-white rounded-xl border border-[#dee8ff] p-6 shadow-sm">
            <h3 className="text-lg font-bold text-[#111c2d] mb-5">Carga de Trabajo</h3>
            <div className="space-y-4">
              {techWorkloads.map((tech, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-[#434655]">{tech.name}</span>
                    <span className="text-[#111c2d] font-bold">{tech.pct}%</span>
                  </div>
                  <div className="w-full bg-[#f0f3ff] h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${tech.color}`}
                      style={{ width: `${tech.pct}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Weekly efficiency chart mock */}
          <div className="bg-white rounded-xl border border-[#dee8ff] p-6 shadow-sm">
            <h3 className="text-lg font-bold text-[#111c2d] mb-4">Eficiencia Semanal</h3>
            {/* simple bar representation */}
            <div className="flex justify-between items-end h-32 pt-4 px-2">
              {[
                { day: 'Lun', val: '40%' },
                { day: 'Mar', val: '65%' },
                { day: 'Mié', val: '80%' },
                { day: 'Jue', val: '95%' },
                { day: 'Vie', val: '50%' }
              ].map((item, idx) => (
                <div key={idx} className="flex flex-col items-center flex-1 space-y-2">
                  <div className="w-full px-2 flex justify-center items-end h-20">
                    <div
                      className={`w-6 rounded-t-sm transition-all duration-300 ${
                        idx === 3 ? 'bg-[#004ac6]' : 'bg-[#505f76]'
                      }`}
                      style={{ height: item.val }}
                    ></div>
                  </div>
                  <span className="text-[10px] font-bold text-[#434655]">{item.day}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
