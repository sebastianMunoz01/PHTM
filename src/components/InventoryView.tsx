import { useState, FormEvent } from 'react';
import { Package, AlertTriangle, Flame, DollarSign, Search, PlusCircle, Edit2, X, Save } from 'lucide-react';
import { InventoryItem } from '../types';

interface InventoryViewProps {
  inventory: InventoryItem[];
  addInventoryItem: (item: Omit<InventoryItem, 'id' | 'sku'>) => InventoryItem;
  updateInventoryItem: (item: InventoryItem) => void;
}

export default function InventoryView({
  inventory,
  addInventoryItem,
  updateInventoryItem
}: InventoryViewProps) {
  const [filterQuery, setFilterQuery] = useState('');
  
  // Modals status
  const [isNewItemModalOpen, setIsNewItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [isConfirmingUpdate, setIsConfirmingUpdate] = useState(false);

  // New item form states
  const [newName, setNewName] = useState('');
  const [newCurrentStock, setNewCurrentStock] = useState<number>(0);
  const [newMinStock, setNewMinStock] = useState<number>(10);
  const [newPrice, setNewPrice] = useState<number>(0);

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 8;

  // Filter items matching name or SKU
  const filteredInventory = inventory.filter(
    (item) =>
      item.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(filterQuery.toLowerCase())
  );

  // Paginate slices
  const totalPages = Math.ceil(filteredInventory.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedInventory = filteredInventory.slice(startIndex, startIndex + itemsPerPage);

  // Dynamic statistics
  const lowStockCount = inventory.filter((item) => item.currentStock > 0 && item.currentStock <= item.minStock).length;
  const noStockCount = inventory.filter((item) => item.currentStock === 0).length;
  const criticalItems = inventory.filter((item) => item.currentStock <= item.minStock);
  
  const totalValuation = inventory.reduce((total, item) => total + item.currentStock * item.unitPrice, 0);
  const formattedValuation = `$${(totalValuation / 1000000).toFixed(1)}M`;

  const getStockBadgeStyle = (current: number, min: number) => {
    if (current === 0) {
      return 'bg-red-100 text-red-600 border border-red-200';
    }
    if (current <= min) {
      return 'bg-amber-100 text-[#f59e0b] border border-amber-200';
    }
    return 'bg-blue-100 text-blue-600 border border-blue-200';
  };

  // Submit operations
  const handleAddNewItem = (e: FormEvent) => {
    e.preventDefault();
    if (!newName) return;

    addInventoryItem({
      name: newName,
      currentStock: Number(newCurrentStock) || 0,
      minStock: Number(newMinStock) || 0,
      unitPrice: Number(newPrice) || 0
    });

    // Reset fields
    setNewName('');
    setNewCurrentStock(0);
    setNewMinStock(10);
    setNewPrice(0);
    setIsNewItemModalOpen(false);
  };

  const handleUpdateItemSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    setIsConfirmingUpdate(true);
  };

  const handleConfirmUpdate = () => {
    if (!editingItem) return;
    updateInventoryItem(editingItem);
    alert('Atención, repuesto modificado');
    setEditingItem(null);
    setIsConfirmingUpdate(false);
  };

  const handleCancelUpdate = () => {
    setIsConfirmingUpdate(false);
  };

  return (
    <div id="inventory-view" className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-extrabold text-[#111c2d] tracking-tight">Inventario de Repuestos</h2>
          <p className="text-[#434655] text-sm">Gestione existencias, precios y alertas de stock mínimo.</p>
        </div>

        <button
          onClick={() => setIsNewItemModalOpen(true)}
          id="btn-add-inventory-item"
          className="bg-[#004ac6] hover:bg-[#2563eb] text-white text-xs font-bold py-3.5 px-5 rounded-xl flex items-center space-x-2 transition-all cursor-pointer self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Agregar Nuevo Ítem</span>
        </button>
      </div>

      {/* Alerta de Reabastecimiento Crítico (Fondo Rojo) */}
      {criticalItems.length > 0 && (
        <div id="urgent-replenishment-alert" className="bg-red-50 border-l-4 border-red-600 rounded-r-xl p-5 shadow-sm space-y-3">
          <div className="flex items-start space-x-3 text-red-800">
            <div className="p-1 px-1.5 bg-red-100 text-[#ba1a1a] rounded mt-0.5 animate-bounce">
              <AlertTriangle className="w-5 h-5 font-black" />
            </div>
            <div>
              <h4 className="text-sm font-black tracking-wider uppercase text-red-900 flex items-center gap-2">
                ¡Alerta Roja: Necesidad Urgente de Reabastecimiento!
              </h4>
              <p className="text-xs text-red-700 font-semibold mt-1">
                Se han detectado {criticalItems.length} repuesto(s) con stock igual o inferior al límite mínimo establecido ({noStockCount} completamente agotados). Proceda a solicitar compras de reposición a la brevedad.
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 pt-1">
            {criticalItems.map((item) => (
              <div 
                key={item.id} 
                className="bg-white border border-red-100 rounded-lg p-2.5 flex flex-col justify-between hover:shadow-xs transition-shadow"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-black text-[#004ac6]">{item.sku}</span>
                    {item.currentStock === 0 ? (
                      <span className="bg-red-600 text-white text-[8px] font-black uppercase px-2 py-0.5 rounded animate-pulse">AGOTADO</span>
                    ) : (
                      <span className="bg-amber-100 text-amber-950 text-[8px] font-bold px-2 py-0.5 rounded">BAJO MÍNIMO</span>
                    )}
                  </div>
                  <p className="text-xs font-bold text-slate-800 mt-1 line-clamp-1">{item.name}</p>
                </div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-50 text-[11px]">
                  <span className="text-slate-500 font-medium">Stock: <b className="text-red-600 font-black">{item.currentStock} UN</b></span>
                  <span className="text-slate-400">Mín: <b>{item.minStock} UN</b></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Bajo Stock */}
        <div className="bg-white border border-[#dee8ff] rounded-xl p-6 flex items-center space-x-5 shadow-sm">
          <div className="p-4 bg-amber-50 text-[#f59e0b] rounded-xl border border-amber-200/50">
            <AlertTriangle className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <p className="text-xs font-heavy uppercase tracking-wider text-[#54647a]">Bajo Stock</p>
            <p className="text-3xl font-black text-[#111c2d] mt-1">{lowStockCount}</p>
          </div>
        </div>

        {/* Sin stock */}
        <div className="bg-white border border-[#dee8ff] rounded-xl p-6 flex items-center space-x-5 shadow-sm">
          <div className="p-4 bg-red-50 text-[#ba1a1a] rounded-xl border border-red-200/50">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-heavy uppercase tracking-wider text-[#54647a]">Sin Stock</p>
            <p className="text-3xl font-black text-[#111c2d] mt-1">{noStockCount}</p>
          </div>
        </div>

        {/* Valoración */}
        <div className="bg-white border border-[#dee8ff] rounded-xl p-6 flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-5">
            <div className="p-4 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-200/50">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-heavy uppercase tracking-wider text-[#54647a]">Valoración</p>
              <p className="text-3xl font-black text-slate-800 mt-1">{formattedValuation}</p>
            </div>
          </div>
          <button
            id="valuation-report-btn"
            onClick={() => alert(`Reporte de Valoración de Activo Fijo: El valor consolidado neto del taller asciende a $${totalValuation.toLocaleString('es-CL')} CLP correspondiente a ${inventory.length} SKUs catalogados.`)}
            className="bg-[#004ac6] hover:bg-[#2563eb] text-white text-[10px] font-black tracking-wider uppercase px-3 py-2 rounded-lg transition-colors"
          >
            Reporte
          </button>
        </div>
      </div>

      {/* Filter box */}
      <div className="bg-white border border-[#dee8ff] rounded-xl p-5 shadow-sm">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#737686]" />
          <input
            id="inventory-search-query"
            type="text"
            placeholder="Filtrar repuestos por SKU, marca o denominación..."
            value={filterQuery}
            onChange={(e) => {
              setFilterQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full text-sm border-slate-200 border rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:border-[#004ac6] focus:ring-1 focus:ring-[#004ac6]"
          />
        </div>
      </div>

      {/* Zebra table of spare parts */}
      <div className="bg-white border border-[#dee8ff] rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-[#dee8ff]">
                <th className="py-4 px-5 font-bold text-[#111c2d] text-xs uppercase tracking-wider">SKU</th>
                <th className="py-4 px-5 font-bold text-[#111c2d] text-xs uppercase tracking-wider">Nombre del Repuesto</th>
                <th className="py-4 px-5 font-bold text-[#111c2d] text-xs uppercase tracking-wider">Stock Actual</th>
                <th className="py-4 px-5 font-bold text-[#111c2d] text-xs uppercase tracking-wider">Stock Mínimo</th>
                <th className="py-4 px-5 font-bold text-[#111c2d] text-xs uppercase tracking-wider">Precio Unitario</th>
                <th className="py-4 px-5 text-right font-bold text-[#111c2d] text-xs uppercase tracking-wider">Modificar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedInventory.map((item, idx) => (
                <tr
                  key={item.id}
                  id={`inventory-row-${item.id}`}
                  className={`hover:bg-[#dee8ff]/20 transition-colors ${
                    idx % 2 === 0 ? 'bg-white' : 'bg-[#F8FAFC]'
                  }`}
                >
                  <td className="py-4 px-5 font-mono text-xs font-extrabold text-[#004ac6]">
                    {item.sku}
                  </td>
                  <td className="py-4 px-5 font-bold text-slate-800">{item.name}</td>
                  <td className="py-4 px-5">
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-full ${getStockBadgeStyle(item.currentStock, item.minStock)}`}>
                      {item.currentStock} UN
                    </span>
                  </td>
                  <td className="py-4 px-5 text-slate-600 font-semibold">{item.minStock} UN</td>
                  <td className="py-4 px-5 font-mono text-slate-800 font-bold">
                    ${item.unitPrice.toLocaleString('es-CL')}
                  </td>
                  <td className="py-4 px-5 text-right">
                    <button
                      onClick={() => setEditingItem(item)}
                      id={`edit-item-pencil-${item.id}`}
                      className="p-1.5 text-[#004ac6] hover:text-[#2563eb] hover:bg-[#e7eeff] rounded-lg transition-colors inline-block"
                      title="Editar repuesto"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {paginatedInventory.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#737686] font-semibold">
                    No se encontraron repuestos con los filtros indicados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info representation */}
        <div className="p-4 bg-[#f0f3ff] border-t border-[#dee8ff] flex items-center justify-between text-xs font-semibold text-[#54647a]">
          <span>
            Mostrando {Math.min(startIndex + 1, filteredInventory.length)}-{Math.min(startIndex + itemsPerPage, filteredInventory.length)} de{' '}
            {filteredInventory.length} repuestos
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

      {/* Modal dialog: AGREGEGAR NUEVO ITEM */}
      {isNewItemModalOpen && (
        <div id="add-item-modal-overlay" className="fixed inset-0 z-50 bg-black/45 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-[#dee8ff] max-w-md w-full overflow-hidden">
            <div className="bg-[#dee8ff] px-6 py-4 flex items-center justify-between border-b border-[#dee8ff]">
              <h3 className="font-extrabold text-[#111c2d]">Agregar Ítem a Inventario</h3>
              <button
                onClick={() => setIsNewItemModalOpen(false)}
                className="p-1 text-[#434655] hover:text-[#ba1a1a] rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddNewItem} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#54647a]">Nombre del Repuesto / Líquido</label>
                <input
                  id="add-item-name"
                  type="text"
                  required
                  placeholder="Ej: Kit Embrague Toyota Yaris"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full text-xs font-semibold border-slate-200 border rounded-lg px-4 py-3"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#54647a]">Stock Inicial</label>
                  <input
                    id="add-item-stock"
                    type="number"
                    min={0}
                    placeholder="0"
                    value={newCurrentStock || ''}
                    onChange={(e) => setNewCurrentStock(Number(e.target.value))}
                    className="w-full text-xs font-semibold border-slate-200 border rounded-lg px-4 py-3"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#54647a]">Stock Mínimo</label>
                  <input
                    id="add-item-min"
                    type="number"
                    min={1}
                    placeholder="10"
                    value={newMinStock || ''}
                    onChange={(e) => setNewMinStock(Number(e.target.value))}
                    className="w-full text-xs font-semibold border-slate-200 border rounded-lg px-4 py-3"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#54647a]">Precio de Venta (CLP)</label>
                <input
                  id="add-item-price"
                  type="number"
                  min={0}
                  placeholder="0"
                  value={newPrice || ''}
                  onChange={(e) => setNewPrice(Number(e.target.value))}
                  className="w-full text-xs font-semibold border-slate-200 border rounded-lg px-4 py-3 text-right"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsNewItemModalOpen(false)}
                  className="px-4 py-2 border rounded-lg text-xs font-bold text-[#434655] hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#004ac6] hover:bg-[#2563eb] text-white rounded-lg text-xs font-bold flex items-center space-x-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Guardar Repuesto</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal dialog: MODIFICAR STOCK/PRECIOS EXISTENTES */}
      {editingItem && (
        <div id="edit-item-modal-overlay" className="fixed inset-0 z-50 bg-black/45 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-[#dee8ff] max-w-md w-full overflow-hidden">
            <div className="bg-[#dee8ff] px-6 py-4 flex items-center justify-between border-b border-[#dee8ff]">
              <div>
                <span className="text-[10px] font-bold text-[#111c2d] uppercase tracking-wider block">ID: {editingItem.sku}</span>
                <h3 className="font-extrabold text-[#111c2d]">Modificar Existencias</h3>
              </div>
              <button
                onClick={() => setEditingItem(null)}
                className="p-1 text-[#434655] hover:text-[#ba1a1a] rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateItemSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#54647a]">Nombre del Repuesto</label>
                <input
                  id="edit-item-name"
                  type="text"
                  required
                  value={editingItem.name}
                  onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                  className="w-full text-xs font-semibold border-slate-200 border rounded-lg px-4 py-3"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#54647a]">Stock Físico</label>
                  <input
                    id="edit-item-stock"
                    type="number"
                    min={0}
                    value={editingItem.currentStock}
                    onChange={(e) => setEditingItem({ ...editingItem, currentStock: Number(e.target.value) })}
                    className="w-full text-xs font-semibold border-slate-200 border rounded-lg px-4 py-3"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#54647a]">Alerta Stock Mínimo</label>
                  <input
                    id="edit-item-min"
                    type="number"
                    min={1}
                    value={editingItem.minStock}
                    onChange={(e) => setEditingItem({ ...editingItem, minStock: Number(e.target.value) })}
                    className="w-full text-xs font-semibold border-slate-200 border rounded-lg px-4 py-3"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#54647a]">Valor Unitario Comercial (CLP)</label>
                <input
                  id="edit-item-price"
                  type="number"
                  min={0}
                  value={editingItem.unitPrice}
                  onChange={(e) => setEditingItem({ ...editingItem, unitPrice: Number(e.target.value) })}
                  className="w-full text-xs font-semibold border-slate-200 border rounded-lg px-4 py-3 text-right"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 border rounded-lg text-xs font-bold text-[#434655] hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#004ac6] hover:bg-[#2563eb] text-white rounded-lg text-xs font-bold flex items-center space-x-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Actualizar Repuesto</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Drawer/Overlay Box (Si / No) */}
      {isConfirmingUpdate && editingItem && (
        <div id="confirm-update-modal-overlay" className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-[#dee8ff] max-w-sm w-full overflow-hidden p-6 text-center space-y-4">
            <div className="mx-auto w-12 h-12 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center border border-amber-200/50">
              <AlertTriangle className="w-6 h-6" />
            </div>
            
            <div className="space-y-1">
              <h4 className="text-base font-extrabold text-[#111c2d]">¿Confirmar modificación?</h4>
              <p className="text-xs text-[#54647a] leading-relaxed">
                ¿Está seguro de que desea aplicar los cambios sobre este repuesto de inventario?
              </p>
            </div>

            <div className="bg-slate-50 rounded-lg p-3 text-left font-sans text-xs border border-slate-100 space-y-1">
              <div className="flex justify-between">
                <span className="text-[#737686] font-semibold">SKU:</span>
                <span className="font-bold text-[#004ac6]">{editingItem.sku}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-[#737686] font-semibold whitespace-nowrap">Nombre:</span>
                <span className="font-semibold text-slate-800 text-right truncate max-w-[180px]">{editingItem.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#737686] font-semibold">Stock:</span>
                <span className="font-semibold text-slate-800">{editingItem.currentStock} UN</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#737686] font-semibold">Precio:</span>
                <span className="font-bold text-slate-800">${editingItem.unitPrice.toLocaleString('es-CL')}</span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                id="btn-confirm-no"
                onClick={handleCancelUpdate}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs transition-colors cursor-pointer"
              >
                No, cancelar
              </button>
              <button
                type="button"
                id="btn-confirm-yes"
                onClick={handleConfirmUpdate}
                className="flex-1 py-2.5 bg-[#004ac6] hover:bg-[#2563eb] text-white font-bold rounded-lg text-xs transition-colors cursor-pointer shadow-sm"
              >
                Sí, guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
