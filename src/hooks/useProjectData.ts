
import { useState, useEffect, useCallback } from 'react';
import { db } from '../lib/firebaseClient'; 
import { collection, getDocs, getDoc, writeBatch, doc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
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
  
  const [projectRaw, setProjectRaw] = useState<ProjectDataRaw>({ proyecto_nombre: '', ds_generales: {}, ts_general: [], garajes: [], trasteros: [] });
  const [project, setProject] = useState<Project | null>(null);
  const [clients, setClients] = useState<Client[]>([]);

  // --- CLIENTS ---
  useEffect(() => {
      const fetchAndBootstrapClients = async () => {
          if (isOfflineMode || !db) {
              if (clients.length === 0) setClients(SAMPLE_CLIENTS);
              return;
          }

          try {
              const clientsCollection = collection(db, 'clients');
              const querySnapshot = await getDocs(clientsCollection);

              if (querySnapshot.empty) {
                  console.log("Base de datos de clientes vacía. Ejecutando bootstrap automático...");
                  const batch = writeBatch(db);
                  SAMPLE_CLIENTS.forEach(client => {
                      const docRef = doc(db, 'clients', client.id);
                      batch.set(docRef, client);
                  });
                  await batch.commit();
                  setClients(SAMPLE_CLIENTS);
                  console.log("Bootstrap de clientes completado.");
              } else {
                  const mappedClients: Client[] = querySnapshot.docs.map(doc => ({ ...(doc.data() as Client) }));
                  setClients(mappedClients);
              }
          } catch (err) {
              console.error("Error en fetchClients (Firebase):", err);
              registrarError('useProjectData', 'FIREBASE', 'fetchClients', (err as Error).message);
              if (clients.length === 0) setClients(SAMPLE_CLIENTS);
          }
      };
      fetchAndBootstrapClients();
  }, [isOfflineMode, clients.length]);

  const handleSaveClient = async (client: Client) => {
      setClients(prev => {
          const idx = prev.findIndex(c => c.id === client.id);
          if (idx >= 0) { const newArr = [...prev]; newArr[idx] = client; return newArr; }
          return [...prev, client];
      });

      if (isOfflineMode || !db) return;

      try {
          const clientRef = doc(db, 'clients', client.id);
          await setDoc(clientRef, client, { merge: true });
      } catch (e) { 
          console.error("Error guardando cliente (Firebase):", e);
          registrarError('useProjectData', 'FIREBASE', 'saveClient', (e as Error).message);
      }
  };

  const handleBulkClientUpdate = async (clientIds: Set<string>, updates: Partial<Client>) => {
      const updatedLocalClients = clients.map(c => clientIds.has(c.id) ? { ...c, ...updates } : c);
      setClients(updatedLocalClients);

      if (isOfflineMode || !db) return;
      
      try {
          const batch = writeBatch(db);
          clientIds.forEach(id => {
              const docRef = doc(db, 'clients', id);
              batch.update(docRef, updates);
          });
          await batch.commit();
      } catch (e) { 
          console.error("Error en actualización masiva de clientes (Firebase):", e); 
          registrarError('useProjectData', 'FIREBASE', 'bulkUpdateClients', (e as Error).message);
      }
  };

  // --- PROJECTS ---
  const loadProjectList = useCallback(async () => {
      if (isOfflineMode || !db) return;
      try {
          const projectsCollection = collection(db, 'projects');
          const projectSnapshot = await getDocs(projectsCollection);
          const projectNames = projectSnapshot.docs.map(doc => doc.id);
          setAvailableProjects(projectNames);
      } catch (err) {
          console.error("Error cargando lista de proyectos (Firebase):", err);
          registrarError('useProjectData', 'FIREBASE', 'loadProjectList', (err as Error).message);
      }
  }, [isOfflineMode]);

  useEffect(() => { loadProjectList(); }, [loadProjectList]);

  const loadProjectData = async (projectName: string) => {
      setIsLoading(true);
      if (!db) {
          alert("Error: Firebase no está configurado. No se puede cargar el proyecto.");
          setIsLoading(false);
          return;
      }
      try {
          const projectRef = doc(db, 'projects', projectName);
          const docSnap = await getDoc(projectRef);

          if (!docSnap.exists()) {
              throw new Error(`El proyecto '${projectName}' no existe en Firebase.`);
          }
          
          const data = docSnap.data();

          const rawData: ProjectDataRaw = {
              proyecto_nombre: projectName,
              ds_generales: data.ds_generales || {},
              ts_general: data.ts_general || [],
              garajes: data.garajes || [],
              trasteros: data.trasteros || []
          };

          setProjectRaw(rawData);
          setProject({
              id: projectName, name: projectName, raw: rawData,
              units: mapTsGeneralToUnits(rawData.ts_general),
              garages: mapGarages(rawData.garajes),
              storages: mapStorages(rawData.trasteros)
          });
          setSelectedProjectName(projectName);
      } catch (err) { 
          console.error("Error cargando datos del proyecto (Firebase):", err);
          registrarError('useProjectData', 'FIREBASE', 'loadProjectData', (err as Error).message);
          alert("Error al cargar el proyecto."); 
      } finally { 
          setIsLoading(false); 
      }
  };

  const handleDeleteProject = async (name: string) => {
      if(!window.confirm(`¿Seguro que quieres eliminar el proyecto '${name}'? Esta acción es irreversible.`)) return;
      if (!db) return;
      try {
          await deleteDoc(doc(db, 'projects', name));
          
          // TODO: Eliminar subcolecciones como 'settings' si se implementan.

          setAvailableProjects(prev => prev.filter(p => p !== name));
          if (selectedProjectName === name) {
              setSelectedProjectName(null); 
              setProject(null);
              setProjectRaw({ proyecto_nombre: '', ds_generales: {}, ts_general: [], garajes: [], trasteros: [] });
          }
      } catch (err) { 
          console.error("Error eliminando el proyecto (Firebase):", err);
          registrarError('useProjectData', 'FIREBASE', 'deleteProject', (err as Error).message);
      }
  };

  // --- UNIT & SERVICE UPDATES (Write-Back) ---
  const persistUnitChanges = async (updatedUnits: Unit[]) => {
      if (!selectedProjectName || !projectRaw.ts_general) return;
      
      let newTsGeneral = [...projectRaw.ts_general];
      updatedUnits.forEach(u => {
          const rowIndex = newTsGeneral.findIndex(row => {
              const rowId = fuzzyFindValue(row, ['_VIVIENDAS', 'ID', 'VIVIENDA', 'CODIGO', 'REF']);
              return String(rowId) === u.id;
          });
          if (rowIndex !== -1) {
              newTsGeneral[rowIndex] = applyChangesToRawRow(newTsGeneral[rowIndex], u);
          }
      });

      setProjectRaw(prev => ({ ...prev, ts_general: newTsGeneral }));

      if (!isOfflineMode && db) {
          try {
              const projectRef = doc(db, 'projects', selectedProjectName);
              await updateDoc(projectRef, { ts_general: newTsGeneral });
          } catch (e) {
              console.error("Error persistiendo cambios de unidades (Firebase):", e);
              registrarError('useProjectData', 'FIREBASE', 'persistUnitChanges', (e as Error).message);
          }
      }
  };
  
  const handleServiceUpdate = async (type: 'garage' | 'storage', updatedItem: Garage | Storage) => {
      if (!project || !selectedProjectName) return;
      const listKey = type === 'garage' ? 'garages' : 'storages';
      const rawListKey = type === 'garage' ? 'garajes' : 'trasteros';
      
      const currentItems = project[listKey] as any[];
      const newItems = currentItems.map(item => item.id === updatedItem.id ? updatedItem : item);
      setProject({ ...project, [listKey]: newItems });
      
      if (!projectRaw[rawListKey]) return;
      let newRawList = [...projectRaw[rawListKey]];
      const rowIndex = newRawList.findIndex(r => {
          const id = fuzzyFindValue(r, type === 'garage' ? ['ID-G', 'GARAJE'] : ['ID-T', 'TRASTERO']) || 'UNK';
          return String(id) === updatedItem.id;
      });

      if (rowIndex !== -1) {
          const row = { ...newRawList[rowIndex] };
          if (updatedItem.status) row['ESTADO'] = updatedItem.status === Status.Reserved ? 'RESERVADA' : (updatedItem.status === Status.Sold ? 'VENDIDA' : 'DISPONIBLE');
          if (updatedItem.price !== undefined) row[type === 'garage' ? 'PRECIO MÁX-G' : 'PRECIO MÁX-T'] = updatedItem.price;
          if (updatedItem.notes !== undefined) row['OBSERVACIONES'] = updatedItem.notes;
          
          newRawList[rowIndex] = row;
          setProjectRaw(prev => ({ ...prev, [rawListKey]: newRawList }));
          
          if (!isOfflineMode && db) {
              try {
                  const projectRef = doc(db, 'projects', selectedProjectName);
                  await updateDoc(projectRef, { [rawListKey]: newRawList });
              } catch (e) {
                  console.error(`Error persistiendo cambios de ${type} (Firebase):`, e);
                  registrarError('useProjectData', 'FIREBASE', `persist${type}Changes`, (e as Error).message);
              }
          }
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
