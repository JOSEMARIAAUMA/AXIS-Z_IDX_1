
import React, { useState } from 'react';
import { DocumentChartBarIcon, PlusIcon, TrashIcon, ArrowPathIcon } from './icons/Icons';
import { supabase } from '../lib/supabaseClient';
import Modal from './ui/Modal';

interface ProjectHeaderProps {
  availableProjects: string[];
  selectedProjectName: string | null;
  onSelectProject: (name: string) => void;
  onProjectSync: (name: string) => void;
  onDeleteProject: (name: string) => void;
}

const SyncModal = ({ onClose, onSync, existingProjectName }: { onClose: () => void, onSync: (name: string) => void, existingProjectName?: string | null }) => {
    const [projectName, setProjectName] = useState(existingProjectName || '');
    const [files, setFiles] = useState<{
        ds_generales: File | null,
        ts_general: File | null,
        garajes: File | null,
        trasteros: File | null
    }>({ ds_generales: null, ts_general: null, garajes: null, trasteros: null });
    const [isUploading, setIsUploading] = useState(false);

    const handleFileChange = (key: keyof typeof files) => (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFiles(prev => ({ ...prev, [key]: e.target.files![0] }));
        }
    };

    const handleSubmit = async () => {
        if (!projectName.trim()) return alert("El nombre del proyecto es obligatorio");
        // Validación mínima: se requiere al menos el TS_GENERAL y DS_GENERALES para que la app tenga sentido
        if (!files.ds_generales && !files.ts_general && !files.garajes && !files.trasteros) {
             return alert("Debes seleccionar al menos un archivo para actualizar.");
        }

        setIsUploading(true);
        try {
            const readFile = (file: File | null, isArray: boolean) => {
                return new Promise<any>((resolve) => {
                    if (!file) {
                        resolve(null); // Return null if no file update
                        return;
                    }
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        try {
                            const json = JSON.parse(e.target?.result as string);
                            resolve(json);
                        } catch (err) {
                            console.error("Error parseando JSON", file?.name, err);
                            resolve(isArray ? [] : {}); // Fallback safe
                        }
                    };
                    reader.readAsText(file);
                });
            };

            const [dsData, tsData, gData, tData] = await Promise.all([
                readFile(files.ds_generales, false),
                readFile(files.ts_general, true),
                readFile(files.garajes, true),
                readFile(files.trasteros, true)
            ]);

            // Construir payload SOLO con lo que se ha subido
            const payload = [];
            if (dsData) payload.push({ proyecto_nombre: projectName, tabla_id: 'ds_generales', datos: dsData });
            if (tsData) payload.push({ proyecto_nombre: projectName, tabla_id: 'ts_general', datos: tsData });
            if (gData) payload.push({ proyecto_nombre: projectName, tabla_id: 'garajes', datos: gData });
            if (tData) payload.push({ proyecto_nombre: projectName, tabla_id: 'trasteros', datos: tData });

            if (payload.length > 0) {
                const { error } = await supabase.from('datos_proyecto').upsert(payload);
                if (error) throw error;
            }

            onSync(projectName);
            onClose();

        } catch (error: any) {
            console.error("Error syncing:", error);
            alert("Error sincronizando proyecto: " + (error.message || JSON.stringify(error)));
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <Modal title={existingProjectName ? "Actualizar Proyecto" : "Sincronizar Nuevo Proyecto"} onClose={onClose}>
            <div className="space-y-4 p-2">
                <div>
                    <label className="block text-sm font-medium mb-1 text-brand-text">Nombre del Proyecto</label>
                    <input 
                        type="text" 
                        className="w-full bg-brand-surface border border-gray-600 rounded p-2 text-brand-text"
                        value={projectName}
                        onChange={e => setProjectName(e.target.value)}
                        placeholder="Ej: Residencial Zénit"
                        disabled={!!existingProjectName} // No permitir cambiar nombre al actualizar
                    />
                </div>
                <div className="grid grid-cols-1 gap-4">
                    {[
                        { key: 'ds_generales', label: 'DS_GENERALES.json' },
                        { key: 'ts_general', label: 'TS_GENERAL.json' },
                        { key: 'garajes', label: 'GARAJES.json' },
                        { key: 'trasteros', label: 'TRASTEROS_BR.json' }
                    ].map(({ key, label }) => (
                        <div key={key} className="flex flex-col bg-brand-bg-dark p-3 rounded">
                            <label className="text-xs font-bold text-brand-primary mb-1 uppercase">{label}</label>
                            <input 
                                type="file" 
                                accept=".json"
                                onChange={handleFileChange(key as any)}
                                className="text-xs text-brand-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-brand-surface file:text-brand-primary hover:file:bg-brand-bg-light cursor-pointer"
                            />
                        </div>
                    ))}
                </div>
                <div className="pt-4 flex justify-end">
                    <button 
                        onClick={handleSubmit} 
                        disabled={isUploading}
                        className="bg-brand-primary text-white px-6 py-2 rounded shadow hover:bg-blue-500 disabled:opacity-50 flex items-center font-bold"
                    >
                        {isUploading ? <ArrowPathIcon className="animate-spin h-4 w-4 mr-2" /> : null}
                        {isUploading ? 'Sincronizando...' : 'Ejecutar Sincronización'}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

const ProjectHeader: React.FC<ProjectHeaderProps> = ({ 
    availableProjects, 
    selectedProjectName, 
    onSelectProject, 
    onProjectSync,
    onDeleteProject
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdateMode, setIsUpdateMode] = useState(false);

  const handleOpenCreate = () => {
      setIsUpdateMode(false);
      setIsModalOpen(true);
  };

  const handleOpenUpdate = () => {
      if (selectedProjectName) {
          setIsUpdateMode(true);
          setIsModalOpen(true);
      }
  };

  return (
    <div className="bg-brand-bg-dark text-white py-4 pl-4 pr-8 border-b border-brand-surface flex items-center justify-between shrink-0 h-16 z-20 relative shadow-md">
        <div className="flex items-center space-x-4 min-w-0 flex-1">
             <div className="flex items-center space-x-2 bg-brand-surface rounded-lg p-1 max-w-md w-full border border-gray-600">
                <DocumentChartBarIcon className="h-5 w-5 text-brand-text-secondary ml-2 shrink-0" />
                <select 
                    value={selectedProjectName || ''} 
                    onChange={(e) => onSelectProject(e.target.value)}
                    className="bg-transparent border-none focus:ring-0 text-sm font-bold w-full text-brand-text truncate cursor-pointer py-1 outline-none"
                >
                    <option value="" className="bg-brand-bg-dark text-gray-400">-- SELECCIONAR PROYECTO --</option>
                    {availableProjects.map(p => (
                        <option key={p} value={p} className="bg-brand-bg-dark text-white">{p}</option>
                    ))}
                </select>
            </div>
            
            <div className="h-6 w-px bg-gray-600 mx-2"></div>

            <button 
                onClick={handleOpenCreate} 
                className="flex items-center bg-brand-primary hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-sm whitespace-nowrap uppercase tracking-wider"
            >
                <PlusIcon className="h-4 w-4 mr-1.5" />
                Nuevo
            </button>
            
            {selectedProjectName && (
                <>
                    <button 
                        onClick={handleOpenUpdate}
                        className="flex items-center bg-brand-surface hover:bg-gray-600 text-brand-text px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap uppercase tracking-wider border border-gray-600"
                    >
                        <ArrowPathIcon className="h-4 w-4 mr-1.5" />
                        Actualizar
                    </button>

                    <button 
                        onClick={() => onDeleteProject(selectedProjectName)} 
                        className="flex items-center bg-red-900/30 hover:bg-red-900/50 text-red-300 hover:text-red-200 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap uppercase tracking-wider border border-red-900/50"
                    >
                        <TrashIcon className="h-4 w-4 mr-1.5" />
                        Eliminar
                    </button>
                </>
            )}
        </div>
        <div className="flex items-center space-x-4">
             <div className="text-right hidden sm:block">
                 <p className="text-xs text-gray-400 font-medium uppercase">Usuario Activo</p>
                 <p className="text-sm font-bold text-white">Arquitecto</p>
            </div>
            <div className="h-8 w-8 rounded-full bg-brand-primary flex items-center justify-center text-white font-bold shadow-lg ring-2 ring-brand-bg-dark">
                A
            </div>
        </div>
        {isModalOpen && (
            <SyncModal 
                onClose={() => setIsModalOpen(false)} 
                onSync={onProjectSync} 
                existingProjectName={isUpdateMode ? selectedProjectName : null}
            />
        )}
    </div>
  );
};

export default ProjectHeader;
