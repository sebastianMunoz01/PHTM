import { useState } from 'react';
import { Search, User as UserIcon, Car, Wrench, Calendar, DollarSign, FileText } from 'lucide-react';
import { WorkOrder, OTStatus, User } from '../types';

interface WorkOrdersViewProps {
  workOrders: WorkOrder[];
  updateWorkOrderStatus: (id: string, status: OTStatus) => void;
  selectedWorkOrder: WorkOrder | null;
  setSelectedWorkOrder: (order: WorkOrder | null) => void;
  users: User[];
}

export default function WorkOrdersView({
  workOrders,
  updateWorkOrderStatus,
  selectedWorkOrder,
  setSelectedWorkOrder,
  users,
}: WorkOrdersViewProps) {
  const [activeFilter, setActiveFilter] = useState<string>('Todos');
  const [searchFolio, setSearchFolio] = useState<string>('');
  const [searchPatente, setSearchPatente] = useState<string>('');
  const [searchCliente, setSearchCliente] = useState<string>('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 8;

  // Filter and search logic
  const filteredOrders = workOrders.filter((order) => {
    // Stage state tab filter
    if (activeFilter !== 'Todos' && order.status !== activeFilter) {
      return false;
    }
    // Search fields
    if (searchFolio && !order.id.toLowerCase().includes(searchFolio.toLowerCase())) {
      return false;
    }
    if (searchPatente && !order.vehiclePatent.toLowerCase().includes(searchPatente.toLowerCase())) {
      return false;
    }
    if (searchCliente && !order.clientName.toLowerCase().includes(searchCliente.toLowerCase())) {
      return false;
    }
    return true;
  });

  // Paginated slices
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + itemsPerPage);

  const getStatusStyle = (status: OTStatus) => {
    switch (status) {
      case 'PENDIENTE':
        return 'bg-gray-100 text-[#54647a] border border-[#c3c6d7]';
      case 'EN REPARACIÓN':
        return 'bg-[#dee8ff] text-[#004ac6] border border-[#b4c5ff]';
      case 'COMPLETADO':
        return 'bg-[#e6fcf5] text-[#10b981] border border-[#a7f3d0]';
      case 'ENTREGADO':
        return 'bg-[#263143] text-[#ecf1ff]';
      default:
        return 'bg-gray-100 text-[#111c2d]';
    }
  };

  const statusOptions: OTStatus[] = ['PENDIENTE', 'EN REPARACIÓN', 'COMPLETADO', 'ENTREGADO'];

  return (
    <div id="ot-view" className="space-y-6 font-sans">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-extrabold text-[#111c2d] tracking-tight">Órdenes de Trabajo</h2>
        <p className="text-[#434655] text-sm">Gestiona el flujo de reparaciones y mantenimiento de vehículos.</p>
      </div>

      {/* Main Filter card */}
      <div className="bg-white border border-[#dee8ff] rounded-xl p-6 shadow-sm space-y-6">
        {/* State row filter */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 border-b border-slate-100 pb-5">
          <span className="text-sm font-bold text-[#434655] shrink-0">Filtrar por Estado:</span>
          <div className="flex flex-wrap gap-2">
            {['Todos', 'PENDIENTE', 'EN REPARACIÓN', 'COMPLETADO', 'ENTREGADO'].map((state) => (
              <button
                key={state}
                id={`filter-state-${state}`}
                onClick={() => {
                  setActiveFilter(state);
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  activeFilter === state
                    ? 'bg-[#004ac6] text-white shadow-sm'
                    : 'bg-[#f0f3ff] text-[#54647a] border border-[#dee8ff] hover:bg-[#dee8ff]'
                }`}
              >
                {state === 'Todos' ? 'Todos' : state}
              </button>
            ))}
          </div>
        </div>

        {/* Search fields input grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Folio */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#54647a]">Buscar por Folio</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-[#737686] text-sm font-semibold">
                #
              </span>
              <input
                id="search-folio-input"
                type="text"
                placeholder="Ej: OT-2024-001"
                value={searchFolio}
                onChange={(e) => {
                  setSearchFolio(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full text-sm border-slate-200 border rounded-lg pl-8 pr-3 py-3 focus:outline-none focus:border-[#004ac6] focus:ring-1 focus:ring-[#004ac6]"
              />
            </div>
          </div>

          {/* Patente */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#54647a]">Buscar por Patente</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-[#737686]">
                <Car className="w-4 h-4" />
              </span>
              <input
                id="search-patente-input"
                type="text"
                placeholder="Ej: ABCD-12"
                value={searchPatente}
                onChange={(e) => {
                  setSearchPatente(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full text-sm border-slate-200 border rounded-lg pl-10 pr-3 py-3 focus:outline-none focus:border-[#004ac6] focus:ring-1 focus:ring-[#004ac6]"
              />
            </div>
          </div>

          {/* Nombre de cliente */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#54647a]">Buscar por Nombre de Cliente</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-[#737686]">
                <UserIcon className="w-4 h-4" />
              </span>
              <input
                id="search-cliente-input"
                type="text"
                placeholder="Ej: Juan Pérez"
                value={searchCliente}
                onChange={(e) => {
                  setSearchCliente(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full text-sm border-slate-200 border rounded-lg pl-10 pr-3 py-3 focus:outline-none focus:border-[#004ac6] focus:ring-1 focus:ring-[#004ac6]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Order Listing and Detail Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Table List of OTs */}
        <div className="lg:col-span-2 bg-white border border-[#dee8ff] rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-[#dee8ff] border-b border-[#dee8ff]">
                  <th className="py-4 px-5 font-bold text-[#111c2d] text-xs uppercase tracking-wider">Folio</th>
                  <th className="py-4 px-5 font-bold text-[#111c2d] text-xs uppercase tracking-wider">Patente</th>
                  <th className="py-4 px-5 font-bold text-[#111c2d] text-xs uppercase tracking-wider">Cliente</th>
                  <th className="py-4 px-5 font-bold text-[#111c2d] text-xs uppercase tracking-wider">Mecánico</th>
                  <th className="py-4 px-5 font-bold text-[#111c2d] text-xs uppercase tracking-wider">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedOrders.map((order, idx) => (
                  <tr
                    key={order.id}
                    id={`ot-row-${order.id}`}
                    onClick={() => setSelectedWorkOrder(order)}
                    className={`cursor-pointer transition-colors hover:bg-[#dee8ff]/50 ${
                      selectedWorkOrder?.id === order.id ? 'bg-[#dee8ff]/30' : (idx % 2 === 0 ? 'bg-white' : 'bg-[#F8FAFC]')
                    }`}
                  >
                    <td className="py-4 px-5 font-black text-[#004ac6] hover:underline">
                      #{order.id}
                    </td>
                    <td className="py-4 px-5">
                      <span className="font-mono text-xs font-bold border bg-white px-2 py-1 rounded text-slate-800">
                        {order.vehiclePatent}
                      </span>
                    </td>
                    <td className="py-4 px-5 font-semibold text-slate-800">{order.clientName}</td>
                    <td className="py-4 px-5 text-slate-600 font-medium">{order.assignedTechnicianName}</td>
                    <td className="py-4 px-5">
                      <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full ${getStatusStyle(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {paginatedOrders.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400 font-medium">
                      No se encontraron órdenes de trabajo que coincidan con la búsqueda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination panel footer representation */}
          <div className="p-4 bg-[#f0f3ff] border-t border-[#dee8ff] flex items-center justify-between text-xs font-semibold text-[#54647a]">
            <span>
              Mostrando {Math.min(startIndex + 1, filteredOrders.length)}-{Math.min(startIndex + itemsPerPage, filteredOrders.length)} de{' '}
              {filteredOrders.length} órdenes de trabajo
            </span>
            <div className="flex space-x-1">
              <button
                id="pagination-prev"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded border border-[#dee8ff] bg-white disabled:opacity-50 text-[#111c2d] hover:bg-[#dee8ff]"
              >
                Anterior
              </button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  id={`pagination-page-${i + 1}`}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-1.5 rounded border transition-colors ${
                    currentPage === i + 1
                      ? 'bg-[#004ac6] text-white border-[#004ac6]'
                      : 'bg-white text-slate-700 border-[#dee8ff] hover:bg-[#dee8ff]'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                id="pagination-next"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded border border-[#dee8ff] bg-white disabled:opacity-50 text-[#111c2d] hover:bg-[#dee8ff]"
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>

        {/* Right side: Detailed info for the selected work order */}
        <div className="bg-white border border-[#dee8ff] rounded-xl shadow-sm p-6 space-y-6">
          {selectedWorkOrder ? (
            <div id="ot-detail-panel" className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <span className="text-xs font-bold text-[#434655] tracking-wider uppercase">Ficha de Órden</span>
                  <h3 className="text-xl font-bold text-[#111c2d] truncate">
                    OT #{selectedWorkOrder.id}
                  </h3>
                </div>
                <span className={`text-xs font-black px-2.5 py-1 rounded-full ${getStatusStyle(selectedWorkOrder.status)}`}>
                  {selectedWorkOrder.status}
                </span>
              </div>

              {/* Status transition slider button */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#54647a]">Actualizar Estado</label>
                <div className="grid grid-cols-2 gap-2">
                  {statusOptions.map((v) => (
                    <button
                      key={v}
                      id={`status-toggle-${v}`}
                      onClick={() => updateWorkOrderStatus(selectedWorkOrder.id, v)}
                      className={`text-xs font-bold py-2 px-3 rounded-lg border transition-all ${
                        selectedWorkOrder.status === v
                          ? 'bg-[#004ac6] text-white border-[#004ac6] shadow-inner'
                          : 'bg-slate-50 text-[#54647a] border-slate-200 hover:bg-[#e7eeff] hover:text-[#004ac6]'
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              {/* Vehicle & Client metadata */}
              <div className="p-4 bg-[#f0f3ff] rounded-xl space-y-3.5 text-xs text-slate-700">
                <div className="flex items-start justify-between border-b border-slate-200/50 pb-2">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-[#54647a] uppercase tracking-wider block">Vehículo</span>
                    <span className="font-extrabold text-[#111c2d] text-sm">
                      {selectedWorkOrder.vehicleBrand} {selectedWorkOrder.vehicleModel}
                    </span>
                    <span className="block text-slate-500 font-semibold">Año: {selectedWorkOrder.vehicleYear}</span>
                  </div>
                  <span className="font-mono bg-white font-black text-xs text-slate-800 px-2 py-1 rounded border">
                    {selectedWorkOrder.vehiclePatent}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-[#54647a] uppercase tracking-wider block">Cliente</span>
                  <span className="font-bold text-[#111c2d]">{selectedWorkOrder.clientName}</span>
                  <span className="block text-[#434655] font-medium">RUT: {selectedWorkOrder.clientRut}</span>
                  <span className="block text-[#434655] font-medium">Fono: {selectedWorkOrder.clientPhone}</span>
                </div>
              </div>

              {/* Diagnosis and description */}
              <div className="space-y-4 text-xs">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-[#54647a] uppercase tracking-wider block">Diagnóstico Inicial</span>
                  <p className="bg-[#f9f9ff] border p-3 rounded-lg text-slate-700 leading-relaxed font-semibold">
                    {selectedWorkOrder.initialDiagnosis || 'Sin diagnóstico registrado.'}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-[#54647a] uppercase tracking-wider block">Trabajos a Realizar</span>
                  <p className="bg-[#f9f9ff] border p-3 rounded-lg text-slate-700 leading-relaxed font-semibold">
                    {selectedWorkOrder.requestedServices || 'Sin trabajos especificados.'}
                  </p>
                </div>
              </div>

              {/* assignment metadata */}
              <div className="border-t border-slate-100 pt-4 grid grid-cols-2 gap-4 text-xs font-semibold">
                <div>
                  <span className="text-[10px] font-bold text-[#54647a] uppercase tracking-wider block">Técnico Asignado</span>
                  <div className="mt-1 flex items-center space-x-1 text-[#111c2d]">
                    <Wrench className="w-3.5 h-3.5 text-[#004ac6] shrink-0" />
                    <span className="truncate">{selectedWorkOrder.assignedTechnicianName}</span>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#54647a] uppercase tracking-wider block">Entrega Estimada</span>
                  <div className="mt-1 flex items-center space-x-1 text-[#111c2d]">
                    <Calendar className="w-3.5 h-3.5 text-[#004ac6] shrink-0" />
                    <span>{selectedWorkOrder.estimatedDeliveryDate}</span>
                  </div>
                </div>
              </div>

              {/* budget card meta */}
              <div className="bg-[#e6fcf5] border border-[#a7f3d0] p-4 rounded-xl flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-[#10b981]/15 text-[#10b981] rounded-lg">
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block">Presupuesto Estimado</span>
                    <span className="text-lg font-black text-slate-800">
                      ${selectedWorkOrder.estimatedBudget.toLocaleString('es-CL')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center py-12 text-[#737686]">
              <FileText className="w-12 h-12 text-[#c3c6d7] mb-3.5" />
              <p className="text-sm font-semibold max-w-[200px]">
                Selecciona una orden de trabajo de la lista para ver su ficha de detalle.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
