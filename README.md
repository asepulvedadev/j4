# J4 Internal Manager

Sistema interno administrativo para Grupo Empresarial J4 S.A.S.

## Estructura del Proyecto

```
j4/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Grupo de rutas de autenticación
│   │   ├── login/               # Página de login
│   │   │   └── page.tsx
│   │   └── layout.tsx           # Layout para auth (opcional)
│   ├── (dashboard)/             # Grupo de rutas protegidas
│   │   ├── dashboard/           # Dashboard principal
│   │   │   └── page.tsx
│   │   ├── importaciones/       # Módulo de importaciones
│   │   │   └── page.tsx
│   │   ├── productos/           # Módulo de productos
│   │   │   └── page.tsx
│   │   ├── inventario/          # Módulo de inventario
│   │   │   └── page.tsx
│   │   └── layout.tsx           # Layout del dashboard con navegación
│   ├── auth/                    # Rutas de API para auth
│   │   └── signout/
│   │       └── route.ts
│   ├── globals.css              # Estilos globales
│   ├── layout.tsx               # Layout raíz
│   └── page.tsx                 # Página de redirección
├── components/                  # Componentes reutilizables
│   ├── ImportForm.tsx           # Formulario de importaciones
│   ├── ImportsList.tsx          # Lista de importaciones
│   └── ui/                      # Componentes de UI (futuro)
├── lib/                         # Utilidades y configuraciones
│   └── supabase/
│       ├── client.ts            # Cliente Supabase para cliente
│       ├── server.ts            # Cliente Supabase para servidor
│       └── types.ts             # Tipos de TypeScript para BD
├── sql/                         # Scripts SQL
│   └── schema.sql               # Esquema completo de la BD
├── plans/                       # Documentación del proyecto
│   └── j4_internal_manager_plan.md
├── middleware.ts                # Middleware de Next.js
├── package.json
├── tsconfig.json
└── tailwind.config.js
```

## Arquitectura

### Autenticación
- **Supabase Auth**: Manejo de usuarios y sesiones
- **Middleware**: Protección automática de rutas
- **Roles**: admin, operador, consulta

### Base de Datos
- **PostgreSQL** via Supabase
- **Row Level Security** (RLS) activado
- **6 tablas principales** con relaciones normalizadas

### Tecnologías
- **Next.js 16** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Supabase** (Auth, Database, Storage)

## Instalación y Configuración

1. **Instalar dependencias**:
   ```bash
   bun install
   ```

2. **Configurar Supabase**:
   - Ejecutar `sql/schema.sql` en el SQL Editor de Supabase
   - Verificar variables de entorno en `.env.local`

3. **Ejecutar el proyecto**:
   ```bash
   bun run dev
   ```

## Módulos

### ✅ Implementados
- **Autenticación**: Login/logout completo
- **Importaciones**: CRUD con cálculo automático de costos

### 🔄 Pendientes
- **Productos**: Gestión de productos por importación
- **Inventario**: Control por sede
- **Precios**: Configuración de márgenes y utilidades
- **Dashboard**: Métricas ejecutivas

## Desarrollo

El proyecto sigue las mejores prácticas de Next.js:
- **Server Components** para datos
- **Client Components** para interactividad
- **Server Actions** para mutaciones
- **TypeScript** para type safety
- **Tailwind** para estilos

## Despliegue

Preparado para Vercel con configuración automática.
