
import React, { useState } from 'react';
import Modal from '../ui/Modal';
import { Status } from '../../types';

interface BulkUnitEditModalProps {
    selectedCount: number;
    onClose: () => void;
    onSave: (updates: { status?: Status; price?: number }) => void;
}

const BulkUnitEditModal: React.FC<BulkUnitEditModalProps> = ({ selectedCount, onClose, onSave }) => {
    const [status, setStatus] = useState<Status | ''>('');
    const [priceStr, setPriceStr] = useState('');

    const handleSave = () => {
        const updates: { status?: Status; price?: number } = {};
        if (status) updates.status = status;
        if (priceStr.trim() !== '') {
            const p = parseFloat(priceStr);
            if (!isNaN(p)) updates.price = p;
        }
        onSave(updates);
    };

    return (
        <Modal title="Edición Múltiple de Unidades" onClose={onClose}>
            <div className="space-y-4 p-2">
                <p className="text-sm text-brand-text-secondary">Editando <span className="font-bold text-brand-text">{selectedCount}</span> elementos seleccionados.</p>
                
                <div className="bg-brand-bg-dark p-4 rounded-lg border border-brand-surface space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-brand-text mb-1 uppercase">Estado</label>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value as Status)}
                            className="w-full bg-brand-surface text-brand-text rounded p-2 text-sm border border-gray-600 focus:border-brand-primary outline-none"
                        >
                            <option value="">-- No cambiar --</option>
                            {Object.values(Status).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-brand-text mb-1 uppercase">Precio (€)</label>
                        <input
                            type="number"
                            value={priceStr}
                            onChange={(e) => setPriceStr(e.target.value)}
                            placeholder="No cambiar"
                            className="w-full bg-brand-surface text-brand-text rounded p-2 text-sm border border-gray-600 focus:border-brand-primary outline-none"
                        />
                        <p className="text-[10px] text-brand-text-secondary mt-1">* Se aplicará este precio a todas las unidades seleccionadas.</p>
                    </div>
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                    <button onClick={onClose} className="px-4 py-2 rounded bg-brand-surface hover:bg-gray-600 text-brand-text font-medium text-sm transition-colors">
                        Cancelar
                    </button>
                    <button onClick={handleSave} className="px-4 py-2 rounded bg-brand-primary hover:bg-blue-500 text-white font-bold text-sm transition-colors">
                        Aplicar Cambios
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default BulkUnitEditModal;
