


import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import type { Project, Unit } from '../../types';
import { Status } from '../../types';

interface FinancialViewProps {
    project: Project;
}

const FinancialView: React.FC<FinancialViewProps> = ({ project }) => {
    
    // KPI Calculation
    const kpis = useMemo(() => {
        if (!project?.units) return { total: 0, sold: 0, reserved: 0, available: 0, soldValue: 0, reservedValue: 0, potentialValue: 0 };

        let totalValue = 0;
        let soldValue = 0;
        let reservedValue = 0;
        let availableValue = 0;

        project.units.forEach(u => {
            const price = u.price || 0;
            totalValue += price;
            if (u.status === Status.Sold) soldValue += price;
            else if (u.status === Status.Reserved) reservedValue += price;
            else availableValue += price;
        });

        return {
            totalUnits: project.units.length,
            soldUnits: project.units.filter(u => u.status === Status.Sold).length,
            reservedUnits: project.units.filter(u => u.status === Status.Reserved).length,
            totalValue,
            soldValue,
            reservedValue,
            availableValue,
            percentSoldValue: totalValue > 0 ? ((soldValue / totalValue) * 100).toFixed(1) : '0',
            percentReservedValue: totalValue > 0 ? ((reservedValue / totalValue) * 100).toFixed(1) : '0'
        };
    }, [project]);

    // Cashflow Data Calculation
    const cashflowData = useMemo(() => {
        if (!project?.units) return [];

        const data: Record<string, { month: string; sold: number; reserved: number }> = {};
        
        // Helper to get YYYY-MM
        const getMonthKey = (dateStr?: string) => {
            if (!dateStr) return 'Sin Fecha';
            try {
                const d = new Date(dateStr);
                if (isNaN(d.getTime())) return 'Sin Fecha';
                return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            } catch { return 'Sin Fecha'; }
        };

        project.units.forEach(u => {
            if (u.price) {
                if (u.status === Status.Sold && u.saleDate) {
                    const key = getMonthKey(u.saleDate);
                    if (!data[key]) data[key] = { month: key, sold: 0, reserved: 0 };
                    data[key].sold += u.price;
                } else if (u.status === Status.Reserved && u.reservationDate) {
                    const key = getMonthKey(u.reservationDate);
                    if (!data[key]) data[key] = { month: key, sold: 0, reserved: 0 };
                    data[key].reserved += u.price;
                }
            }
        });

        // Convert to array and sort
        return Object.values(data)
            .filter(d => d.month !== 'Sin Fecha')
            .sort((a, b) => a.month.localeCompare(b.month));

    }, [project]);

    // Ticket Medio Calculation
    const ticketMedio = useMemo(() => {
        const soldCount = kpis.soldUnits;
        const reservedCount = kpis.reservedUnits;
        const soldAvg = soldCount > 0 ? kpis.soldValue / soldCount : 0;
        const reservedAvg = reservedCount > 0 ? kpis.reservedValue / reservedCount : 0;
        return { soldAvg, reservedAvg };
    }, [kpis]);

    const formatCurrency = (val: number) => val.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });

    return (
        <div className="flex flex-col h-full space-y-4 p-4 overflow-y-auto">
            {/* Header KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
                <div className="bg-brand-bg-light p-4 rounded-lg shadow border-l-4 border-blue-500">
                    <h3 className="text-xs font-bold text-brand-text-secondary uppercase">Volumen Total Venta</h3>
                    <p className="text-2xl font-bold text-white mt-1">{formatCurrency(kpis.totalValue)}</p>
                    <p className="text-xs text-brand-text-secondary mt-1">{kpis.totalUnits} Unidades Totales</p>
                </div>
                <div className="bg-brand-bg-light p-4 rounded-lg shadow border-l-4 border-status-sold">
                    <h3 className="text-xs font-bold text-brand-text-secondary uppercase">Vendido (Realizado)</h3>
                    <p className="text-2xl font-bold text-white mt-1">{formatCurrency(kpis.soldValue)}</p>
                    <div className="flex justify-between mt-1 text-xs">
                         <span className="text-status-sold font-bold">{kpis.percentSoldValue}% Valor</span>
                         <span className="text-brand-text-secondary">{kpis.soldUnits} uds.</span>
                    </div>
                </div>
                <div className="bg-brand-bg-light p-4 rounded-lg shadow border-l-4 border-status-reserved">
                    <h3 className="text-xs font-bold text-brand-text-secondary uppercase">Reservado (Potencial)</h3>
                    <p className="text-2xl font-bold text-white mt-1">{formatCurrency(kpis.reservedValue)}</p>
                    <div className="flex justify-between mt-1 text-xs">
                         <span className="text-status-reserved font-bold">{kpis.percentReservedValue}% Valor</span>
                         <span className="text-brand-text-secondary">{kpis.reservedUnits} uds.</span>
                    </div>
                </div>
                <div className="bg-brand-bg-light p-4 rounded-lg shadow border-l-4 border-status-available">
                    <h3 className="text-xs font-bold text-brand-text-secondary uppercase">Disponible (Stock)</h3>
                    <p className="text-2xl font-bold text-white mt-1">{formatCurrency(kpis.availableValue)}</p>
                    <p className="text-xs text-brand-text-secondary mt-1">Stock restante</p>
                </div>
            </div>

            {/* Main Charts Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 min-h-[300px]">
                {/* Cashflow Chart */}
                <div className="lg:col-span-2 bg-brand-bg-dark border border-brand-surface p-4 rounded-lg shadow flex flex-col">
                    <h3 className="text-lg font-bold text-brand-text mb-4">Flujo de Caja (Ventas y Reservas)</h3>
                    <div className="flex-1">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={cashflowData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorSold" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#C07575" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#C07575" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorReserved" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6B8CAC" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#6B8CAC" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="month" stroke="#9CA3AF" fontSize={12} />
                                <YAxis stroke="#9CA3AF" fontSize={12} tickFormatter={(val) => `${(val/1000).toFixed(0)}k`} />
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#1F2937', borderColor: '#4B5563', color: '#F3F4F6' }}
                                    formatter={(val: number) => formatCurrency(val)}
                                />
                                <Legend />
                                <Area type="monotone" dataKey="sold" name="Ventas Cerradas" stroke="#C07575" fillOpacity={1} fill="url(#colorSold)" />
                                <Area type="monotone" dataKey="reserved" name="Reservas" stroke="#6B8CAC" fillOpacity={1} fill="url(#colorReserved)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Ticket Medio Stats */}
                <div className="bg-brand-bg-dark border border-brand-surface p-4 rounded-lg shadow flex flex-col space-y-6">
                    <h3 className="text-lg font-bold text-brand-text">Ticket Medio</h3>
                    
                    <div className="flex-1 flex flex-col justify-center space-y-8">
                        <div>
                            <p className="text-sm text-brand-text-secondary uppercase font-bold">Ticket Medio Ventas</p>
                            <p className="text-3xl font-bold text-status-sold">{formatCurrency(ticketMedio.soldAvg)}</p>
                            <div className="w-full bg-gray-700 h-2 rounded-full mt-2">
                                <div className="bg-status-sold h-2 rounded-full" style={{ width: '100%' }}></div>
                            </div>
                        </div>

                        <div>
                             <p className="text-sm text-brand-text-secondary uppercase font-bold">Ticket Medio Reservas</p>
                             <p className="text-3xl font-bold text-status-reserved">{formatCurrency(ticketMedio.reservedAvg)}</p>
                             <div className="w-full bg-gray-700 h-2 rounded-full mt-2">
                                <div className="bg-status-reserved h-2 rounded-full" style={{ width: `${(ticketMedio.reservedAvg / (ticketMedio.soldAvg || 1)) * 100}%` }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FinancialView;