
export enum Status {
  Available = 'Available',
  Reserved = 'Reserved',
  Sold = 'Sold',
}

export enum ClientStatus {
  Active = 'ACTIVO',
  Inactive = 'INACTIVO',
}

export enum ClientType {
  Interested = 'Interesado',
  Potential = 'Potencial',
  OptionHolder = 'Optante',
  Partner = 'Socio',
  Previous = 'Previo',
  Reserved = 'Reserva',
  Buyer = 'Comprada',
}

export interface Client {
  id: string;
  status: ClientStatus;
  clientType: ClientType;
  group?: string;
  name: string;
  lastName?: string;
  dni?: string;
  phone: string;
  phone2?: string;
  email: string;
  address?: string;
  postalCode?: string;
  city?: string;
  province?: string;
  country?: string;
  birthDate?: string;
  civilStatus?: string;
  gender?: 'F' | 'M';
  registrationDate: string;
  lastActivityDate?: string;
  notes?: string;
}

export interface AugmentedClient extends Client {
  idC: string;
  promocionId?: string;
  promocionNombre?: string;
  viviendaId?: string;
  garajeId?: string;
  trasteroId?: string;
  edad?: number;
  rangoEdad?: string;
  añoRegistro?: number;
}

export interface FiltersState {
  building: string;
  floor: string;
  bedrooms: string;
  status: string;
  type: string;
  position: string;
  orientation: string;
  priceRange: string;
}

// --- ARQUITECTURA DE DATOS JSON (AXIS-Z) ---

// Estructura cruda tal cual viene de Supabase/JSONs
export interface ProjectDataRaw {
  proyecto_nombre: string;
  ds_generales: Record<string, any>;
  ts_general: Record<string, any>[];
  garajes: Record<string, any>[];
  trasteros: Record<string, any>[];
}

// Modelo interno para compatibilidad con Dashboards y Reservas
export interface Unit {
  id: string;
  bedrooms: number;
  bathrooms: number;
  building: string;
  floor: number;
  type: string;
  position: string;
  orientation: string;
  status: Status;
  price: number;
  totalBuiltArea: number;
  totalUsefulArea: number;
  
  // Linking (Campos opcionales según briefing)
  garageId?: string;
  storageId?: string;
  buyerId?: string;
  notes?: string;
  
  // Dates
  reservationDate?: string;
  saleDate?: string;

  // Raw access for specific columns
  [key: string]: any;
}

export interface Garage {
  id: string;
  price: number;
  type: string;
  usefulArea: number;
  [key: string]: any;
}

export interface Storage {
  id: string;
  price: number;
  usefulArea: number;
  [key: string]: any;
}

export interface Project {
  id: string;
  name: string;
  units: Unit[];
  garages: Garage[];
  storages: Storage[];
  raw: ProjectDataRaw; // Acceso a los datos crudos (Fuente de Verdad)
}
