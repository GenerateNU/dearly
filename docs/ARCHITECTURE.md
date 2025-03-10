# ARCHITECTURE

## 1. High-Level Architecture Overview

For a visual representation of the architecture, see [Architecture Diagrams](https://excalidraw.com/#json=MsMc--KKNrDPQOIynAkza,iGESHr9rTon6OhNCAwlzXg).

--- 

## 2. Key Components & Technology Stack

### Backend

| **Aspect**               | **Description**                                                                                                                                                  |
|--------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Framework**            | **[Hono](https://hono.dev/)** (lightweight alternative to Express) and **[Bun](https://bun.sh/)** (high-performance alternative to Node.js) with excellent TypeScript support.                           |
| **Language**             | **TypeScript** for type safety and scalability.                                                                                                                   |
| **Database**             | - **[PostgreSQL](https://www.postgresql.org/docs/current/)** for transactional data handling and support for complex queries.<br>- **[Docker](https://www.docker.com/)**: Containerized database for testing and development.                                                                                 |
| **Authorization**        | **JSON Web Tokens (JWT)**, a stateless and standardized approach to authorization, ensuring compatibility with different client applications.                                             |
| **ORM**                  | **[DrizzleORM](https://orm.drizzle.team/docs/overview)** for database migrations and efficient query handling.                                                                                             |
| **Documentation**        | API documentation with **[Scalar](https://scalar.com/)**.                                                                                                                               |
| **External Services**    | - **[AWS S3](https://docs.aws.amazon.com/AmazonS3/latest/API/Welcome.html)**: Used for storing and managing voice memos and images.<br>- **[AWS EventBridge](https://aws.amazon.com/eventbridge/)**: Create scheduled rules to trigger automatic push notifications.<br>- **[AWS Lambda](https://aws.amazon.com/lambda/)**: Run code in response to events triggered by AWS EventBridge for nudge feature.<br>- **[Expo Push Service](https://docs.expo.dev/push-notifications/sending-notifications/)**: Sending push notification to users.<br>- **[Supabase Realtime](https://supabase.com/docs/guides/realtime?queryGroups=language&language=js)**: Listening for events from database for notification.                   |
| **Layered Architecture** | The backend follows a **Model-View-Controller (MVC)**-inspired design, separating into Controller (C), Service (M), and Transaction layers.                      |
| **Controller (C)**       | Manages incoming HTTP requests and outgoing responses, delegating client requests to appropriate services.                                                       |
| **Service (M)**          | Core business rules and logic that define how the application behaves.                                                                                          |
| **Transaction**          | Interacts directly with the database, leveraging the ORM for efficient query execution and migrations.                                                           |                                                    |

-----

### Frontend

| **Aspect**            | **Description**                                                                                                                                          |
|-----------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Framework**         |**[React Native](https://reactnative.dev/docs/environment-setup)** with **[Expo](https://docs.expo.dev/guides/overview/)** for building cross-platform mobile applications.                                                                         |
| **Language**          | **TypeScript** for better maintainability and type safety.                                                                                              |
| **Authentication**    | **[Supabase Auth Service](https://supabase.com/docs/guides/auth)** for handling user authentication.                                                                                             |
| **Main Libraries**    | - **[Nativewind](https://www.nativewind.dev/)**: Tailwind CSS for styling in React Native.<br> - **[Restyle](https://shopify.github.io/restyle/fundamentals/)**: A utility-first design system for theming and styling components.<br> - **[Tanstack Query](https://tanstack.com/query/latest/docs/framework/react/quick-start)**: For data fetching, caching, and synchronization.<br> - **[Zod](https://zod.dev/)**: Type-safe schema validation for form data and API calls.<br> - **[React Hooks Form](https://react-hook-form.com/)**: For building and managing forms with built-in validation. |


--- 

## 3. Repository Structure

### Backend Directory Structure

```
backend/src/
├── config/          # Configuration files and environment variables
├── constants/       # Shared constants used in the app
├── database/        # Database connection and setup scripts
├── entities/        # Entity schema, controllers, services, and transactions
├── middlewares/     # Custom middlewares (e.g., logging, authorization, compression)
├── migrations/      # Database migration files
├── routes/          # API routes and endpoints
├── services/        # External service integration
├── tests/           # Unit and integration tests for the backend
├── types/           # Type definitions for the backend
├── utilities/       # Helper functions
└── server.ts        # Main entry into our app (server)
```
-----

### Frontend Directory Structure

```
frontend/
├── api/             # API calls to backend endpoints
├── app/             # Main entry point for the frontend application
├── assets/          # Static assets (e.g., images, fonts, svgs, icons)
├── auth/            # Authentication-related logic and components
├── constants/       # Constants and configuration values shared across app
├── contexts/        # Contexts used across the app
├── design-system/   # Shared UI components and themes
├── hooks/           # Custom React hooks for reusable logic
├── types/           # TypeScript type definitions for the frontend
└── utilities/       # Helper functions
```

--- 

## 4. CI/CD Pipeline

### Deployment

- **PostgresDB**: Hosted on Supabase.
- **Backend**: Hosted on Google Cloud Run at [dearly-35496165508.us-east1.run.app](https://dearly-35496165508.us-east1.run.app) with Docker Image.
- **Frontend**: TestFlight with EAS Build.

### Automated Workflow

- **Dependabot**: Automatically creates pull requests to update dependencies for security and compatibility.
- **Husky**: Hooks for enforcing pre-commit and pre-push hooks (linting and formatting checks).
- **Slack API**: Comment "/preview-build" in frontend PR when ready for review, this will send a message to Slack when the build is ready for designers to download and test.

### Pipelines
Any pull request to the `main` branch will need to pass code reviews, have all green CI checkmarks, be fully updated with the latest changes from `main` before merging.

1. **CodeQL**: Static code analysis tool to ensure the code is free of vulnerabilities and quality issues.
2. **Linter**: Enforces consistent coding style using ESLint with a TypeScript configuration.
3. **Formatter**: Uses Prettier to ensure consistent code formatting across the project.
4. **Tests**: Automated testing to ensure code reliability and correctness (unit and integration tests).
5. **Backend Deployment**: Pulls latest docker image, builds, and deploys.
6. **Frontend Deployment**: Creates build of latest version of frontend and submit to App Store Connect for TestFlight.

