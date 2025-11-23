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
- [ ] Definición de Roles en DB: `admin`, `architect`, `sales`, `viewer`.
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
