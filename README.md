# Kurao — Sistema de Gestión Hospitalaria

Monorepo que contiene:

- **`/` (raíz)** — Frontend en React + Vite + TypeScript.
- **`backend-kurao/`** — Backend en Node.js + Express + PostgreSQL + JWT.

## Requisitos

- Node.js 18+
- PostgreSQL 13+ corriendo en local

## Puesta en marcha

### 1. Base de datos

Crea la BD y ejecuta el script de inicialización:

```bash
createdb kurao
psql -d kurao -f backend-kurao/sql/init.sql
```

> Si ya tenías la BD creada con el esquema original, aplica la migración para soportar el estado `Completada` en citas:
>
> ```sql
> ALTER TABLE citas DROP CONSTRAINT IF EXISTS citas_estado_check;
> ALTER TABLE citas ADD CONSTRAINT citas_estado_check
>   CHECK (estado IN ('Pendiente','Confirmada','Completada','Cancelada'));
> ```

### 2. Variables de entorno

- `backend-kurao/.env` — credenciales de Postgres, `PORT=4000`, `JWT_SECRET`, etc. (ver `backend-kurao/.env.example`).
- `.env` en la raíz — `VITE_API_URL=http://localhost:4000/api` (ver `.env.example`).

### 3. Instalar dependencias

```bash
npm install                 # frontend
npm run backend:install     # backend (equivale a: cd backend-kurao && npm install)
```

### 4. Arrancar ambos servicios

En dos terminales distintas:

```bash
# Terminal 1 — backend en :4000
npm run backend:dev

# Terminal 2 — frontend en :3000
npm run dev
```

Abre <http://localhost:3000>. Swagger de la API: <http://localhost:4000/api-docs>.

## Usuarios seed

Todos con password **`admin123`** (hash en `sql/init.sql`):

| Email                        | Rol backend     | Rol frontend |
| ---------------------------- | --------------- | ------------ |
| admin@kurao.com              | admin           | admin        |
| elena.garcia@kurao.com       | medico          | doctor       |
| ricardo.martinez@kurao.com   | medico          | doctor       |
| roberto.sanchez@kurao.com    | medico          | doctor       |
| recepcion@kurao.com          | recepcionista   | reception    |

## Cómo está integrado

- `src/services/api.ts` es el adaptador HTTP: llama al backend con `fetch`, agrega `Authorization: Bearer <token>` desde `localStorage`, y traduce las formas de datos:
  - `usuario.rol` (`admin|medico|recepcionista`) → `user.role` (`admin|doctor|reception`).
  - `apellido` ↔ `apellidos`, `genero` ↔ `sexo`, `ultima_visita` ↔ `ultimaVisita`.
  - `horario` JSONB → `horarioInicio`/`horarioFin`.
  - Citas: `id` → `FOL-<id>`, `paciente_nombre`/`medico_nombre` → `paciente`/`medico`, estado `Pendiente|Confirmada` → `Programada`.
- `AuthContext` persiste `kurao_token` y `kurao_user` en `localStorage`.
- Las rutas protegidas en `AppRouter.tsx` validan contra los roles traducidos (`admin`, `doctor`, `reception`).
