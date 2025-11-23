
import React from 'react';

// --- CONFIGURACIÓN ESTRUCTURAL ESTÁTICA (MATRIZ 3x5) ---
export const CARD_CONFIG = [
  // --- FILA 1 ---
  {
    id: '01', title: '1. DATOS GENERALES', items: [
      { label: 'PROMOCIÓN' }, { label: 'CÓDIGO', isInteger: true }, { label: 'RÉGIMEN' },
      { label: 'LOCALIDAD' }, { label: 'SITUACIÓN' }, { label: 'USO' },
      { label: 'TIPOLOGÍA' }, { label: 'TIPO DE OBRA' }, { label: 'FASE DEL PROYECTO' },
      { label: 'SISTEMA DE GESTIÓN' }
    ]
  },
  {
    id: '02', title: '2. AGENTES', items: [
      { label: 'PROPIEDAD' }, { label: 'PROMOTORA/GESTORA' }, { label: 'ARQUITECTO' },
      { label: 'ESTUDIO' }, { label: 'ARQUITECTO TÉCNICO 1' }, { label: 'ARQUITECTO TÉCNICO 2' },
      { label: 'COMERCIALIZADORA' }, { label: 'DOCUMENTACIÓN COMERCIAL' }, { label: 'INFOGRAFÍAS' },
      { label: 'GESTORA DE MATERIALES' }
    ]
  },
  {
    id: '03', title: '3. EJECUCIÓN', items: [
      { label: 'PROYECT MANAGMENT' }, { label: 'PROYECT MONITORING' }, { label: 'CONSTRUCTORA' },
      { label: 'JEFE DE OBRAS' }, { label: 'ENCARGADO DE OBRA' }, { label: 'GEOTÉCNICO' },
      { label: 'TOPOGRÁFICO' }, { label: 'ICT' }, { label: 'OCT' }, { label: 'SEGURO DECENAL' }
    ]
  },
  // --- FILA 2 ---
  {
    id: '04', title: '4. DATOS DEL SUELO', items: [
      { label: 'Nº MÁX. VIVIENDAS', unit: 'Uds', isInteger: true }, { label: 'Nº MÍNIMO PLZ. GARAJE', unit: 'Uds', isInteger: true },
      { label: 'Nº LOCALES COMERCIALES', unit: 'Uds', isInteger: true }, { label: 'SUPERFICIE DE PARCELA', unit: 'm²s' },
      { label: 'EDIFICABILIDAD MÁXIMA', unit: 'm²c' }, { label: 'PLANTAS MÁX. SR', unit: 'Niveles', isInteger: true },
      { label: 'PLANTAS BR', unit: 'Niveles', isInteger: true }, { label: 'PEM PROYECTO', unit: 'Euros' }
    ]
  },
  {
    id: '05', title: '5. SUP. CONSTRUIDAS REALES', items: [
      { label: 'BAJO RASANTE', unit: 'm²c' }, { label: 'TOTAL RESIDENCIAL', unit: 'm²c' },
      { label: 'COMERCIAL', unit: 'm²c' }, { label: 'NETO VIVIENDAS', unit: 'm²c' },
      { label: 'EXTERIORES VIVIENDAS', unit: 'm²c' }, { label: 'ZONAS COMUNES INTERIORES', unit: 'm²c' },
      { label: 'ZONAS COMUNES EXTERIORES', unit: 'm²c' }, { label: 'TOTAL ZONAS COMUNES', unit: 'm²c' }
    ]
  },
  {
    id: '06', title: '6. SUPERFICIES ÚTILES', items: [
      { label: 'VIVIENDAS', unit: 'm²u' }, { label: 'COMERCIAL', unit: 'm²u' },
      { label: 'Total SR', unit: 'm²u', isTotal: true }, { label: 'TRASTEROS', unit: 'm²u' },
      { label: 'GARAJES', unit: 'm²u' }, { label: 'Total BR', unit: 'm²u', isTotal: true },
      { label: 'SALON SOCIAL', unit: 'm²u' }, { label: 'ZONA COMÚN EXTERIOR', unit: 'm²c' }
    ]
  },
  // --- FILA 3 ---
  {
    id: '07', title: '7. DATOS DEL PROYECTO', items: [
      { label: 'Nº DE VIVIENDAS/APARTAMENTOS', unit: 'Uds', isInteger: true }, { label: 'Nº PLAZAS GARAJE', unit: 'Uds', isInteger: true },
      { label: 'GARAJES CERRADOS', unit: 'Uds', isInteger: true }, { label: 'Nº DE TRASTEROS', unit: 'Uds', isInteger: true },
      { label: 'EDIFICADO SR', unit: 'm²c' }, { label: 'EDIFICADO BR', unit: 'm²c' },
      { label: 'EDIFICADO TOTAL', unit: 'm²c' }, { label: 'PLANTAS SR', unit: 'Niveles', isInteger: true },
      { label: 'PLANTAS BR', unit: 'Niveles', isInteger: true }
    ]
  },
  {
    id: '08', title: '8. SUP. CONSTRUIDAS URBANÍSTICAS', items: [
      { label: 'BAJO RASANTE', unit: 'Uds' }, { label: 'TOTAL RESIDENCIAL', unit: 'Uds' },
      { label: 'COMERCIAL' }, { label: 'NETO VIVIENDAS', unit: 'm²c' },
      { label: 'EXTERIORES VIVIENDAS', unit: 'm²c' }, { label: 'ZONAS COMUNES INT', unit: 'm²c' },
      { label: 'ZONAS COMUNES EXT', unit: 'm²c' }, { label: 'TOTAL ZONAS COMUNES', unit: 'm²c' }
    ]
  },
  {
    id: '09', title: '9. VALORES MÁXIMOS DE VENTA', items: [
      { label: 'VIVIENDAS', unit: 'Euros' }, { label: 'GARAJES', unit: 'Euros' },
      { label: 'TRASTEROS', unit: 'Euros' }, { label: 'LOCALES', unit: 'Euros' },
      { label: 'PRECIO DE VENTA TOTAL', unit: 'Euros', isTotal: true },
      { label: 'FECHA DE LICENCIA' }, { label: 'FECHA ACTA DE REPLANTEO' },
      { label: 'FECHA CFO' }
    ]
  },
  // --- FILA 4 (Solo Tarjeta 10) ---
  {
    id: '10', title: '10. DATOS ECONÓMICOS', items: [
      { label: 'PEM CONTRATADO', unit: 'Euros' }, { label: 'COSTES DE URBANIZACIÓN', unit: 'Euros' },
      { label: 'ICIO', unit: 'Euros' }, { label: 'TASAS LICENCIA', unit: 'Euros' },
      { label: 'FIANZA RESIDUOS', unit: 'Euros' }, { label: 'FIANZA URBANIZACIÓN', unit: 'Euros' }
    ]
  }
];

export const PEM_TABLE_ROWS = [
    'Residencial', 'Comercial', 'Urb. Interior', 'Aparcamiento'
];

// CONFIGURACIÓN ESTRICTA DE LA TARJETA INFERIOR
const BOTTOM_METRICS = [
    { label: 'IPREM', unit: '' },
    { label: 'MODULO BASICO', unit: 'Euros' },
    { label: 'PRECIO REFERENCIA', unit: 'Euros' },
    { label: 'REGIMEN', unit: '' },
    { label: 'MODULO PONDERADO', unit: 'Euros' },
    { label: 'PRECIO REF. ANEJOS', unit: 'Euros' }
];

// --- HELPER INTELIGENTE: BUSCADOR DE CLAVES FUZZY ---

export const normalizeKey = (key: string) => {
    if (!key) return '';
    return key.toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[:.,]/g, "")
        .replace(/[^a-z0-9]/g, "");
};

const tokenize = (str: string): string[] => {
    return str.toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[:.,]/g, " ")
        .replace(/[^a-z0-9\s]/g, " ")
        .split(/\s+/)
        .filter(Boolean);
};

const COMMON_MAPPINGS: Record<string, string[]> = {
    'nº': ['n', 'num', 'numero'],
    'max': ['maximo', 'maxim'],
    'viv': ['vivienda', 'viviendas'],
    'plz': ['plazas', 'plaza'],
    'sup': ['superficie', 'sup', 's'],
    'const': ['construida', 'construido'],
    'urb': ['urbanistica', 'urbanistico', 'urbanizacion', 'urb'],
    'int': ['interior', 'interiores'],
    'ext': ['exterior', 'exteriores', 'externa'],
    'unitario': ['unit', 'coac'], 
    'proyecto': ['project', 'proyecto'],
    'uso': ['usage'],
    'zona': ['zonas'],
    'comun': ['comunes', 'comun'],
    'anejos': ['anejo', 'anejos']
};

export const findKeyAndValueFull = (data: Record<string, any>, label: string, exactOnly: boolean = false) => {
    if (!data) return { status: 'missing', key: null, value: null };
    
    const keys = Object.keys(data);

    // 1. Búsqueda Exacta
    if (data[label] !== undefined) {
        return { status: 'found', key: label, value: data[label] };
    }
    
    const targetNorm = normalizeKey(label);
    let foundKey = keys.find(k => normalizeKey(k) === targetNorm);
    if (foundKey) return { status: 'found', key: foundKey, value: data[foundKey] };

    // Si se pide exactitud (para tablas críticas), paramos aquí
    if (exactOnly) return { status: 'missing', key: null, value: null };

    // 2. Búsqueda Difusa (Solo para tarjetas generales donde el nombre puede variar mucho)
    const labelTokens = tokenize(label);
    const expandedTokens = labelTokens.map(token => {
        const synonyms = COMMON_MAPPINGS[token] || [];
        return [token, ...synonyms];
    });

    foundKey = keys.find(k => {
        const kNorm = normalizeKey(k);
        const allTokensMatch = expandedTokens.every(tokenVariants => {
            return tokenVariants.some(variant => kNorm.includes(variant));
        });

        if (labelTokens.length === 1 && kNorm.length > labelTokens[0].length + 5) {
             return kNorm === labelTokens[0] || kNorm.endsWith(labelTokens[0]);
        }
        return allTokensMatch;
    });

    if (foundKey) {
        return { status: 'found', key: foundKey, value: data[foundKey] };
    }

    return { status: 'missing', key: null, value: null };
};

// --- COMPONENTES UI ---

interface ValueRowProps {
    label: string;
    result: { status: string, value: any };
    unit?: string;
    isTotal?: boolean;
    isInteger?: boolean;
}

const ValueRow: React.FC<ValueRowProps> = ({ label, result, unit, isTotal, isInteger }) => {
    let displayValue: React.ReactNode = result.value;
    
    if (result.status === 'missing') {
        displayValue = <span className="font-extrabold text-red-500 tracking-wider text-[9px] bg-red-900/20 px-1 rounded border border-red-500/30">ERR</span>;
    } else {
        const val = result.value;
        if (val === 0 || val === '0' || val === null || val === undefined || val === '') {
            displayValue = '-';
        } else if (typeof val === 'number') {
            if (isInteger) {
                displayValue = val.toLocaleString('es-ES', { maximumFractionDigits: 0 });
            } else {
                displayValue = val.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            }
        }
    }

    return (
        <div className={`flex justify-between items-baseline py-0.5 border-b border-brand-bg-light/20 last:border-0 text-[10px] ${isTotal ? 'bg-brand-bg-dark/30 font-bold mt-1 px-1 rounded' : ''}`}>
            <span className={`text-brand-text-secondary uppercase truncate w-2/3 ${isTotal ? 'text-brand-text' : ''}`} title={label}>
                {label}:
            </span>
            <div className="text-right whitespace-nowrap w-1/3 flex justify-end items-center gap-1">
                <span className={`font-bold truncate ${result.status === 'missing' ? '' : 'text-brand-primary'}`}>{displayValue}</span>
                {unit && typeof displayValue !== 'object' && displayValue !== '-' && <span className="text-brand-text-secondary text-[8px]">{unit}</span>}
            </div>
        </div>
    );
};

const Card = ({ config, data }: { config: any, data: any }) => (
    <div className="bg-brand-bg-dark rounded-sm shadow border border-brand-surface flex flex-col h-full min-h-0">
        <div className="bg-brand-surface text-brand-text font-bold text-[10px] py-1 px-2 uppercase tracking-wide border-b border-gray-600 shrink-0">
            {config.title}
        </div>
        <div className="p-2 flex-col justify-center bg-brand-bg-dark space-y-0.5 flex-1">
            {config.items.map((item: any, idx: number) => (
                <ValueRow 
                    key={idx} 
                    label={item.label} 
                    result={findKeyAndValueFull(data, item.label)}
                    unit={item.unit}
                    isTotal={item.isTotal}
                    isInteger={item.isInteger}
                />
            ))}
        </div>
    </div>
);

// MATRIZ DE CLAVES EXPLÍCITAS PARA LA TABLA PEM
export const PEM_KEYS_MATRIX: Record<string, Record<string, string[]>> = {
    'Residencial': {
        'PEM UNITARIO': [
            'PEM_UNITARIO_RESIDENCIAL', 'PEM_COAC_RESIDENCIAL', 'MODULO_RESIDENCIAL', 'PEM_M2_RESIDENCIAL', 
            'PEM_UNITARIO_VIVIENDAS', 'MODULO_VIVIENDAS', 'VALOR_UNITARIO_RESIDENCIAL'
        ],
        'SUP. PROYECTO': ['EDIFICADO_SR', 'SUP_CONST_REAL_TOTAL_RESIDENCIAL', 'TOTAL_RESIDENCIAL', 'SUP_PROYECTO_RESIDENCIAL', 'SUP_VIVIENDAS'],
        'PEM USO': [
            'PEM_TOTAL_RESIDENCIAL', 'PEM_USO_RESIDENCIAL', 'PRESUPUESTO_RESIDENCIAL', 'PEM_SOBRE_RASANTE', 
            'PEM_EDIFICACION_SR', 'PEM_EJECUCION_RESIDENCIAL', 'COSTES_CONSTRUCCION_RESIDENCIAL', 'TOTAL_PEM_RESIDENCIAL'
        ]
    },
    'Comercial': {
        'PEM UNITARIO': ['PEM_UNITARIO_COMERCIAL', 'PEM_COAC_COMERCIAL', 'PEM_M2_COMERCIAL', 'MODULO_COMERCIAL'],
        'SUP. PROYECTO': ['SUP_PROYECTO_COMERCIAL', 'SUP_LOCALES', 'SUP_CONST_REAL_COMERCIAL', 'COMERCIAL'],
        'PEM USO': [
            'PEM_TOTAL_COMERCIAL', 'PEM_USO_COMERCIAL', 'PRESUPUESTO_COMERCIAL', 
            'PRESUPUESTO_EJECUCION_COMERCIAL', 'TOTAL_PEM_COMERCIAL'
        ]
    },
    'Urb. Interior': {
        'PEM UNITARIO': ['PEM_UNITARIO_URB_INTERIOR', 'PEM_UNITARIO_URBANIZACION', 'PEM_M2_URBANIZACION', 'MODULO_URBANIZACION'],
        'SUP. PROYECTO': ['ZONAS_COMUNES_EXTERIORES', 'SUP_URBANIZACION_INTERIOR', 'SUP_PROYECTO_URB_INTERIOR', 'ZONAS COMUNES EXT', 'SUP_URBANIZACION'],
        'PEM USO': [
            'PEM_TOTAL_URBANIZACION', 'PEM_USO_URB_INTERIOR', 'PRESUPUESTO_URBANIZACION', 'PEM_URBANIZACION_INTERIOR', 
            'PEM_ZONAS_COMUNES', 'PRESUPUESTO_URBANIZACION_INTERIOR', 'PEM_EJECUCION_URBANIZACION'
        ]
    },
    'Aparcamiento': {
        'PEM UNITARIO': [
            'PEM_UNITARIO_APARCAMIENTO', 'PEM_UNITARIO_GARAJES', 'PEM_UNITARIO_PARKING', 'PEM_M2_GARAJES',
            'MODULO_GARAJES', 'MODULO_APARCAMIENTO'
        ],
        'SUP. PROYECTO': ['BAJO_RASANTE', 'EDIFICADO_BR', 'SUP_PROYECTO_APARCAMIENTO', 'SUP_GARAJES', 'SUP_SOTANO'],
        'PEM USO': [
            'PEM_TOTAL_APARCAMIENTO', 'PEM_USO_APARCAMIENTO', 'PEM_BAJO_RASANTE', 
            'PRESUPUESTO_GARAJES', 'PEM_SOTANO', 'PRESUPUESTO_APARCAMIENTO', 'PEM_EJECUCION_GARAJES', 'PEM_TOTAL_GARAJES'
        ]
    }
};

export const getPemValDirect = (data: any, rowLabel: string, colLabel: string) => {
    // Misma lógica que PemTable pero expuesta para diagnóstico
    const explicitKeys = PEM_KEYS_MATRIX[rowLabel]?.[colLabel];
    if (explicitKeys) {
        for (const key of explicitKeys) {
            const res = findKeyAndValueFull(data, key, true);
            if (res.status === 'found') return { key, value: res.value };
        }
    }
    
    // Fallbacks
    if (colLabel === 'PEM UNITARIO') {
         const keywords = ['pem', 'modulo', 'unitario', 'coac', 'valor'];
         const rowKeywords = rowLabel.toLowerCase().split(' ');
         const potentialKey = Object.keys(data).find(k => {
            const kn = normalizeKey(k);
            const hasUnitKey = keywords.some(wk => kn.includes(wk));
            const hasRowKey = rowKeywords.some(rk => kn.includes(normalizeKey(rk)));
            if (kn.includes('total') || kn.includes('presupuesto') || kn.includes('ejecucion')) return false;
            return hasUnitKey && hasRowKey;
        });
        if (potentialKey) return { key: potentialKey, value: data[potentialKey] };
    }

    if (colLabel === 'PEM USO') {
        const blacklist = ['sup', 'm2', 'edificado', 'area', 'construido', 'unitario', 'modulo', 'coac'];
        const keywords = ['pem', 'presupuesto', 'ejecucion', 'coste', 'total'];
        const rowKeywords = rowLabel.toLowerCase().split(' ');
        const potentialKey = Object.keys(data).find(k => {
            const kn = normalizeKey(k);
            if (blacklist.some(b => kn.includes(b))) return false;
            const hasMoneyKey = keywords.some(wk => kn.includes(wk));
            const hasRowKey = rowKeywords.some(rk => kn.includes(normalizeKey(rk)));
            return hasMoneyKey && hasRowKey;
        });
        if (potentialKey) return { key: potentialKey, value: data[potentialKey] };
    }
    return { key: 'NO_ENCONTRADA', value: null };
};


export const PemTable = ({ data }: { data: any }) => {
    const format = (v: any, isMoney: boolean = false) => {
         if (v === null || v === undefined || v === '') return '-';
         if (v === 0 || v === '0') return '-';
         const num = typeof v === 'number' ? v : parseFloat(String(v).replace(/[^\d,.-]/g, '').replace('.', '').replace(',', '.'));
         if (isNaN(num)) return v;
         if (isMoney) return num.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2 });
         return num.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const parseNum = (v: any) => {
        if (typeof v === 'number') return v;
        if (!v) return 0;
        const clean = String(v).replace(/[^\d,.-]/g, '').replace('.', '').replace(',', '.');
        return parseFloat(clean) || 0;
    };

    let calculatedTotal = 0;
    let pemTotalVal = null;
    const pemTotalRes = findKeyAndValueFull(data, 'PEM TOTAL');
    if (pemTotalRes.status === 'found') pemTotalVal = pemTotalRes.value;
    else {
         const k = Object.keys(data).find(key => {
             const kn = normalizeKey(key);
             return kn.includes('pem') && kn.includes('total') && !kn.includes('unitario');
         });
         if (k) pemTotalVal = data[k];
    }

    return (
        <div className="bg-brand-bg-dark rounded-sm shadow border border-brand-surface flex flex-col h-full min-h-0">
            <div className="bg-brand-surface text-brand-text font-bold text-[10px] py-1 px-2 uppercase flex justify-between items-center shrink-0 border-b border-gray-600">
                <span className="w-[28%]">PEM UNITARIO (COAC)</span>
                <span className="w-[22%]"></span> 
                <span className="w-[25%] text-right">SUP. PROYECTO</span>
                <span className="w-[25%] text-right">PEM-USO</span>
            </div>
            <div className="p-1 flex-1 flex flex-col justify-center"> 
                <table className="w-full border-collapse text-[10px]">
                    <tbody>
                        {PEM_TABLE_ROWS.map(row => {
                             const res1 = getPemValDirect(data, row, 'PEM UNITARIO');
                             const res2 = getPemValDirect(data, row, 'SUP. PROYECTO');
                             const res3 = getPemValDirect(data, row, 'PEM USO'); 
                             
                             const p1 = parseNum(res1.value);
                             const p2 = parseNum(res2.value);
                             const p3 = parseNum(res3.value);

                             let finalTotal = p3;
                             let isCalculated = false;

                             if (p1 !== 0) {
                                 finalTotal = p1 * p2;
                                 isCalculated = true;
                             }

                             if (isCalculated || typeof finalTotal === 'number') {
                                 calculatedTotal += (typeof finalTotal === 'number' ? finalTotal : 0);
                             } else {
                                 calculatedTotal += p3;
                             }

                             return (
                                <tr key={row} className="border-b border-brand-bg-light/20 text-brand-text-secondary">
                                    <td className="py-1.5 px-1 pl-2 text-left font-medium w-[28%] bg-brand-bg-light/10 text-brand-text-secondary text-[10px]">{row}</td>
                                    <td className="py-1.5 px-1 text-right text-brand-primary font-bold w-[22%] text-[10px]">{format(res1.value)}</td>
                                    <td className="py-1.5 px-1 text-right text-brand-text font-bold w-[25%] text-[10px]">{format(res2.value)}</td>
                                    <td className={`py-1.5 px-1 text-right font-bold w-[25%] pr-2 text-[10px] ${isCalculated ? 'text-brand-primary' : 'text-brand-text'}`}>
                                        {format(finalTotal, true)}
                                    </td>
                                </tr>
                             );
                        })}
                        <tr className="bg-brand-bg-light/30">
                            <td colSpan={3} className="py-1.5 px-1 text-right font-bold uppercase text-brand-text pr-2 text-[10px]">PEM TOTAL:</td>
                            <td className="py-1.5 px-1 text-right font-bold text-brand-primary pr-2 text-[10px]">
                                {pemTotalVal ? format(pemTotalVal, true) : format(calculatedTotal, true)}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// --- NUEVO PANEL DE DIAGNÓSTICO DETALLADO (Exportado para ProgrammerView) ---
// UPDATED: Uses Programmer View dark theme (gray-900/800)
export const DetailedDiagnosticTable = ({ dsGenerales }: { dsGenerales: Record<string, any> }) => {
    return (
        <div className="h-full w-full font-mono text-xs text-gray-300 overflow-auto rounded">
             <div className="space-y-6">
                 {CARD_CONFIG.map(card => (
                     <div key={card.id} className="border border-gray-700 rounded overflow-hidden">
                         <div className="bg-gray-800 px-3 py-1 font-bold text-white text-[11px] uppercase tracking-wide border-b border-gray-700">
                             {card.title}
                         </div>
                         <table className="w-full text-left border-collapse">
                             <thead>
                                 <tr className="text-[10px] text-gray-400 uppercase bg-gray-900 border-b border-gray-700">
                                     <th className="p-2 w-1/3 border-r border-gray-700">Etiqueta App</th>
                                     <th className="p-2 w-1/3 border-r border-gray-700">Clave DB</th>
                                     <th className="p-2 w-1/3 text-right">Valor</th>
                                 </tr>
                             </thead>
                             <tbody className="bg-gray-900">
                                 {card.items.map((item: any, idx: number) => {
                                     const res = findKeyAndValueFull(dsGenerales, item.label);
                                     const found = res.status === 'found';
                                     return (
                                         <tr key={idx} className="border-b border-gray-800 hover:bg-gray-800">
                                             <td className="p-2 border-r border-gray-800 text-yellow-200">{item.label}</td>
                                             <td className={`p-2 border-r border-gray-800 font-bold ${found ? 'text-green-400' : 'text-red-400 italic'}`}>
                                                 {found ? res.key : 'NO ENCONTRADA'}
                                             </td>
                                             <td className="p-2 text-right text-white">
                                                 {found ? String(res.value) : '-'}
                                             </td>
                                         </tr>
                                     );
                                 })}
                             </tbody>
                         </table>
                     </div>
                 ))}
             </div>
        </div>
    );
};

// UPDATED: Uses Programmer View dark theme (gray-900/800)
export const PemAuditTable = ({ dsGenerales }: { dsGenerales: Record<string, any> }) => {
     const parseNum = (v: any) => {
        if (typeof v === 'number') return v;
        if (!v) return 0;
        return parseFloat(String(v).replace(/[^\d,.-]/g, '').replace('.', '').replace(',', '.')) || 0;
    };

    return (
        <div className="border border-gray-700 rounded overflow-hidden font-mono text-xs text-gray-300">
            <div className="bg-gray-800 px-3 py-2 font-bold text-white uppercase tracking-wide flex items-center border-b border-gray-700">
                Auditoría de Cálculo PEM (Lógica Forzada)
            </div>
            <div className="p-3 space-y-4 bg-gray-900">
                {PEM_TABLE_ROWS.map(rowName => {
                    const unitario = getPemValDirect(dsGenerales, rowName, 'PEM UNITARIO');
                    const superficie = getPemValDirect(dsGenerales, rowName, 'SUP. PROYECTO');
                    const dbTotal = getPemValDirect(dsGenerales, rowName, 'PEM USO');
                    
                    const valUnit = parseNum(unitario.value);
                    const valSup = parseNum(superficie.value);
                    const calculated = valUnit * valSup;
                    
                    const isForced = valUnit !== 0;

                    return (
                        <div key={rowName} className="bg-gray-800 p-3 rounded border border-gray-700">
                            <div className="font-bold text-white mb-2 border-b border-gray-700 pb-1">{rowName}</div>
                            <div className="grid grid-cols-3 gap-4 text-[10px]">
                                <div>
                                    <div className="text-gray-500 uppercase mb-1">1. Unitario (Input)</div>
                                    <div className="font-bold text-green-400 mb-0.5">{unitario.key}</div>
                                    <div className="font-bold text-sm text-white">{valUnit.toLocaleString()} €</div>
                                </div>
                                <div>
                                    <div className="text-gray-500 uppercase mb-1">2. Superficie (Input)</div>
                                    <div className="font-bold text-green-400 mb-0.5">{superficie.key}</div>
                                    <div className="font-bold text-sm text-white">{valSup.toLocaleString()} m²</div>
                                </div>
                                <div className={`p-2 rounded ${isForced ? 'bg-green-900/20 border border-green-500/30' : 'bg-gray-700'}`}>
                                    <div className="text-gray-400 uppercase mb-1">3. Resultado (Output)</div>
                                    {isForced ? (
                                        <>
                                            <div className="text-green-400 font-bold mb-1">LÓGICA FORZADA</div>
                                            <div className="text-gray-300 mb-1">{valUnit} x {valSup}</div>
                                            <div className="font-bold text-sm text-white">{calculated.toLocaleString()} €</div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="text-gray-400 font-bold mb-1">VALOR DB (NO CÁLCULO)</div>
                                            <div className="text-gray-500 mb-1">Clave: {dbTotal.key}</div>
                                            <div className="font-bold text-sm text-white">{parseNum(dbTotal.value).toLocaleString()} €</div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

const GeneralDataView: React.FC<{ dsGenerales: Record<string, any>; projectName: string }> = ({ dsGenerales }) => {
    const row1 = CARD_CONFIG.slice(0, 3);
    const row2 = CARD_CONFIG.slice(3, 6);
    const row3 = CARD_CONFIG.slice(6, 9);
    const card10 = CARD_CONFIG[9];

    return (
        <div className="h-full w-full bg-brand-bg-dark p-4 font-sans text-xs flex flex-col overflow-y-auto relative">
            <div className="grid grid-cols-3 gap-2 pb-8"> 
                {/* FILA 1 */}
                {row1.map(c => <div key={c.id} className="min-h-0 h-full"><Card config={c} data={dsGenerales} /></div>)}
                
                {/* FILA 2 */}
                {row2.map(c => <div key={c.id} className="min-h-0 h-full"><Card config={c} data={dsGenerales} /></div>)}
                
                {/* FILA 3 */}
                {row3.map(c => <div key={c.id} className="min-h-0 h-full"><Card config={c} data={dsGenerales} /></div>)}

                {/* FILA 4 - Card 10 + PEM Table (Span 2) */}
                <div className="min-h-0 h-full"><Card config={card10} data={dsGenerales} /></div>
                <div className="col-span-2 min-h-0 h-full"><PemTable data={dsGenerales} /></div>
                
                {/* FILA 5 - Métricas Inferiores */}
                <div className="col-span-3 bg-brand-bg-dark border border-brand-surface p-2 rounded grid grid-cols-3 gap-x-4 gap-y-1 shrink-0 shadow mt-2 mb-6">
                        {BOTTOM_METRICS.map(m => {
                        const res = findKeyAndValueFull(dsGenerales, m.label);
                        let val: React.ReactNode = res.value;
                        
                        if (res.status === 'missing') val = <span className="text-red-500 text-[9px] font-bold">ERR</span>;
                        else if (val === 0 || val === '0' || !val) val = '-';
                        else if (typeof val === 'number') val = val.toLocaleString('es-ES', { maximumFractionDigits: 2 });

                        return (
                            <div key={m.label} className="flex justify-between items-center border-b border-brand-bg-light/10 last:border-0 pb-1">
                                <span className="font-semibold text-brand-text-secondary uppercase text-[10px] truncate pr-2 tracking-tighter">{m.label}:</span>
                                <div className="text-right shrink-0 leading-none">
                                    <span className={`font-bold text-[10px] ${res.status === 'missing' ? '' : 'text-brand-primary'}`}>{val}</span>
                                    {res.status !== 'missing' && val !== '-' && m.unit && <span className="text-[9px] text-brand-text-secondary ml-1">{m.unit}</span>}
                                </div>
                            </div>
                        );
                        })}
                </div>
            </div>
        </div>
    );
};

export default GeneralDataView;
