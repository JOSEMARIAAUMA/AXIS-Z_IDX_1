
// Function to calculate age from a birth date string (YYYY-MM-DD)
export const calculateAge = (birthDate: string): number => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDifference = today.getMonth() - birth.getMonth();
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return age;
};

// Function to get an age range string from an age
export const getAgeRange = (age: number): string => {
    if (age < 18) return '< 18';
    if (age >= 18 && age <= 25) return '18-25';
    if (age >= 26 && age <= 35) return '26-35';
    if (age >= 36 && age <= 45) return '36-45';
    if (age >= 46 && age <= 55) return '46-55';
    if (age >= 56 && age <= 65) return '56-65';
    return '> 65';
};

// Function to normalize a string for searching (lowercase, no accents, strict alphanumeric)
export const normalizeKey = (str: string): string => {
    if (!str) return '';
    return String(str)
        .toLowerCase()
        .trim()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Quitar acentos
        .replace(/[^a-z0-9]/g, ""); // Quitar espacios y símbolos
};

// Version menos agresiva que mantiene espacios para ciertos logs o búsquedas
export const normalizeString = (str: string): string => {
    return String(str)
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
};

// --- GENERADOR DE CLAVES ESTÁNDAR (SNAKE_CASE LIMPIO) ---
// Convierte "DATOS GENERALES_Nº BAÑOS" -> "grl_num_banos"
export const generateStandardKey = (str: string): string => {
    if (!str || !str.trim()) return 'empty';
    
    let s = str.toLowerCase().trim();

    // 1. Reemplazos semánticos de símbolos
    s = s.replace(/º/g, 'num');
    s = s.replace(/%/g, 'pct');
    s = s.replace(/\+/g, '_plus_');
    s = s.replace(/&/g, '_and_');
    s = s.replace(/@/g, '_at_');

    // 2. Eliminación de acentos (NFD)
    s = s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    // 3. Reemplazo de caracteres no alfanuméricos por guiones bajos
    s = s.replace(/[^a-z0-9]/g, '_');

    // 4. Diccionario de Abreviaturas Arquitectónicas (para acortar claves)
    const abbrevs: Record<string, string> = {
        'superficies': 'sup', 'superficie': 'sup',
        'utiles': 'util', 'util': 'util',
        'construidas': 'const', 'construida': 'const', 'construido': 'const',
        'interiores': 'int', 'interior': 'int',
        'exteriores': 'ext', 'exterior': 'ext',
        'viviendas': 'viv', 'vivienda': 'viv',
        'datos_generales': 'grl', 'general': 'grl', 'datos': 'data',
        'ubicacion': 'loc',
        'urbanistico': 'urb', 'urbanistica': 'urb', 'urbanizacion': 'urb',
        'privativas': 'priv', 'privativo': 'priv',
        'comunes': 'com', 'comun': 'com',
        'servicios': 'serv',
        'garajes': 'gar', 'garaje': 'gar',
        'trasteros': 'trast', 'trastero': 'trast',
        'resumen': 'res',
        'distribuidor': 'dist', 'distrib': 'dist',
        'dormitorio': 'dorm', 'dormitorios': 'dorm',
        'banos': 'bath', 'bano': 'bath',
        'cocina': 'kit',
        'salon': 'liv',
        'comedor': 'din',
        'terraza': 'terr',
        'jardin': 'gdn',
        'precio': 'prc', 'maximo': 'max',
        'venta': 'sale',
        'gestion': 'mgmt',
        'observaciones': 'obs',
        'vinculado': 'link',
        'cliente': 'cli',
        'comprador': 'buyer'
    };

    // 5. Procesar partes
    s = s.split('_')
        .filter(Boolean) // Eliminar vacíos
        .map(part => abbrevs[part] || part) // Aplicar abreviaturas
        .join('_'); // Unir de nuevo

    // Final check for empty result after cleaning
    if (!s) return 'empty';

    return s;
};


// Helper para encontrar el valor de una propiedad en un objeto usando búsqueda flexible de claves
export const fuzzyFindValue = (row: Record<string, any>, possibleKeys: string[]): any => {
    if (!row) return undefined;
    const rowKeys = Object.keys(row);

    for (const target of possibleKeys) {
        // 1. Búsqueda exacta
        if (row[target] !== undefined) return row[target];

        // 2. Búsqueda normalizada
        const targetNorm = normalizeKey(target);
        
        // Búsqueda en claves de fila
        const match = rowKeys.find(k => {
            const kNorm = normalizeKey(k);
            
            // Coincidencia exacta de la versión normalizada
            if (kNorm === targetNorm) return true;
            
            // Coincidencia si contiene la cadena (útil para prefijos largos)
            if (targetNorm.length > 5 && kNorm.includes(targetNorm)) return true;
            if (kNorm.length > 5 && targetNorm.includes(kNorm)) return true;

            return false;
        });

        if (match) return row[match];
    }
    return undefined;
};
