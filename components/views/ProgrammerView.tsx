


import React, { useState, useMemo, useEffect } from 'react';
import { ProjectDataRaw, Project, Client } from '../../types';
import { GRUPOS_VIVIENDAS_CONFIG } from './ProjectTableView';
import { GARAGES_GROUPS_CONFIG } from './GaragesView';
import { STORAGES_GROUPS_CONFIG } from './StoragesView';
import { DetailedDiagnosticTable, CARD_CONFIG } from './GeneralDataView'; 
import { fuzzyFindValue, generateStandardKey } from '../../utils';
import { obtenerErrores } from '../../utils/log_errores';
import { supabase } from '../../lib/supabaseClient';
import { 
    CommandLineIcon, TableCellsIcon, InformationCircleIcon, 
    BuildingOfficeIcon, Cog6ToothIcon, CarIcon, ArchiveBoxIcon, 
    BookOpenIcon, ClipboardDocumentCheckIcon, LightBulbIcon, BugAntIcon,
    TagIcon, PlusCircleIcon, PencilIcon, TrashIcon, ChevronLeftIcon, ChevronRightIcon,
    MapPinIcon, CheckCircleIcon, UsersIcon, BuildingLibraryIcon, CurrencyDollarIcon, HomeIcon, WrenchScrewdriverIcon,
    LockClosedIcon, ShieldCheckIcon, BoltIcon, SwatchIcon
} from '../icons/Icons';
import { BEDROOM_COLORS, BEDROOM_BG_COLORS } from '../../constants';
import Modal from '../ui/Modal';

interface ProgrammerViewProps {
    projectRaw: ProjectDataRaw;
    project: Project | null;
    clients: Client[];
}

// Level 1 Contexts
type Context = 'vision_roadmap' | 'indice_parametros' | 'planificador' | 'generales' | 'proyecto' | 'garajes' | 'trasteros' | 'sistema' | 'design_system';

// Interface for the Parameters Index
interface ParameterDefinition {
    id: string;
    key: string;
    label: string;
    group: string;
    location: string;
    currentValue?: any;
    dataType: string;
    dataQuality: 'ok' | 'zero' | 'empty' | 'null' | 'missing';
}

// --- ROADMAP DATA (MASTER PLAN ENRICHED) ---
const MASTER_PLAN_PHASES = [
    {
        id: 1,
        title: "FASE 1: CIMIENTOS Y SEGURIDAD (Rigor Técnico)",
        subtitle: "Establecer la verdad única del dato. Si no está en la base de datos, no existe.",
        status: 'in_progress', 
        items: [
            { 
                label: "Implementación Supabase Auth", 
                done: false,
                detail: "Sistema de autenticación robusto. No es solo 'entrar', es identificar quién es responsable de qué acción."
            },
            { 
                label: "Definición de Roles (RBAC)", 
                done: false,
                detail: "Arquitectura de permisos estancos. El constructor no ve márgenes financieros. El comercial no altera geometrías. Cada agente en su carril."
            },
            { 
                label: "Políticas RLS (Row Level Security)", 
                done: false,
                detail: "Seguridad a nivel de fila en PostgreSQL. Protección blindada del dato sensible."
            },
            { 
                label: "Sistema de Logs y Auditoría", 
                done: true,
                detail: "Trazabilidad absoluta. El 'quién tocó qué' deja de ser una pregunta para ser un registro inmutable."
            }
        ]
    },
    {
        id: 2,
        title: "FASE 2: POTENCIACIÓN COMERCIAL (Agilidad)",
        subtitle: "Herramientas que eliminan la fricción en la venta y reducen la ansiedad del cliente.",
        status: 'in_progress',
        items: [
            { 
                label: "Módulo Documental Automatizado", 
                done: false,
                detail: "Generación de contratos y hojas de reserva en un click. Adiós al 'copia-pega' en Word y a los errores humanos."
            },
            { 
                label: "Plano Interactivo (SVG)", 
                done: false,
                detail: "Interfaz visual de venta. El cliente compra una vivienda, no una celda en un Excel. Click para reservar."
            },
            { 
                label: "CRM Avanzado", 
                done: true,
                detail: "Gestión de leads integrada con el inventario real. Cruce inmediato entre demanda y disponibilidad."
            },
            { 
                label: "Filtros y Buscadores", 
                done: true,
                detail: "Motor de búsqueda instantáneo. Permite al comercial responder en segundos, no en minutos."
            }
        ]
    },
    {
        id: 3,
        title: "FASE 3: PERSONALIZACIONES (Nexo Obra)",
        subtitle: "Cerrar la brecha entre lo que se vende y lo que se construye.",
        status: 'pending',
        items: [
            { 
                label: "Catálogo de Opciones", 
                done: false,
                detail: "Base de datos estructurada de acabados (Suelos, Cocinas). Control de costes asociado a cada opción."
            },
            { 
                label: "Selección por Cliente", 
                done: false,
                detail: "Interfaz digital para que el cliente elija. Validación automática de incompatibilidades técnicas."
            },
            { 
                label: "Hoja de Trabajo (Obra)", 
                done: false,
                detail: "Generación de la 'Biblia de Ejecución' por unidad. La constructora recibe exactamente lo que el cliente firmó."
            }
        ]
    },
    {
        id: 4,
        title: "FASE 4: EXPANSIÓN (Ecosistema)",
        subtitle: "Apertura del sistema hacia el exterior y post-venta.",
        status: 'pending',
        items: [
            { 
                label: "Portal del Propietario", 
                done: false,
                detail: "Transparencia radical. El cliente ve el estado de su vivienda, sus documentos y sus pagos en tiempo real."
            },
            { 
                label: "API Contable / ERP", 
                done: false,
                detail: "Conexión bidireccional con contabilidad. La facturación es una consecuencia automática de la venta."
            },
            { 
                label: "Sistema de Notificaciones", 
                done: false,
                detail: "Alertas proactivas. Mantener a todos los agentes informados sin necesidad de emails constantes."
            }
        ]
    }
];

// --- ROADMAP TYPES (TICKET SYSTEM) ---
interface RoadmapItem {
    id: string;
    title: string;
    description?: string;
    type: 'feature' | 'bug' | 'chore' | 'idea';
    status: 'backlog' | 'todo' | 'in_progress' | 'done';
    priority: 'high' | 'medium' | 'low';
    solution?: string;
    created_at?: string;
}

const INITIAL_ROADMAP: RoadmapItem[] = [];

// --- COMPONENTES AUXILIARES UI ---

const SidebarButton = ({ active, onClick, icon, label }: any) => (
    <button onClick={onClick} className={`w-full text-left px-3 py-2 rounded flex items-center space-x-2 text-xs transition-colors ${active ? 'bg-green-900/30 text-green-400 border border-green-500/30' : 'hover:bg-gray-700 text-gray-400'}`}>
        {icon}
        <span>{label}</span>
    </button>
);

const StatusBadge = ({ quality, value }: { quality: ParameterDefinition['dataQuality'], value: any }) => {
    if (quality === 'ok') {
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-green-900/30 text-green-400 border border-green-500/30">OK</span>;
    }
    if (quality === 'zero' || quality === 'empty') {
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-purple-900/30 text-purple-400 border border-purple-500/30 uppercase">{quality === 'zero' ? 'CERO' : 'VACÍO'}</span>;
    }
    return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-red-900/30 text-red-400 border border-red-500/30 uppercase">MISSING</span>;
};

// --- MANIFIESTO REDISEÑADO (Formato Documento Grande) ---

const RenderVision = () => (
    <div className="w-full max-w-[1600px] mx-auto pb-10 px-6 font-sans">
        <div className="mb-10 border-b border-gray-700 pb-6">
            <h1 className="text-6xl font-bold text-white tracking-tight mb-6 mt-4">
                AXIS-Z <span className="text-green-500">GPI</span>
            </h1>
            <p className="text-2xl text-gray-200 max-w-4xl leading-relaxed">
                Gestión de Proyectos Inmobiliarios: El fin de los silos de información.
            </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            {/* COLUMNA PRINCIPAL (TEXTO) */}
            <div className="lg:col-span-7 space-y-16">
                <section>
                    <h2 className="text-3xl font-bold text-green-400 mb-6 uppercase tracking-wider">El Problema: La Torre de Babel</h2>
                    <div className="text-xl text-gray-200 leading-relaxed space-y-6">
                        <p>
                            Históricamente, la arquitectura y la promoción inmobiliaria han vivido en realidades paralelas. 
                            El <strong>Arquitecto</strong> tiene unos planos (la verdad geométrica). 
                            El <strong>Comercial</strong> tiene un Excel de precios (la verdad económica). 
                            La <strong>Constructora</strong> tiene unas mediciones (la verdad física).
                        </p>
                        <p>
                            Cuando estas tres verdades no coinciden, nacen los problemas: sobrecostes, errores de ejecución 
                            y clientes frustrados. <span className="text-white font-bold">AXIS-Z nace para destruir esa fragmentación.</span>
                        </p>
                    </div>
                </section>

                <section>
                    <h2 className="text-3xl font-bold text-green-400 mb-6 uppercase tracking-wider">La Filosofía: Single Source of Truth</h2>
                    <div className="text-xl text-gray-200 leading-relaxed space-y-6">
                        <p>
                            Solo puede haber una verdad. En AXIS-Z, el dato fluye en una única dirección lógica pero alimenta a todos.
                            El <strong>Dato Técnico</strong> es sagrado e inmutable, proviene del JSON/BIM. Nadie puede "opinar" sobre los metros cuadrados de una vivienda; son los que son.
                        </p>
                        <p>
                            El <strong>Dato Comercial</strong> (precios, estados) se construye sobre esa base técnica, no en paralelo. 
                            Si cambia la arquitectura, el sistema comercial se entera inmediatamente. No hay versiones de Excel perdidas en correos electrónicos.
                        </p>
                    </div>
                </section>

                <section>
                    <h2 className="text-3xl font-bold text-green-400 mb-6 uppercase tracking-wider">El Ecosistema</h2>
                    <div className="text-xl text-gray-200 leading-relaxed space-y-6">
                        <p>
                            Esta aplicación no es un visor de tablas. Es un <strong>Sistema Operativo</strong> diseñado para coordinar a cinco agentes con intereses a menudo contrapuestos, alineándolos bajo una misma interfaz:
                        </p>
                        <ul className="list-disc pl-6 space-y-4 mt-4">
                            <li><strong className="text-white">El Arquitecto:</strong> Necesita que se respete la geometría. AXIS-Z garantiza la integridad del dato técnico.</li>
                            <li><strong className="text-white">El Promotor:</strong> Necesita certidumbre financiera. AXIS-Z le da ROI y Cashflow en tiempo real.</li>
                            <li><strong className="text-white">El Comercial:</strong> Necesita agilidad. AXIS-Z le da herramientas visuales y contratos automáticos.</li>
                            <li><strong className="text-white">La Constructora:</strong> Necesita claridad. AXIS-Z vincula las elecciones del cliente directamente a la obra.</li>
                            <li><strong className="text-white">El Cliente Final:</strong> Necesita paz mental. AXIS-Z ofrece transparencia.</li>
                        </ul>
                    </div>
                </section>
            </div>

            {/* COLUMNA LATERAL (DESTACADOS) */}
            <div className="lg:col-span-5 space-y-8">
                <div className="bg-gray-800 p-8 rounded-xl border border-gray-700 shadow-2xl">
                    <h3 className="text-2xl font-bold text-white mb-6 border-b border-gray-600 pb-4">Principios Innegociables</h3>
                    <ul className="space-y-6">
                        <li className="flex items-start">
                            <div className="mr-4 text-green-400 mt-1">
                                <LockClosedIcon className="h-8 w-8" />
                            </div>
                            <div>
                                <strong className="block text-green-400 text-lg mb-1">Integridad del Dato</strong>
                                <span className="text-lg text-gray-300 leading-snug">La geometría viene del BIM. El precio viene de la Estrategia. No se mezclan, se complementan.</span>
                            </div>
                        </li>
                        <li className="flex items-start">
                            <div className="mr-4 text-green-400 mt-1">
                                <ShieldCheckIcon className="h-8 w-8" />
                            </div>
                            <div>
                                <strong className="block text-green-400 text-lg mb-1">Seguridad por Diseño</strong>
                                <span className="text-lg text-gray-300 leading-snug">Roles estrictos (RLS). Un comercial no edita arquitectura. Un arquitecto no ve márgenes financieros.</span>
                            </div>
                        </li>
                        <li className="flex items-start">
                            <div className="mr-4 text-green-400 mt-1">
                                <BoltIcon className="h-8 w-8" />
                            </div>
                            <div>
                                <strong className="block text-green-400 text-lg mb-1">Velocidad y Estética</strong>
                                <span className="text-lg text-gray-300 leading-snug">El diseño no es cosmético, es funcionalidad. La herramienta debe ser rápida, oscura y profesional.</span>
                            </div>
                        </li>
                    </ul>
                </div>

                <div className="bg-blue-900/20 p-8 rounded-xl border border-blue-500/30">
                    <h3 className="text-2xl font-bold text-blue-300 mb-4">¿Por qué Web?</h3>
                    <p className="text-lg text-gray-200 leading-relaxed">
                        Porque el Excel es local, frágil y propenso al error humano. La Web es centralizada, robusta, accesible desde cualquier lugar y la única forma de garantizar que todos miran la misma realidad al mismo tiempo.
                    </p>
                </div>
            </div>
        </div>
    </div>
);

const RenderRoadmap = () => (
    <div className="w-full h-full flex flex-col px-4">
        <div className="pb-6 px-2 shrink-0">
            <h2 className="text-4xl font-bold text-white mb-2">Plan Maestro de Desarrollo</h2>
            <p className="text-xl text-gray-400">Hoja de ruta estratégica para la evolución de AXIS-Z</p>
        </div>

        <div className="flex-1 overflow-y-auto pr-2">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 pb-10">
                {MASTER_PLAN_PHASES.map((phase) => {
                    const completedCount = phase.items.filter(i => i.done).length;
                    const totalCount = phase.items.length;
                    const progress = Math.round((completedCount / totalCount) * 100);
                    const isComplete = progress === 100;
                    const isInProgress = progress > 0 && progress < 100;

                    return (
                        <div key={phase.id} className={`border rounded-xl overflow-hidden flex flex-col shadow-lg ${isInProgress ? 'bg-gray-800 border-green-500/40' : 'bg-gray-800/40 border-gray-700'}`}>
                            {/* Header de Fase */}
                            <div className="p-6 border-b border-gray-700 bg-gray-900/40 flex justify-between items-center">
                                <div>
                                    <div className="flex items-center gap-4 mb-2">
                                        <h3 className={`text-2xl font-bold uppercase tracking-wide ${isComplete ? 'text-green-400' : 'text-white'}`}>
                                            {phase.title}
                                        </h3>
                                        {isInProgress && <span className="bg-green-900 text-green-400 text-xs font-bold px-3 py-1 rounded-full border border-green-500/30 uppercase tracking-wider">En curso</span>}
                                    </div>
                                    <p className="text-lg text-gray-400 italic">{phase.subtitle}</p>
                                </div>
                                <div className="text-right pl-6">
                                    <span className={`text-3xl font-mono font-bold ${isComplete ? 'text-green-400' : 'text-gray-500'}`}>{progress}%</span>
                                </div>
                            </div>

                            {/* Items de la Fase */}
                            <div className="p-6 flex-1 bg-black/10">
                                <div className="space-y-4">
                                    {phase.items.map((item, idx) => (
                                        <div key={idx} className={`flex items-start p-4 rounded-lg border transition-all hover:shadow-md ${item.done ? 'bg-green-900/10 border-green-500/20' : 'bg-gray-900 border-gray-700 hover:border-gray-500'}`}>
                                            <div className={`mt-1 mr-5 shrink-0 w-8 h-8 rounded-full flex items-center justify-center border-2 ${item.done ? 'bg-green-600 border-green-600' : 'border-gray-600 bg-gray-800'}`}>
                                                {item.done && <CheckCircleIcon className="w-5 h-5 text-white" />}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className={`text-xl font-bold mb-2 ${item.done ? 'text-green-200 line-through decoration-green-500/50' : 'text-gray-100'}`}>
                                                    {item.label}
                                                </h4>
                                                <p className={`text-lg leading-relaxed ${item.done ? 'text-gray-500' : 'text-gray-300'}`}>
                                                    {item.detail}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    </div>
);

// --- SUB-VISTA: VISIÓN Y PLAN MAESTRO (MASTER PLAN VIEW) ---
const MasterPlanView = () => {
    const [activeTab, setActiveTab] = useState<'plan' | 'vision'>('plan');

    return (
        <div className="flex flex-col h-full w-full bg-gray-900">
            <div className="flex justify-center space-x-8 border-b border-gray-800 pb-0 mb-0 shrink-0 bg-gray-900 sticky top-0 z-20 pt-4">
                <button 
                    onClick={() => setActiveTab('plan')} 
                    className={`pb-4 px-8 text-base font-bold uppercase tracking-widest transition-all border-b-4 ${activeTab === 'plan' ? 'text-green-400 border-green-400' : 'text-gray-500 border-transparent hover:text-gray-300 hover:border-gray-700'}`}
                >
                    Plan Maestro
                </button>
                <button 
                    onClick={() => setActiveTab('vision')} 
                    className={`pb-4 px-8 text-base font-bold uppercase tracking-widest transition-all border-b-4 ${activeTab === 'vision' ? 'text-green-400 border-green-400' : 'text-gray-500 border-transparent hover:text-gray-300 hover:border-gray-700'}`}
                >
                    Manifiesto
                </button>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 p-4 md:p-8 w-full">
                {activeTab === 'vision' && <RenderVision />}
                {activeTab === 'plan' && <RenderRoadmap />}
            </div>
        </div>
    );
};

// --- SUB-VISTA: ROADMAP TÁCTICO (TICKETS) ---
const DevRoadmapModule = () => {
    const [items, setItems] = useState<RoadmapItem[]>(INITIAL_ROADMAP);
    const [viewMode, setViewMode] = useState<'kanban' | 'bitacora'>('kanban');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<RoadmapItem | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchItems = async () => {
            setIsLoading(true);
            const { data, error } = await supabase.from('dev_roadmap').select('*').order('created_at', { ascending: false });
            if (data) setItems(data as RoadmapItem[]);
            setIsLoading(false);
        };
        fetchItems();
    }, []);

    const handleSave = async (item: RoadmapItem) => {
        setIsLoading(true);
        const { error } = await supabase.from('dev_roadmap').upsert(item);
        if (!error) {
            setItems(prev => {
                const idx = prev.findIndex(i => i.id === item.id);
                if (idx >= 0) { const n = [...prev]; n[idx] = item; return n; }
                return [item, ...prev];
            });
            setIsModalOpen(false);
            setEditingItem(null);
        } else {
            alert("Error guardando (Verifica que ejecutaste el SQL): " + error.message);
        }
        setIsLoading(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("¿Borrar ticket?")) return;
        const { error } = await supabase.from('dev_roadmap').delete().eq('id', id);
        if (!error) setItems(prev => prev.filter(i => i.id !== id));
    };

    const moveStatus = async (item: RoadmapItem, newStatus: RoadmapItem['status']) => {
        const updated = { ...item, status: newStatus };
        setItems(prev => prev.map(i => i.id === item.id ? updated : i));
        await supabase.from('dev_roadmap').update({ status: newStatus }).eq('id', item.id);
    };

    const getTypeIcon = (type: string) => {
        switch(type) {
            case 'feature': return <LightBulbIcon className="h-4 w-4 text-yellow-400" />;
            case 'bug': return <BugAntIcon className="h-4 w-4 text-red-400" />;
            case 'idea': return <InformationCircleIcon className="h-4 w-4 text-blue-400" />;
            default: return <TagIcon className="h-4 w-4 text-gray-400" />;
        }
    };

    const getPriorityColor = (p: string) => {
        if(p==='high') return 'text-red-400 border-red-900/50 bg-red-900/20';
        if(p==='medium') return 'text-yellow-400 border-yellow-900/50 bg-yellow-900/20';
        return 'text-green-400 border-green-900/50 bg-green-900/20';
    }

    const KanbanColumn = ({ status, title }: { status: RoadmapItem['status'], title: string }) => (
        <div className="flex-1 min-w-[200px] bg-gray-800 rounded border border-gray-700 flex flex-col h-full overflow-hidden">
            <div className="p-3 border-b border-gray-700 font-bold text-sm text-gray-300 uppercase flex justify-between items-center bg-gray-900/50">
                {title}
                <span className="bg-gray-700 px-2 rounded text-xs text-white">{items.filter(i => i.status === status).length}</span>
            </div>
            <div className="p-3 space-y-3 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-gray-600">
                {items.filter(i => i.status === status).map(item => (
                    <div key={item.id} className="bg-gray-900 p-3 rounded border border-gray-700 hover:border-gray-500 transition-colors group relative">
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center space-x-2">
                                {getTypeIcon(item.type)}
                                <span className={`text-[10px] px-1.5 py-0.5 rounded border uppercase font-bold ${getPriorityColor(item.priority)}`}>{item.priority}</span>
                            </div>
                            <div className="flex space-x-2 opacity-50 group-hover:opacity-100">
                                <button onClick={() => { setEditingItem(item); setIsModalOpen(true); }} className="hover:text-white"><PencilIcon className="h-4 w-4" /></button>
                                <button onClick={() => handleDelete(item.id)} className="hover:text-red-400"><TrashIcon className="h-4 w-4" /></button>
                            </div>
                        </div>
                        <h4 className="text-white font-bold text-sm mb-2 leading-tight">{item.title}</h4>
                        <div className="mt-3 flex justify-between items-center pt-2 border-t border-gray-800">
                            {status !== 'backlog' && <button onClick={() => moveStatus(item, status === 'done' ? 'in_progress' : status === 'in_progress' ? 'todo' : 'backlog')} className="text-gray-500 hover:text-white"><ChevronLeftIcon className="h-4 w-4" /></button>}
                            <span className="text-xs text-gray-600">{new Date(item.created_at!).toLocaleDateString()}</span>
                            {status !== 'done' && <button onClick={() => moveStatus(item, status === 'backlog' ? 'todo' : status === 'todo' ? 'in_progress' : 'done')} className="text-gray-500 hover:text-white"><ChevronRightIcon className="h-4 w-4" /></button>}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="flex flex-col h-full">
            <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-gray-800/50 shrink-0">
                <div className="flex space-x-2">
                    <button onClick={() => setViewMode('kanban')} className={`flex items-center space-x-2 px-3 py-1.5 rounded text-sm font-bold ${viewMode === 'kanban' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}>
                        <TableCellsIcon className="h-4 w-4" /> <span>Tablero Táctico</span>
                    </button>
                    <button onClick={() => setViewMode('bitacora')} className={`flex items-center space-x-2 px-3 py-1.5 rounded text-sm font-bold ${viewMode === 'bitacora' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}>
                        <BookOpenIcon className="h-4 w-4" /> <span>Bitácora Técnica</span>
                    </button>
                </div>
                <button 
                    onClick={() => { setEditingItem({ id: crypto.randomUUID(), title: '', type: 'feature', status: 'todo', priority: 'medium' }); setIsModalOpen(true); }}
                    className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded text-sm font-bold flex items-center"
                >
                    <PlusCircleIcon className="h-4 w-4 mr-2" />
                    Nuevo Ticket
                </button>
            </div>

            <div className="flex-1 overflow-hidden p-4">
                {viewMode === 'kanban' && (
                    <div className="flex space-x-4 h-full overflow-x-auto">
                        <KanbanColumn title="Ideas / Backlog" status="backlog" />
                        <KanbanColumn title="Por Hacer" status="todo" />
                        <KanbanColumn title="En Progreso" status="in_progress" />
                        <KanbanColumn title="Hecho" status="done" />
                    </div>
                )}

                {viewMode === 'bitacora' && (
                    <div className="space-y-3 overflow-y-auto h-full pr-2">
                        {items.filter(i => i.solution || i.type === 'bug').map(item => (
                            <div key={item.id} className="bg-gray-800 p-4 rounded border border-gray-700 text-sm">
                                <div className="flex items-start gap-4">
                                    <div className="pt-1">{getTypeIcon(item.type)}</div>
                                    <div className="flex-1">
                                        <div className="flex justify-between mb-2">
                                            <h4 className="text-white font-bold text-base">{item.title}</h4>
                                            <span className={`text-xs px-2 py-0.5 rounded border ${item.status === 'done' ? 'border-green-500 text-green-400' : 'border-gray-500 text-gray-400'}`}>{item.status}</span>
                                        </div>
                                        <p className="text-gray-300 mb-3 text-sm">{item.description}</p>
                                        <div className="bg-black/30 p-3 rounded border border-gray-700/50">
                                            <span className="text-green-500 text-xs font-bold uppercase block mb-2">Solución Técnica / Notas:</span>
                                            <p className="text-gray-300 whitespace-pre-wrap text-sm font-mono">{item.solution || "Pendiente de documentar..."}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => { setEditingItem(item); setIsModalOpen(true); }} className="text-gray-500 hover:text-white"><PencilIcon className="h-5 w-5" /></button>
                                </div>
                            </div>
                        ))}
                        {items.filter(i => i.solution || i.type === 'bug').length === 0 && (
                            <div className="text-center text-gray-500 mt-10 text-sm">No hay entradas en la bitácora.</div>
                        )}
                    </div>
                )}
            </div>

            {isModalOpen && editingItem && (
                <Modal title={editingItem.created_at ? "Editar Ticket" : "Nuevo Ticket"} onClose={() => setIsModalOpen(false)}>
                    <div className="space-y-4 p-2 text-gray-800">
                        <div>
                            <label className="block text-sm font-bold mb-1">Título</label>
                            <input type="text" value={editingItem.title} onChange={e => setEditingItem({...editingItem, title: e.target.value})} className="w-full bg-white text-gray-900 border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                             <div>
                                <label className="block text-sm font-bold mb-1">Tipo</label>
                                <select value={editingItem.type} onChange={e => setEditingItem({...editingItem, type: e.target.value as any})} className="w-full bg-white text-gray-900 border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none">
                                    <option value="feature">Funcionalidad</option>
                                    <option value="bug">Error (Bug)</option>
                                    <option value="chore">Tarea Técnica</option>
                                    <option value="idea">Idea</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-1">Prioridad</label>
                                <select value={editingItem.priority} onChange={e => setEditingItem({...editingItem, priority: e.target.value as any})} className="w-full bg-white text-gray-900 border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none">
                                    <option value="low">Baja</option>
                                    <option value="medium">Media</option>
                                    <option value="high">Alta</option>
                                </select>
                            </div>
                             <div>
                                <label className="block text-sm font-bold mb-1">Estado</label>
                                <select value={editingItem.status} onChange={e => setEditingItem({...editingItem, status: e.target.value as any})} className="w-full bg-white text-gray-900 border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none">
                                    <option value="backlog">Ideas / Futuro</option>
                                    <option value="todo">Por Hacer</option>
                                    <option value="in_progress">En Progreso</option>
                                    <option value="done">Completado</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-1">Descripción</label>
                            <textarea rows={4} value={editingItem.description || ''} onChange={e => setEditingItem({...editingItem, description: e.target.value})} className="w-full bg-white text-gray-900 border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
                        </div>
                        <div className="bg-purple-50 p-3 rounded border border-purple-200">
                            <label className="block text-sm font-bold mb-1 text-purple-700">Solución Técnica (Bitácora)</label>
                            <textarea rows={4} value={editingItem.solution || ''} onChange={e => setEditingItem({...editingItem, solution: e.target.value})} className="w-full bg-white text-gray-900 border p-2 rounded focus:ring-2 focus:ring-purple-500 outline-none font-mono text-sm" placeholder="Detalles técnicos, snippets de código, SQL..." />
                        </div>
                        <div className="flex justify-end pt-2">
                            <button onClick={() => handleSave(editingItem)} className="bg-blue-600 text-white px-6 py-2 rounded font-bold hover:bg-blue-500 shadow-sm">Guardar Ticket</button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

// --- COMPONENTE DE DIAGNÓSTICO DE TABLAS ---
const TableMappingDiagnostic = ({ config, sampleData, title }: { config: any[], sampleData: any, title: string }) => {
    
    const determineQuality = (val: any): ParameterDefinition['dataQuality'] => {
        if (val === undefined) return 'missing';
        if (val === null) return 'null';
        if (val === '' || (typeof val === 'string' && val.trim() === '')) return 'empty';
        if (val === 0 || val === '0') return 'zero';
        return 'ok';
    };

    return (
        <div className="border border-gray-700 rounded overflow-hidden mb-6">
            <div className="bg-gray-800 px-3 py-2 font-bold text-white text-xs uppercase tracking-wide border-b border-gray-700 flex justify-between">
                <span>{title}</span>
                {sampleData ? (
                    <span className="text-green-400">Datos Detectados</span>
                ) : (
                    <span className="text-red-400">Sin Datos de Muestra</span>
                )}
            </div>
            <div className="p-0">
                {config.map((group: any, gIdx: number) => (
                    <div key={gIdx} className="border-b border-gray-700 last:border-0">
                        <div className="bg-gray-900 px-3 py-1 text-[10px] font-bold text-gray-500 uppercase">{group.nombre || group.name}</div>
                        <div className="grid grid-cols-1 divide-y divide-gray-800">
                             {(group.columnas || group.columns).map((col: any, cIdx: number) => {
                                 const colKey = typeof col === 'string' ? col : col.key;
                                 const colLabel = typeof col === 'string' ? (col.includes('_') ? col.split('_').slice(1).join('_') : col) : col.label;
                                 
                                 // Búsqueda simulada para ver qué encuentra
                                 const searchKeys = [colKey, colLabel];
                                 if (typeof col === 'string') {
                                    const suffix = col.includes('_') ? col.split('_').slice(1).join('_') : col;
                                    searchKeys.push(suffix);
                                 }

                                 const val = fuzzyFindValue(sampleData || {}, searchKeys);
                                 const quality = determineQuality(val);

                                 return (
                                     <div key={cIdx} className="grid grid-cols-12 gap-2 px-3 py-1 hover:bg-gray-800 items-center">
                                         <div className="col-span-4 text-gray-400 text-[10px] truncate" title={colLabel}>{colLabel}</div>
                                         <div className="col-span-4 text-gray-500 text-[9px] font-mono truncate" title={colKey}>{colKey}</div>
                                         <div className="col-span-4 text-right flex items-center justify-end gap-2">
                                             {/* Valor crudo (cortado) */}
                                             {val !== undefined && (
                                                 <span className="text-gray-300 text-[9px] truncate max-w-[80px]">{String(val).substring(0, 20)}</span>
                                             )}
                                             {/* Semáforo */}
                                             <StatusBadge quality={quality} value={val} />
                                         </div>
                                     </div>
                                 )
                             })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- DESIGN SYSTEM / COLOR PALETTE VIEW ---
const DesignSystemView = () => {
    return (
        <div className="h-full w-full overflow-y-auto p-8 font-sans">
            <h2 className="text-3xl font-bold text-white mb-2">Sistema de Diseño</h2>
            <p className="text-gray-400 mb-10">Guía de estilo oficial de AXIS-Z GPI. Referencia para asegurar consistencia visual.</p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* COLORES DE ESTADO */}
                <section>
                    <h3 className="text-xl font-bold text-white mb-4 border-b border-gray-700 pb-2">Estados de Unidades</h3>
                    <div className="space-y-4">
                        <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 rounded-lg bg-[#16a34a] shadow-lg"></div>
                            <div>
                                <strong className="block text-white">Available (Disponible)</strong>
                                <span className="text-gray-500 font-mono text-sm">#16a34a (Green-600)</span>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 rounded-lg bg-[#6B8CAC] shadow-lg"></div>
                            <div>
                                <strong className="block text-white">Reserved (Reservado)</strong>
                                <span className="text-gray-500 font-mono text-sm">#6B8CAC (Steel Blue)</span>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 rounded-lg bg-[#C07575] shadow-lg"></div>
                            <div>
                                <strong className="block text-white">Sold (Vendido)</strong>
                                <span className="text-gray-500 font-mono text-sm">#C07575 (Muted Terracotta)</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CODIGO DE COLORES DORMITORIOS */}
                <section>
                    <h3 className="text-xl font-bold text-white mb-4 border-b border-gray-700 pb-2">Tipología (Dormitorios)</h3>
                    <p className="text-gray-400 text-sm mb-4">Código de color usado en tarjetas y tablas para identificar rápidamente el tamaño de la vivienda.</p>
                    <div className="grid grid-cols-1 gap-4">
                        {[
                            { label: '1 Dormitorio', colorClass: 'border-yellow-400', bgClass: 'bg-yellow-400/20', textClass: 'text-yellow-400' },
                            { label: '2 Dormitorios', colorClass: 'border-cyan-400', bgClass: 'bg-cyan-400/20', textClass: 'text-cyan-400' },
                            { label: '3 Dormitorios', colorClass: 'border-orange-400', bgClass: 'bg-orange-400/20', textClass: 'text-orange-400' },
                            { label: '4 Dormitorios', colorClass: 'border-pink-500', bgClass: 'bg-pink-500/20', textClass: 'text-pink-500' },
                            { label: '5+ Dormitorios', colorClass: 'border-indigo-500', bgClass: 'bg-indigo-500/20', textClass: 'text-indigo-500' },
                        ].map((item, idx) => (
                            <div key={idx} className={`flex items-center p-3 rounded border-l-4 bg-gray-800 ${item.colorClass}`}>
                                <span className={`font-bold text-lg mr-4 ${item.textClass}`}>{idx + 1}</span>
                                <div className="flex-1">
                                    <span className="text-white block font-bold">{item.label}</span>
                                    <div className={`mt-1 h-6 w-full rounded ${item.bgClass} flex items-center px-2`}>
                                        <span className={`text-xs font-mono ${item.textClass}`}>Background Style Preview</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* TIPOGRAFIA */}
                <section className="lg:col-span-2">
                    <h3 className="text-xl font-bold text-white mb-4 border-b border-gray-700 pb-2">Tipografía (Montserrat)</h3>
                    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 space-y-6">
                        <div>
                            <h1 className="text-4xl font-bold text-white mb-2">H1 - Montserrat Bold (36px+)</h1>
                            <p className="text-gray-400">Usado en títulos de sección principales y paneles de marketing.</p>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-2">H2 - Montserrat Bold (24px)</h2>
                            <p className="text-gray-400">Usado en cabeceras de tarjetas y subtítulos importantes.</p>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-white mb-2">H3 - Montserrat Semibold (18px)</h3>
                            <p className="text-gray-400">Títulos de widgets y agrupaciones.</p>
                        </div>
                        <div>
                            <p className="text-base text-gray-300 leading-relaxed">
                                <strong>Body Text (Base):</strong> Montserrat Regular 16px. Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
                                Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-400 leading-relaxed">
                                <strong>Small Text:</strong> Montserrat Regular 14px/12px. Usado en tablas densas y metadatos secundarios.
                            </p>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}


const ProgrammerView: React.FC<ProgrammerViewProps> = ({ projectRaw, project, clients }) => {
    const [activeContext, setActiveContext] = useState<Context>('vision_roadmap'); 
    const [paramSearch, setParamSearch] = useState('');
    const [showSqlHelp, setShowSqlHelp] = useState(false);

    // Helper Inteligente para detectar tipo de dato
    const detectType = (val: any, key: string): string => {
        const k = key.toLowerCase();
        if (val === null || val === undefined) return 'null';
        
        // Inferencia Semántica por Nombre de Clave
        if (k.includes('precio') || k.includes('pem') || k.includes('coste') || k.includes('valor') || k.includes('importe') || k.includes('pvp') || k.includes('fianza') || k.includes('tasas')) return 'Currency (€)';
        if (k.includes('porc') || k.includes('percent') || k.includes('%') || k.includes('pct')) return 'Percentage (%)';
        if (k.includes('sup') || k.includes('area') || k.includes('m2') || k.includes('surface') || k.includes('edificabilidad')) return 'Area (m²)';
        if (k.includes('fecha') || k.includes('date') || k.includes('cfo')) return 'Date';
        if (k.includes('id') || k.includes('codigo') || k.includes('ref')) return 'ID / Code';
        if (k.includes('estado') || k.includes('status') || k.includes('situacion')) return 'Status';
        
        // Inferencia Técnica por Valor
        if (Array.isArray(val)) return 'Array';
        const t = typeof val;
        if (t === 'number') return Number.isInteger(val) ? 'Integer' : 'Float';
        if (t === 'boolean') return 'Boolean';
        
        return 'String';
    };

    const detectQuality = (val: any): ParameterDefinition['dataQuality'] => {
        if (val === undefined) return 'missing';
        if (val === null) return 'null';
        if (val === '' || (typeof val === 'string' && val.trim() === '')) return 'empty';
        if (val === 0 || val === '0') return 'zero';
        return 'ok';
    };

    // Parameters Index Generation (ACTUALIZADO PARA INCLUIR TODO)
    const parametersIndex = useMemo(() => {
        const params: ParameterDefinition[] = [];
        let counter = 1;
        const generateId = () => `IdPar-${String(counter++).padStart(4, '0')}`;

        // 1. From General Data
        CARD_CONFIG.forEach(card => {
            card.items.forEach((item: any) => {
                const val = fuzzyFindValue(projectRaw.ds_generales, [item.label]);
                const cleanKey = generateStandardKey(item.label);
                params.push({ 
                    id: generateId(), 
                    key: cleanKey, 
                    label: item.label, 
                    group: 'Datos Generales', 
                    location: `Tarjeta ${card.id}`, 
                    currentValue: val, 
                    dataType: detectType(val, cleanKey), // Pass key for better detection
                    dataQuality: detectQuality(val) 
                });
            });
        });
        // 2. From TS Table (Viviendas)
        if (projectRaw.ts_general && projectRaw.ts_general.length > 0) {
            const sample = projectRaw.ts_general[0];
            GRUPOS_VIVIENDAS_CONFIG.forEach(group => {
                group.columnas.forEach((col: string) => {
                    const suffix = col.includes('_') ? col.split('_').slice(1).join('_') : col;
                    const val = fuzzyFindValue(sample, [col, suffix]);
                    const cleanKey = generateStandardKey(col);
                    params.push({ 
                        id: generateId(), 
                        key: cleanKey, 
                        label: suffix, 
                        group: 'Viviendas (TS)', 
                        location: `Tabla Proyecto`, 
                        currentValue: val, 
                        dataType: detectType(val, cleanKey), 
                        dataQuality: detectQuality(val) 
                    });
                });
            });
        }
        // 3. From Garages
        if (projectRaw.garajes && projectRaw.garajes.length > 0) {
            const sample = projectRaw.garajes[0];
            GARAGES_GROUPS_CONFIG.forEach(group => {
               group.columns.forEach((col) => {
                   const val = fuzzyFindValue(sample, [col.key, col.label]);
                   const cleanKey = generateStandardKey(col.label);
                   params.push({ 
                       id: generateId(), 
                       key: cleanKey, 
                       label: col.label, 
                       group: 'Garajes', 
                       location: 'Tabla Garajes', 
                       currentValue: val, 
                       dataType: detectType(val, cleanKey), 
                       dataQuality: detectQuality(val) 
                   });
               });
            });
       }
        // 4. From Storages
        if (projectRaw.trasteros && projectRaw.trasteros.length > 0) {
            const sample = projectRaw.trasteros[0];
            STORAGES_GROUPS_CONFIG.forEach(group => {
               group.columns.forEach((col) => {
                   const val = fuzzyFindValue(sample, [col.key, col.label]);
                   const cleanKey = generateStandardKey(col.label);
                   params.push({ 
                       id: generateId(), 
                       key: cleanKey, 
                       label: col.label, 
                       group: 'Trasteros', 
                       location: 'Tabla Trasteros', 
                       currentValue: val, 
                       dataType: detectType(val, cleanKey), 
                       dataQuality: detectQuality(val) 
                   });
               });
            });
       }

        return params;
    }, [projectRaw]);

     // SQL Help
    const getRepairSql = () => {
        return `
-- 1. TABLA DE ROADMAP (Planificador) - REQUERIDA
CREATE TABLE IF NOT EXISTS dev_roadmap (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  type text DEFAULT 'feature',
  status text DEFAULT 'todo',
  priority text DEFAULT 'medium',
  solution text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);
ALTER TABLE dev_roadmap ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Access Roadmap" ON dev_roadmap;
CREATE POLICY "Public Access Roadmap" ON dev_roadmap FOR ALL USING (true) WITH CHECK (true);

-- Refrescar esquema
NOTIFY pgrst, 'reload config';
`.trim();
    };

    // Render Content Switcher
    const renderContent = () => {
        switch (activeContext) {
            case 'vision_roadmap':
                return <MasterPlanView />;
            case 'planificador':
                return <DevRoadmapModule />;
            case 'design_system':
                return <DesignSystemView />;
            case 'indice_parametros':
                return (
                    <div className="h-full flex flex-col">
                         <div className="flex justify-between items-center bg-gray-800 p-3 rounded border border-gray-700 mb-4">
                            <h3 className="font-bold text-sm text-white flex items-center"><BookOpenIcon className="h-4 w-4 mr-2 text-green-400"/> Índice de Parámetros</h3>
                            <input type="text" placeholder="Buscar variable..." value={paramSearch} onChange={e => setParamSearch(e.target.value)} className="bg-gray-900 border border-gray-600 rounded px-2 py-1 text-xs text-white w-64" />
                         </div>
                         <div className="flex-1 overflow-auto border border-gray-700 rounded bg-black/50">
                            <table className="w-full text-left text-[11px]">
                                <thead className="bg-gray-800 text-gray-400 sticky top-0 z-10">
                                    <tr>
                                        <th className="p-2 w-24">Grupo</th>
                                        <th className="p-2 w-40">Etiqueta App</th>
                                        <th className="p-2 w-40">Clave Generada</th>
                                        <th className="p-2 w-28">Tipo</th>
                                        <th className="p-2 w-20">Estado</th>
                                        <th className="p-2">Valor Muestra</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800">
                                    {parametersIndex.filter(p => p.label.toLowerCase().includes(paramSearch.toLowerCase()) || p.group.toLowerCase().includes(paramSearch.toLowerCase())).map(p => (
                                        <tr key={p.id} className="hover:bg-gray-800/50 transition-colors">
                                            <td className="p-2 text-gray-500 truncate">{p.group}</td>
                                            <td className="p-2 text-white font-medium truncate" title={p.label}>{p.label}</td>
                                            <td className="p-2 text-blue-400 font-mono truncate" title={p.key}>{p.key}</td>
                                            <td className="p-2">
                                                <span className="text-[9px] px-1 py-0.5 rounded bg-gray-700 text-gray-300 font-mono">{p.dataType}</span>
                                            </td>
                                            <td className="p-2">
                                                <StatusBadge quality={p.dataQuality} value={p.currentValue} />
                                            </td>
                                            <td className="p-2 text-yellow-200 truncate max-w-[200px]" title={String(p.currentValue)}>
                                                {p.currentValue !== undefined && p.currentValue !== null ? String(p.currentValue) : '-'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                         </div>
                    </div>
                );
            case 'generales':
                return <DetailedDiagnosticTable dsGenerales={projectRaw.ds_generales} />;
            case 'proyecto':
                return (
                    <div className="h-full overflow-auto">
                        <h3 className="font-bold text-white mb-4">Diagnóstico de Tabla de Viviendas (TS_GENERAL)</h3>
                        <TableMappingDiagnostic 
                            config={GRUPOS_VIVIENDAS_CONFIG} 
                            sampleData={projectRaw.ts_general?.[0]} 
                            title="Viviendas - Mapeo de Columnas" 
                        />
                    </div>
                );
            case 'garajes':
                return (
                    <div className="h-full overflow-auto">
                        <h3 className="font-bold text-white mb-4">Diagnóstico de Tabla de Garajes</h3>
                        <TableMappingDiagnostic 
                            config={GARAGES_GROUPS_CONFIG} 
                            sampleData={projectRaw.garajes?.[0]} 
                            title="Garajes - Mapeo de Columnas" 
                        />
                    </div>
                );
            case 'trasteros':
                 return (
                    <div className="h-full overflow-auto">
                        <h3 className="font-bold text-white mb-4">Diagnóstico de Tabla de Trasteros</h3>
                        <TableMappingDiagnostic 
                            config={STORAGES_GROUPS_CONFIG} 
                            sampleData={projectRaw.trasteros?.[0]} 
                            title="Trasteros - Mapeo de Columnas" 
                        />
                    </div>
                );
            case 'sistema':
                return (
                    <div className="h-full overflow-auto p-4 text-gray-400">
                         <h3 className="font-bold text-white mb-4">Logs del Sistema</h3>
                         <p>Registro de errores de mapeo y alertas de integridad.</p>
                         <div className="mt-4 bg-black p-4 rounded border border-gray-800 font-mono text-xs whitespace-pre-wrap">
                            {obtenerErrores().length > 0 ? JSON.stringify(obtenerErrores(), null, 2) : "Sin errores registrados en esta sesión."}
                         </div>
                    </div>
                );
            default:
                return <div className="p-10 text-center text-gray-500">Selecciona una opción del menú lateral.</div>;
        }
    };

    return (
        <div className="flex h-full bg-gray-900 text-gray-300 font-mono text-xs overflow-hidden">
            {showSqlHelp && (
                <Modal title="Configuración SQL Requerida" onClose={() => setShowSqlHelp(false)}>
                    <div className="space-y-4">
                        <p className="text-sm text-gray-300">Ejecuta esto en Supabase para habilitar el Roadmap.</p>
                        <div className="bg-gray-900 p-4 rounded border border-gray-700 relative">
                            <pre className="text-xs text-green-300 whitespace-pre-wrap">{getRepairSql()}</pre>
                            <button onClick={() => navigator.clipboard.writeText(getRepairSql())} className="absolute top-2 right-2 text-xs bg-gray-700 text-white px-2 py-1 rounded">Copiar</button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* SIDEBAR */}
            <div className="w-60 bg-gray-800 border-r border-gray-700 flex flex-col shrink-0 overflow-y-auto">
                <div className="p-4 border-b border-gray-700 flex items-center space-x-2 text-green-400 shrink-0">
                    <CommandLineIcon className="h-5 w-5" />
                    <span className="font-bold text-sm">Programador</span>
                </div>
                <nav className="flex-1 p-2 space-y-1">
                    <SidebarButton active={activeContext === 'vision_roadmap'} onClick={() => setActiveContext('vision_roadmap')} icon={<MapPinIcon className="h-4 w-4 text-yellow-400" />} label="Visión y Plan Maestro" />
                    <SidebarButton active={activeContext === 'planificador'} onClick={() => setActiveContext('planificador')} icon={<ClipboardDocumentCheckIcon className="h-4 w-4" />} label="Planificador / Kanban" />
                    <div className="h-px bg-gray-700 my-2 mx-2"></div>
                    <SidebarButton active={activeContext === 'design_system'} onClick={() => setActiveContext('design_system')} icon={<SwatchIcon className="h-4 w-4 text-pink-400" />} label="Sistema de Diseño" />
                    <div className="h-px bg-gray-700 my-2 mx-2"></div>
                    <SidebarButton active={activeContext === 'indice_parametros'} onClick={() => setActiveContext('indice_parametros')} icon={<BookOpenIcon className="h-4 w-4" />} label="Índice de Parámetros" />
                    <SidebarButton active={activeContext === 'generales'} onClick={() => setActiveContext('generales')} icon={<BuildingOfficeIcon className="h-4 w-4" />} label="Datos Generales" />
                    <SidebarButton active={activeContext === 'proyecto'} onClick={() => setActiveContext('proyecto')} icon={<TableCellsIcon className="h-4 w-4" />} label="Tabla Viviendas" />
                    <SidebarButton active={activeContext === 'garajes'} onClick={() => setActiveContext('garajes')} icon={<CarIcon className="h-4 w-4" />} label="Tabla Garajes" />
                    <SidebarButton active={activeContext === 'trasteros'} onClick={() => setActiveContext('trasteros')} icon={<ArchiveBoxIcon className="h-4 w-4" />} label="Tabla Trasteros" />
                    <div className="h-px bg-gray-700 my-2 mx-2"></div>
                    <SidebarButton active={activeContext === 'sistema'} onClick={() => setActiveContext('sistema')} icon={<Cog6ToothIcon className="h-4 w-4" />} label="Sistema / Logs" />
                    
                    {/* Botón Ayuda SQL rápido */}
                    <button onClick={() => setShowSqlHelp(true)} className="w-full mt-4 text-center text-[10px] text-gray-500 hover:text-white underline">
                        Ver SQL de Instalación
                    </button>
                </nav>
            </div>

            {/* MAIN */}
            <div className="flex-1 flex flex-col min-w-0">
                <div className="flex-1 overflow-auto p-4 bg-gray-900 relative">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default ProgrammerView;
