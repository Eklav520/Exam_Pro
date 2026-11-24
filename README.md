# Exam Pro

Online exam platform. Students take timed exams and review their results; admins write and publish exams.

**Stack:** React 19, TypeScript (strict), Redux Toolkit + RTK Query, React Router 7, React Hook Form + Zod, Tailwind CSS 4, Vite, Vitest, MSW.

## Getting started

Requires Node 20.9 or later, and Exam_Pro_Backend for real data.

```bash
npm install

# Terminal 1, in Exam_Pro_Backend
npm install
npm run seed       # first time only: creates an admin, a student and sample exams
npm run dev        # http://localhost:5000

# Terminal 2, here
npm run dev        # http://localhost:3000
```

The dev server forwards `/api` to `http://localhost:5000`. Set the `API_PROXY_TARGET` environment variable to use another address.

### Without a backend

`npm run dev:mock` serves the API from the browser. Mock data is kept in `localStorage`; remove the `exam-pro.mock-db` key to reset it.

| Role    | Email                  | Password     |
| ------- | ---------------------- | ------------ |
| Student | `student@exampro.test` | `student123` |
| Admin   | `admin@exampro.test`   | `admin123`   |

## Scripts

| Command            | Purpose                                                 |
| ------------------ | ------------------------------------------------------- |
| `npm run dev`      | Development server, using the backend                   |
| `npm run dev:mock` | Development server, using the mock API                  |
| `npm run build`    | Type-check and build to `dist/`                         |
| `npm run preview`  | Serve the production build (needs a real API)           |
| `npm test`         | Run tests once (`test:watch` to watch)                  |
| `npm run validate` | Types, lint, formatting and tests. Run before every PR. |

## Structure

```
src/
  app/        Store, router, layouts. Composes everything.
  features/   One folder per business capability.
    auth/         Sign in, session, route guards
    dashboard/    Student home
    exams/        Browse exams
    attempt/      Take an exam: timer, autosave, submit
    results/      Scores and answer review
    admin-exams/  Write and publish exams
    staff/        Admin-side roles and the role preview menu
    admin-dashboard/, question-papers/, approvals/, monitoring/, evaluation/
                  Admin screens. Designed, using data/sample.ts; not connected yet.
  shared/     Reusable, business-agnostic: api, config, hooks, lib, types, ui
  mocks/      Mock API (MSW): handlers, seed data, grading
  test/       Test setup and helpers
```

A feature contains what it needs of `api/`, `model/`, `components/`, `pages/` and an `index.ts` public API.

### Rules (enforced by ESLint)

- Imports point down only: `app → features → shared`.
- Features import other features through their `index.ts`. Pages are not exported there, so they stay lazy-loaded.
- Features use `useAppDispatch` and `useAppSelector` from `@/app/hooks`.

### Admin screens in progress

Screens are built from sample data first and connected later.

- Each feature's `data/sample.ts` is what an API will replace.
- `usePreviewAction()` marks every control that still needs functionality.
- "Preview as role" in the account menu changes what is shown. It grants no access.

### State

- **Server data:** RTK Query. Add endpoints with `baseApi.injectEndpoints` in the feature.
- **Shared client state:** slices. The running attempt is the main one.
- **Forms and local UI:** React Hook Form and `useState`.

## API

Implemented by Exam_Pro_Backend. Paths are relative to `VITE_API_BASE_URL` (`/api/v1`). For a production build, set it to the full URL, such as `https://api.example.com/api/v1`, and add the frontend's origin to `CORS_ORIGINS` in the backend.

Request and response types are in `src/shared/types`. Errors are returned as `{ "message": "..." }`.

| Method           | Path                    | Role    |
| ---------------- | ----------------------- | ------- |
| POST             | `/auth/login`           | –       |
| GET              | `/auth/me`              | any     |
| GET              | `/exams`, `/exams/:id`  | student |
| POST             | `/exams/:id/attempts`   | student |
| GET              | `/attempts/:id`         | student |
| PUT              | `/attempts/:id/answers` | student |
| POST             | `/attempts/:id/submit`  | student |
| GET              | `/results`              | student |
| GET              | `/results/:attemptId`   | student |
| GET, POST        | `/admin/exams`          | admin   |
| GET, PUT, DELETE | `/admin/exams/:id`      | admin   |

The server must:

- Enforce roles and attempt ownership on every request. Client route guards are for UX only.
- Grade on the server and never send `correctOptionIds` or `explanation` before submission.
- Own the deadline: return `expiresAt` and `serverTime`, reject late answers (allowing a few seconds for the automatic submit), and close abandoned attempts.
- Ignore answers whose `revision` is not newer than the stored one, and make submit idempotent.

When the API changes, update `src/shared/types` and `src/mocks/handlers` to match.

The access token is kept in `localStorage`. If your backend can set an `HttpOnly` cookie, prefer that and drop `src/shared/lib/storage.ts`.

## Dependency versions

Vite 6, ESLint 9, Vitest 4 and MSW 2.12 are the newest lines that run on Node 20.15. With Node 22.13 or later you can move to the current majors, then remove the `eslint-visitor-keys` override and, on npm 11, the `legacy-peer-deps` line in `.npmrc`.
