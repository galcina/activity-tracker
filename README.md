# Activity Tracker

Full-stack activity journal application with Spring Boot backend and React frontend. This project allows users to create, view, and manage their activity journal entries. It was created as a junior full-stack test assignment.

## Project Structure

The project is organized into two main directories: the backend contains the Spring Boot REST API, and the frontend contains the React application.

```
activity-tracker/
├── backend/          # Spring Boot REST API
└── frontend/         # React frontend application
```

## Prerequisites

- **Backend**: Java 21, Maven (or use included `mvnw`)
- **Frontend**: Node.js (v16 or higher), npm

## Quick Start

### 1. Start the Backend

```bash
cd backend
./mvnw spring-boot:run
```

The backend will start on `http://localhost:8080`

### 2. Start the Frontend

In a new terminal:

```bash
cd frontend
npm install
npm start
```

The frontend will start on `http://localhost:3000`

## Application Features

- **List Activities**: View all activities with details
- **Add Activity**: Create new activities with validation
- **Delete Activity**: Remove activities from the journal
- **Data Persistence**: Uses H2 in-memory database (local) or PostgreSQL (Docker)

## API Endpoints

The REST API provides endpoints for managing activities. Base URL: `http://localhost:8080`

- `GET /api/activities` - List all activities
- `POST /api/activities` - Create a new activity
- `DELETE /api/activities/{id}` - Delete an activity by ID

## Database Options

The application supports two database configurations:

### H2 In-Memory Database (Default - Local Development)

When running locally with `./mvnw spring-boot:run`, the application uses H2 in-memory database by default. This is convenient for development:

- **No setup required** - works out of the box
- **Fast startup** - no external dependencies
- **Data resets on restart** - all data is lost when the backend stops
- **H2 Console available** at: http://localhost:8080/h2-console
  - JDBC URL: `jdbc:h2:mem:activitydb`
  - Username: `sa`
  - Password: (leave empty)

### PostgreSQL (Docker)

When running via Docker Compose, the application uses PostgreSQL for persistent data storage. Data is stored in a Docker volume and persists across container restarts.

See the [Docker](#docker) section for details.

## Validation Rules

- **Name**: Required, cannot be empty
- **Category**: Required, cannot be empty
- **Date**: Required
- **Duration**: Required, must be positive (> 0)
- **Description**: Optional

## Development

### Backend

See `backend/README.md` for detailed backend documentation.

### Frontend

See `frontend/README.md` for detailed frontend documentation.

## Technologies

**Backend:**
- Spring Boot 4.0.1
- Spring Data JPA
- H2 Database
- Java 21

**Frontend:**
- React 18
- Vite
- Fetch API

## Docker

### Run Full Stack (Backend + Frontend + PostgreSQL)

Run the entire application using Docker Compose:

```bash
docker compose up --build
```

This will build and start all services:

- **Backend**: http://localhost:8080
- **Frontend**: http://localhost:3000
- **PostgreSQL**: localhost:5432

The application uses PostgreSQL for persistent data storage when running via Docker Compose. Data is persisted in a Docker volume (`activitydb_data`) and will persist across container restarts. The database is automatically configured with:

- **Database**: `activitydb`
- **Username**: `activity`
- **Password**: `activity`
- **Port**: `5432`

To reset the database and start fresh:

```bash
docker compose down -v
```

The `-v` flag removes all volumes, including the database data.

The frontend is configured to communicate with the backend at `http://localhost:8080`. The API base URL can be customized via the `VITE_API_BASE_URL` build argument in `docker-compose.yml`.

To stop all services:

```bash
docker compose down
```

### Run PostgreSQL Only (Optional)

You can run only the PostgreSQL database in Docker while running the backend and frontend locally:

1. **Start PostgreSQL:**

```bash
docker compose up -d db
```

This starts only the PostgreSQL service in detached mode. The database will be available at `localhost:5432`.

2. **Run the backend with PostgreSQL profile:**

```bash
cd backend
SPRING_PROFILES_ACTIVE=docker SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/activitydb ./mvnw spring-boot:run
```

This connects the backend to the PostgreSQL database running in Docker.

3. **Run the frontend locally:**

```bash
cd frontend
npm install
npm start
```

The frontend will connect to the backend running on `http://localhost:8080`.

**To stop the PostgreSQL container:**

```bash
docker compose stop db
```

**Note**: When running locally with `./mvnw spring-boot:run` without any profile, the application uses the H2 in-memory database by default (data resets on restart).
