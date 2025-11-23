
import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import { Status } from '../../types';
import { Garage, Storage } from '../../types';

interface ServiceDetailModalProps {
  item: Garage | Storage;
  type: 'garage' | 'storage';
  onClose: () => void;
  onSave: (updatedItem: Garage | Storage) => void;
}

const STATUS_TRANSLATIONS: Record<string, string> = {
  [Status.Available]: 'Disponible',
  [Status.Reserved]: 'Reservado',
  [Status.Sold]: 'Vendido',
  'DISPONIBLE': 'Disponible',
  'RESERVADA': 'Reservado',
  'VENDIDA': 'Vendido'
};

const ServiceDetailModal: React.FC<ServiceDetailModalProps> = ({ item, type, onClose, onSave }) => {
  const [editedItem, setEditedItem] = useState<Garage | Storage>({ ...item });
  
  // Normalizar estado inicial
  useEffect(() => {
      let currentStatus = item.status || 'DISPONIBLE';
      // Mapeo simple para asegurar que el select tenga un valor válido del enum o string
      if (currentStatus === 'RESERVADA') currentStatus = Status.Reserved;
      else if (currentStatus === 'VENDIDA') currentStatus = Status.Sold;
      else if (currentStatus === 'DISPONIBLE') currentStatus = Status.Available;
      
      setEditedItem({ ...item, status: currentStatus });
  }, [item]);

  const handleChange = (field: string, value: any) => {
    setEditedItem(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onSave(editedItem);
    onClose();
  };

  const title = type === 'garage' ? `Garaje: ${item.id}` : `Trastero: ${item.id}`;

  return (
    <Modal title={title} onClose={onClose}>
      <div className="space-y-4 p-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <div>
             <label className="block text-xs font-bold text-brand-text-secondary mb-1">ID</label>
             <p className="text-brand-text font-bold">{item.id}</p>
           </div>
           <div>
             <label className="block text-xs font-bold text-brand-text-secondary mb-1">Superficie Útil</label>
             <p className="text-brand-text">{item.usefulArea?.toLocaleString('es-ES')} m²</p>
           </div>
           {type === 'garage' && (
               <div>
                 <label className="block text-xs font-bold text-brand-text-secondary mb-1">Tipo</label>
                 <p className="text-brand-text">{(item as Garage).type || '-'}</p>
               </div>
           )}
        </div>

        <div className="bg-brand-bg-dark p-4 rounded border border-brand-surface space-y-4 mt-4">
            <h4 className="text-sm font-bold text-brand-primary border-b border-brand-surface pb-1">Gestión Comercial</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-medium text-brand-text mb-1">Estado</label>
                    <select 
                        value={editedItem.status || Status.Available}
                        onChange={(e) => handleChange('status', e.target.value)}
                        className="w-full bg-brand-surface text-brand-text rounded p-2 text-sm border border-gray-600 focus:border-brand-primary outline-none"
                    >
                        <option value={Status.Available}>Disponible</option>
                        <option value={Status.Reserved}>Reservado</option>
                        <option value={Status.Sold}>Vendido</option>
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-medium text-brand-text mb-1">Precio (€)</label>
                    <input 
                        type="number"
                        value={editedItem.price || 0}
                        onChange={(e) => handleChange('price', parseFloat(e.target.value))}
                        className="w-full bg-brand-surface text-brand-text rounded p-2 text-sm border border-gray-600 focus:border-brand-primary outline-none"
                    />
                </div>
            </div>

            <div>
                <label className="block text-xs font-medium text-brand-text mb-1">Observaciones</label>
                <textarea 
                    rows={3}
                    value={editedItem.notes || ''}
                    onChange={(e) => handleChange('notes', e.target.value)}
                    className="w-full bg-brand-surface text-brand-text rounded p-2 text-sm border border-gray-600 focus:border-brand-primary outline-none resize-none"
                    placeholder="Escribe aquí notas internas..."
                />
            </div>
        </div>

        <div className="flex justify-end space-x-2 pt-2">
            <button onClick={onClose} className="px-4 py-2 rounded bg-brand-surface hover:bg-gray-600 text-brand-text font-medium text-sm transition-colors">
                Cancelar
            </button>
            <button onClick={handleSave} className="px-4 py-2 rounded bg-brand-primary hover:bg-blue-500 text-white font-bold text-sm transition-colors">
                Guardar Cambios
            </button>
        </div>
      </div>
    </Modal>
  );
};

export default ServiceDetailModal;
