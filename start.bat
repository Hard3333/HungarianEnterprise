@echo off
REM Set environment variables for the application
set "NODE_ENV=development"
REM PostgreSQL connection string - update these values according to your local setup
set "DATABASE_URL=postgresql://postgres:postgres@localhost:5432/erp_db"
REM Session secret for authentication
set "SESSION_SECRET=your-local-development-secret-key"

echo Starting the application...
echo Environment: %NODE_ENV%
echo Database URL: %DATABASE_URL%

REM Start the application in development mode
call npm run dev