# Activity Tracker Backend

Spring Boot REST API for managing activity journal entries.

## How to Run

```bash
cd backend
./mvnw spring-boot:run
```

The server will start on `http://localhost:8080`

## API Endpoints

- **GET** `/api/activities` - List all activities
- **POST** `/api/activities` - Create a new activity
- **DELETE** `/api/activities/{id}` - Delete an activity by ID

## Testing

### View all activities
Open in browser: http://localhost:8080/api/activities

### Create an activity (curl)
```bash
curl -X POST http://localhost:8080/api/activities \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Morning Run",
    "description": "5km run in the park",
    "category": "Exercise",
    "date": "2024-01-15",
    "durationMinutes": 30
  }'
```

### Delete an activity (curl)
```bash
curl -X DELETE http://localhost:8080/api/activities/1
```

## H2 Database Console

Access the H2 console at: http://localhost:8080/h2-console

**Connection settings:**
- JDBC URL: `jdbc:h2:mem:activitydb`
- Username: `sa`
- Password: (leave empty)

## Validation Rules

- `name`: Required, cannot be empty
- `category`: Required, cannot be empty
- `date`: Required
- `durationMinutes`: Required, must be positive (> 0)
- `description`: Optional
