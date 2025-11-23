
import React, { useState } from 'react';
import { CarIcon } from '../icons/Icons';
import { Garage, Status } from '../../types';
import { STATUS_COLORS } from '../../constants';
import ServiceDetailModal from '../modals/ServiceDetailModal';

interface GaragesViewProps {
    garages: Garage[];
    filters: { status: string; type: string; };
    setFilters: any;
    onUpdate: (garage: Garage) => void;
}

export const GARAGES_GROUPS_CONFIG = [
    {
        name: "GARAJES",
        columns: [
            { key: 'id', label: 'ID', type: 'id' },
            { key: 'status', label: 'ESTADO', type: 'status' },
            { key: 'tipo_g', label: 'TIPO', type: 'text' },
            { key: 'const_g', label: 'CONST. G (m²)', type: 'number' },
            { key: 'util_priv_g', label: 'ÚTIL G (m²)', type: 'number' },
            { key: 'zc_rodadura', label: 'ZC RODADURA', type: 'number' },
            { key: 'privzc', label: 'PRIV+ZC', type: 'number' },
            { key: 'calificable_g', label: 'CALIFICABLE G', type: 'number' },
            { key: 'porc_util_priv_g', label: '% PART. G', type: 'percent' },
            { key: 'precio_max_g', label: 'PRECIO G. (€)', type: 'currency' },
        ]
    },
    {
        name: "TRASTEROS VINCULADOS",
        columns: [
            { key: 'trastero_vinc', label: 'TRAST. VINC.', type: 'text' },
            { key: 'const_t', label: 'CONST. T (m²)', type: 'number' },
            { key: 'util_priv_t', label: 'ÚTIL T (m²)', type: 'number' },
            { key: 'calificable_t', label: 'CALIFICABLE T', type: 'number' },
            { key: 'porc_util_priv_t', label: '% PART. T', type: 'percent' },
            { key: 'precio_max_t', label: 'PRECIO T. (€)', type: 'currency' },
        ]
    },
    {
        name: "GESTIÓN",
        columns: [
            { key: 'notes', label: 'OBSERVACIONES', type: 'text' },
        ]
    }
];

const getGroupColorClass = (groupName: string, type: 'main' | 'sub') => {
    if (groupName === "GARAJES") return type === 'main' ? 'bg-taupe-5-main' : 'bg-taupe-5-sub'; 
    if (groupName === "TRASTEROS VINCULADOS") return type === 'main' ? 'bg-taupe-6-main' : 'bg-taupe-6-sub'; 
    return type === 'main' ? 'bg-taupe-2-main' : 'bg-taupe-2-sub'; 
};

const GaragesView: React.FC<GaragesViewProps> = ({ garages, filters, onUpdate }) => {
    const [selectedGarage, setSelectedGarage] = useState<Garage | null>(null);

    if (!garages || garages.length === 0) {
        return <div className="p-4 text-gray-400">No hay datos de garajes disponibles en este proyecto.</div>;
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
            case 'percent':
                return Number(val).toLocaleString('es-ES', { minimumFractionDigits: 6, maximumFractionDigits: 6 });
            default:
                return val;
        }
    };

    const getRowValue = (garage: Garage, key: string) => {
        if (garage[key] !== undefined) return garage[key];
        if (key === 'id') return garage.id;
        if (key === 'status') return garage.status;
        if (key === 'notes') return garage.notes;
        return null;
    };

    return (
        <div className="flex flex-col h-full space-y-2 p-2">
            <div className="shrink-0 flex gap-4 items-center bg-brand-bg-light p-2 rounded border border-brand-surface">
                <CarIcon className="text-brand-primary h-5 w-5" />
                <div>
                    <span className="text-xs text-brand-text-secondary font-bold uppercase block">GARAJES</span>
                    <span className="text-[10px] text-brand-text-secondary">Total: {garages.length} unidades</span>
                </div>
            </div>
            
            <div className="flex-1 overflow-auto bg-brand-bg-dark rounded shadow border border-brand-surface">
                <table className="min-w-full text-xs text-center whitespace-nowrap border-separate border-spacing-0">
                    <thead className="sticky top-0 z-10 text-white uppercase text-[10px]">
                         {/* GROUP HEADERS */}
                        <tr>
                            {GARAGES_GROUPS_CONFIG.map((group) => (
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
                            {GARAGES_GROUPS_CONFIG.map((group) => (
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
                        {garages.map((garage, i) => (
                            <tr key={i} className="hover:bg-brand-surface/30 transition-colors last:border-0">
                                {GARAGES_GROUPS_CONFIG.map(group => (
                                    group.columns.map(col => {
                                        const tdClasses = "px-2 py-1.5 border-b border-white/20";
                                        const val = getRowValue(garage, col.key);
                                        
                                        if (col.key === 'status') {
                                            const status = val || Status.Available;
                                            const colorClass = STATUS_COLORS[status as Status] || 'bg-gray-400 text-white';
                                            return (
                                                <td key={col.key} className={tdClasses}>
                                                    <button 
                                                        onClick={() => setSelectedGarage(garage)}
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
            
            {selectedGarage && (
                <ServiceDetailModal 
                    item={selectedGarage} 
                    type="garage" 
                    onClose={() => setSelectedGarage(null)} 
                    onSave={onUpdate} 
                />
            )}
        </div>
    );
};

export default GaragesView;
