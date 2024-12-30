# Dearly

Behold the most chad Generate Project to ever Generate

## Project Required Dependencies

### [Nix](https://nixos.org), the all in one package manager

```bash
# MacOS
sh <(curl -L https://nixos.org/nix/install)

# Linux
sh <(curl -L https://nixos.org/nix/install) --daemon
```

#### Troubleshooting with Nix

> [!WARNING]
> Recent MacOS installations of Sequoia have breaking changes with Nix.
> Follow the instructions to [uninstall](https://nix.dev/manual/nix/2.18/installation/uninstall),
> scroll down to the section under macOS.

#### Enable experimental builds

```bash
# Append any nix command with for temporary enablement of nix features
nix --experimental-features 'nix-command flakes' develop
```

> [!TIP]
> Configure [Nix](https://wiki.nixos.org/wiki/Flakes) to allow experimental-features

#### Run Nix

```bash
# In the root directory
nix develop
```

### Mobile Development

- `macOS`, utilize [Xcode](https://developer.apple.com/xcode/) to natively run IOS emulators
- `Linux` utilize [Android Studio](https://developer.android.com) to natively run android emulators

> [!NOTE]
> The nix shell script attempts to pass up ios or android sdks into the nix shell, so install xcode or android locally to be able to
> run simulators in the shell.

---

## Development Documentation
For further development guidelines, refer to our documentation in `/docs`.
> [!NOTE]
> - You’re encouraged to update documentation whenever you find gaps, issues, or outdated information. 
> - Our design is structured around anticipated future needs, prioritizing testability, modularity, and consistency. Since predictions are not always precise, the design will change as we continue to iterate and implement new features.
> - If you find a better design approach, feel free to improve, rewrite or refactor it, but ensure the documentation stays aligned with the code.

---

## CLI with Task
Task is a command-line tool that automates and streamlines repetitive tasks, allowing you to run commands from any folder.

### Available Commands

To view all available task commands, run:

```bash
task -l
```

-----

### Install Dependencies

Before starting the development server, ensure all dependencies are installed by running the following command in a nix shell:

```bash
task install
```
Or we can install dependencies separately for frontend and backend
```bash
task backend:install
task frontend:install
```

-----

### Backend Development Server

To start the server:

1. **Start the database**:  
   Make sure to shut down any running PostgreSQL instances if you encounter error like "testuser does not exist."

   ```bash
   task db:up
   ```

2. **Start the backend**:

   ```bash
   task backend:dev
   ```

3. **Shut down the database when done**:

   ```bash
   task db:down
   ```

-----

### Running Backend Tests

To run the backend tests, simply use the following command:

```bash
task test
```

-----

### Database Setup and Migration

We use different databases for each environment to ensure data integrity. We will apply migration to production database when PR is merged.

- **Development and Testing**: Dockerized PostgreSQL database
- **Production**: PostgreSQL database hosted on Supabase

To apply schema changes, follow these steps:

1. **Update the Schema**  
   Modify the `/backend/entities/schema.ts` file.

2. **Start the Local Database**  
 
   ```bash
   task db:up
   ```

3. **Generate SQL**  

   ```bash
   task db:generate
   ```
4. **Apply Migration**  

   ```bash
   task db:migrate
   ```
-----

### API Documentation

To generate the OpenAPI specification for API documentation, do:
1. **Update the API documentation**
    Modify the `/openapi.yml` file.

2. **Generate New Schema**

    ```bash
    task generate
    ```
Start the backend development server at "/" route and see latest changes.

-----

### Code Formatting and Linting

We have a commit hook that automatically formats the code and fixes any linting issues. However, if you prefer to do it manually or want to see more details of lint errors that cannot be automatically fixed, you can use the commands below:

- **Format both backend and frontend**:

   ```bash
   task format
   ```

- **Backend linting**:

   ```bash
   task backend:lint
   ```

- **Frontend linting**:

   ```bash
   task frontend:lint
   ```

-----

### Frontend Development Server
```bash
task frontend:dev
```

-----

### Add new libraries or packages
We use Bun as our package manager, so if you need to install any new libraries during development:
```bash
bun add <library>
```
