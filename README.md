## Splitwise-Frontend (Warikan)

An Angular 18 app that mimics core Splitwise functionality: groups, members, expenses, and balances. It includes a simple Node/Express backend (in `backend/`) used for certain operations (e.g., resolving Firebase UIDs by email).

### Tech Stack
- Angular 18 (standalone APIs)
- PrimeNG UI components
- Firebase Auth (`@angular/fire`)
- Node/Express backend (`backend/`) for API endpoints

### Prerequisites
- Node.js 18+ and npm
- Firebase project (optional but recommended if you want to test auth end-to-end)

### Quick Start

1) Install dependencies

```bash
npm install
cd backend && npm install && cd ..
```

2) Start the backend API (default: `http://localhost:3001`)

```bash
cd backend
npm start
```

The API exposes endpoints under `/api`. For example, the frontend expects `GET /api/users/uid-by-email?email=...`.

3) Start the Angular dev server (default: `http://localhost:4200`)

```bash
npm start
# or
ng serve
```

Open the app at `http://localhost:4200`.

### Configuration

- API URL: The frontend currently points to `http://localhost:3001/api` inside `src/app/features/groups/services/groups.service.ts` (property `apiUrl`). If you change the backend port/host, update this value accordingly.

- Firebase: The app references Firebase Auth (e.g., `getAuth()`). Ensure your Firebase config is set up in `src/environments/environment.ts` and `environment.production.ts` if you plan to use real authentication. For local development without Firebase, some features will be stubbed or rely on local data.

### Scripts

- Dev server: `npm start` or `ng serve`
- Build: `ng build`
- Production build output: `dist/`

### Common Issues

- Port already in use: If `4200` or `3001` is in use, either free the port or run the servers on different ports and update the `apiUrl` accordingly.
- CORS: If you deploy the backend separately, ensure CORS is configured to allow the frontend origin.

### Project Structure (partial)

- `src/` – Angular app source
  - `app/features/groups/` – Groups, members, and expenses features
  - `app/features/add-expense/` – Add expense modal and logic
  - `app/features/auth/` – Auth routes and services
- `backend/` – Node/Express API used by the frontend

### Notes

- Some demo data is embedded for quick local testing (e.g., groups, members, and expenses). The backend API is used for specific flows like resolving Firebase UIDs by email.

---

Generated with Angular CLI 18.2.12, then customized for this project.
