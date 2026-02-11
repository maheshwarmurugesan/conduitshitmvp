# Project Structure

This project is organized by functionality and components for easy navigation.

## Root Level
- **README.md** - Main project documentation
- **requirements.txt** - Python dependencies
- **.gitignore** - Git ignore rules (excludes node_modules, .next, .db, etc.)

## Documentation (`/docs` equivalent - root level)
- **MVP_AND_WHAT_I_NEED.md** - MVP scope and requirements
- **BUILD_SPEC_WHAT_YOU_NEED.md** - Build specifications
- **SECURITY_HUMAN_IN_THE_LOOP.md** - Security checklist and fixes
- **PROMPTS_STRICT_ORDER.md** - Implementation prompts
- **EMAIL_TO_AARON_QUESTIONS.md** - Questions for plant contact

## Backend (`/backend`)

### Core Application
- **main.py** - FastAPI app entry point, CORS middleware
- **database.py** - SQLAlchemy setup, DB initialization
- **auth.py** - Authentication: `get_current_user()` from token
- **rate_limit.py** - Rate limiting middleware

### API Routes
- **routes_platform.py** - Platform API: dashboard, alerts, work orders, shift handoff
- **routes_spec.py** - Spec API: scada/poll, alerts/process, compliance/export, logs/write

### Data Models
- **models_platform.py** - SQLAlchemy models: Reading, Alert, WorkOrderRecord, AuditLog

### Schemas
- **schemas_shared.py** - Pydantic schemas: ReadingOut, AlertOut, WorkOrderCreate, etc.

### Connectors (`/backend/connectors`)
- **base.py** - Base connector interface
- **scada.py** - SCADA connector (OPC UA, mock data)
- **wims.py** - WIMS connector (stub)
- **cmms.py** - CMMS connector (Fiix stub)
- **lims.py** - LIMS connector (stub)
- **logs.py** - Logs connector (stub)

### Ingestion (`/backend/ingestion`)
- **service.py** - Pull SCADA, normalize tags, store readings

### Pipeline (`/backend/pipeline`)
- **alerts.py** - Evaluate alerts from threshold rules

### E-Log Module (`/backend/elog`)
- **models.py** - LogEntry SQLAlchemy model
- **schemas.py** - LogEntryCreate, LogEntryResponse Pydantic schemas
- **repository.py** - DB operations: create_entry, get_entry, list_entries
- **routes.py** - E-Log REST API routes
- **connector.py** - Helper functions: log_readings_approved, log_wo_created, log_alert_only

### Configuration
- **compliance_config.py** - Compliance CSV column mapping
- **config/compliance_columns.example.json** - Example compliance config

## Frontend (`/frontend`)

### App Pages (`/frontend/src/app`)
- **page.tsx** - Overview dashboard (main page)
- **alerts/page.tsx** - Alerts list with severity colors
- **alerts/[id]/page.tsx** - Alert detail (create WO, log only, dismiss)
- **elog/page.tsx** - Shift log with filters and search
- **work-orders/page.tsx** - Work orders list
- **shift/page.tsx** - Shift handover summary and sign-off
- **trends/page.tsx** - Process trends with time ranges
- **layout.tsx** - Root layout with ScadaHeader
- **globals.css** - Global styles, theme variables, animations

### Components (`/frontend/src/components`)
- **ScadaHeader.tsx** - Top navigation bar (menu, KPIs, search, user)
- **ThemeProvider.tsx** - Dark/light theme context
- **DashboardCard.tsx** - Reusable card container
- **AlarmBanner.tsx** - Critical alarm banner with flash
- **Gauge.tsx** - Process gauge component
- **Sparkline.tsx** - Mini trend chart component

### Libraries (`/frontend/src/lib`)
- **auth.ts** - Auth helpers: getAuthToken, getCurrentUser, getDisplayName
- **mockScadaData.ts** - Mock data generators: WSU table, charts, notifications

### Configuration
- **package.json** - Dependencies (Next.js, React, Tailwind)
- **tsconfig.json** - TypeScript config
- **next.config.js** - Next.js config (API rewrites)
- **postcss.config.mjs** - PostCSS config for Tailwind

## Key Features by Component

### Authentication & Authorization
- Token-based auth (`operator_id:plant_id:role`)
- Plant-scoped data access (IDOR protection)
- Role-based actions (operator, supervisor, admin)

### Dashboard
- Systems status (SCADA, LIMS, WIMS, CMMS)
- Pull latest from SCADA
- Approve & sync to WIMS + E-Log
- Process charts (pressure, consumption)
- Process data table (185 WSUs)

### Alerts
- Threshold-based alerts from SCADA
- Severity colors (critical, high, medium, low)
- Actions: Create work order, log only, dismiss

### Work Orders
- Created from alerts
- Pushed to CMMS
- Audit trail

### Shift Log
- Electronic logbook
- Filters: All, readings_approved, wo_created, alert_log_only, shift_handoff
- Search by entry type, body, operator

### Shift Handover
- Summary: syncs, alerts handled, work orders, time saved
- Sign-off with notes

## Security Features
- ✅ Auth stub (token-based)
- ✅ Role from auth only
- ✅ Rate limiting
- ✅ Input validation (max lengths, no control chars)
- ✅ IDOR fix (plant-scoped access)
- ✅ CORS restricted to frontend origin

## Remaining for Production
- Real OAuth/SSO (replace token stub)
- Secrets manager
- Disable debug mode
