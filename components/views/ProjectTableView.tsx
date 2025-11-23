


import React, { useMemo, useState, useCallback, useEffect } from 'react';
import type { ProjectDataRaw, FiltersState, Project, Client, Unit } from '../../types';
import { Status } from '../../types';
import Filters from '../Filters';
import { normalizeKey, fuzzyFindValue } from '../../utils';
import { STATUS_COLORS, BEDROOM_BG_COLORS } from '../../constants';
import UnitDetailModal from '../modals/UnitDetailModal';
import BulkUnitEditModal from '../modals/BulkUnitEditModal';
import { CheckIcon, QueueListIcon, XCircleIcon, PencilIcon, DocumentChartBarIcon } from '../icons/Icons'; 
import { registrarError, descargarLogErrores } from '../../utils/log_errores';

export const GRUPOS_VIVIENDAS_CONFIG = [
    { nombre: "VIVIENDAS", columnas: ["_VIVIENDAS"] }, 
    { nombre: "ESTADO", columnas: ["_ESTADO"] },
    { nombre: "DATOS GENERALES", columnas: ["DATOS GENERALES_Nº DORM", "DATOS GENERALES_Nº BAÑOS", "DATOS GENERALES_EDIFICIO", "DATOS GENERALES_FASE", "DATOS GENERALES_PORTAL"] },
    { nombre: "UBICACIÓN", columnas: ["UBICACIÓN_NIVEL", "UBICACIÓN_TIPO", "UBICACIÓN_POSICIÓN", "UBICACIÓN_ORIENTACIÓN"] },
    { nombre: "SUPERFICIES ÚTILES INTERIORES VIVIENDAS", columnas: ["SUPERFICIES ÚTILES INTERIORES VIVIENDAS_ENTRADA", "SUPERFICIES ÚTILES INTERIORES VIVIENDAS_DISTRIB. 1", "SUPERFICIES ÚTILES INTERIORES VIVIENDAS_E+C", "SUPERFICIES ÚTILES INTERIORES VIVIENDAS_K", "SUPERFICIES ÚTILES INTERIORES VIVIENDAS_E+C+K", "SUPERFICIES ÚTILES INTERIORES VIVIENDAS_LAV", "SUPERFICIES ÚTILES INTERIORES VIVIENDAS_D1", "SUPERFICIES ÚTILES INTERIORES VIVIENDAS_D2", "SUPERFICIES ÚTILES INTERIORES VIVIENDAS_D3", "SUPERFICIES ÚTILES INTERIORES VIVIENDAS_D4", "SUPERFICIES ÚTILES INTERIORES VIVIENDAS_B1", "SUPERFICIES ÚTILES INTERIORES VIVIENDAS_B2", "SUPERFICIES ÚTILES INTERIORES VIVIENDAS_TOTAL"] },
    { nombre: "ÚTIL SERV.COM.", columnas: ["ÚTIL SERV.COM._S. SOCIAL"] },
    { nombre: "SUP. ÚTILES EXTERIORES PRIVATIVAS", columnas: ["SUP. ÚTILES EXTERIORES PRIVATIVAS_DESCUBIERTAS", "SUP. ÚTILES EXTERIORES PRIVATIVAS_CUBIERTAS", "SUP. ÚTILES EXTERIORES PRIVATIVAS_TOTAL2", "SUP. ÚTILES EXTERIORES PRIVATIVAS_EXT. COMP."] },
    { nombre: "TOTAL ÚTIL VIVIENDAS", columnas: ["TOTAL ÚTIL VIVIENDAS_REAL I+E", "TOTAL ÚTIL VIVIENDAS_REAL I+EXT POND 50%", "TOTAL ÚTIL VIVIENDAS_CRIT.VPP", "TOTAL ÚTIL VIVIENDAS_MÁX", "TOTAL ÚTIL VIVIENDAS_CALIFICABLE", "TOTAL ÚTIL VIVIENDAS_% PARTICIP."] },
    { nombre: "CONSTRUIDO INTERIOR. CRITERIO VPP", columnas: ["CONSTRUIDO INTERIOR. CRITERIO VPP_NETA", "CONSTRUIDO INTERIOR. CRITERIO VPP_Z. COMÚN/ÚTIL", "CONSTRUIDO INTERIOR. CRITERIO VPP_NETA+ZC/ÚTIL"] },
    { nombre: "CONSTRUIDO INTERIOR. CRITERIO LIBRE", columnas: ["CONSTRUIDO INTERIOR. CRITERIO LIBRE_NETA2", "CONSTRUIDO INTERIOR. CRITERIO LIBRE_ZC/C.NETA", "CONSTRUIDO INTERIOR. CRITERIO LIBRE_NETA+ZC/C.NETA"] },
    { nombre: "CONSTRUIDO REAL PRIVATIVO EXTERIOR(CRITERIO URBANÍSTICO)", columnas: ["CONSTRUIDO REAL PRIVATIVO EXTERIOR(CRITERIO URBANÍSTICO)_COMP 100%", "CONSTRUIDO REAL PRIVATIVO EXTERIOR(CRITERIO URBANÍSTICO)_COMP 50%", "CONSTRUIDO REAL PRIVATIVO EXTERIOR(CRITERIO URBANÍSTICO)_COMP 25%", "CONSTRUIDO REAL PRIVATIVO EXTERIOR(CRITERIO URBANÍSTICO)_COMP 0%", "CONSTRUIDO REAL PRIVATIVO EXTERIOR(CRITERIO URBANÍSTICO)_TOTAL EXT REAL", "CONSTRUIDO REAL PRIVATIVO EXTERIOR(CRITERIO URBANÍSTICO)_TOTAL EXT COMP."] },
    { nombre: "CONSTRUIDO TOTAL", columnas: ["CONSTRUIDO TOTAL_URBANÍSTICO", "CONSTRUIDO TOTAL_CRITERIO VPP", "CONSTRUIDO TOTAL_DECRETO"] },
    { nombre: "PRECIOS MÁX. VIV", columnas: ["PRECIOS MÁX. VIV_MÁXIMO"] }
];

const getGroupColorClass = (groupName: string, index: number, type: 'main' | 'sub') => {
    const lower = groupName.toLowerCase();
    if (lower.includes('viviendas') && !lower.includes('util')) return type === 'main' ? 'bg-taupe-7-main' : 'bg-navy-taupe'; 
    if (lower.includes('estado')) return type === 'main' ? 'bg-taupe-2-main' : 'bg-taupe-2-sub';
    const paletteIndex = (index % 5) + 1; 
    return `bg-taupe-${paletteIndex}-${type}`;
};

const STATUS_TRANSLATIONS_SHORT: Record<Status, string> = {
    [Status.Available]: 'DISPONIBLE',
    [Status.Reserved]: 'RESERVADA',
    [Status.Sold]: 'VENDIDA',
};

interface ProjectTableViewProps {
    projectData: ProjectDataRaw;
    project: Project | null;
    clients: Client[];
    filters: FiltersState;
    setFilters: React.Dispatch<React.SetStateAction<FiltersState>>;
    onUnitUpdate: (u: Unit) => void;
    onBulkUpdate: (ids: Set<string>, updates: Partial<Unit>) => void;
    visibleGroups: Record<string, boolean>;
    onVisibleGroupsChange: (groups: Record<string, boolean>) => void;
}

const ProjectTableView: React.FC<ProjectTableViewProps> = ({ 
    projectData, project, clients, filters, setFilters, onUnitUpdate, onBulkUpdate,
    visibleGroups, onVisibleGroupsChange
}) => {
    
    useEffect(() => {
        if (Object.keys(visibleGroups).length === 0) {
            const initial: Record<string, boolean> = {};
            GRUPOS_VIVIENDAS_CONFIG.forEach(g => initial[g.nombre] = true);
            onVisibleGroupsChange(initial);
        }
    }, []);
    
    const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
    const [lastSelectedRowId, setLastSelectedRowId] = useState<string | null>(null);
    const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
    const [isBulkEditModalOpen, setIsBulkEditModalOpen] = useState(false);

    const toggleGroup = (name: string) => {
        const newState = { ...visibleGroups, [name]: !visibleGroups[name] };
        onVisibleGroupsChange(newState);
    };

    const getRowValue = (row: any, colKey: string) => {
        // 0. Resolver ID de forma robusta para Logs
        const rowIdCandidates = ['viviendas_viviendas', 'ID', 'VIVIENDA', 'CODIGO', 'REF', '_VIVIENDAS', 'id_vivienda', 'referencia_vivienda'];
        const foundId = fuzzyFindValue(row, rowIdCandidates);
        const rowId = String(foundId || 'UNKNOWN');

        // 1. Búsqueda directa
        if (row[colKey] !== undefined) return row[colKey];

        // 2. Casos Especiales de ID y ESTADO
        if (colKey === '_VIVIENDAS') {
            return foundId;
        }
        if (colKey === '_ESTADO') {
            if (project && project.units && foundId !== 'UNKNOWN') {
                const unit = project.units.find(u => u.id === foundId);
                if (unit) return unit.status;
            }
            return fuzzyFindValue(row, ['GESTIÓN_ESTADO', 'ESTADO', 'SITUACION', 'STATUS', 'estado']);
        }

        // 3. Generación de Candidatos Inteligente
        const candidates: string[] = [];
        
        // Extraer sufijo (sin grupo)
        const suffix = colKey.includes('_') ? colKey.split('_').slice(1).join('_') : colKey;

        // Función para generar claves snake_case aproximadas
        const generateSmartKey = (s: string) => {
            let k = s.toLowerCase();
            k = k.replace(/nº/g, 'num');
            k = k.replace(/%/g, 'porc');   // 50% -> 50porc
            k = k.replace(/\+/g, '');      // E+C+K -> eck (quita el + para unir)
            k = k.replace(/\//g, '_');     // NETA/ZC -> neta_zc
            k = k.replace(/\./g, '');      // C.NETA -> cneta
            k = k.replace(/[()]/g, '');    // Paréntesis fuera
            k = k.replace(/\s+/g, '_');    // Espacios -> _
            k = k.replace(/_+/g, '_');     // Evitar __
            return k;
        };

        // PRIORIDAD 1: Claves generadas (snake_case) que coinciden con la exportación típica de BD
        candidates.push(generateSmartKey(suffix)); 
        candidates.push(generateSmartKey(colKey));

        // PRIORIDAD 2: Claves originales y sufijos limpios
        candidates.push(suffix);
        candidates.push(colKey);
        
        // PRIORIDAD 3: Fallback agresivo (alfanumérico puro)
        const cleanName = (s: string) => s.toLowerCase().replace(/nº/g, 'num').replace(/[^a-z0-9]/g, '');
        candidates.push(cleanName(suffix));
        candidates.push(cleanName(colKey));
        
        // 4. Ejecutar búsqueda con utils
        const val = fuzzyFindValue(row, candidates);
        
        if (val !== undefined && val !== null && val !== '') return val;

        // 5. Si no encuentra nada -> REGISTRAR ERROR Y DEVOLVER "ERR"
        registrarError('ProjectTableView', rowId, colKey, `No se encontró valor para '${suffix}' ni variantes.`);
        return 'ERR';
    };

    const filteredData = useMemo(() => {
        if (!projectData.ts_general) return [];
        
        return projectData.ts_general.filter(row => {
            const building = String(getRowValue(row, 'DATOS GENERALES_EDIFICIO') || '');
            const floor = String(getRowValue(row, 'UBICACIÓN_NIVEL') || '');
            const bedrooms = String(getRowValue(row, 'DATOS GENERALES_Nº DORM') || '');
            const type = String(getRowValue(row, 'UBICACIÓN_TIPO') || '');
            const status = String(getRowValue(row, '_ESTADO') || ''); 
            const position = String(getRowValue(row, 'UBICACIÓN_POSICIÓN') || '');
            const orientation = String(getRowValue(row, 'UBICACIÓN_ORIENTACIÓN') || '');

            if (filters.building && building !== filters.building) return false;
            if (filters.floor && floor !== filters.floor) return false;
            if (filters.bedrooms && bedrooms !== filters.bedrooms) return false;
            if (filters.type && type !== filters.type) return false;
            if (filters.position && position !== filters.position) return false;
            if (filters.orientation && orientation !== filters.orientation) return false;
            if (filters.status && !status.toUpperCase().includes(filters.status.toUpperCase())) return false;

            return true;
        });
    }, [projectData.ts_general, filters, project]);

    const handleRowClick = useCallback((row: any, index: number, event: React.MouseEvent) => {
        const id = String(getRowValue(row, '_VIVIENDAS'));
        if (!id || id === 'ERR') return;

        const newSelectedRows = new Set(selectedRows);

        if (event.shiftKey && lastSelectedRowId) {
            const lastIndex = filteredData.findIndex(r => String(getRowValue(r, '_VIVIENDAS')) === lastSelectedRowId);
            if (lastIndex !== -1) {
                const [start, end] = [lastIndex, index].sort((a, b) => a - b);
                for (let i = start; i <= end; i++) {
                    const rId = String(getRowValue(filteredData[i], '_VIVIENDAS'));
                    if (rId && rId !== 'ERR') newSelectedRows.add(rId);
                }
            }
        } else if (event.ctrlKey || event.metaKey) {
            if (newSelectedRows.has(id)) newSelectedRows.delete(id);
            else newSelectedRows.add(id);
        } else {
            if (newSelectedRows.has(id) && newSelectedRows.size === 1) newSelectedRows.clear();
            else {
                newSelectedRows.clear();
                newSelectedRows.add(id);
            }
        }
        setSelectedRows(newSelectedRows);
        setLastSelectedRowId(id);
    }, [filteredData, selectedRows, lastSelectedRowId]);

    const handleSelectAllVisible = () => {
        const newSet = new Set(selectedRows);
        filteredData.forEach(row => {
            const id = String(getRowValue(row, '_VIVIENDAS'));
            if (id && id !== 'ERR') newSet.add(id);
        });
        setSelectedRows(newSet);
    };

    const handleDeselectAll = () => setSelectedRows(new Set());

    const formatValue = (val: any, key: string, row: any) => {
        if (val === 'ERR') {
            return <span className="font-extrabold text-red-500 tracking-wider text-[10px] bg-red-900/20 px-1 rounded border border-red-500/30">ERR</span>;
        }

        if (key === '_ESTADO') {
             let status = Status.Available;
             const sStr = String(val || '').toUpperCase();
             if (sStr.includes('RESERV')) status = Status.Reserved;
             else if (sStr.includes('VENDID') || sStr.includes('SOLD')) status = Status.Sold;
             else if (Object.values(Status).includes(val)) status = val;

             const colorClass = STATUS_COLORS[status] || 'bg-gray-400 text-white';
             const label = STATUS_TRANSLATIONS_SHORT[status] || sStr || 'DISPONIBLE';
             
             return (
                 <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        const id = getRowValue(row, '_VIVIENDAS');
                        if (id && id !== 'ERR') setSelectedUnitId(String(id));
                    }}
                    className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide cursor-pointer hover:opacity-80 transition-opacity w-full ${colorClass}`}
                 >
                     {label}
                 </button>
             );
        }

        // Detectar si es numérico para gestión de ceros
        let numVal = val;
        if (typeof val === 'string') {
            // Intentar parsear strings numéricos simples
            const parsed = parseFloat(val.replace(',', '.'));
            if (!isNaN(parsed)) numVal = parsed;
        }

        // Lógica de Cero: Si es 0 (numérico o string "0") y NO es columna de Niveles/Planta, mostrar "-"
        // Excepción para la columna de Nivel/Planta (puede ser 0 = Bajo)
        const keyNorm = normalizeKey(key);
        const isLevelCol = keyNorm.includes('nivel') || keyNorm.includes('planta') || keyNorm.includes('floor');

        if (!isLevelCol && (numVal === 0 || val === '0')) {
            return '-';
        }

        if (val === undefined || val === null || val === '') return '-';
        
        // Formateo numérico específico con decimales forzados
        if (typeof numVal === 'number') {
            if (keyNorm.includes('precio') || keyNorm.includes('venta') || keyNorm.includes('pvp') || keyNorm.includes('maximo')) {
                // Precio: Currency estándar (0 decimales normalmente, o 2 si hay céntimos, locale handles it)
                return numVal.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
            }
            if (keyNorm.includes('superficie') || keyNorm.includes('util') || keyNorm.includes('construid') || keyNorm.includes('area') || keyNorm.includes('total') || keyNorm.includes('neta') || keyNorm.includes('comun')) {
                 // Superficies: Forzar 2 decimales siempre (incluso ceros a la derecha)
                 return numVal.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            }
             if (keyNorm.includes('porc') || keyNorm.includes('particip')) {
                 // Porcentajes: Forzar 2 decimales siempre
                 return numVal.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '%';
            }
            // Enteros como Dormitorios/Baños no se formatean con decimales
            if (keyNorm.includes('dorm') || keyNorm.includes('banos') || keyNorm.includes('bed') || keyNorm.includes('bath')) {
                return numVal;
            }
        }
        
        // Fallback de formateo original (string o numero que no cae en categorias anteriores)
        if (typeof numVal === 'number') {
             // Para cualquier otro número no identificado específicamente, max 2 decimales por defecto
             return numVal.toLocaleString('es-ES', { maximumFractionDigits: 2 });
        }

        return val;
    };

    const getColLabel = (colKey: string, groupName: string) => {
        if (colKey === '_VIVIENDAS') return 'ID';
        if (colKey === '_ESTADO') return 'ESTADO';
        if (colKey.startsWith(groupName + '_')) return colKey.substring(groupName.length + 1);
        return colKey;
    };
    
    const selectedUnit = useMemo(() => {
        if (!selectedUnitId || !project) return null;
        return project.units.find(u => u.id === selectedUnitId) || null;
    }, [project, selectedUnitId]);

    const dummyProjectForFilters: any = useMemo(() => ({
        units: (projectData.ts_general || []).map(row => ({
            building: getRowValue(row, 'DATOS GENERALES_EDIFICIO'),
            floor: getRowValue(row, 'UBICACIÓN_NIVEL'),
            bedrooms: getRowValue(row, 'DATOS GENERALES_Nº DORM'),
            type: getRowValue(row, 'UBICACIÓN_TIPO'),
            status: getRowValue(row, '_ESTADO'),
            position: getRowValue(row, 'UBICACIÓN_POSICIÓN'),
            orientation: getRowValue(row, 'UBICACIÓN_ORIENTACIÓN'),
            price: getRowValue(row, 'PRECIOS MÁX. VIV_MÁXIMO')
        }))
    }), [projectData.ts_general]);

    return (
        <div className="flex flex-col h-full w-full overflow-hidden p-2 space-y-2">
            <div className="shrink-0 space-y-2">
                <Filters project={dummyProjectForFilters} filters={filters} setFilters={setFilters} showPriceRangeFilter={false} />
                
                <div className="flex flex-col gap-2">
                    <div className="flex gap-2 bg-brand-bg-dark p-1.5 rounded-lg overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-brand-surface border border-brand-surface">
                        {GRUPOS_VIVIENDAS_CONFIG.map((g, idx) => (
                            <button 
                                key={g.nombre}
                                onClick={() => toggleGroup(g.nombre)}
                                className={`px-3 py-1 rounded text-[10px] font-bold transition-colors uppercase tracking-wider whitespace-nowrap border border-transparent ${visibleGroups[g.nombre] ? `${getGroupColorClass(g.nombre, idx, 'main')} text-white border-white/20` : 'bg-brand-surface text-brand-text-secondary hover:text-white'}`}
                            >
                                {g.nombre}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center justify-between bg-brand-bg-dark p-2 rounded-lg border border-brand-surface">
                         <div className="flex items-center space-x-3">
                             <span className="text-xs font-bold text-brand-text ml-2">
                                 {selectedRows.size} seleccionados
                             </span>
                             <div className="h-4 w-px bg-brand-surface"></div>
                             <button onClick={handleSelectAllVisible} className="p-1.5 text-brand-text-secondary hover:text-brand-primary hover:bg-brand-surface rounded transition-colors" title="Seleccionar visibles">
                                <QueueListIcon className="h-4 w-4" />
                             </button>
                             <button onClick={handleDeselectAll} disabled={selectedRows.size === 0} className="p-1.5 text-brand-text-secondary hover:text-red-400 hover:bg-brand-surface rounded transition-colors disabled:opacity-30" title="Deseleccionar todo">
                                <XCircleIcon className="h-4 w-4" />
                             </button>
                             <button onClick={descargarLogErrores} className="p-1.5 text-brand-text-secondary hover:text-yellow-400 hover:bg-brand-surface rounded transition-colors ml-2" title="Descargar Log de Errores">
                                <DocumentChartBarIcon className="h-4 w-4" />
                             </button>

                             {selectedRows.size > 0 && (
                                <>
                                    <div className="h-4 w-px bg-brand-surface mx-1"></div>
                                    <button 
                                        className="flex items-center bg-brand-primary text-white px-3 py-1 rounded text-xs font-bold hover:bg-blue-500 transition-colors"
                                        onClick={() => setIsBulkEditModalOpen(true)}
                                    >
                                        <PencilIcon className="h-3 w-3 mr-2" />
                                        EDITAR ({selectedRows.size})
                                    </button>
                                </>
                             )}
                         </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-auto bg-brand-bg-dark rounded-lg shadow border border-brand-surface">
                <table className="min-w-full text-xs text-center border-separate border-spacing-0">
                    <thead className="sticky top-0 z-20 text-white uppercase text-[10px]">
                        <tr>
                            {GRUPOS_VIVIENDAS_CONFIG.map((group, idx) => visibleGroups[group.nombre] && (
                                <th key={group.nombre} colSpan={group.columnas.length} className={`${getGroupColorClass(group.nombre, idx, 'main')} py-1 px-2 border-b border-brand-bg-dark font-bold tracking-wide`}>
                                    {group.nombre}
                                </th>
                            ))}
                        </tr>
                        <tr>
                            {GRUPOS_VIVIENDAS_CONFIG.map((group, idx) => visibleGroups[group.nombre] && group.columnas.map(colKey => (
                                <th key={colKey} className={`${getGroupColorClass(group.nombre, idx, 'sub')} py-2 px-2 border-b border-brand-bg-dark font-semibold whitespace-nowrap min-w-[80px]`}>
                                    {getColLabel(colKey, group.nombre)}
                                </th>
                            )))}
                        </tr>
                    </thead>
                    <tbody className="text-brand-text-secondary text-[11px]">
                        {filteredData.length > 0 ? (
                            filteredData.map((row, idx) => {
                                const rowId = String(getRowValue(row, '_VIVIENDAS'));
                                const isSelected = selectedRows.has(rowId);
                                
                                return (
                                    <tr 
                                        key={idx} 
                                        onClick={(e) => handleRowClick(row, idx, e)}
                                        className={`cursor-pointer transition-colors last:border-0 select-none ${isSelected ? 'bg-brand-primary/20' : 'hover:bg-brand-surface/30'}`}
                                    >
                                        {GRUPOS_VIVIENDAS_CONFIG.map(group => visibleGroups[group.nombre] && group.columnas.map(colKey => {
                                            const val = getRowValue(row, colKey);
                                            
                                            // Special styling for Bedroom Count using Constants
                                            let cellBgClass = "";
                                            if (colKey === 'DATOS GENERALES_Nº DORM') {
                                                const numDorm = typeof val === 'number' ? val : parseInt(String(val));
                                                if (numDorm && BEDROOM_BG_COLORS[numDorm]) {
                                                    cellBgClass = BEDROOM_BG_COLORS[numDorm];
                                                }
                                            }

                                            const baseTdClasses = "py-1.5 px-2 whitespace-nowrap border-b border-white/20";
                                            const finalTdClasses = `${baseTdClasses} ${cellBgClass}`;
                                            
                                            if (colKey === '_VIVIENDAS') {
                                                return (
                                                    <td key={colKey} className={`${baseTdClasses} bg-navy-taupe text-white font-bold text-left relative group`}>
                                                        <div className="flex items-center min-w-[80px]">
                                                            <div className={`w-4 h-4 mr-2 flex items-center justify-center rounded border border-white/30 transition-opacity ${isSelected ? 'bg-brand-primary border-brand-primary opacity-100' : 'opacity-0 group-hover:opacity-50'}`}>
                                                                {isSelected && <CheckIcon className="h-3 w-3 text-white" />}
                                                            </div>
                                                            <span>{formatValue(val, colKey, row)}</span>
                                                        </div>
                                                    </td>
                                                );
                                            }
                                            return (
                                                <td key={colKey} className={finalTdClasses}>
                                                    {formatValue(val, colKey, row)}
                                                </td>
                                            );
                                        }))}
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan={GRUPOS_VIVIENDAS_CONFIG.reduce((acc, g) => acc + g.columnas.length, 0)} className="py-8 text-center text-brand-text-secondary italic">
                                    No se encontraron viviendas con los filtros actuales.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            
            {selectedUnit && project && (
                <UnitDetailModal
                    unit={selectedUnit}
                    project={project}
                    clients={clients}
                    onClose={() => setSelectedUnitId(null)}
                    onSave={onUnitUpdate}
                />
            )}

            {isBulkEditModalOpen && (
                <BulkUnitEditModal
                    selectedCount={selectedRows.size}
                    onClose={() => setIsBulkEditModalOpen(false)}
                    onSave={(updates) => {
                        onBulkUpdate(selectedRows, updates);
                        setIsBulkEditModalOpen(false);
                    }}
                />
            )}
        </div>
    );
};

export default ProjectTableView;
