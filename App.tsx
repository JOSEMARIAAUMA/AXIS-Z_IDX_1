
import React, { useState, useMemo, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import DashboardView from './components/views/DashboardView';
import ProjectTableView from './components/views/ProjectTableView';
import ReservationsView from './components/views/ReservationsView';
import ClientsView from './components/views/ClientsView';
import GeneralDataView from './components/views/GeneralDataView';
import GaragesView from './components/views/GaragesView';
import StoragesView from './components/views/StoragesView';
import FinancialView from './components/views/FinancialView';
import ProgrammerView from './components/views/ProgrammerView'; // Importar Nueva Vista
import ProjectHeader from './components/ProjectHeader';
import type { FiltersState, AugmentedClient } from './types';
import { calculateAge, getAgeRange } from './utils';
import { supabase } from './lib/supabaseClient';
import { useProjectData } from './hooks/useProjectData';

const initialFilters: FiltersState = {
  building: '', floor: '', bedrooms: '', status: '', type: '', position: '', orientation: '', priceRange: '',
};

export default function App() {
  // --- PERSISTENCIA ESTADO INICIAL ---
  const savedView = localStorage.getItem('lastView');
  const savedProject = localStorage.getItem('lastProject');

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [currentView, setCurrentView] = useState(savedView || 'general');
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  
  const {
      isLoading,
      availableProjects,
      selectedProjectName,
      project,
      projectRaw,
      clients,
      loadProjectList,
      handleSelectProject,
      handleProjectSync,
      handleDeleteProject,
      handleUnitUpdate,
      handleBulkUnitUpdate,
      handleServiceUpdate,
      handleSaveClient,
      handleBulkClientUpdate
  } = useProjectData(isOfflineMode);

  const [filters, setFilters] = useState<FiltersState>(initialFilters);
  const [visibleGroups, setVisibleGroups] = useState<Record<string, boolean>>({});

  // --- EFECTO PARA CARGAR PROYECTO GUARDADO ---
  useEffect(() => {
      if (availableProjects.length > 0 && savedProject && !selectedProjectName) {
          // Verificar si el proyecto guardado aun existe
          if (availableProjects.includes(savedProject)) {
              handleSelectProject(savedProject);
          }
      }
  }, [availableProjects, savedProject, selectedProjectName]); // Solo cuando carga la lista o cambia el guardado

  // --- EFECTO PARA GUARDAR ESTADO ---
  useEffect(() => {
      localStorage.setItem('lastView', currentView);
  }, [currentView]);

  useEffect(() => {
      if (selectedProjectName) {
          localStorage.setItem('lastProject', selectedProjectName);
      }
  }, [selectedProjectName]);


  // --- SETTINGS PERSISTENCE (Keep minimal logic here for UI prefs) ---
  useEffect(() => {
      const loadSettings = async () => {
          if (!selectedProjectName || isOfflineMode) return;
          try {
              const { data: filterData } = await supabase.from('user_project_settings').select('setting_value').eq('project_name', selectedProjectName).eq('setting_type', 'filters').single();
              if (filterData) setFilters(filterData.setting_value); else setFilters(initialFilters);

              const { data: groupData } = await supabase.from('user_project_settings').select('setting_value').eq('project_name', selectedProjectName).eq('setting_type', 'visible_groups').single();
              if (groupData) setVisibleGroups(groupData.setting_value); else setVisibleGroups({});
          } catch (err) { console.error("Error loading settings:", err); }
      };
      loadSettings();
  }, [selectedProjectName, isOfflineMode]);

  const saveSettings = async (type: 'filters' | 'visible_groups', value: any) => {
      if (!selectedProjectName || isOfflineMode) return;
      try { await supabase.from('user_project_settings').upsert({ project_name: selectedProjectName, setting_type: type, setting_value: value, updated_at: new Date().toISOString() }, { onConflict: 'project_name, setting_type' }); } catch (e) { console.error(e); }
  };

  const handleSetFilters = (newFilters: FiltersState | ((prev: FiltersState) => FiltersState)) => {
      setFilters(prev => {
          const next = typeof newFilters === 'function' ? newFilters(prev) : newFilters;
          saveSettings('filters', next);
          return next;
      });
  };
  const handleSetVisibleGroups = (newGroups: Record<string, boolean>) => {
      setVisibleGroups(newGroups);
      saveSettings('visible_groups', newGroups);
  };

  const augmentedClients = useMemo<AugmentedClient[]>(() => {
    return clients.map(client => ({
           ...client, idC: client.id,
           edad: client.birthDate ? calculateAge(client.birthDate) : undefined,
           rangoEdad: client.birthDate ? getAgeRange(calculateAge(client.birthDate)) : undefined,
           añoRegistro: client.registrationDate ? new Date(client.registrationDate).getFullYear() : undefined
    }));
  }, [clients]);

  const renderContent = () => {
    if (!selectedProjectName || !project) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-brand-text-secondary">
                <p className="text-xl mb-4 font-bold">Bienvenido a AXIS-Z</p>
                <p className="text-sm mb-2">Selecciona un proyecto existente o sincroniza uno nuevo.</p>
            </div>
        );
    }
    if (isLoading) return <div className="flex items-center justify-center h-full text-brand-primary">Cargando datos...</div>;

    switch (currentView) {
      case 'general': return <GeneralDataView dsGenerales={projectRaw.ds_generales} projectName={projectRaw.proyecto_nombre} />;
      case 'dashboard': return <DashboardView project={project} filters={filters} setFilters={handleSetFilters} />;
      case 'financial': return <FinancialView project={project} />;
      case 'table': return <ProjectTableView projectData={projectRaw} project={project} clients={clients} filters={filters} setFilters={handleSetFilters} onUnitUpdate={handleUnitUpdate} onBulkUpdate={handleBulkUnitUpdate} visibleGroups={visibleGroups} onVisibleGroupsChange={handleSetVisibleGroups} />;
      case 'reservations': return <ReservationsView project={project} clients={clients} updateProject={async (_, data) => { if (data.units) data.units.forEach(u => handleUnitUpdate(u)); }} filters={filters} setFilters={handleSetFilters} />;
      case 'garages': return <GaragesView garages={project.garages || []} filters={{status: '', type: ''}} setFilters={() => {}} onUpdate={(g) => handleServiceUpdate('garage', g)} />;
      case 'storages': return <StoragesView storages={project.storages || []} filters={{status: ''}} setFilters={() => {}} onUpdate={(s) => handleServiceUpdate('storage', s)} />;
      case 'clients': return <ClientsView clients={augmentedClients} allProjects={[project]} onSaveClient={handleSaveClient} onClientImport={async (n, u) => { for (const c of n) await handleSaveClient(c); for (const c of u) await handleSaveClient(c); }} onBulkClientUpdate={handleBulkClientUpdate} />;
      case 'interactive-map': 
        return (
            <div className="flex flex-col items-center justify-center h-full text-brand-text-secondary p-8 text-center border-2 border-dashed border-brand-surface rounded m-8">
                <p className="text-2xl font-bold mb-4 text-brand-primary">Módulo de Plano Interactivo</p>
                <p className="max-w-md">Próximamente: Carga de planos SVG vectoriales e interacción directa con las unidades.</p>
            </div>
        );
      case 'programmer': // Nueva Vista Programador (Actualizada con más props)
         return <ProgrammerView projectRaw={projectRaw} project={project} clients={clients} />;
      default: return <div className="p-4 text-white">Vista no encontrada</div>;
    }
  };

  return (
    <div className="flex h-screen bg-brand-bg-dark font-sans overflow-hidden">
      <Sidebar isCollapsed={isSidebarCollapsed} setIsCollapsed={setIsSidebarCollapsed} currentView={currentView} setCurrentView={setCurrentView} isOfflineMode={isOfflineMode} setIsOfflineMode={setIsOfflineMode} />
      <div className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${isSidebarCollapsed ? 'ml-20' : 'ml-64'} h-full overflow-hidden`}>
        <ProjectHeader availableProjects={availableProjects} selectedProjectName={selectedProjectName} onSelectProject={handleSelectProject} onProjectSync={handleProjectSync} onDeleteProject={handleDeleteProject} />
        <main className="flex-1 overflow-hidden relative bg-brand-bg-dark">
             <div className="absolute inset-0 overflow-auto">{renderContent()}</div>
        </main>
      </div>
    </div>
  );
}
