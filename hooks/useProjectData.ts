
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { Project, ProjectDataRaw, Unit, Client, Garage, Storage } from '../types';
import { Status } from '../types';
import { fuzzyFindValue } from '../utils';
import { SAMPLE_CLIENTS } from '../constants';
import { registrarError } from '../utils/log_errores';

// --- HELPER: Actualizar objeto crudo (ts_general) basado en cambios del modelo Unit ---
export const applyChangesToRawRow = (rawRow: any, updates: Partial<Unit>): any => {
    const newRow = { ...rawRow };

    if (updates.status) {
        const statusKey = Object.keys(newRow).find(k => {
            const kn = k.toUpperCase();
            return kn.includes('ESTADO') || kn.includes('SITUACION') || kn.includes('STATUS');
        });
        
        if (statusKey) {
            let valToSave: string | Status | undefined = updates.status;
            if (updates.status === Status.Reserved) valToSave = 'RESERVADA';
            else if (updates.status === Status.Sold) valToSave = 'VENDIDA';
            else if (updates.status === Status.Available) valToSave = 'DISPONIBLE';
            newRow[statusKey] = valToSave;
        } else {
            newRow['GESTIÓN_ESTADO'] = updates.status === Status.Reserved ? 'RESERVADA' : (updates.status === Status.Sold ? 'VENDIDA' : 'DISPONIBLE');
        }
    }

    if (updates.price !== undefined) {
         const priceKey = Object.keys(newRow).find(k => {
            const kn = k.toUpperCase();
            return (kn.includes('PRECIO') && kn.includes('MAX')) || kn.includes('PVP') || kn === 'PRECIO';
        });
        if (priceKey) newRow[priceKey] = updates.price;
        else newRow['PRECIOS MÁX. VIV_MÁXIMO'] = updates.price;
    }

    if (updates.notes !== undefined) newRow['OBSERVACIONES_INTERNAS'] = updates.notes;
    if (updates.garageId !== undefined) newRow['GARAJES_VINCULADO'] = updates.garageId;
    if (updates.storageId !== undefined) newRow['TRASTEROS_VINCULADO'] = updates.storageId;
    if (updates.buyerId !== undefined) newRow['CLIENTE_COMPRADOR_ID'] = updates.buyerId;
    if (updates.reservationDate !== undefined) newRow['FECHA_RESERVA'] = updates.reservationDate;
    if (updates.saleDate !== undefined) newRow['FECHA_VENTA'] = updates.saleDate;

    return newRow;
};

// --- MAPPERS ---
const mapTsGeneralToUnits = (tsData: any[]): Unit[] => {
  if (!Array.isArray(tsData)) return [];
  
  return tsData.map(row => {
    const id = fuzzyFindValue(row, ['_VIVIENDAS', 'ID', 'VIVIENDA', 'CODIGO', 'REF', 'viviendas_viviendas', 'id_vivienda']);
    
    if (!id) {
        registrarError('useProjectData', 'UNKNOWN', 'ID', 'Fila sin identificador encontrada.');
    }

    const statusRaw = fuzzyFindValue(row, ['GESTIÓN_ESTADO', 'ESTADO', 'SITUACION', 'STATUS', 'estado']) || 'DISPONIBLE';
    let status = Status.Available;
    const sUpper = String(statusRaw).toUpperCase();
    if (sUpper.includes('RESERV')) status = Status.Reserved;
    else if (sUpper.includes('VENDID') || sUpper.includes('SOLD')) status = Status.Sold;

    let price = 0;
    const priceRaw = fuzzyFindValue(row, ['PRECIOS MÁX. VIV_MÁXIMO', 'PRECIO', 'PVP', 'AMOUNT', 'VALOR', 'precios_max_viv_maximo']);
    if (priceRaw) {
         if (typeof priceRaw === 'number') price = priceRaw;
         else {
             const clean = String(priceRaw).replace(/[^\d,.-]/g, '').replace('.', '').replace(',', '.');
             price = parseFloat(clean) || 0;
         }
    } else {
        registrarError('useProjectData', String(id || 'Row'), 'PRECIO', 'Precio no encontrado, por defecto 0.');
    }

    // Helper para extraer números con log
    const getNum = (keys: string[], fieldName: string) => {
        const val = fuzzyFindValue(row, keys);
        if (val === undefined || val === null || val === '') {
             registrarError('useProjectData', String(id || 'Row'), fieldName, `Campo no encontrado, asignando 0.`);
             return 0;
        }
        return Number(val);
    };

    return {
      id: String(id || 'UNK'),
      bedrooms: getNum(['DATOS GENERALES_Nº DORM', 'DORMITORIOS', 'HABITACIONES', 'Nº DORM', 'num_dorm', 'datos_generales_num_dorm'], 'Dormitorios'),
      bathrooms: getNum(['DATOS GENERALES_Nº BAÑOS', 'BAÑOS', 'ASEOS', 'Nº BAÑOS', 'num_banos'], 'Baños'),
      building: String(fuzzyFindValue(row, ['DATOS GENERALES_EDIFICIO', 'EDIFICIO', 'BLOQUE', 'edificio']) || ''),
      floor: Number(fuzzyFindValue(row, ['UBICACIÓN_NIVEL', 'NIVEL', 'PLANTA', 'PISO', 'nivel']) || 0),
      type: String(fuzzyFindValue(row, ['UBICACIÓN_TIPO', 'TIPO', 'TIPOLOGIA', 'tipo']) || ''),
      position: String(fuzzyFindValue(row, ['UBICACIÓN_POSICIÓN', 'POSICION', 'MANO', 'posicion']) || ''),
      orientation: String(fuzzyFindValue(row, ['UBICACIÓN_ORIENTACIÓN', 'ORIENTACION', 'orientacion']) || ''),
      status: status,
      price: price,
      totalBuiltArea: getNum([
          'SUP. CONSTRUIDAS (M²)_CONSTRUIDO TOTAL', 'CONST TOTAL', 'SUP CONST', 
          'construido_total_urbanistico', 'construido_total_criterio_vpp', 'construido_total'
      ], 'Total Built Area'),
      totalUsefulArea: getNum([
          'SUP. ÚTILES RESUMEN (M²)_TOTAL ÚTIL VIVIENDAS', 'UTIL TOTAL', 'SUP UTIL', 
          'total_util_viviendas_real_ie', 'total_util_viviendas'
      ], 'Total Useful Area'),
      garageId: fuzzyFindValue(row, ['GARAJES_VINCULADO', 'GARAJE', 'VINCULADO']) || undefined,
      storageId: fuzzyFindValue(row, ['TRASTEROS_VINCULADO', 'TRASTERO']) || undefined,
      buyerId: fuzzyFindValue(row, ['CLIENTE_COMPRADOR_ID', 'ID_CLIENTE']) || undefined,
      notes: fuzzyFindValue(row, ['OBSERVACIONES_INTERNAS', 'NOTAS', 'COMENTARIOS']) || undefined,
      reservationDate: fuzzyFindValue(row, ['FECHA_RESERVA']) || undefined,
      saleDate: fuzzyFindValue(row, ['FECHA_VENTA']) || undefined,
      ...row 
    };
  });
};

const mapGarages = (raw: any[]): Garage[] => {
    if (!Array.isArray(raw)) return [];
    return raw.map(r => {
        const id = fuzzyFindValue(r, ['ID-G', 'GARAJE', 'ID', 'CODIGO', 'NUMERO', 'REFERENCIA', 'PLAZA']) || 'UNK';
        const priceRaw = fuzzyFindValue(r, ['PRECIO MÁX-G', 'PRECIO', 'PVP', 'VALOR', 'AMOUNT', 'PRECIO VENTA']);
        let price = 0;
        if (typeof priceRaw === 'number') price = priceRaw;
        else if (priceRaw) {
             const clean = String(priceRaw).replace(/[^\d,.-]/g, '').replace('.', '').replace(',', '.');
             price = parseFloat(clean) || 0;
        }
        const type = fuzzyFindValue(r, ['TIPO-G', 'TIPO', 'TIPOLOGIA', 'MODELO', 'CLASE']) || '';
        const areaRaw = fuzzyFindValue(r, ['ÚTIL PRIV-G', 'UTIL', 'SUPERFICIE', 'AREA', 'M2', 'SUP UTIL']);
        let usefulArea = 0;
        if (typeof areaRaw === 'number') usefulArea = areaRaw;
        else if (areaRaw) {
             const clean = String(areaRaw).replace(/[^\d,.-]/g, '').replace('.', '').replace(',', '.');
             usefulArea = parseFloat(clean) || 0;
        }
        const statusRaw = fuzzyFindValue(r, ['ESTADO', 'STATUS', 'SITUACION']) || 'DISPONIBLE';
        let status = Status.Available;
        const sUpper = String(statusRaw).toUpperCase();
        if (sUpper.includes('RESERV')) status = Status.Reserved;
        else if (sUpper.includes('VENDID') || sUpper.includes('SOLD')) status = Status.Sold;
        const notes = fuzzyFindValue(r, ['OBSERVACIONES', 'NOTAS', 'COMENTARIOS']) || '';

        return { id: String(id), price, type: String(type), usefulArea, status, notes: String(notes), ...r };
    });
};

const mapStorages = (raw: any[]): Storage[] => {
    if (!Array.isArray(raw)) return [];
    return raw.map(r => {
        const id = fuzzyFindValue(r, ['ID-T', 'TRASTERO', 'ID', 'CODIGO', 'NUMERO', 'REFERENCIA']) || 'UNK';
        const priceRaw = fuzzyFindValue(r, ['PRECIO MÁX-T', 'PRECIO', 'PVP', 'VALOR']);
        let price = 0;
        if (typeof priceRaw === 'number') price = priceRaw;
        else if (priceRaw) {
             const clean = String(priceRaw).replace(/[^\d,.-]/g, '').replace('.', '').replace(',', '.');
             price = parseFloat(clean) || 0;
        }
        const areaRaw = fuzzyFindValue(r, ['ÚTIL PRIV-T', 'UTIL', 'SUPERFICIE', 'AREA', 'M2', 'SUP UTIL']);
        let usefulArea = 0;
        if (typeof areaRaw === 'number') usefulArea = areaRaw;
        else if (areaRaw) {
             const clean = String(areaRaw).replace(/[^\d,.-]/g, '').replace('.', '').replace(',', '.');
             usefulArea = parseFloat(clean) || 0;
        }
        const statusRaw = fuzzyFindValue(r, ['ESTADO', 'STATUS', 'SITUACION']) || 'DISPONIBLE';
        let status = Status.Available;
        const sUpper = String(statusRaw).toUpperCase();
        if (sUpper.includes('RESERV')) status = Status.Reserved;
        else if (sUpper.includes('VENDID') || sUpper.includes('SOLD')) status = Status.Sold;
        const notes = fuzzyFindValue(r, ['OBSERVACIONES', 'NOTAS', 'COMENTARIOS']) || '';

        return { id: String(id), price, usefulArea, status, notes: String(notes), ...r };
    });
};

export const useProjectData = (isOfflineMode: boolean) => {
  const [isLoading, setIsLoading] = useState(false);
  const [availableProjects, setAvailableProjects] = useState<string[]>([]);
  const [selectedProjectName, setSelectedProjectName] = useState<string | null>(null);
  
  const [projectRaw, setProjectRaw] = useState<ProjectDataRaw>({
      proyecto_nombre: '', ds_generales: {}, ts_general: [], garajes: [], trasteros: []
  });
  const [project, setProject] = useState<Project | null>(null);
  const [clients, setClients] = useState<Client[]>([]);

  // --- AUTOMATIC CLIENT BOOTSTRAPPING & SYNC ---
  useEffect(() => {
      const fetchAndBootstrapClients = async () => {
          // 1. Modo Offline: Usar muestra local siempre
          if (isOfflineMode) {
              if (clients.length === 0) setClients(SAMPLE_CLIENTS);
              return;
          }

          try {
              // 2. Modo Online: Consultar Supabase
              const { data, error, count } = await supabase.from('clients').select('*', { count: 'exact' });
              
              // Error crítico o tabla inexistente
              if (error) {
                  console.warn("Error accediendo a 'clients':", error.message);
                  if (clients.length === 0) setClients(SAMPLE_CLIENTS); 
                  return;
              }

              // 3. BOOTSTRAP: Si la tabla está vacía, inyectar datos de muestra automáticamente
              if (data && data.length === 0) {
                  console.log("Base de datos vacía. Ejecutando bootstrap automático de clientes...");
                  const mappedSampleClients = SAMPLE_CLIENTS.map(c => ({
                    id: c.id, name: c.name, last_name: c.lastName, email: c.email,
                    phone: c.phone, phone2: c.phone2, dni: c.dni, address: c.address,
                    postal_code: c.postalCode, city: c.city, province: c.province, country: c.country,
                    status: c.status, client_type: c.clientType, "group": c.group,
                    birth_date: c.birthDate, civil_status: c.civilStatus, gender: c.gender,
                    registration_date: c.registrationDate, notes: c.notes
                  }));
                  
                  const { error: insertError } = await supabase.from('clients').insert(mappedSampleClients);
                  if (!insertError) {
                      setClients(SAMPLE_CLIENTS); // Usar muestra local tras insertar
                  } else {
                      console.error("Error en bootstrap:", insertError);
                  }
              } else if (data) {
                  // 4. Datos existentes: Cargar normal
                  const mappedClients: Client[] = data.map((c: any) => ({
                      ...c,
                      phone: c.phone || '',
                      status: c.status || 'ACTIVO',
                      clientType: c.client_type || c.clientType || 'Interesado',
                      lastName: c.last_name || c.lastName,
                      postalCode: c.postal_code || c.postalCode,
                      birthDate: c.birth_date || c.birthDate,
                      civilStatus: c.civil_status || c.civilStatus,
                      registrationDate: c.registration_date || c.registrationDate || new Date().toISOString(),
                  }));
                  setClients(mappedClients);
              }
          } catch (err) {
              console.error("Error general en fetchClients:", err);
              if (clients.length === 0) setClients(SAMPLE_CLIENTS);
          }
      };
      fetchAndBootstrapClients();
  }, [isOfflineMode]);

  const handleSaveClient = async (client: Client) => {
      setClients(prev => {
          const idx = prev.findIndex(c => c.id === client.id);
          if (idx >= 0) { const newArr = [...prev]; newArr[idx] = client; return newArr; }
          return [...prev, client];
      });
      if (isOfflineMode) return;
      const dbClient = {
          id: client.id, name: client.name, last_name: client.lastName, email: client.email,
          phone: client.phone, phone2: client.phone2, dni: client.dni, address: client.address,
          postal_code: client.postalCode, city: client.city, province: client.province, country: client.country,
          status: client.status, client_type: client.clientType, "group": client.group,
          birth_date: client.birthDate, civil_status: client.civilStatus, gender: client.gender,
          registration_date: client.registrationDate, notes: client.notes
      };
      try { await supabase.from('clients').upsert(dbClient); } catch (e) { console.error(e); }
  };

  const handleBulkClientUpdate = async (clientIds: Set<string>, updates: Partial<Client>) => {
      const updatedLocalClients = clients.map(c => clientIds.has(c.id) ? { ...c, ...updates } : c);
      setClients(updatedLocalClients);
      if (isOfflineMode) return;
      const dbUpdates: any = {};
      if (updates.status) dbUpdates.status = updates.status;
      if (updates.clientType) dbUpdates.client_type = updates.clientType;
      if (updates.group) dbUpdates["group"] = updates.group;
      if (Object.keys(dbUpdates).length > 0) {
          try { await supabase.from('clients').update(dbUpdates).in('id', Array.from(clientIds)); } catch (e) { console.error(e); }
      }
  };

  // --- PROJECTS ---
  const loadProjectList = useCallback(async () => {
      if (isOfflineMode) return;
      try {
          const { data, error } = await supabase.from('datos_proyecto').select('proyecto_nombre');
          if (error) { if (error.code === '42P01') return; throw error; }
          if (data) { setAvailableProjects(Array.from(new Set(data.map((d: any) => d.proyecto_nombre)))); }
      } catch (err) { console.error("Error cargando lista de proyectos:", err); }
  }, [isOfflineMode]);

  useEffect(() => { loadProjectList(); }, [loadProjectList]);

  const loadProjectData = async (projectName: string) => {
      setIsLoading(true);
      try {
          const { data, error } = await supabase.from('datos_proyecto').select('tabla_id, datos').eq('proyecto_nombre', projectName);
          if (error) throw error;

          const rawData: ProjectDataRaw = {
              proyecto_nombre: projectName,
              ds_generales: data.find(d => d.tabla_id === 'ds_generales')?.datos || {},
              ts_general: data.find(d => d.tabla_id === 'ts_general')?.datos || [],
              garajes: data.find(d => d.tabla_id === 'garajes')?.datos || [],
              trasteros: data.find(d => d.tabla_id === 'trasteros')?.datos || []
          };
          setProjectRaw(rawData);
          setProject({
              id: projectName, name: projectName, raw: rawData,
              units: mapTsGeneralToUnits(rawData.ts_general),
              garages: mapGarages(rawData.garajes),
              storages: mapStorages(rawData.trasteros)
          });
          setSelectedProjectName(projectName);
      } catch (err) { console.error("Error cargando datos del proyecto:", err); alert("Error al cargar el proyecto."); } finally { setIsLoading(false); }
  };

  const handleDeleteProject = async (name: string) => {
      if(!window.confirm(`¿Eliminar ${name}?`)) return;
      try {
          await supabase.from('datos_proyecto').delete().eq('proyecto_nombre', name);
          await supabase.from('user_project_settings').delete().eq('project_name', name);
          setAvailableProjects(prev => prev.filter(p => p !== name));
          if (selectedProjectName === name) {
              setSelectedProjectName(null); setProject(null);
              setProjectRaw({ proyecto_nombre: '', ds_generales: {}, ts_general: [], garajes: [], trasteros: [] });
          }
      } catch (err) { console.error(err); }
  };

  // --- UNIT UPDATES ---
  const persistUnitChanges = async (updatedUnits: Unit[]) => {
      if (!selectedProjectName || !projectRaw.ts_general) return;
      const newTsGeneral = [...projectRaw.ts_general];
      
      updatedUnits.forEach(u => {
          const rowIndex = newTsGeneral.findIndex(row => {
              const rowId = fuzzyFindValue(row, ['_VIVIENDAS', 'ID', 'VIVIENDA', 'CODIGO', 'REF']);
              return String(rowId) === u.id;
          });
          if (rowIndex !== -1) {
              newTsGeneral[rowIndex] = applyChangesToRawRow(newTsGeneral[rowIndex], u);
          }
      });
      const newRawData = { ...projectRaw, ts_general: newTsGeneral };
      setProjectRaw(newRawData);

      if (!isOfflineMode) {
          await supabase.from('datos_proyecto').update({ datos: newTsGeneral }).eq('proyecto_nombre', selectedProjectName).eq('tabla_id', 'ts_general');
      }
  };

  const handleUnitUpdate = async (updatedUnit: Unit) => {
      if (!project) return;
      const newUnits = project.units.map(u => u.id === updatedUnit.id ? updatedUnit : u);
      setProject({ ...project, units: newUnits });
      await persistUnitChanges([updatedUnit]);
  };

  const handleBulkUnitUpdate = async (ids: Set<string>, updates: Partial<Unit>) => {
      if (!project) return;
      const changedUnits: Unit[] = [];
      const newUnits = project.units.map(u => {
         if (ids.has(u.id)) {
             const updated = { ...u, ...updates };
             changedUnits.push(updated);
             return updated;
         }
         return u;
      });
      setProject({ ...project, units: newUnits });
      await persistUnitChanges(changedUnits);
  };
  
  const handleServiceUpdate = async (type: 'garage' | 'storage', updatedItem: Garage | Storage) => {
      if (!project || !selectedProjectName) return;
      const listKey = type === 'garage' ? 'garages' : 'storages';
      const rawListKey = type === 'garage' ? 'garajes' : 'trasteros';
      
      const currentItems = project[listKey] as any[];
      const newItems = currentItems.map(item => item.id === updatedItem.id ? updatedItem : item);
      setProject({ ...project, [listKey]: newItems });
      
      if (!projectRaw[rawListKey]) return;
      const newRawList = [...projectRaw[rawListKey]];
      const rowIndex = newRawList.findIndex(r => {
          const id = fuzzyFindValue(r, type === 'garage' ? ['ID-G', 'GARAJE'] : ['ID-T', 'TRASTERO']) || 'UNK';
          return String(id) === updatedItem.id;
      });
      if (rowIndex !== -1) {
          const row = { ...newRawList[rowIndex] };
           // Mapeo inverso simplificado
          if (updatedItem.status) row['ESTADO'] = updatedItem.status === Status.Reserved ? 'RESERVADA' : (updatedItem.status === Status.Sold ? 'VENDIDA' : 'DISPONIBLE');
          if (updatedItem.price !== undefined) row['PRECIO'] = updatedItem.price;
          if (updatedItem.notes !== undefined) row['OBSERVACIONES'] = updatedItem.notes;
          
          newRawList[rowIndex] = row;
          setProjectRaw(prev => ({ ...prev, [rawListKey]: newRawList }));
          
          if (!isOfflineMode) {
              await supabase.from('datos_proyecto').update({ datos: newRawList }).eq('proyecto_nombre', selectedProjectName).eq('tabla_id', rawListKey);
          }
      }
  };

  return {
    isLoading,
    availableProjects,
    selectedProjectName,
    project,
    projectRaw,
    clients,
    loadProjectList,
    handleSelectProject: (name: string) => { if(!name) { setSelectedProjectName(null); setProject(null); return; } loadProjectData(name); },
    handleProjectSync: (name: string) => { loadProjectList(); loadProjectData(name); },
    handleDeleteProject,
    handleUnitUpdate,
    handleBulkUnitUpdate,
    handleServiceUpdate,
    handleSaveClient,
    handleBulkClientUpdate,
    setProject
  };
};
