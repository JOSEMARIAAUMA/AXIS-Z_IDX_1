


import React, { useMemo, useState } from 'react';
import type { Project, Unit, Client, FiltersState } from '../../types';
import { STATUS_COLORS, BEDROOM_COLORS } from '../../constants';
import Filters from '../Filters';
import UnitDetailModal from '../modals/UnitDetailModal';

interface UnitCardProps {
  unit: Unit;
  onClick: () => void;
}

const UnitCard: React.FC<UnitCardProps> = ({ unit, onClick }) => {
    const statusColor = STATUS_COLORS[unit.status];
    // Use the distinct colors from constants
    const bedroomColor = BEDROOM_COLORS[unit.bedrooms] || 'border-l-4 border-gray-500';

    return (
        <div 
            onClick={onClick}
            className={`bg-brand-surface rounded-lg shadow-md p-4 cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-200 ${bedroomColor}`}>
            <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-lg text-brand-text">{unit.id}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${statusColor}`}>
                    {unit.status}
                </span>
            </div>
            <div className="text-brand-text-secondary space-y-1 text-base">
                <p className="font-medium">{unit.bedrooms} dorm. / {(unit.totalBuiltArea ?? 0).toLocaleString('es-ES', { maximumFractionDigits: 0 })} m²</p>
                <p className="font-bold text-brand-text text-lg">{(unit.price ?? 0).toLocaleString('es-ES', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
            </div>
        </div>
    );
};

interface ReservationsViewProps {
  project: Project;
  clients: Client[];
  updateProject: (projectId: string, projectData: Partial<Project>) => Promise<void>;
  filters: FiltersState;
  setFilters: React.Dispatch<React.SetStateAction<FiltersState>>;
}

const ReservationsView: React.FC<ReservationsViewProps> = ({ project, clients, updateProject, filters, setFilters }) => {
    const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
    
    const filteredUnits = useMemo(() => {
        if (!project.units) return [];
        return project.units.filter(unit => {
            return (filters.building === '' || unit.building === filters.building) &&
                   (filters.floor === '' || unit.floor === parseInt(filters.floor, 10)) &&
                   (filters.bedrooms === '' || unit.bedrooms === parseInt(filters.bedrooms, 10)) &&
                   (filters.status === '' || unit.status === filters.status) &&
                   (filters.type === '' || unit.type === filters.type) &&
                   (filters.position === '' || unit.position === filters.position) &&
                   (filters.orientation === '' || unit.orientation === filters.orientation);
        });
    }, [project.units, filters]);

    const unitsByBuildingAndFloor = useMemo(() => {
        const grouped: Record<string, Record<string, Unit[]>> = {};
        filteredUnits.forEach(unit => {
            if (!grouped[unit.building]) {
                grouped[unit.building] = {};
            }
            if (!grouped[unit.building][unit.floor]) {
                grouped[unit.building][unit.floor] = [];
            }
            grouped[unit.building][unit.floor].push(unit);
        });
        // Sort floors numerically
        for (const building in grouped) {
            grouped[building] = Object.fromEntries(
                Object.entries(grouped[building]).sort(([a], [b]) => parseInt(b) - parseInt(a))
            );
        }
        return grouped;
    }, [filteredUnits]);

    const handleSaveUnit = (updatedUnit: Unit) => {
        const newUnits = project.units.map((u) => (u.id === updatedUnit.id ? updatedUnit : u));
        updateProject(project.id, { units: newUnits });
    };

    return (
        <>
            <div className="space-y-8 overflow-y-auto h-full pr-2">
                <Filters project={project} filters={filters} setFilters={setFilters} />

                <div className="space-y-10">
                    {Object.keys(unitsByBuildingAndFloor).sort().map(building => (
                        <div key={building} className="bg-brand-bg-light p-6 rounded-lg shadow-lg">
                            <h2 className="text-3xl font-bold mb-6 border-b-2 border-brand-primary pb-2 text-brand-text">Edificio {building}</h2>
                            <div className="flex flex-col">
                                {Object.keys(unitsByBuildingAndFloor[building]).map((floor, index, arr) => (
                                    <div 
                                        key={floor} 
                                        className={`flex items-start ${index < arr.length - 1 ? 'border-b border-white/10 pb-6 mb-6' : ''}`}
                                    >
                                        <div className="w-28 text-right pr-6 pt-3 shrink-0">
                                            <span className="font-bold text-2xl text-brand-text-secondary block">Planta {floor}</span>
                                            <span className="text-sm text-gray-500 font-medium uppercase tracking-wider">Nivel</span>
                                        </div>
                                        <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-8 gap-4 border-l-2 border-brand-surface pl-6">
                                            {unitsByBuildingAndFloor[building][floor]
                                                .sort((a,b) => a.id.localeCompare(b.id))
                                                .map(unit => (
                                                    <UnitCard key={unit.id} unit={unit} onClick={() => setSelectedUnit(unit)} />
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {selectedUnit && (
                <UnitDetailModal
                    unit={selectedUnit}
                    project={project}
                    clients={clients}
                    onClose={() => setSelectedUnit(null)}
                    onSave={handleSaveUnit}
                />
            )}
        </>
    );
};

export default ReservationsView;
