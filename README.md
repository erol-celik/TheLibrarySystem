# The Library System (BookHub)

A full-stack library management platform where users can rent, buy, sell, and donate books, leave reviews, and manage an in-app wallet. Librarians and admins get dedicated dashboards for moderating content, tracking donations, and viewing platform statistics.

## Tech Stack

**Backend**
- Java 21, Spring Boot 3.4 (Web, Data JPA, Security, Validation)
- MySQL 8
- JWT-based authentication (`jjwt`)
- Maven

**Frontend**
- React + TypeScript, built with Vite
- React Router
- Radix UI primitives + Tailwind (via `class-variance-authority`, `tailwind-merge`)
- Axios, React Hook Form, Recharts

**Infrastructure**
- Docker Compose (MySQL + backend + frontend containers)

## Project Structure

```
BookHub/
├── backend/         # Spring Boot REST API
├── frontend/        # React + Vite single-page app
├── data.sql         # Seed data for the database
├── mock.py          # Script used to generate mock/seed data
├── .env.example     # Template for required environment variables (copy to .env)
└── docker-compose.yml
```

## Prerequisites

- Java 21+ and Maven (or use the included `mvnw` wrapper — note: wrapper support files are currently missing from this repo, see below)
- Node.js 18+ and npm
- Docker and Docker Compose (for the containerized setup)

## Getting Started

### 1. Configure secrets

Copy `.env.example` to `.env` and fill in `DB_PASSWORD` and `JWT_SECRET` with your own values:

```bash
cp .env.example .env
```

These are read as environment variables by both `docker-compose.yml` and the backend (`application.properties`) — see [Configuration](#configuration) below.

### 2. Option A: Docker Compose (recommended)

```bash
docker-compose up --build
```

This starts MySQL, the backend API (port `8080`), and the frontend dev server (port `3000`), all using the values from `.env`.

### 2. Option B: Run services locally

**Backend**

```bash
cd backend
./mvnw spring-boot:run
```

> Note: the Maven wrapper's support files (`.mvn/wrapper/`) are not currently present in this repository. If `./mvnw` fails, install Maven locally and run `mvn spring-boot:run` instead, or regenerate the wrapper with `mvn -N wrapper:wrapper`.

Since `application.properties` reads `${DB_PASSWORD}` and `${JWT_SECRET}` from the environment, export the same values from `.env` into your shell before running locally (outside Docker Compose), e.g. `export $(cat .env | xargs)` on macOS/Linux.

**Frontend**

```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:3000`.

## Available Scripts (frontend)

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Production build |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview the production build locally |

## Configuration

Database credentials and the JWT signing secret are **not** hardcoded — both `docker-compose.yml` and `application.properties` read them from environment variables (`DB_PASSWORD`, `JWT_SECRET`), sourced from a local `.env` file (gitignored, never committed). See `.env.example` for the required keys. For any non-local deployment, set these through your platform's own secrets mechanism rather than a checked-in `.env` file.

## License

No license file is currently included in this repository. All rights reserved by the author unless a license is added.
