import { useState } from 'react';
import { FileSpreadsheet, Percent, Calendar, FileText, Search, CreditCard, Eye, FileDown, Check } from 'lucide-react';
import { Invoice } from '../types';

interface BillingViewProps {
  invoices: Invoice[];
  payInvoice: (id: string) => void;
}

export default function BillingView({ invoices, payInvoice }: BillingViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDate, setFilterDate] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 6;

  // Filter logic
  const filteredInvoices = invoices.filter((inv) => {
    const term = searchQuery.toLowerCase();
    const matchesClient = inv.clientName.toLowerCase().includes(term) || inv.clientRut.toLowerCase().includes(term);
    const matchesId = inv.id.toLowerCase().includes(term);
    
    // Simple filter matching
    return matchesClient || matchesId;
  });

  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedInvoices = filteredInvoices.slice(startIndex, startIndex + itemsPerPage);

  // Stats calculation
  const paidInvoices = invoices.filter((i) => i.status === 'PAGADA');
  const pendingInvoices = invoices.filter((i) => i.status === 'PENDIENTE');

  const totalBilledPaid = paidInvoices.reduce((sum, i) => sum + i.total, 0);
  const totalPendingDebt = pendingInvoices.reduce((sum, i) => sum + i.total, 0);

  const averageTicket = invoices.length > 0 ? Math.round(invoices.reduce((sum, i) => sum + i.total, 0) / invoices.length) : 0;

  const triggerExport = () => {
    alert(`Reporte consolidado de Facturación:\n- Total Facturado Recaudado: $${totalBilledPaid.toLocaleString('es-CL')}\n- Deuda en Tránsito: $${totalPendingDebt.toLocaleString('es-CL')}\n- Total Registros: ${invoices.length} documentos emitidos.`);
  };

  return (
    <div id="billing-view" className="space-y-6 font-sans text-brand-on-surface">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-extrabold text-[#111c2d] tracking-tight text-sans">Facturación</h2>
        <p className="text-[#434655] text-sm">Controle los ingresos fiscales, impuestos e historial tributario.</p>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Facturado Mes */}
        <div className="bg-white border border-[#dee8ff] rounded-xl p-6 shadow-sm relative overflow-hidden flex items-center justify-between">
          <div className="flex items-center space-x-5">
            <div className="p-4 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-200/50">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-heavy uppercase tracking-wider text-[#54647a]">Total Facturado Mes</p>
              <p className="text-2xl font-black text-[#111c2d] mt-1">
                ${totalBilledPaid.toLocaleString('es-CL')}
              </p>
              <div className="flex items-center space-x-1.5 mt-1">
                <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                  ▲ +12%
                </span>
                <span className="text-[10px] text-[#737686] font-semibold">vs mes anterior</span>
              </div>
            </div>
          </div>
        </div>

        {/* Facturas pendientes */}
        <div className="bg-white border border-[#dee8ff] rounded-xl p-6 shadow-sm flex items-center justify-between">
          <div className="flex items-center space-x-5">
            <div className="p-4 bg-amber-50 text-amber-600 rounded-xl border border-amber-200/50">
              <FileText className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <p className="text-xs font-heavy uppercase tracking-wider text-[#54647a]">Facturas Pendientes</p>
              <p className="text-2xl font-black text-[#111c2d] mt-1">{pendingInvoices.length}</p>
              <p className="text-[10px] font-bold text-amber-600 mt-0.5">
                Total deuda en tránsito: ${totalPendingDebt.toLocaleString('es-CL')}
              </p>
            </div>
          </div>
        </div>

        {/* Promedio por Ticket */}
        <div className="bg-white border border-[#dee8ff] rounded-xl p-6 shadow-sm flex items-center justify-between">
          <div className="flex items-center space-x-5">
            <div className="p-4 bg-blue-50 text-[#004ac6] rounded-xl border border-blue-200/50">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-heavy uppercase tracking-wider text-[#54647a]">Promedio por Ticket</p>
              <p className="text-2xl font-black text-[#111c2d] mt-1">
                ${averageTicket.toLocaleString('es-CL')}
              </p>
              <p className="text-[10px] font-semibold text-[#737686] mt-0.5">
                Basado en {invoices.length} órdenes y servicios
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Date Box */}
      <div className="bg-[#f0f3ff] border border-[#dee8ff] rounded-xl p-5 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          {/* Cliente search */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#54647a]">Búsqueda rápida</label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#737686]" />
              <input
                id="invoice-search-text"
                type="text"
                placeholder="RUT Cliente o N° Factura..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full text-xs font-semibold bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-3"
              />
            </div>
          </div>

          {/* Date range picker */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#54647a]">Rango de Fecha</label>
            <input
              id="invoice-search-date"
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full text-xs font-semibold bg-white border border-slate-200 rounded-lg px-3 py-3"
            />
          </div>

          <button
            id="btn-apply-billing-filters"
            onClick={() => {
              setCurrentPage(1);
              alert('Filtros aplicados correctamente.');
            }}
            className="bg-[#004ac6] hover:bg-[#2563eb] text-white text-xs font-bold py-3 px-5 rounded-lg transition-colors cursor-pointer text-center h-[46px]"
          >
            Aplicar Filtros
          </button>
        </div>
      </div>

      {/* List of bill logs with invoice report action */}
      <div className="bg-white border border-[#dee8ff] rounded-xl shadow-sm overflow-hidden p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="text-sm font-heavy uppercase tracking-wider text-[#004ac6] font-bold">Listado de Documentos</h3>
          
          <button
            onClick={triggerExport}
            id="btn-generate-billing-pdf"
            className="bg-[#2563eb] hover:bg-[#004ac6] text-white text-xs font-bold py-2.5 px-4 rounded-lg flex items-center space-x-1.5 transition-colors self-start sm:self-auto"
          >
            <FileDown className="w-4 h-4" />
            <span>Generar Reporte de Facturación</span>
          </button>
        </div>

        <div className="overflow-x-auto border border-[#dee8ff] rounded-xl">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-[#dee8ff]">
                <th className="py-3 px-4 font-bold text-[#111c2d] text-xs uppercase tracking-wider">N° Factura / Boleta</th>
                <th className="py-3 px-4 font-bold text-[#111c2d] text-xs uppercase tracking-wider">Fecha Emisión</th>
                <th className="py-3 px-4 font-bold text-[#111c2d] text-xs uppercase tracking-wider">Cliente / Contante</th>
                <th className="py-3 px-4 font-bold text-[#111c2d] text-xs uppercase tracking-wider">Desglose (MO/Rep)</th>
                <th className="py-3 px-4 font-bold text-[#111c2d] text-xs uppercase tracking-wider">Total Final</th>
                <th className="py-3 px-4 font-bold text-[#111c2d] text-xs uppercase tracking-wider">Estado</th>
                <th className="py-3 px-4 text-right font-bold text-[#111c2d] text-xs uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedInvoices.map((inv, idx) => (
                <tr
                  key={inv.id}
                  id={`invoice-row-${inv.id}`}
                  className={`hover:bg-[#dee8ff]/15 transition-colors ${
                    idx % 2 === 0 ? 'bg-white' : 'bg-[#f8fafc]'
                  }`}
                >
                  <td className="py-3.5 px-4 font-black text-[#004ac6]">{inv.id}</td>
                  <td className="py-3.5 px-4 text-slate-500 font-semibold">{inv.date}</td>
                  <td className="py-3.5 px-4">
                    <p className="font-extrabold text-slate-800">{inv.clientName}</p>
                    <p className="text-[10px] text-slate-500 font-mono">{inv.clientRut}</p>
                  </td>
                  <td className="py-3.5 px-4 text-[10px] text-slate-500 space-y-0.5 font-semibold">
                    <p>Mano de Obra (MO): ${inv.moCost.toLocaleString('es-CL')}</p>
                    <p>Repuestos (REP): ${inv.repCost.toLocaleString('es-CL')}</p>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-black text-slate-800 text-sm">
                    ${inv.total.toLocaleString('es-CL')}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`text-[9px] font-black uppercase tracking-wide px-2 py-0.5 rounded-full border ${
                        inv.status === 'PAGADA'
                          ? 'bg-[#e6fcf5] text-emerald-600 border-emerald-200'
                          : 'bg-amber-50 text-amber-600 border-amber-200 animate-pulse'
                      }`}
                    >
                      {inv.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex justify-end items-center space-x-1">
                      {inv.status === 'PENDIENTE' && (
                        <button
                          onClick={() => {
                            payInvoice(inv.id);
                            alert(`¡Factura #${inv.id} marcada como PAGADA con éxito!`);
                          }}
                          id={`pay-inv-${inv.id}`}
                          className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded text-[10px] font-extrabold transition-colors flex items-center space-x-1"
                          title="Registrar Pago"
                        >
                          <Check className="w-3 h-3" />
                          <span>Pagar</span>
                        </button>
                      )}
                      
                      <button
                        onClick={() => alert(`Visualizando PDF interactivo para Factura ${inv.id}:\nCliente: ${inv.clientName}\nFecha: ${inv.date}\nTotal Neto: $${Math.round(inv.total*0.81).toLocaleString('es-CL')} CLP\nIVA (19%): $${Math.round(inv.total*0.19).toLocaleString('es-CL')} CLP\nTotal a pagar: $${inv.total.toLocaleString('es-CL')} CLP`)}
                        className="p-1.5 hover:bg-[#e7eeff] text-[#004ac6] hover:text-[#2563eb] rounded-lg transition-colors inline-block"
                        title="Ver PDF Tributario"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {paginatedInvoices.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 font-semibold">
                    No se encontraron registros tributarios con los criterios elegidos.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 bg-[#f0f3ff] border-t border-[#dee8ff] flex items-center justify-between text-xs font-semibold text-[#54647a] rounded-b-xl">
          <span>
            Mostrando {Math.min(startIndex + 1, filteredInvoices.length)}-{Math.min(startIndex + itemsPerPage, filteredInvoices.length)} de{' '}
            {filteredInvoices.length} facturas
          </span>
          <div className="flex space-x-1">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded border border-[#dee8ff] bg-white disabled:opacity-50 text-[#111c2d] hover:bg-[#dee8ff]"
            >
              Anterior
            </button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
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
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 rounded border border-[#dee8ff] bg-white disabled:opacity-50 text-[#111c2d] hover:bg-[#dee8ff]"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
