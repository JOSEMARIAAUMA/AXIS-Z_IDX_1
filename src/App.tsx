
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
import ProgrammerView from './components/views/ProgrammerView';
import ProjectHeader from './components/ProjectHeader';
import type { FiltersState, AugmentedClient } from './types';
import { calculateAge, getAgeRange } from './utils';
import { db } from './lib/firebaseClient';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useProjectData } from './hooks/useProjectData';

const initialFilters: FiltersState = {
  building: '', floor: '', bedrooms: '', status: '', type: '', position: '', orientation: '', priceRange: '',
};

export default function App() {
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

  useEffect(() => {
      if (availableProjects.length > 0 && savedProject && !selectedProjectName) {
          if (availableProjects.includes(savedProject)) {
              handleSelectProject(savedProject);
          }
      }
  }, [availableProjects, savedProject, selectedProjectName, handleSelectProject]);

  useEffect(() => {
      localStorage.setItem('lastView', currentView);
  }, [currentView]);

  useEffect(() => {
      if (selectedProjectName) {
          localStorage.setItem('lastProject', selectedProjectName);
      }
  }, [selectedProjectName]);

  // --- SETTINGS PERSISTENCE (FIREBASE) ---
  useEffect(() => {
      const loadSettings = async () => {
          if (!selectedProjectName || isOfflineMode || !db) { // DB CHECK ADDED
              setFilters(initialFilters);
              setVisibleGroups({});
              return;
          }
          try {
              const filterRef = doc(db, 'projects', selectedProjectName, 'settings', 'filters');
              const filterSnap = await getDoc(filterRef);
              if (filterSnap.exists()) {
                  setFilters(filterSnap.data().value);
              } else {
                  setFilters(initialFilters);
              }

              const groupRef = doc(db, 'projects', selectedProjectName, 'settings', 'visible_groups');
              const groupSnap = await getDoc(groupRef);
              if (groupSnap.exists()) {
                  setVisibleGroups(groupSnap.data().value);
              } else {
                  setVisibleGroups({});
              }
          } catch (err) { 
              console.error("Error cargando settings desde Firebase:", err); 
          }
      };
      loadSettings();
  }, [selectedProjectName, isOfflineMode]);

  const saveSettings = async (type: 'filters' | 'visible_groups', value: any) => {
      if (!selectedProjectName || isOfflineMode || !db) return; // DB CHECK ADDED
      try { 
          const settingRef = doc(db, 'projects', selectedProjectName, 'settings', type);
          await setDoc(settingRef, { value });
      } catch (e) { 
          console.error(`Error guardando setting '${type}' en Firebase:`, e);
      }
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
    if (isLoading) return <div className="flex items-center justify-center h-full text-brand-primary">Cargando datos...</div>;

    if (!selectedProjectName || !project) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-brand-text-secondary">
                <p className="text-xl mb-4 font-bold">Bienvenido a AXIS-Z</p>
                <p className="text-sm mb-2">Selecciona un proyecto existente o sincroniza uno nuevo.</p>
            </div>
        );
    }

    if (!projectRaw) {
        return <div className="flex items-center justify-center h-full text-brand-primary">Inicializando proyecto...</div>;
    }

    switch (currentView) {
      case 'general': 
        if (!projectRaw.ds_generales) return <div className="flex items-center justify-center h-full text-brand-primary">Cargando datos generales...</div>;
        return <GeneralDataView dsGenerales={projectRaw.ds_generales} projectName={projectRaw.proyecto_nombre} />;
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
      case 'programmer':
        if (!projectRaw.ds_generales) return <div className="flex items-center justify-center h-full text-brand-primary">Cargando datos de programador...</div>;
        return <ProgrammerView projectRaw={projectRaw} />;
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
