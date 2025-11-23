import { useState, useMemo } from 'react';
import { ProjectDataRaw } from '../../types';
import {
    MapPinIcon, ClipboardDocumentCheckIcon, PencilIcon, TagIcon, BuildingOfficeIcon,
    TableCellsIcon, MagnifyingGlassIcon, ExclamationTriangleIcon,
    CommandLineIcon
} from '../icons/Icons';
import KanbanView from './KanbanView';

// --- MANIFESTO CONTENT (From VISION_AND_ROADMAP.md) ---
const manifestoContent = `
# AXIS-Z GPI: Visión y Hoja de Ruta del Proyecto

## 1. MANIFIESTO Y PROPÓSITO
**AXIS-Z GPI** no es simplemente un gestor de bases de datos; es el **Sistema Operativo Central** para la coordinación de proyectos de arquitectura y promoción inmobiliaria.

Su objetivo fundacional es **eliminar los silos de información** que históricamente han fragmentado el sector AECO (Arquitectura, Ingeniería, Construcción y Operaciones).

### La Filosofía: "Single Source of Truth" (Fuente Única de Verdad)
En un proyecto tradicional, el Arquitecto tiene unos planos, el Comercial tiene un Excel de precios, y el Constructor tiene unas mediciones. A menudo, estas tres versiones difieren, provocando errores costosos (construir lo que no es, vender lo que no existe, calcular mal el beneficio).

En **AXIS-Z**, el dato nace del modelo BIM (Arquitectura), se enriquece con la gestión (Promoción/Ventas) y guía la ejecución (Construcción). Todos miran el mismo dato en tiempo real.

---

## 2. LOS 5 AGENTES DEL ECOSISTEMA

La aplicación está diseñada para servir y conectar a cinco perfiles clave. Cada funcionalidad desarrollada debe responder a la pregunta: *¿Aporta valor o reduce fricción a alguno de estos agentes?*

### 🏛️ 1. El Arquitecto (Origen del Dato)
*   **Rol:** Garante de la calidad técnica y geométrica.
*   **Dolor actual:** Gestión de cambios constante, falta de control sobre si la obra sigue el último plano.
*   **Solución AXIS-Z:** Carga automática de parámetros desde BIM (JSON). Control de versiones. Canal directo de comunicación técnica.

### 💰 2. El Promotor (Visión Estratégica)
*   **Rol:** Inversor y tomador de decisiones.
*   **Dolor actual:** Incertidumbre financiera, falta de visión en tiempo real del Cashflow.
*   **Solución AXIS-Z:** Dashboards financieros en tiempo real. Análisis de viabilidad dinámica. Control de ROI instantáneo basado en ventas reales y costes de obra actualizados.

### 🤝 3. El Comercial (Motor de Ventas)
*   **Rol:** Gestión de clientes y reservas.
*   **Dolor actual:** Información desactualizada, herramientas precarias (Excel), lentitud en respuesta al cliente.
*   **Solución AXIS-Z:** CRM integrado con el inventario real. Filtros potentes para encontrar producto. Generación automática de contratos.

### 🧱 4. La Constructora (Ejecución)
*   **Rol:** Materialización del proyecto.
*   **Dolor actual:** "Teléfono escacharrado" con las personalizaciones de clientes. Planos obsoletos.
*   **Solución AXIS-Z:** Acceso a la ficha técnica real de cada unidad. Módulo de personalizaciones (Client Choices) vinculado directamente a la unidad a construir.

### 🏠 5. El Cliente Final (Usuario)
*   **Rol:** Consumidor del producto.
*   **Dolor actual:** Falta de transparencia, ansiedad sobre plazos y calidades.
*   **Solución AXIS-Z:** (Futuro) Portal del propietario. Transparencia en el proceso.

---

## 3. PRINCIPIOS TÉCNICOS INNEGOCIABLES

Para mantener la solidez y escalabilidad, todo desarrollo debe adherirse a:

1.  **Integridad del Dato BIM:** Los datos geométricos y técnicos (superficies, nº dormitorios, ubicación) son propiedad del JSON importado (Arquitectura). La App **NO** debe permitir editar estos datos manualmente salvo en modo "Admin/Corrección de Emergencia".
2.  **Integridad del Dato Comercial:** Los datos de estado (Vendido/Reservado), precios finales y clientes son propiedad de la App (Base de Datos). No deben ser sobrescritos al importar un nuevo JSON de arquitectura, salvo instrucción explícita.
3.  **Seguridad por Diseño:** Nadie ve lo que no debe ver. El sistema de roles (RLS en Supabase) es sagrado. Un constructor no ve datos financieros del promotor. Un comercial no edita parámetros técnicos.
4.  **Estética y Usabilidad:** La herramienta debe ser inspiradora y profesional. El diseño no es cosmético, es funcionalidad.

---

## 4. HOJA DE RUTA (ROADMAP) DE DESARROLLO

### FASE 1: Cimientos de Seguridad y Roles (PRIORIDAD ALTA)
- [ ] Implementación de **Supabase Auth** (Login seguro).
- [ ] Definición de Roles en DB: 'admin', 'architect', 'sales', 'viewer'.
- [ ] Políticas RLS (Row Level Security) estrictas.
- [ ] Auditoría de acciones (Logs): ¿Quién cambió el precio de la unidad 1A?

### FASE 2: Potenciación Comercial y Visual
- [ ] **Módulo Documental:** Generación automática de PDFs (Hoja de Reserva, Contrato CV) con datos de la vivienda y cliente.
- [ ] **Plano Interactivo:** Integración de SVGs vectoriales donde las unidades cambian de color según estado. Click para ver ficha.
- [ ] **CRM Avanzado:** Pipeline de ventas, calendario de citas, historial de interacciones.

### FASE 3: Gestión de Personalizaciones (Nexo Ventas-Obra)
- [ ] Catálogo de Opciones (Suelos, Cocinas, Baños).
- [ ] Selección por parte del cliente/comercial.
- [ ] Generación de "Hoja de Trabajo" para la constructora por vivienda.

### FASE 4: Portal del Cliente y Expansión
- [ ] Acceso limitado para clientes finales ("Mi Vivienda").
- [ ] API para integración con software contable/ERP.
- [ ] Sistema de notificaciones (Email/In-App) ante cambios de estado.

---

*Documento generado el 24/05/2024. Este archivo debe evolucionar con el proyecto pero sus principios fundacionales deben respetarse.*
`;

// --- DATA SCHEMA DEFINITION ---
const PARAMETER_SCHEMA = [
    { grupo: "Datos Generales", etiqueta: "PROMOCIÓN", clave: "promocion", tipo: "String" },
    { grupo: "Datos Generales", etiqueta: "CÓDIGO", clave: "codigo", tipo: "ID / Code" },
    { grupo: "Datos Generales", etiqueta: "RÉGIMEN", clave: "regimen", tipo: "String" },
    { grupo: "Datos Generales", etiqueta: "LOCALIDAD", clave: "localidad", tipo: "ID / Code" },
    { grupo: "Datos Generales", etiqueta: "SITUACIÓN", clave: "situacion", tipo: "Status" },
    { grupo: "Datos Generales", etiqueta: "USO", clave: "uso", tipo: "String" },
    { grupo: "Datos Generales", etiqueta: "TIPOLOGÍA", clave: "tipologia", tipo: "String" },
    { grupo: "Datos Generales", etiqueta: "TIPO DE OBRA", clave: "tipo_de_obra", tipo: "String" },
    { grupo: "Datos Generales", etiqueta: "FASE DEL PROYECTO", clave: "fase_del_proyecto", tipo: "String" },
    { grupo: "Datos Generales", etiqueta: "SISTEMA DE GESTIÓN", clave: "sistema_de_mgmt", tipo: "String" },
    { grupo: "Datos Generales", etiqueta: "PROPIEDAD", clave: "propiedad", tipo: "String" },
    { grupo: "Datos Generales", etiqueta: "PROMOTORA/GESTORA", clave: "promotora_gestora", tipo: "String" },
    { grupo: "Datos Generales", etiqueta: "ARQUITECTO", clave: "arquitecto", tipo: "String" },
    { grupo: "Datos Generales", etiqueta: "ESTUDIO", clave: "estudio", tipo: "String" },
    { grupo: "Datos Generales", etiqueta: "ARQUITECTO TÉCNICO 1", clave: "arquitecto_tecnico_1", tipo: "String" },
    { grupo: "Datos Generales", etiqueta: "ARQUITECTO TÉCNICO 2", clave: "arquitecto_tecnico_2", tipo: "String" },
    { grupo: "Datos Generales", etiqueta: "COMERCIALIZADORA", clave: "comercializadora", tipo: "Integer" },
    { grupo: "Datos Generales", etiqueta: "DOCUMENTACIÓN COMERCIAL", clave: "documentacion_comercial", tipo: "Integer" },
    { grupo: "Datos Generales", etiqueta: "INFOGRAFÍAS", clave: "infografias", tipo: "String" },
    { grupo: "Datos Generales", etiqueta: "GESTORA DE MATERIALES", clave: "gestora_de_materiales", tipo: "Integer" },
    { grupo: "Datos Generales", etiqueta: "PROYECT MANAGMENT", clave: "proyect_managment", tipo: "Integer" },
];

interface ProgrammerViewProps {
    projectRaw: ProjectDataRaw;
}

type ProgrammerNavSection =
    | 'vision'
    | 'kanban'
    | 'design'
    | 'params'
    | 'data_general'
    | 'data_viviendas'
    | 'data_garajes'
    | 'data_trasteros'
    | 'logs';

// --- SUB-COMPONENTS ---

const SidebarButton = ({ active, onClick, icon, label, subLabel }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string, subLabel?: string }) => (
    <button
        onClick={onClick}
        className={`w-full text-left px-3 py-2.5 rounded-md flex items-center space-x-3 transition-colors text-sm ${
            active
                ? 'bg-brand-surface text-brand-primary font-bold'
                : 'text-brand-text-secondary hover:bg-brand-surface/50'
        }`}
    >
        {icon}
        <div className="flex flex-col">
            <span>{label}</span>
            {subLabel && <span className="text-xs text-gray-500">{subLabel}</span>}
        </div>
    </button>
);

const StatusBadge = ({ status, value }: { status: string, value: any }) => {
    let bgColor = 'bg-gray-700';
    let textColor = 'text-gray-300';
    let text = status.toUpperCase();

    if (status === 'OK' && (value === 0 || value === '0' || value === '')) {
        bgColor = 'bg-purple-800/80';
        textColor = 'text-purple-300';
        text = 'CERO';
    } else if (status === 'OK') {
        bgColor = 'bg-green-800/80';
        textColor = 'text-green-300';
    }

    return (
        <span className={`px-2 py-0.5 rounded-full text-xs font-mono ${bgColor} ${textColor}`}>
            {text}
        </span>
    );
};

const ParameterIndexView = ({ dsGenerales }: { dsGenerales: ProjectDataRaw['ds_generales'] }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const parameters = useMemo(() => {
        return PARAMETER_SCHEMA.map(schema => {
            const value = dsGenerales ? dsGenerales[schema.clave] : undefined;
            const status = (value !== undefined && value !== null) ? 'OK' : 'MISSING';
            return {
                ...schema,
                valor: value,
                estado: status,
            };
        });
    }, [dsGenerales]);

    const filteredParameters = useMemo(() => {
        if (!searchTerm) return parameters;
        return parameters.filter(p =>
            p.etiqueta.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.clave.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [parameters, searchTerm]);

    return (
        <div className="bg-brand-bg-dark flex-1 flex flex-col h-full">
            <div className="p-4 border-b border-brand-border flex justify-between items-center">
                <h2 className="text-xl font-bold text-brand-text-primary flex items-center">
                    <TagIcon className="h-6 w-6 mr-3 text-brand-primary"/>
                    Índice de Parámetros
                </h2>
                <div className="relative">
                    <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"/>
                    <input
                        type="text"
                        placeholder="Buscar variable..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="bg-brand-bg-dark border border-brand-border rounded-md pl-10 pr-4 py-2 text-sm w-64 focus:ring-brand-primary focus:border-brand-primary"
                    />
                </div>
            </div>
            <div className="flex-1 overflow-y-auto">
                <table className="w-full text-sm text-left text-brand-text-secondary">
                    <thead className="text-xs text-gray-400 uppercase bg-brand-bg-dark sticky top-0">
                        <tr>
                            <th scope="col" className="px-6 py-3">Grupo</th>
                            <th scope="col" className="px-6 py-3">Etiqueta App</th>
                            <th scope="col" className="px-6 py-3">Clave Generada</th>
                            <th scope="col" className="px-6 py-3">Tipo</th>
                            <th scope="col" className="px-6 py-3">Estado</th>
                            <th scope="col" className="px-6 py-3">Valor Muestra</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredParameters.map((p) => (
                            <tr key={p.clave} className="border-b border-brand-border/50 hover:bg-brand-surface-light/50">
                                <td className="px-6 py-3 text-gray-400">{p.grupo}</td>
                                <th scope="row" className="px-6 py-4 font-bold text-brand-text-primary whitespace-nowrap">{p.etiqueta}</th>
                                <td className="px-6 py-3 font-mono text-blue-400">{p.clave}</td>
                                <td className="px-6 py-3 font-mono text-purple-300">{p.tipo}</td>
                                <td className="px-6 py-3"><StatusBadge status={p.estado} value={p.valor} /></td>
                                <td className="px-6 py-3 font-mono text-gray-300 truncate max-w-xs">{String(p.valor ?? '')}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const PlaceholderView = ({ title }: { title: string }) => (
    <div className="flex items-center justify-center h-full text-brand-text-secondary p-8 text-center bg-brand-bg-dark">
        <div className="border-2 border-dashed border-brand-surface-light rounded-xl p-12">
            <h2 className="text-2xl font-bold mb-4 text-brand-text-primary">{title}</h2>
            <p className="max-w-md">Este módulo está en desarrollo y estará disponible en futuras versiones.</p>
        </div>
    </div>
);

const KeyValueTable = ({ data, title, icon: Icon }: { data: Record<string, any>, title: string, icon: React.ComponentType<any> }) => {
    if (!data) {
        return <NoDataView title={title} />;
    }
    const entries = Object.entries(data);

    return (
        <div className="bg-brand-bg-dark flex-1 flex flex-col h-full">
            <div className="p-4 border-b border-brand-border">
                <h2 className="text-xl font-bold text-brand-text-primary flex items-center">
                    <Icon className="h-6 w-6 mr-3 text-brand-primary"/>
                    {title}
                </h2>
            </div>
            <div className="flex-1 overflow-y-auto">
                <table className="w-full text-sm text-left text-brand-text-secondary">
                    <thead className="text-xs text-gray-400 uppercase bg-brand-bg-dark sticky top-0">
                        <tr>
                            <th scope="col" className="px-6 py-3 w-1/3">Clave</th>
                            <th scope="col" className="px-6 py-3">Valor</th>
                        </tr>
                    </thead>
                    <tbody>
                        {entries.map(([key, value]) => (
                            <tr key={key} className="border-b border-brand-border/50 hover:bg-brand-surface-light/50">
                                <th scope="row" className="px-6 py-4 font-bold text-brand-text-primary whitespace-nowrap">{key}</th>
                                <td className="px-6 py-3 font-mono text-gray-300">{String(value)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

const GenericDataTable = ({ data, title, icon: Icon }: { data: Record<string, any>[], title: string, icon: React.ComponentType<any> }) => {
    if (!data || data.length === 0) {
        return <NoDataView title={title} />;
    }
    const headers = Object.keys(data[0]);

    return (
        <div className="bg-brand-bg-dark flex-1 flex flex-col h-full">
            <div className="p-4 border-b border-brand-border">
                <h2 className="text-xl font-bold text-brand-text-primary flex items-center">
                    <Icon className="h-6 w-6 mr-3 text-brand-primary"/>
                    {title}
                </h2>
            </div>
            <div className="flex-1 overflow-y-auto">
                <table className="w-full text-sm text-left text-brand-text-secondary">
                    <thead className="text-xs text-gray-400 uppercase bg-brand-bg-dark sticky top-0">
                        <tr>
                            {headers.map(h => <th scope="col" key={h} className="px-6 py-3">{h}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((row, i) => (
                            <tr key={i} className="border-b border-brand-border/50 hover:bg-brand-surface-light/50">
                                {headers.map(header => (
                                    <td key={`${i}-${header}`} className="px-6 py-4 font-mono text-gray-300 whitespace-nowrap">
                                        {String(row[header] ?? '')}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const NoDataView = ({ title, message }: { title: string, message?: string }) => (
    <div className="flex flex-col items-center justify-center h-full text-brand-text-secondary p-8 text-center bg-brand-bg-dark">
        <ExclamationTriangleIcon className="h-16 w-16 text-yellow-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2 text-brand-text-primary">{title}</h2>
        <p className="max-w-md">{message || `La fuente de datos para este módulo no se ha encontrado o está vacía.`}</p>
    </div>
);

// --- NEW MARKDOWN VIEWER ---
const MarkdownViewer = ({ content, title, icon: Icon }: { content: string, title: string, icon: React.ComponentType<any> }) => {
    const parsedContent = useMemo(() => {
        const lines = content.split('\n');
        return lines.map((line, index) => {
            if (line.startsWith('# ')) return <h1 key={index} className="text-3xl font-bold mt-6 mb-4 text-brand-text-primary">{line.substring(2)}</h1>;
            if (line.startsWith('## ')) return <h2 key={index} className="text-2xl font-bold mt-8 mb-4 border-b border-brand-border pb-2 text-brand-text-primary">{line.substring(3)}</h2>;
            if (line.startsWith('### ')) return <h3 key={index} className="text-xl font-bold mt-6 mb-3 text-brand-text-secondary">{line.substring(4)}</h3>;
            if (line.startsWith('---')) return <hr key={index} className="my-8 border-brand-border" />;
            if (line.startsWith('* ') || line.startsWith('- ')) {
                const itemContent = line.substring(2).replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-brand-text-primary">$1</strong>');
                return <li key={index} className="ml-6 mb-2 list-disc" dangerouslySetInnerHTML={{ __html: itemContent }} />;
            }
            if (line.trim() === '') return <div key={index} className="h-4"></div>; // Spacer for empty lines

            const formattedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-brand-text-primary">$1</strong>').replace(/`(.*?)`/g, '<code class="text-sm bg-brand-bg-dark p-1 rounded-md text-purple-300">$1</code>');
            return <p key={index} className="mb-4 text-brand-text-secondary leading-relaxed" dangerouslySetInnerHTML={{ __html: formattedLine }} />;
        });
    }, [content]);

    return (
        <div className="bg-brand-bg-dark flex-1 flex flex-col h-full">
            <div className="p-4 border-b border-brand-border sticky top-0 bg-brand-bg-dark/95 backdrop-blur-sm">
                <h2 className="text-xl font-bold text-brand-text-primary flex items-center">
                    <Icon className="h-6 w-6 mr-3 text-brand-primary"/>
                    {title}
                </h2>
            </div>
            <div className="flex-1 overflow-y-auto p-8 prose prose-invert max-w-none">
                {parsedContent}
            </div>
        </div>
    );
}

// --- MAIN PROGRAMMER VIEW ---

const ProgrammerView = ({ projectRaw }: ProgrammerViewProps) => {
    const [activeSection, setActiveSection] = useState<ProgrammerNavSection>('vision');

    const renderContent = () => {
        if (!projectRaw) {
            return <div className="p-10 text-gray-500">Cargando datos del proyecto...</div>;
        }

        switch (activeSection) {
            case 'vision':
                return <MarkdownViewer content={manifestoContent} title="Visión y Plan Maestro" icon={MapPinIcon} />;
            case 'kanban':
                return <KanbanView />;
            case 'design':
                return <PlaceholderView title="Sistema de Diseño" />;
            case 'params':
                return <ParameterIndexView dsGenerales={projectRaw?.ds_generales} />;
            case 'data_general':
                return <KeyValueTable data={projectRaw.ds_generales} title="Datos Generales" icon={BuildingOfficeIcon} />;
            case 'data_viviendas':
                 return <GenericDataTable data={projectRaw.ts_general} title="Tabla Viviendas" icon={TableCellsIcon} />;
            case 'data_garajes':
                 return <GenericDataTable data={projectRaw.garajes} title="Tabla Garajes" icon={TableCellsIcon} />;
            case 'data_trasteros':
                 return <GenericDataTable data={projectRaw.trasteros} title="Tabla Trasteros" icon={TableCellsIcon} />;
            case 'logs':
                return <NoDataView title="Sistema / Logs" message="No se ha encontrado un fichero SQL de instalación en el proyecto." />;
            default:
                return <div className="p-10 text-gray-500">Selecciona una opción del menú.</div>;
        }
    };

    return (
        <div className="flex h-full bg-brand-bg-dark text-brand-text-primary font-sans overflow-hidden">
            <div className="w-72 bg-brand-bg-dark border-r border-brand-border flex flex-col">
                <div className="p-4 border-b border-brand-border">
                    <h1 className="text-xl font-bold">Programador</h1>
                </div>
                <nav className="flex-1 p-3 space-y-1.5">
                    <SidebarButton active={activeSection === 'vision'} onClick={() => setActiveSection('vision')} icon={<MapPinIcon className="h-5 w-5" />} label="Visión y Plan Maestro" />
                    <SidebarButton active={activeSection === 'kanban'} onClick={() => setActiveSection('kanban')} icon={<ClipboardDocumentCheckIcon className="h-5 w-5" />} label="Planificador / Kanban" />
                    <SidebarButton active={activeSection === 'design'} onClick={() => setActiveSection('design')} icon={<PencilIcon className="h-5 w-5" />} label="Sistema de Diseño" />
                    <SidebarButton active={activeSection === 'params'} onClick={() => setActiveSection('params')} icon={<TagIcon className="h-5 w-5" />} label="Índice de Parámetros" />
                    <SidebarButton active={activeSection === 'data_general'} onClick={() => setActiveSection('data_general')} icon={<BuildingOfficeIcon className="h-5 w-5" />} label="Datos Generales" />
                    <SidebarButton active={activeSection === 'data_viviendas'} onClick={() => setActiveSection('data_viviendas')} icon={<TableCellsIcon className="h-5 w-5" />} label="Tabla Viviendas" />
                    <SidebarButton active={activeSection === 'data_garajes'} onClick={() => setActiveSection('data_garajes')} icon={<TableCellsIcon className="h-5 w-5" />} label="Tabla Garajes" />
                    <SidebarButton active={activeSection === 'data_trasteros'} onClick={() => setActiveSection('data_trasteros')} icon={<TableCellsIcon className="h-5 w-5" />} label="Tabla Trasteros" />
                    <SidebarButton active={activeSection === 'logs'} onClick={() => setActiveSection('logs')} icon={<CommandLineIcon className="h-5 w-5" />} label="Sistema / Logs" subLabel="Ver SQL de Instalación"/>
                </nav>
            </div>
            <main className="flex-1 flex flex-col min-w-0">
                {renderContent()}
            </main>
        </div>
    );
};

export default ProgrammerView;
