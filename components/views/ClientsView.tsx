
import React, { useState, useMemo, useCallback } from 'react';
import type { Client, AugmentedClient, Project } from '../../types';
import { ClientStatus, ClientType } from '../../types';
import ClientTable from './crm/ClientTable';
import ClientImportModal from '../modals/ClientImportModal';
import { PlusIcon, ArrowDownOnSquareIcon, Cog6ToothIcon, XCircleIcon, QueueListIcon, FunnelSlashIcon, MagnifyingGlassIcon } from '../icons/Icons';
import { normalizeString } from '../../utils';
import Modal from '../ui/Modal';
import ClientDetailModal from '../modals/ClientDetailModal';
import * as XLSX from 'xlsx';
import ClientFilters from './crm/ClientFilters';

const BulkActionsModal: React.FC<{
    selectedClientIds: Set<string>;
    onClose: () => void;
    onSave: (updates: Partial<Client>) => void;
}> = ({ selectedClientIds, onClose, onSave }) => {
    const [status, setStatus] = useState('');
    const [clientType, setClientType] = useState('');
    const [group, setGroup] = useState('');

    const handleSave = () => {
        const updates: Partial<Client> = {};
        if (status) updates.status = status as ClientStatus;
        if (clientType) updates.clientType = clientType as ClientType;
        if (group) updates.group = group;
        onSave(updates);
        onClose();
    };

    return (
        <Modal title={`Acciones para ${selectedClientIds.size} clientes`} onClose={onClose}>
            <div className="space-y-4 p-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium">Cambiar Estado</label>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="mt-1 block w-full bg-brand-surface text-brand-text rounded-md p-2"
                        >
                            <option value="">-- No cambiar --</option>
                            {Object.values(ClientStatus).map((s) => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    </div>
                     <div>
                        <label className="block text-sm font-medium">Cambiar Tipo Cliente</label>
                        <select
                            value={clientType}
                            onChange={(e) => setClientType(e.target.value)}
                            className="mt-1 block w-full bg-brand-surface text-brand-text rounded-md p-2"
                        >
                            <option value="">-- No cambiar --</option>
                            {Object.values(ClientType).map((t) => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>
                    </div>
                </div>
                 <div>
                    <label className="block text-sm font-medium">Asignar Grupo</label>
                    <input
                        type="text"
                        value={group}
                        onChange={(e) => setGroup(e.target.value)}
                        className="mt-1 block w-full bg-brand-surface text-brand-text rounded-md p-2"
                        placeholder="Ej: A, B, VIP..."
                    />
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                    <button onClick={onClose} className="py-2 px-4 rounded-lg bg-brand-surface hover:bg-gray-600">Cancelar</button>
                    <button onClick={handleSave} className="py-2 px-4 rounded-lg bg-brand-primary text-white hover:bg-blue-400">Aplicar</button>
                </div>
            </div>
        </Modal>
    );
};

interface ClientsViewProps {
  clients: AugmentedClient[];
  allProjects: Project[];
  onSaveClient: (client: Client) => Promise<void>;
  onClientImport: (newClients: Client[], updatedClients: Client[]) => Promise<void>;
  onBulkClientUpdate: (clientIds: Set<string>, updates: Partial<Client>) => Promise<void>;
}

const ClientsView: React.FC<ClientsViewProps> = ({
  clients,
  allProjects,
  onSaveClient,
  onClientImport,
  onBulkClientUpdate
}) => {
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isBulkActionsModalOpen, setIsBulkActionsModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<AugmentedClient | Client | null>(null);
  
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [lastSelectedRowId, setLastSelectedRowId] = useState<string | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<Record<string, Set<string>>>({});

  const handleFilterChange = useCallback((filterName: string, value: string) => {
    setFilters(prev => {
      const newSet = new Set(prev[filterName]);
      if (newSet.has(value)) {
        newSet.delete(value);
      } else {
        newSet.add(value);
      }
      return { ...prev, [filterName]: newSet };
    });
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({});
  }, []);
  
  const filteredClients = useMemo(() => {
    const normalizedSearch = normalizeString(searchTerm);
    const hasActiveFilters = Object.values(filters).some((s: Set<string>) => s.size > 0);

    return clients.filter(client => {
      const searchMatch = normalizedSearch === '' || 
        ['name', 'lastName', 'email', 'phone', 'dni'].some(prop => 
          client[prop as keyof AugmentedClient] && normalizeString(String(client[prop as keyof AugmentedClient])).includes(normalizedSearch)
        );

      if (!searchMatch) return false;

      if (!hasActiveFilters) return true;

      return Object.entries(filters).every(([key, selectedValues]) => {
        const setValues = selectedValues as Set<string>;
        if (setValues.size === 0) return true;
        const clientValue = client[key as keyof AugmentedClient];
        return setValues.has(String(clientValue));
      });
    });
  }, [clients, searchTerm, filters]);

  const handleSaveAndCloseDetail = async (updatedClient: Client) => {
    await onSaveClient(updatedClient);
    setSelectedClient(null);
  }

  const handleBulkUpdateAndClose = (updates: Partial<Client>) => {
    onBulkClientUpdate(selectedRows, updates);
    setIsBulkActionsModalOpen(false);
    setSelectedRows(new Set());
  };
  
  const handleSelectVisible = () => setSelectedRows(new Set(filteredClients.map(c => c.id)));
  const handleDeselectAll = () => setSelectedRows(new Set());
  
  const handleExport = () => {
        const clientsToExport = selectedRows.size > 0
            ? clients.filter(c => selectedRows.has(c.id))
            : filteredClients;

        if (clientsToExport.length === 0) {
            alert('No hay clientes para exportar.');
            return;
        }

        const worksheet = XLSX.utils.json_to_sheet(clientsToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Clientes');
        XLSX.writeFile(workbook, `Exportacion_Clientes_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-1 flex min-h-0">
        <ClientFilters 
          clients={clients}
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
        />
        <div className="flex-1 flex flex-col p-4 space-y-3 min-w-0">
          <div className="flex items-center justify-between shrink-0">
            <div className="relative w-1/3 min-w-[200px]">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-brand-text-secondary" />
              <input 
                type="text"
                placeholder="Buscar cliente..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-brand-bg-light text-brand-text rounded-lg p-2 pl-10"
              />
            </div>
            <div className="flex items-center space-x-2">
                <button onClick={() => setSelectedClient({} as Client)} className="flex items-center bg-brand-primary text-white font-semibold py-2 px-3 rounded-lg hover:bg-blue-400 transition-colors text-sm">
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Nuevo Cliente
                </button>
                <button onClick={() => setIsImportModalOpen(true)} className="flex items-center bg-brand-surface text-brand-text-secondary font-semibold py-2 px-3 rounded-lg hover:bg-gray-600 transition-colors text-sm">
                    <ArrowDownOnSquareIcon className="h-4 w-4 mr-2" />
                    Importar
                </button>
                <button onClick={handleExport} className="flex items-center bg-brand-surface text-brand-text-secondary font-semibold py-2 px-3 rounded-lg hover:bg-gray-600 transition-colors text-sm">
                   Exportar
                </button>
            </div>
          </div>
          
          <div className="bg-brand-bg-light p-2 rounded-lg flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-sm font-semibold text-brand-text w-28 text-center">{selectedRows.size} seleccionado{selectedRows.size !== 1 ? 's' : ''}</span>
              <div className="flex items-center space-x-2 ml-4">
                <button onClick={handleSelectVisible} title="Seleccionar Visibles" className="p-2 text-brand-text-secondary hover:text-brand-primary rounded-full hover:bg-brand-surface transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled={filteredClients.length === 0}><QueueListIcon className="h-6 w-6" /></button>
                <button onClick={handleDeselectAll} title="Anular Selección" className="p-2 text-brand-text-secondary hover:text-brand-primary rounded-full hover:bg-brand-surface transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled={selectedRows.size === 0}><XCircleIcon className="h-6 w-6" /></button>
                <button onClick={() => setIsBulkActionsModalOpen(true)} disabled={selectedRows.size === 0} title="Acciones" className="p-2 text-brand-text-secondary hover:text-brand-primary rounded-full hover:bg-brand-surface transition-colors disabled:opacity-50 disabled:cursor-not-allowed"><Cog6ToothIcon className="h-6 w-6" /></button>
              </div>
            </div>
          </div>

          <div className="flex-1 min-h-0 bg-brand-bg-light rounded-lg shadow-lg">
            <ClientTable 
              clients={filteredClients}
              selectedRows={selectedRows}
              setSelectedRows={setSelectedRows}
              lastSelectedRowId={lastSelectedRowId}
              setLastSelectedRowId={setLastSelectedRowId}
              onEditClient={setSelectedClient}
            />
          </div>
        </div>
      </div>
      {isImportModalOpen && <ClientImportModal allClients={clients} allProjects={allProjects} onClose={() => setIsImportModalOpen(false)} onComplete={onClientImport} />}
      {isBulkActionsModalOpen && <BulkActionsModal selectedClientIds={selectedRows} onClose={() => setIsBulkActionsModalOpen(false)} onSave={handleBulkUpdateAndClose} />}
      {selectedClient && <ClientDetailModal client={selectedClient} onClose={() => setSelectedClient(null)} onSave={handleSaveAndCloseDetail} />}
    </div>
  );
}

export default ClientsView;
