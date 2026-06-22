import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardView from './components/DashboardView';
import WorkOrdersView from './components/WorkOrdersView';
import NewWorkOrderView from './components/NewWorkOrderView';
import InventoryView from './components/InventoryView';
import ClientsView from './components/ClientsView';
import BillingView from './components/BillingView';
import UsersView from './components/UsersView';
import LoginView from './components/LoginView';
import { useWorkshopState } from './hooks/useWorkshopState';
import { WorkOrder } from './types';

export default function App() {
  const {
    users,
    clients,
    workOrders,
    inventory,
    invoices,
    logs,
    currentUser,
    login,
    logout,
    addWorkOrder,
    updateWorkOrderStatus,
    addClient,
    addInventoryItem,
    updateInventoryItem,
    addUser,
    toggleUserStatus,
    payInvoice
  } = useWorkshopState();

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(null);

  // If user is not logged in, render the login screen
  if (!currentUser) {
    return (
      <LoginView
        onLogin={login}
        presetUsers={users}
      />
    );
  }

  // Switch tabs & reset order helper if needed
  const handleSelectTab = (tab: string) => {
    setActiveTab(tab);
    // Optionally keep or clear work order selection
  };

  const handleSelectWorkOrder = (order: WorkOrder) => {
    setSelectedWorkOrder(order);
    setActiveTab('ot');
  };

  return (
    <div id="workshop-container" className="min-h-screen bg-[#f9f9ff] flex text-brand-on-surface">
      {/* Sidebar navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={handleSelectTab}
        currentUser={currentUser}
        onLogout={logout}
      />

      {/* Main viewport block */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          activeTab={activeTab}
          currentUser={currentUser}
          workOrders={workOrders}
        />

        <main className="p-8 flex-1 overflow-y-auto max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && (
            <DashboardView
              workOrders={workOrders}
              inventory={inventory}
              setActiveTab={handleSelectTab}
              onSelectWorkOrder={handleSelectWorkOrder}
            />
          )}

          {activeTab === 'ot' && (
            <WorkOrdersView
              workOrders={workOrders}
              updateWorkOrderStatus={updateWorkOrderStatus}
              selectedWorkOrder={selectedWorkOrder}
              setSelectedWorkOrder={setSelectedWorkOrder}
              users={users}
            />
          )}

          {activeTab === 'ingresar' && (
            <NewWorkOrderView
              clients={clients}
              users={users}
              addWorkOrder={addWorkOrder}
              addClient={addClient}
              setActiveTab={handleSelectTab}
              setSelectedWorkOrder={setSelectedWorkOrder}
            />
          )}

          {activeTab === 'inventario' && (
            <InventoryView
              inventory={inventory}
              addInventoryItem={addInventoryItem}
              updateInventoryItem={updateInventoryItem}
            />
          )}

          {activeTab === 'clientes' && (
            <ClientsView
              clients={clients}
              addClient={addClient}
            />
          )}

          {activeTab === 'facturacion' && (
            <BillingView
              invoices={invoices}
              payInvoice={payInvoice}
            />
          )}

          {activeTab === 'usuarios' && currentUser?.role !== 'Mecánico' && currentUser?.role !== 'Recepcionista' && (
            <UsersView
              users={users}
              logs={logs}
              currentUser={currentUser}
              addUser={addUser}
              toggleUserStatus={toggleUserStatus}
            />
          )}
        </main>
      </div>
    </div>
  );
}
