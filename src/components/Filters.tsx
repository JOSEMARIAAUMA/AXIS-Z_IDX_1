
import React, { useMemo } from 'react';
import type { Project, FiltersState } from '../types';
import { Status } from '../types';
import { FunnelSlashIcon } from './icons/Icons';
import HoverDropdown from './ui/HoverDropdown';

interface FiltersProps {
  project: Project;
  filters: FiltersState;
  setFilters: React.Dispatch<React.SetStateAction<FiltersState>>;
  showPriceRangeFilter?: boolean;
}

// DUPLICADO CONTROLADO: Parser robusto para asegurar consistencia con Dashboard y ProjectHeader
const robustPriceParser = (val: any): number => {
    if (typeof val === 'number') return val;
    if (!val) return 0;
    
    let str = String(val).trim();
    str = str.replace(/[€$£\s]/g, '');

    // Regex estricta para formato español
    const isStrictSpanish = /^-?\d{1,3}(\.\d{3})+(\,\d+)?$/.test(str);
    
    if (isStrictSpanish) {
        str = str.replace(/\./g, '').replace(',', '.');
    } else {
        const hasDot = str.includes('.');
        const hasComma = str.includes(',');

        if (hasDot && hasComma) {
            if (str.lastIndexOf(',') > str.lastIndexOf('.')) {
                 str = str.replace(/\./g, '').replace(',', '.');
            } else {
                 str = str.replace(/,/g, '');
            }
        } else if (hasComma) {
            str = str.replace(',', '.');
        } else if (hasDot) {
            const dotCount = (str.match(/\./g) || []).length;
            if (dotCount > 1) {
                 str = str.replace(/\./g, '');
            } else {
                 const parts = str.split('.');
                 if (parts[1] && parts[1].length === 3) {
                     str = str.replace(/\./g, '');
                 }
            }
        }
    }
    const result = parseFloat(str);
    return isNaN(result) ? 0 : result;
};

const Filters: React.FC<FiltersProps> = ({ project, filters, setFilters, showPriceRangeFilter = false }) => {
    
    const filterOptions = useMemo(() => {
        const units = project.units || [];
        const getUniqueSorted = (key: keyof typeof units[0], numeric = false): (string | number)[] => {
            const rawValues = units.map(u => u[key]).filter(v => v !== null && v !== undefined && v !== '');
            const unique = [...new Set(rawValues)];
            if (numeric) {
                return unique.sort((a, b) => Number(a) - Number(b)) as number[];
            }
            return unique.sort((a,b) => String(a).localeCompare(String(b))) as (string | number)[];
        };

        return {
            buildings: getUniqueSorted('building'),
            floors: getUniqueSorted('floor', true),
            bedrooms: getUniqueSorted('bedrooms', true),
            statuses: Object.values(Status),
            types: getUniqueSorted('type'),
            positions: getUniqueSorted('position'),
            orientations: getUniqueSorted('orientation'),
        };
    }, [project.units]);

    // Lógica dinámica para rangos de precios usando parser robusto
    const priceRangeOptions = useMemo(() => {
        const prices = project.units
            .map(u => robustPriceParser(u.price))
            .filter(p => p > 0);
            
        if (prices.length === 0) return [];

        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);

        const minRounded = Math.floor(minPrice / 10000) * 10000;
        let maxRounded = Math.ceil(maxPrice / 10000) * 10000;
        if (maxRounded <= minRounded) maxRounded += 10000;
        
        const step = (maxRounded - minRounded) / 4;

        return Array.from({ length: 4 }).map((_, i) => {
            const start = minRounded + (i * step);
            const end = minRounded + ((i + 1) * step);
            return {
                value: `${start}-${end}`,
                label: `${(start/1000).toLocaleString('es-ES', {maximumFractionDigits: 1})}k - ${(end/1000).toLocaleString('es-ES', {maximumFractionDigits: 1})}k €`
            };
        });
    }, [project.units]);

    const handleFilterChange = (filterName: keyof FiltersState, value: string) => {
        setFilters(prev => ({ ...prev, [filterName]: value }));
    };

    const clearFilters = () => {
        setFilters({
            building: '',
            floor: '',
            bedrooms: '',
            status: '',
            type: '',
            position: '',
            orientation: '',
            priceRange: '',
        });
    };

    const dropdownClass = "flex-1 min-w-[90px] max-w-[200px]";

    return (
        <div className="w-full">
            <div className="flex flex-wrap gap-2 items-end">
                <HoverDropdown className={dropdownClass} label="Edificio" options={filterOptions.buildings} value={filters.building} onChange={value => handleFilterChange('building', value)} />
                <HoverDropdown className={dropdownClass} label="Planta" options={filterOptions.floors} value={filters.floor} onChange={value => handleFilterChange('floor', value)} />
                <HoverDropdown className={dropdownClass} label="Dormitorios" options={filterOptions.bedrooms} value={filters.bedrooms} onChange={value => handleFilterChange('bedrooms', value)} />
                <HoverDropdown className={dropdownClass} label="Estado" options={filterOptions.statuses} value={filters.status} onChange={value => handleFilterChange('status', value)} />
                <HoverDropdown className={dropdownClass} label="Tipo" options={filterOptions.types} value={filters.type} onChange={value => handleFilterChange('type', value)} />
                <HoverDropdown className={dropdownClass} label="Posición" options={filterOptions.positions} value={filters.position} onChange={value => handleFilterChange('position', value)} />
                <HoverDropdown className={dropdownClass} label="Orientación" options={filterOptions.orientations} value={filters.orientation} onChange={value => handleFilterChange('orientation', value)} />
                
                {showPriceRangeFilter && (
                    <HoverDropdown 
                        className={dropdownClass}
                        label="Rango Precio" 
                        options={priceRangeOptions} 
                        value={filters.priceRange} 
                        onChange={value => handleFilterChange('priceRange', value)} 
                    />
                )}

                <div className="flex-none">
                     <button 
                        onClick={clearFilters} 
                        className="flex items-center justify-center bg-brand-surface hover:bg-gray-600 text-brand-text-secondary font-semibold py-0.5 px-3 rounded-md transition-colors text-xs h-[28px] border border-transparent hover:border-brand-text-secondary"
                        title="Limpiar todos los filtros"
                    >
                        <FunnelSlashIcon className="h-3.5 w-3.5 mr-1.5" />
                        Limpiar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Filters;
