
import React, { useState } from 'react';
import { ArchiveBoxIcon } from '../icons/Icons';
import { Storage, Status } from '../../types';
import { STATUS_COLORS } from '../../constants';
import ServiceDetailModal from '../modals/ServiceDetailModal';

interface StoragesViewProps {
    storages: Storage[];
    filters: { status: string; };
    setFilters: any;
    onUpdate: (storage: Storage) => void;
}

export const STORAGES_GROUPS_CONFIG = [
    {
        name: "TRASTEROS",
        columns: [
            { key: 'id', label: 'ID', type: 'id' },
            { key: 'status', label: 'ESTADO', type: 'status' },
            { key: 'usefulArea', label: 'S. ÚTIL (m²)', type: 'number' },
            { key: 'price', label: 'PRECIO MÁX', type: 'currency' },
        ]
    },
    {
        name: "GESTIÓN",
        columns: [
            { key: 'notes', label: 'OBSERVACIONES', type: 'text' },
        ]
    }
];

// Usa el mismo color (Taupe 6 - Rojizo/Burdeos) que "TRASTEROS VINCULADOS" en la vista de Garajes
const getGroupColorClass = (groupName: string, type: 'main' | 'sub') => {
    if (groupName === "TRASTEROS") return type === 'main' ? 'bg-taupe-6-main' : 'bg-taupe-6-sub'; 
    return type === 'main' ? 'bg-taupe-2-main' : 'bg-taupe-2-sub'; // Gestión (Gris)
};

const StoragesView: React.FC<StoragesViewProps> = ({ storages, filters, onUpdate }) => {
    const [selectedStorage, setSelectedStorage] = useState<Storage | null>(null);

    if (!storages || storages.length === 0) {
         return <div className="p-4 text-gray-400">No hay datos de trasteros disponibles en este proyecto.</div>;
    }

    const formatValue = (val: any, type: string) => {
        if (val === undefined || val === null) {
            return <span className="font-extrabold text-red-500 tracking-wider text-[10px] bg-red-900/20 px-1 rounded border border-red-500/30">ERR</span>;
        }
        
        // Gestión de ceros (numéricos o string "0") -> "-"
        if (val === 0 || val === '0') return '-';
        if (val === '') return '-';

        switch (type) {
            case 'currency':
                return Number(val).toLocaleString('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 2 });
            case 'number':
                // Forzar 2 decimales siempre
                return Number(val).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            default:
                return val;
        }
    };

    const getRowValue = (storage: Storage, key: string) => {
        if ((storage as any)[key] !== undefined) return (storage as any)[key];
        return null;
    };

    return (
        <div className="flex flex-col h-full space-y-2 p-2">
            <div className="shrink-0 flex gap-4 items-center bg-brand-bg-light p-2 rounded border border-brand-surface">
                <ArchiveBoxIcon className="text-brand-primary h-5 w-5" />
                <div>
                    <span className="text-xs text-brand-text-secondary font-bold uppercase block">TRASTEROS</span>
                    <span className="text-[10px] text-brand-text-secondary">Total: {storages.length} unidades</span>
                </div>
            </div>
            
            <div className="flex-1 overflow-auto bg-brand-bg-dark rounded shadow border border-brand-surface">
                <table className="min-w-full text-xs text-center whitespace-nowrap border-separate border-spacing-0">
                    <thead className="sticky top-0 z-10 text-white uppercase text-[10px]">
                        {/* GROUP HEADERS */}
                        <tr>
                            {STORAGES_GROUPS_CONFIG.map((group) => (
                                <th 
                                    key={group.name} 
                                    colSpan={group.columns.length} 
                                    className={`${getGroupColorClass(group.name, 'main')} py-1 px-2 border-b border-brand-bg-dark font-bold tracking-wide`}
                                >
                                    {group.name}
                                </th>
                            ))}
                        </tr>
                        {/* COLUMN HEADERS */}
                        <tr>
                            {STORAGES_GROUPS_CONFIG.map((group) => (
                                group.columns.map(col => (
                                    <th 
                                        key={col.key} 
                                        className={`${getGroupColorClass(group.name, 'sub')} py-2 px-2 border-b border-brand-bg-dark font-semibold whitespace-nowrap`}
                                    >
                                        {col.label}
                                    </th>
                                ))
                            ))}
                        </tr>
                    </thead>
                    <tbody className="text-brand-text-secondary text-[11px]">
                        {storages.map((storage, i) => (
                            <tr key={i} className="hover:bg-brand-surface/30 transition-colors last:border-0">
                                {STORAGES_GROUPS_CONFIG.map(group => (
                                    group.columns.map(col => {
                                        const tdClasses = "px-2 py-1.5 border-b border-white/20";
                                        const val = getRowValue(storage, col.key);
                                        
                                        if (col.key === 'status') {
                                            const status = val || Status.Available;
                                            const colorClass = STATUS_COLORS[status as Status] || 'bg-gray-400 text-white';
                                            return (
                                                <td key={col.key} className={tdClasses}>
                                                    <button 
                                                        onClick={() => setSelectedStorage(storage)}
                                                        className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide w-full ${colorClass} hover:opacity-80`}
                                                    >
                                                        {String(status)}
                                                    </button>
                                                </td>
                                            );
                                        }

                                        return (
                                            <td key={col.key} className={`${tdClasses} ${col.key === 'id' ? 'font-bold text-brand-primary bg-brand-surface/10 text-left' : ''}`}>
                                                {formatValue(val, col.type)}
                                            </td>
                                        );
                                    })
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {selectedStorage && (
                <ServiceDetailModal 
                    item={selectedStorage} 
                    type="storage" 
                    onClose={() => setSelectedStorage(null)} 
                    onSave={onUpdate} 
                />
            )}
        </div>
    );
};

export default StoragesView;
