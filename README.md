# Activity Tracker

Full-stack activity journal application with Spring Boot backend and React frontend.

## Project Structure

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
- **Data Persistence**: All data is stored in H2 in-memory database

## API Endpoints

- `GET /api/activities` - List all activities
- `POST /api/activities` - Create a new activity
- `DELETE /api/activities/{id}` - Delete an activity by ID

## Database

The application uses H2 in-memory database. Access the H2 console at:
- URL: http://localhost:8080/h2-console
- JDBC URL: `jdbc:h2:mem:activitydb`
- Username: `sa`
- Password: (leave empty)

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
