


import React, { useMemo, useState, useRef, useLayoutEffect } from 'react';
import type { Project, FiltersState, Unit } from '../../types';
import { Status } from '../../types';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList, AreaChart, Area } from 'recharts';
import Filters from '../Filters';
import { ChevronLeftIcon, ChevronRightIcon } from '../icons/Icons';

// --- COMPONENTE CONTENEDOR ESTILIZADO (Fondo OSCURO para resaltar degradados) ---
const ChartContainer = ({ title, children, headerContent }: { title: string, children?: React.ReactNode, headerContent?: React.ReactNode }) => (
    <div className="bg-brand-bg-dark border border-brand-surface p-4 rounded-lg shadow-md flex flex-col h-96 relative">
        <div className="flex justify-between items-center mb-4 shrink-0 z-10">
            <h3 className="text-lg font-bold text-brand-text tracking-wide">{title}</h3>
            {headerContent}
        </div>
        <div className="flex-grow text-sm relative min-h-0">
            {children}
        </div>
    </div>
);

interface DashboardViewProps {
  project: Project;
  filters: FiltersState;
  setFilters: React.Dispatch<React.SetStateAction<FiltersState>>;
}

const getWeek = (d: Date) => {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    return `S${String(weekNo).padStart(2, '0')}`;
};

// Parser robusto de precios
const robustPriceParser = (val: any): number => {
    if (typeof val === 'number') return val;
    if (!val) return 0;
    
    let str = String(val).trim().replace(/[€$£\s]/g, '');
    const isStrictSpanish = /^-?\d{1,3}(\.\d{3})+(\,\d+)?$/.test(str);
    
    if (isStrictSpanish) {
        str = str.replace(/\./g, '').replace(',', '.');
    } else {
        str = str.replace(/[^\d.-]/g, ''); 
    }
    
    const result = parseFloat(str);
    return isNaN(result) ? 0 : result;
};

const DashboardView: React.FC<DashboardViewProps> = ({ project, filters, setFilters }) => {
    
    const [timeScale, setTimeScale] = useState<'month' | 'week' | 'year'>('month');
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // --- 2. FILTRADO DE UNIDADES (FILTROS GLOBALES) ---
    const filteredUnits = useMemo(() => {
        let units = project.units.filter(unit => {
            return (filters.building === '' || unit.building === filters.building) &&
                   (filters.floor === '' || unit.floor === parseInt(filters.floor, 10)) &&
                   (filters.bedrooms === '' || unit.bedrooms === parseInt(filters.bedrooms, 10)) &&
                   (filters.status === '' || unit.status === filters.status) &&
                   (filters.type === '' || unit.type === filters.type) &&
                   (filters.position === '' || unit.position === filters.position) &&
                   (filters.orientation === '' || unit.orientation === filters.orientation);
        });

        if (filters.priceRange) {
            const [minStr, maxStr] = filters.priceRange.split('-');
            const minFilter = parseFloat(minStr);
            const maxFilter = parseFloat(maxStr);
            if (!isNaN(minFilter) && !isNaN(maxFilter)) {
                 units = units.filter(unit => {
                    const price = robustPriceParser(unit.price);
                    return price >= minFilter && price < maxFilter;
                });
            }
        }
        return units;

    }, [project.units, filters]);

    // --- 3. DATOS PARA GRÁFICAS DE BARRAS ---
    const groupAndStackBy = (data: Unit[], key: keyof Unit, nameFormatter?: (value: any) => string) => {
        const grouped = data.reduce((acc, unit) => {
            const groupVal = unit[key];
            const groupName = nameFormatter ? nameFormatter(groupVal) : String(groupVal || 'N/A');
            
            if (!acc[groupName]) {
                acc[groupName] = { name: groupName, sortKey: groupVal, [Status.Available]: 0, [Status.Reserved]: 0, [Status.Sold]: 0 };
            }
            acc[groupName][unit.status]++;
            return acc;
        }, {} as Record<string, any>);
        
        return Object.values(grouped).sort((a,b) => {
            if(typeof a.sortKey === 'number' && typeof b.sortKey === 'number') return a.sortKey - b.sortKey;
            return String(a.sortKey).localeCompare(String(b.sortKey));
        });
    };

    const statusByBuildingData = useMemo(() => groupAndStackBy(filteredUnits, 'building'), [filteredUnits]);
    const statusByBedroomsData = useMemo(() => groupAndStackBy(filteredUnits, 'bedrooms', (val) => `${val} Dorm`), [filteredUnits]);

    const statusByPriceRangeData = useMemo(() => {
        const allPrices = project.units
            .map(u => robustPriceParser(u.price)) 
            .filter(p => p > 1000); 

        if (allPrices.length === 0) return [];

        const minPrice = Math.min(...allPrices);
        const maxPrice = Math.max(...allPrices);

        const minRounded = Math.floor(minPrice / 10000) * 10000;
        let maxRounded = Math.ceil(maxPrice / 10000) * 10000;
        if (maxRounded <= minRounded) maxRounded = minRounded + 10000;

        const step = (maxRounded - minRounded) / 4;
        
        const ranges = Array.from({ length: 4 }).map((_, i) => {
            const start = minRounded + i * step;
            const end = minRounded + (i + 1) * step;
            return {
                name: `${(start / 1000).toFixed(0)}k - ${(end / 1000).toFixed(0)}k`,
                min: start,
                max: end,
                [Status.Available]: 0,
                [Status.Reserved]: 0,
                [Status.Sold]: 0,
            };
        });

        filteredUnits.forEach(unit => {
            const price = robustPriceParser(unit.price);
            if (price <= 0) return;
            
            let bucketIndex = Math.floor((price - minRounded) / step);
            if (bucketIndex >= 4) bucketIndex = 3; 
            if (bucketIndex < 0) bucketIndex = 0;

            if (ranges[bucketIndex]) {
                ranges[bucketIndex][unit.status]++;
            }
        });

        return ranges;
    }, [project.units, filteredUnits]);

    // --- 4. DATOS DE EVOLUCIÓN CONTINUA (GLOBAL) ---
    const evolutionData = useMemo(() => {
        const datedUnits = project.units.filter(u => u.reservationDate || u.saleDate);
        if (datedUnits.length === 0) return [];

        const allDates = datedUnits.flatMap(u => [u.reservationDate, u.saleDate]).filter(Boolean).map(d => new Date(d!));
        
        // Calcular rango global de fechas
        let minDate = new Date(Math.min(...allDates.map(d => d.getTime())));
        let maxDate = new Date(Math.max(...allDates.map(d => d.getTime())));
        
        // Añadir Padding temporal (1 año antes, 1 año después) para contexto vacío
        minDate.setFullYear(minDate.getFullYear() - 1);
        maxDate.setFullYear(maxDate.getFullYear() + 1);

        // Normalizar fechas al inicio de periodo
        minDate = new Date(minDate.getFullYear(), 0, 1);
        maxDate = new Date(maxDate.getFullYear(), 11, 31);

        const data: { [key: string]: { name: string; Reservas: number; Ventas: number, sortDate: number } } = {};

        let currentDate = new Date(minDate);
        
        // Generar esqueleto
        while(currentDate <= maxDate) {
            let key = '';
            let label = '';
            
            if (timeScale === 'month') {
                key = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
                label = `${currentDate.toLocaleDateString('es-ES', { month: 'short' })} ${currentDate.getFullYear().toString().slice(-2)}`;
            } else if (timeScale === 'week') {
                const weekStr = getWeek(currentDate);
                key = `${currentDate.getFullYear()}-${weekStr}`;
                label = `${weekStr} ${currentDate.getFullYear().toString().slice(-2)}`;
            } else { 
                key = `${currentDate.getFullYear()}`;
                label = key;
            }

            if(!data[key]) {
                data[key] = { name: label.toUpperCase(), Reservas: 0, Ventas: 0, sortDate: currentDate.getTime() };
            }
            
            // Avanzar cursor
            if (timeScale === 'month') currentDate.setMonth(currentDate.getMonth() + 1);
            else if (timeScale === 'week') currentDate.setDate(currentDate.getDate() + 7);
            else currentDate.setFullYear(currentDate.getFullYear() + 1);
        }

        // Rellenar datos
        datedUnits.forEach(unit => {
            const processDate = (dateStr: string | undefined, type: 'Reservas' | 'Ventas') => {
                if (!dateStr) return;
                const date = new Date(dateStr);
                let key = '';
                if (timeScale === 'month') key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                else if (timeScale === 'week') key = `${date.getFullYear()}-${getWeek(date)}`;
                else key = `${date.getFullYear()}`;

                if (data[key]) data[key][type]++;
            };

            processDate(unit.reservationDate, 'Reservas');
            processDate(unit.saleDate, 'Ventas');
        });

        const sortedData = Object.values(data).sort((a, b) => a.sortDate - b.sortDate);
        
        // Acumulado
        for (let i = 1; i < sortedData.length; i++) {
            sortedData[i].Reservas += sortedData[i-1].Reservas;
            sortedData[i].Ventas += sortedData[i-1].Ventas;
        }
        return sortedData;

    }, [project.units, timeScale]);

    // --- AUTO-SCROLL AL FINAL (PRESENTE) CUANDO CAMBIA LA ESCALA O LOS DATOS ---
    useLayoutEffect(() => {
        if (scrollContainerRef.current) {
            // Hacer scroll al final (derecha) para mostrar el "ahora" por defecto
            scrollContainerRef.current.scrollLeft = scrollContainerRef.current.scrollWidth;
        }
    }, [timeScale, evolutionData]);


    // --- CÁLCULO ANCHO DINÁMICO PARA DENSIDAD ---
    const chartWidth = useMemo(() => {
        const count = evolutionData.length;
        if (count === 0) return '100%';

        // Definimos cuántos elementos queremos ver "por pantalla" sin hacer scroll
        if (timeScale === 'month') {
            // Queremos ver 12 meses exactos.
            // Si hay 36 datos, el ancho debe ser 300%
            return `${Math.max(100, (count / 12) * 100)}%`;
        } else if (timeScale === 'week') {
            // Queremos ver unas 26 semanas (medio año) para que no esté tan vacío
            return `${Math.max(100, (count / 26) * 100)}%`;
        } else {
            // Año: siempre cabe en pantalla (salvo que sean 50 años)
            return '100%';
        }
    }, [evolutionData.length, timeScale]);


    // --- ESTILOS DE GRÁFICA ---
    const tooltipStyle = { backgroundColor: '#1f2937', border: '1px solid #4b5563', borderRadius: '0.5rem', color: '#edf2f7', fontSize: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' };
    const tooltipLabelStyle = { color: '#9ca3af', fontWeight: 'bold', marginBottom: '5px', fontSize: '10px', textTransform: 'uppercase' as const };
    
    const COLOR_AVAILABLE = '#16a34a';
    const COLOR_RESERVED = '#6B8CAC'; 
    const COLOR_SOLD = '#C07575';     

    const renderTopStackLabels = (props: any, currentBarKey: string) => {
        if (!props || !props.payload) return null;
        const { x, y, width, payload } = props;
        const avail = payload[Status.Available] || 0;
        const res = payload[Status.Reserved] || 0;
        const sold = payload[Status.Sold] || 0;

        let isTop = false;
        if (currentBarKey === Status.Sold && sold > 0) isTop = true;
        else if (currentBarKey === Status.Reserved && sold === 0 && res > 0) isTop = true;
        else if (currentBarKey === Status.Available && sold === 0 && res === 0 && avail > 0) isTop = true;

        if (!isTop) return null;

        return (
            <text x={x + width / 2} y={y - 10} textAnchor="middle" fontSize={10} fontWeight="bold" style={{ pointerEvents: 'none' }}>
                {avail > 0 && <tspan fill={COLOR_AVAILABLE}>{avail} </tspan>}
                {res > 0 && <tspan dx="2" fill={COLOR_RESERVED}>{res} </tspan>}
                {sold > 0 && <tspan dx="2" fill={COLOR_SOLD}>{sold}</tspan>}
            </text>
        );
    };

    const renderStackedBarChart = (title: string, data: any[]) => (
        <ChartContainer title={title}>
             {data && data.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={data} margin={{ top: 25, right: 20, left: -15, bottom: 0 }}>
                        <defs>
                            <linearGradient id="gradAvailable" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={COLOR_AVAILABLE} stopOpacity={0.9}/>
                                <stop offset="95%" stopColor={COLOR_AVAILABLE} stopOpacity={0.4}/>
                            </linearGradient>
                            <linearGradient id="gradReserved" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={COLOR_RESERVED} stopOpacity={0.9}/>
                                <stop offset="95%" stopColor={COLOR_RESERVED} stopOpacity={0.4}/>
                            </linearGradient>
                            <linearGradient id="gradSold" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={COLOR_SOLD} stopOpacity={0.9}/>
                                <stop offset="95%" stopColor={COLOR_SOLD} stopOpacity={0.4}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                        <XAxis dataKey="name" stroke="#9ca3af" fontSize={10} fontWeight={600} interval={0} />
                        <YAxis stroke="#9ca3af" fontSize={10} allowDecimals={false} />
                        <Tooltip contentStyle={tooltipStyle} labelStyle={tooltipLabelStyle} cursor={{fill: 'rgba(255, 255, 255, 0.05)'}}/>
                        <Legend wrapperStyle={{fontSize: '11px', paddingTop: '10px'}} iconSize={8}/>
                        
                        <Bar dataKey={Status.Available} stackId="a" fill="url(#gradAvailable)" name="Disponibles" radius={[0, 0, 4, 4]}>
                            <LabelList dataKey={Status.Available} content={(props) => renderTopStackLabels(props, Status.Available)} />
                        </Bar>
                        <Bar dataKey={Status.Reserved} stackId="a" fill="url(#gradReserved)" name="Reservadas">
                            <LabelList dataKey={Status.Reserved} content={(props) => renderTopStackLabels(props, Status.Reserved)} />
                        </Bar>
                        <Bar dataKey={Status.Sold} stackId="a" fill="url(#gradSold)" name="Vendidas" radius={[4, 4, 0, 0]}>
                            <LabelList dataKey={Status.Sold} content={(props) => renderTopStackLabels(props, Status.Sold)} />
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            ) : (
                <div className="flex items-center justify-center h-full text-brand-text-secondary text-xs italic">
                    Sin datos disponibles.
                </div>
            )}
        </ChartContainer>
    );
    
    const TimeControls = () => (
        <div className="flex items-center space-x-2 bg-brand-bg-dark border border-brand-surface p-1 rounded-md">
            {(['week', 'month', 'year'] as const).map(scale => (
                <button
                    key={scale}
                    onClick={() => setTimeScale(scale)}
                    className={`px-2 py-1 text-[10px] font-bold rounded uppercase transition-colors ${
                        timeScale === scale ? 'bg-brand-primary text-white shadow-sm' : 'text-brand-text-secondary hover:bg-brand-surface hover:text-white'
                    }`}
                >
                    {scale === 'week' ? 'Sem.' : scale === 'month' ? 'Mes' : 'Año'}
                </button>
            ))}
        </div>
    );

    return (
        <div className="flex flex-col h-full overflow-hidden space-y-3 p-4 pr-6">
            <div className="shrink-0">
                <Filters project={project} filters={filters} setFilters={setFilters} showPriceRangeFilter />
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 pb-4 overflow-y-auto scrollbar-thin scrollbar-thumb-brand-surface pr-2">
                {renderStackedBarChart("Estado por Edificio", statusByBuildingData)}
                {renderStackedBarChart("Estado por Nº Dormitorios", statusByBedroomsData)}
                {renderStackedBarChart("Estado por Rango de Precio", statusByPriceRangeData)}
                
                <div className="xl:col-span-3">
                     <ChartContainer title="Evolución Histórica de Ventas (Acumulado)" headerContent={<TimeControls />}>
                        {/* Contenedor con Scroll Horizontal Controlado */}
                        <div 
                            ref={scrollContainerRef}
                            className="w-full h-full overflow-x-auto scrollbar-thin scrollbar-thumb-brand-primary scrollbar-track-brand-surface/20 pb-2"
                        >
                            <div style={{ width: chartWidth, height: '100%', minWidth: '100%' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                     <AreaChart data={evolutionData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                                        <defs>
                                            <linearGradient id="colorSold" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={COLOR_SOLD} stopOpacity={0.8}/>
                                                <stop offset="95%" stopColor={COLOR_SOLD} stopOpacity={0}/>
                                            </linearGradient>
                                            <linearGradient id="colorReserved" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={COLOR_RESERVED} stopOpacity={0.8}/>
                                                <stop offset="95%" stopColor={COLOR_RESERVED} stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                                        <XAxis 
                                            dataKey="name" 
                                            stroke="#9ca3af" 
                                            fontSize={10} 
                                            fontWeight={500} 
                                            tick={{ dy: 5 }} 
                                            interval={0} 
                                            padding={{ left: 20, right: 20 }}
                                        />
                                        <YAxis stroke="#9ca3af" fontSize={10} allowDecimals={false} />
                                        <Tooltip contentStyle={tooltipStyle} labelStyle={tooltipLabelStyle} cursor={{stroke: '#63b3ed', strokeWidth: 1, strokeDasharray: '4 4'}}/>
                                        <Legend wrapperStyle={{fontSize: '11px', paddingTop: '10px'}} iconSize={10}/>
                                        
                                        <Area 
                                            type="monotone" 
                                            dataKey="Reservas" 
                                            stroke={COLOR_RESERVED} 
                                            fill="url(#colorReserved)"
                                            strokeWidth={2} 
                                            dot={{ r: 3, strokeWidth: 1, fill: '#1f2937' }} 
                                            activeDot={{ r: 5, stroke: '#fff' }} 
                                            animationDuration={0} 
                                            isAnimationActive={false}
                                        />
                                        <Area 
                                            type="monotone" 
                                            dataKey="Ventas" 
                                            stroke={COLOR_SOLD} 
                                            fill="url(#colorSold)"
                                            strokeWidth={2} 
                                            dot={{ r: 3, strokeWidth: 1, fill: '#1f2937' }} 
                                            activeDot={{ r: 5, stroke: '#fff' }} 
                                            animationDuration={0}
                                            isAnimationActive={false}
                                        />
                                     </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </ChartContainer>
                </div>
            </div>
        </div>
    );
};

export default DashboardView;