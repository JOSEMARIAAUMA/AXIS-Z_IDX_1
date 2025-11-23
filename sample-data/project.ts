
import type { Project } from '../types';
import { Status } from '../types';

export const SAMPLE_PROJECT: any = {
  id: 'sample-project-1',
  name: 'Residencial Zénit (Ejemplo)',
  code: 'PROY-ZENIT-01',
  regime: 'Venta Libre',
  location: 'Calle de la Innovación, 123, Valencia',
  promoter: 'Construcciones Futura S.L.',
  architect: 'Estudio de Arquitectura Vanguardia',
  constructorCompany: 'Edifica S.A.',
  plotArea: 2500,
  maxEdificability: 7500,
  pemProject: 6500000,
  locality: 'Valencia',
  use: 'Residencial',
  typology: 'Plurifamiliar',
  workType: 'Obra Nueva',
  projectPhase: 'En Construcción',
  managementSystem: 'Cooperativa',
  maxDwellings: 30,
  minGarageSpaces: 45,
  commercialPremises: 1,
  maxFloorsSR: 5,
  floorsBR: 2,
  edificadoSR: 7450.50,
  edificadoBR: 1800.00,
  property: 'Inversiones Urbanas S.A.',
  studio: 'Estudio de Arquitectura Vanguardia',
  technicalArchitect1: 'Rigoberto Manzanas',
  technicalArchitect2: 'Benita Juárez',
  marketer: 'InmoGlobal',
  commercialDocs: 'Folletos Prisma',
  infographics: 'Render Factory',
  materialsManager: 'GestMat S.L.',
  projectManagement: 'Project & Co.',
  projectMonitoring: 'Supervisión Global',
  headOfWorks: 'Juan García',
  worksManager: 'Pedro Pérez',
  geotechnical: 'GeoEstudios VLC',
  topographical: 'Topografía Levantina',
  ict: 'Teleco Proyectos',
  oct: 'Controla Edificación',
  decennialInsurance: 'Aseguradora Constructa',
  licenseDate: '2023-05-15',
  replanningActDate: '2023-06-01',
  cfoDate: '2025-12-20',
  pemContracted: 6200000,
  urbanizationCosts: 150000,
  icio: 248000,
  licenseFees: 55000,
  residualDeposit: 25000,
  urbanizationDeposit: 75000,

  // Section 6: SUP. CONSTRUIDAS REALES
  supConstRealBajoRasante: 1850.25,
  supConstRealTotalResidencial: 7350.75,
  supConstRealComercial: 150.00,
  supConstRealNetoViviendas: 5500.50,
  supConstRealExterioresViviendas: 850.25,
  supConstRealZonasComunesExt: 450.00,
  supConstRealZonasComunesInteriores: 1000.00,
  supConstRealTotalZonasComunes: 1450.00,

  // Section 7: SUP. CONSTRUIDAS URBANÍSTICAS
  supConstUrbBajoRasante: 1800.00,
  supConstUrbTotalResidencial: 7200.00,
  supConstUrbComercial: 145.00,
  supConstUrbNetoViviendas: 5400.00,
  supConstUrbExterioresViviendas: 800.00,
  supConstUrbZonasComunesInt: 950.00,
  supConstUrbZonasComunesExt: 420.00,
  supConstUrbTotalZonasComunes: 1370.00,

  // Section 8: SUPERFICIES ÚTILES
  supUtilViviendas: 4850.50,
  supUtilComercial: 135.25,
  supUtilTotalSR: 4985.75,
  supUtilTrasteros: 250.00,
  supUtilGarajes: 1350.00,
  supUtilTotalBR: 1600.00,
  supUtilSalonSocial: 80.00,
  supUtilZonaComunExterior: 1200.00,

  // Section 9: VALORES DE VENTA
  valorVentaViviendas: 9500000,
  valorVentaGarajes: 810000,
  valorVentaTrasteros: 240000,
  valorVentaLocales: 450000,
  precioVentaTotal: 11000000,

  // Bottom section fields
  pemUnitarioYear: '2024',
  pemUnitCoacResidential: 750.00,
  pemUnitCoacCommercial: 650.00,
  pemUnitCoacUrbInterior: 120.00,
  pemUnitCoacParking: 350.00,
  pemUsoSupProjectResidential: 7200.00,
  pemUsoSupProjectCommercial: 145.00,
  pemUsoSupProjectUrbInterior: 400.00,
  pemUsoSupProjectParking: 1800.00,
  pemUsoPemUsoResidential: 5400000,
  pemUsoPemUsoCommercial: 94250,
  pemUsoPemUsoUrbInterior: 48000,
  pemUsoPemUsoParking: 630000,
  pemTotal: 6172250,
  iprem: '600 €/mes',
  regime2: 'VPO',
  maximos2025: 'Sí',
  precioLimitado: 'No aplica',
  moduloBasico: 1850.50,
  moduloPonderado: 2100.00,
  precioReferencia: 155000,
  precioRefAnejos: 15000,

  units: [
    // --- Edificio A ---
    {
      id: 'A-PB-A', status: Status.Sold, bedrooms: 3, bathrooms: 2, building: 'A', floor: 0, type: 'Bajo con Jardín', position: 'Esquina', orientation: 'Sur-Este', price: 320000,
      totalUsefulArea: 110.50, totalBuiltArea: 130.20, usefulLivingArea: 95.5, builtLivingArea: 112, builtCommonArea: 18.2, terraceArea: 45.0,
      buyerId: 'cli-1', garageId: 'G-01', storageId: 'T-01', reservationDate: '2024-01-10T00:00:00Z', saleDate: '2024-03-15T00:00:00Z', notes: '[2024-03-15]: Venta formalizada con John Doe.'
    },
    {
      id: 'A-PB-B', status: Status.Reserved, bedrooms: 2, bathrooms: 2, building: 'A', floor: 0, type: 'Bajo con Jardín', position: 'Central', orientation: 'Sur', price: 295000,
      totalUsefulArea: 90.00, totalBuiltArea: 105.50, usefulLivingArea: 80, builtLivingArea: 93, builtCommonArea: 12.5, terraceArea: 35.0,
      buyerId: 'cli-5', garageId: 'G-02', reservationDate: '2024-05-20T00:00:00Z', notes: '[2024-05-20]: Reserva realizada por Carlos Rodriguez.'
    },
    {
      id: 'A-01-A', status: Status.Sold, bedrooms: 4, bathrooms: 3, building: 'A', floor: 1, type: 'Piso', position: 'Esquina', orientation: 'Sur-Este', price: 350000,
      totalUsefulArea: 125.00, totalBuiltArea: 145.00, usefulLivingArea: 115, builtLivingArea: 130, builtCommonArea: 15, terraceArea: 18.0,
      buyerId: 'cli-10', garageId: 'G-03', storageId: 'T-02', reservationDate: '2024-02-01T00:00:00Z', saleDate: '2024-04-10T00:00:00Z'
    },
    {
      id: 'A-01-B', status: Status.Available, bedrooms: 3, bathrooms: 2, building: 'A', floor: 1, type: 'Piso', position: 'Central', orientation: 'Sur', price: 310000,
      totalUsefulArea: 105.00, totalBuiltArea: 122.00, usefulLivingArea: 98, builtLivingArea: 110, builtCommonArea: 12, terraceArea: 12.0
    },
    {
      id: 'A-02-A', status: Status.Available, bedrooms: 4, bathrooms: 3, building: 'A', floor: 2, type: 'Piso', position: 'Esquina', orientation: 'Sur-Este', price: 355000,
      totalUsefulArea: 125.00, totalBuiltArea: 145.00, usefulLivingArea: 115, builtLivingArea: 130, builtCommonArea: 15, terraceArea: 18.0
    },
    {
      id: 'A-02-B', status: Status.Reserved, bedrooms: 3, bathrooms: 2, building: 'A', floor: 2, type: 'Piso', position: 'Central', orientation: 'Sur', price: 315000,
      totalUsefulArea: 105.00, totalBuiltArea: 122.00, usefulLivingArea: 98, builtLivingArea: 110, builtCommonArea: 12, terraceArea: 12.0,
      buyerId: 'cli-14', garageId: 'G-04', storageId: 'T-03', reservationDate: '2024-06-05T00:00:00Z'
    },
    {
      id: 'A-AT-A', status: Status.Sold, bedrooms: 5, bathrooms: 4, building: 'A', floor: 3, type: 'Ático', position: 'Esquina', orientation: 'Sur-Este', price: 550000,
      totalUsefulArea: 180.00, totalBuiltArea: 210.00, usefulLivingArea: 150, builtLivingArea: 175, builtCommonArea: 35, terraceArea: 80.0,
      buyerId: 'cli-15', garageId: 'G-05', storageId: 'T-04', reservationDate: '2023-12-15T00:00:00Z', saleDate: '2024-02-20T00:00:00Z'
    },
    {
      id: 'A-AT-B', status: Status.Available, bedrooms: 4, bathrooms: 3, building: 'A', floor: 3, type: 'Ático', position: 'Central', orientation: 'Sur', price: 480000,
      totalUsefulArea: 150.00, totalBuiltArea: 175.00, usefulLivingArea: 130, builtLivingArea: 150, builtCommonArea: 25, terraceArea: 60.0
    },

    // --- Edificio B ---
    {
      id: 'B-PB-A', status: Status.Available, bedrooms: 2, bathrooms: 1, building: 'B', floor: 0, type: 'Bajo con Jardín', position: 'Esquina', orientation: 'Norte-Oeste', price: 270000,
      totalUsefulArea: 85.00, totalBuiltArea: 100.00, usefulLivingArea: 75, builtLivingArea: 88, builtCommonArea: 12, terraceArea: 30.0
    },
    {
      id: 'B-PB-B', status: Status.Reserved, bedrooms: 1, bathrooms: 1, building: 'B', floor: 0, type: 'Bajo con Jardín', position: 'Central', orientation: 'Norte', price: 210000,
      totalUsefulArea: 60.00, totalBuiltArea: 70.00, usefulLivingArea: 55, builtLivingArea: 62, builtCommonArea: 8, terraceArea: 25.0,
      buyerId: 'cli-9', garageId: 'G-11', reservationDate: '2024-06-11T00:00:00Z'
    },
    {
      id: 'B-01-A', status: Status.Sold, bedrooms: 3, bathrooms: 2, building: 'B', floor: 1, type: 'Piso', position: 'Esquina', orientation: 'Norte-Oeste', price: 285000,
      totalUsefulArea: 100.00, totalBuiltArea: 118.00, usefulLivingArea: 92, builtLivingArea: 105, builtCommonArea: 13, terraceArea: 15.0,
      buyerId: 'cli-21', garageId: 'G-12', storageId: 'T-06', reservationDate: '2024-03-20T00:00:00Z', saleDate: '2024-05-15T00:00:00Z'
    },
    {
      id: 'B-01-B', status: Status.Available, bedrooms: 2, bathrooms: 2, building: 'B', floor: 1, type: 'Piso', position: 'Central', orientation: 'Norte', price: 260000,
      totalUsefulArea: 88.00, totalBuiltArea: 102.00, usefulLivingArea: 80, builtLivingArea: 90, builtCommonArea: 12, terraceArea: 10.0
    },
    {
      id: 'B-02-A', status: Status.Available, bedrooms: 3, bathrooms: 2, building: 'B', floor: 2, type: 'Piso', position: 'Esquina', orientation: 'Norte-Oeste', price: 290000,
      totalUsefulArea: 100.00, totalBuiltArea: 118.00, usefulLivingArea: 92, builtLivingArea: 105, builtCommonArea: 13, terraceArea: 15.0
    },
    {
      id: 'B-02-B', status: Status.Available, bedrooms: 2, bathrooms: 2, building: 'B', floor: 2, type: 'Piso', position: 'Central', orientation: 'Norte', price: 265000,
      totalUsefulArea: 88.00, totalBuiltArea: 102.00, usefulLivingArea: 80, builtLivingArea: 90, builtCommonArea: 12, terraceArea: 10.0
    },
    {
      id: 'B-AT-A', status: Status.Reserved, bedrooms: 4, bathrooms: 3, building: 'B', floor: 3, type: 'Ático', position: 'Esquina', orientation: 'Norte-Oeste', price: 450000,
      totalUsefulArea: 140.00, totalBuiltArea: 165.00, usefulLivingArea: 125, builtLivingArea: 145, builtCommonArea: 20, terraceArea: 70.0,
      buyerId: 'cli-23', garageId: 'G-15', storageId: 'T-07', reservationDate: '2024-04-30T00:00:00Z'
    },
  ].map(u => ({ ...u, surfaceEntrance: 0, surfaceDistributor: 0, surfaceLivingDiningKitchen: 0, surfaceLaundry: 0, surfaceBedroom1: 0, surfaceBedroom2: 0, surfaceBedroom3: 0, surfaceBedroom4: 0, surfaceBathroom1: 0, surfaceBathroom2: 0, usefulCoveredTerrace: 0, usefulUncoveredTerrace: 0, netArea: 0, totalBuiltWithCommon: 0, ...u })),

  garages: [
    { id: 'G-01', price: 18000, type: 'Estándar', builtArea: 15, usefulArea: 12.5 },
    { id: 'G-02', price: 18000, type: 'Estándar', builtArea: 15, usefulArea: 12.5 },
    { id: 'G-03', price: 18000, type: 'Estándar', builtArea: 15, usefulArea: 12.5 },
    { id: 'G-04', price: 18000, type: 'Estándar', builtArea: 15, usefulArea: 12.5 },
    { id: 'G-05', price: 25000, type: 'Grande + Eléctrico', builtArea: 20, usefulArea: 18 },
    { id: 'G-06', price: 17500, type: 'Estándar', builtArea: 14.5, usefulArea: 12 },
    { id: 'G-07', price: 17500, type: 'Estándar', builtArea: 14.5, usefulArea: 12 },
    { id: 'G-08', price: 16000, type: 'Pequeña', builtArea: 12, usefulArea: 10 },
    { id: 'G-09', price: 16000, type: 'Pequeña', builtArea: 12, usefulArea: 10 },
    { id: 'G-10', price: 17500, type: 'Estándar', builtArea: 14.5, usefulArea: 12 },
    { id: 'G-11', price: 18000, type: 'Estándar', builtArea: 15, usefulArea: 12.5 },
    { id: 'G-12', price: 18000, type: 'Estándar', builtArea: 15, usefulArea: 12.5 },
    { id: 'G-13', price: 22000, type: 'Grande', builtArea: 18, usefulArea: 16 },
    { id: 'G-14', price: 22000, type: 'Grande', builtArea: 18, usefulArea: 16 },
    { id: 'G-15', price: 25000, type: 'Grande + Eléctrico', builtArea: 20, usefulArea: 18 },
  ],
  storages: [
    { id: 'T-01', price: 6000, builtArea: 8, usefulArea: 7 },
    { id: 'T-02', price: 6000, builtArea: 8, usefulArea: 7 },
    { id: 'T-03', price: 6000, builtArea: 8, usefulArea: 7 },
    { id: 'T-04', price: 8000, builtArea: 10, usefulArea: 9 },
    { id: 'T-05', price: 5000, builtArea: 6, usefulArea: 5 },
    { id: 'T-06', price: 6000, builtArea: 8, usefulArea: 7 },
    { id: 'T-07', price: 8000, builtArea: 10, usefulArea: 9 },
    { id: 'T-08', price: 5000, builtArea: 6, usefulArea: 5 },
  ],
  unitColumnHeaders: [
    'VIVIENDAS',
    'TIPO',
    'Nº DORM',
    'Nº BAÑOS',
    'EDIFICIO',
    'NIVEL',
    'POSICIÓN',
    'ORIENTACIÓN',
    'SUP. ÚTIL TOTAL',
    'SUP. CONST. TOTAL',
    'PRECIO DE VENTA',
    'COMPRADOR'
  ],
  unitColumnGroups: [
    'DATOS GENERALES',
    'ESPECIFICACIONES',
    'ESPECIFICACIONES',
    'ESPECIFICACIONES',
    'UBICACIÓN',
    'UBICACIÓN',
    'UBICACIÓN',
    'UBICACIÓN',
    'SUP. ÚTILES RESUMEN (M²)',
    'SUP. CONSTRUIDAS (M²)',
    'PRECIOS MÁX. VIV',
    'GESTIÓN'
  ],
  garageColumnHeaders: ['ID-G', 'TIPO-G', 'CONST-G', 'ÚTIL PRIV-G', 'PRECIO MÁX-G'],
  garageColumnGroups: ['DATOS GENERALES', 'ESPECIFICACIONES', 'ESPECIFICACIONES', 'ESPECIFICACIONES', 'GESTIÓN'],
  storageColumnHeaders: ['ID-T', 'CONST-T', 'ÚTIL PRIV-T', 'PRECIO MÁX-T'],
};
