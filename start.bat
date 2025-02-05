@echo off
REM Set environment variables for the application
set "NODE_ENV=production"
REM Replace the values below with your actual PostgreSQL credentials:
REM username: Your PostgreSQL username (default is usually "postgres")
REM password: Your PostgreSQL password
REM database_name: The name of the database you created
set "DATABASE_URL=postgresql://your_username:your_password@localhost:5432/your_database_name"
REM Build the application first
call npm run build
REM Start the application in production mode
call npm start