# ARCHITECTURE

## 1. High-Level Architecture Overview

For a visual representation of the architecture, see [Architecture Diagrams](https://excalidraw.com/#json=JnQrQrEm9c-MgRECVfWH8,qKH-QGbm337kJHC99dp9LQ).

--- 

## 2. Key Components & Tech Stack

### Backend

| **Aspect**               | **Description**                                                                                                                                                  |
|--------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Framework**            | **Hono** (lightweight alternative to Express) and **Bun** (high-performance alternative to Node.js) with excellent TypeScript support.                           |
| **Language**             | **TypeScript** for type safety and scalability.                                                                                                                   |
| **Database**             | **PostgreSQL** for transactional data handling and support for complex queries.                                                                                  |
| **Authorization**        | A **stateless and standardized approach** to authorization, ensuring compatibility with different client applications.                                             |
| **ORM**                  | **DrizzleORM** for database migrations and efficient query handling.                                                                                             |
| **Documentation**        | API documentation with **Scalar**.                                                                                                                               |
| **External Services**    | - **AWS S3**: Used for storing and managing voice memos and images.<br>- **Expo Push API**: For sending push notifications to mobile devices.                     |
| **Layered Architecture** | The backend follows a **Model-View-Controller (MVC)**-inspired design, separating into Controller (C), Service (M), and Transaction layers.                      |
| **Controller (C)**       | Manages incoming HTTP requests and outgoing responses, delegating client requests to appropriate services.                                                       |
| **Service (M)**          | Core business rules and logic that define how the application behaves.                                                                                          |
| **Transaction**          | Interacts directly with the database, leveraging the ORM for efficient query execution and migrations.                                                           |                                                    |

-----

### Frontend

| **Aspect**            | **Description**                                                                                                                                          |
|-----------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Framework**         | **React Native** with **Expo** for building cross-platform mobile applications.                                                                         |
| **Language**          | **TypeScript** for better maintainability and type safety.                                                                                              |
| **Authentication**    | **Supabase Auth Service** for handling user authentication.                                                                                             |
| **Main Libraries**    | - **Nativewind**: Tailwind CSS for styling in React Native.<br> - **Restyle**: A utility-first design system for theming and styling components.<br> - **Tanstack Query**: For data fetching, caching, and synchronization.<br> - **Zod**: Type-safe schema validation for form data and API calls.<br> - **React Hook Form**: For building and managing forms with built-in validation. |


--- 

## 3. Repository Structure

### Backend Directory Structure

```
backend/src/
├── config/          # Configuration files and environment variables
├── constants/       # Shared constants used in the app
├── database/        # Database connection and setup scripts
├── entities/        # Entity schema, controllers, services, and transactions
├── middlewares/     # Custom middlewares (e.g., logging, request compression)
├── migrations/      # Database migration files
├── routes/          # API routes and endpoints
├── tests/           # Unit and integration tests for the backend
├── types/           # TypeScript type definitions for the backend
└── utilities/       # Helper functions and utility modules
```
-----

### Frontend Directory Structure

```
frontend/
├── app/             # Main entry point for the frontend application
├── assets/          # Static assets (e.g., images, fonts, icons)
├── auth/            # Authentication-related logic and components
├── constants/       # Constants and configuration values shared across app
├── design-system/   # Shared UI components and styling utilities
├── hooks/           # Custom React hooks for reusable logic
└── types/           # TypeScript type definitions for the frontend
```

--- 

## 4. CI/CD Pipeline

### Deployment

- **PostgresDB**: Hosted on Supabase.

### Automated Workflow

- **Dependabot**: Automatically creates pull requests to update dependencies for security and compatibility.
- **Husky**: Hooks for enforcing pre-commit and pre-push hooks (linting and formatting checks).

### Pipelines

1. **CodeQL**: Static code analysis tool to ensure the code is free of vulnerabilities and quality issues.
2. **Linter**: Enforces consistent coding style using ESLint with a TypeScript configuration.
3. **Formatter**: Uses Prettier to ensure consistent code formatting across the project.
4. **Tests**: Automated testing to ensure code reliability and correctness (unit and integration tests).
