# Activity Tracker Frontend

React frontend for the Activity Tracker application.

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn

## Installation

```bash
cd frontend
npm install
```

## Running the Application

```bash
npm start
```

The application will start on `http://localhost:3000`

## Development

- `npm start` - Start the development server
- `npm run dev` - Alias for `npm start` (Vite dev server)
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Features

- **List Activities**: View all activities with name, date, category, duration, and description
- **Add Activity**: Create new activities with form validation
- **Delete Activity**: Remove activities with confirmation
- **Real-time Updates**: Activities list refreshes after add/delete operations

## API Integration

The frontend communicates with the Spring Boot backend running on `http://localhost:8080`:

- `GET /api/activities` - Fetch all activities
- `POST /api/activities` - Create a new activity
- `DELETE /api/activities/{id}` - Delete an activity

## Validation

- **Name**: Required, cannot be empty
- **Category**: Required, cannot be empty
- **Date**: Required
- **Duration**: Required, must be a positive number
- **Description**: Optional

## Technologies

- React 18
- Vite (build tool)
- Fetch API for HTTP requests
