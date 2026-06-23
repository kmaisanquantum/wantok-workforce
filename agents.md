# AGENTS.md — Wantok-Workforce Mission Control

## 1. Project Context & Stack
* **Project Name:** Wantok-Workforce
* **Deployment Target:** Hosted and containerized via Coolify on cloud servers.
* **Environment Architecture:** Runs in isolated Docker containers with continuous deployment loops managed by Coolify.

## 2. Global Coding Standards & Patterns
* **Modularity:** Keep controllers, middleware, and route declarations strictly separated.
* **Error Handling:** Every async operation must be wrapped safely in try/catch blocks with explicit log tracking. 
* **State Management:** Keep API requests stateless. Session management must remain independent of local container filesystems to survive automated Coolify redeployments.

## 3. Strict Boundary Rules for Jules
* **Database Network Safety:** Always use environment variables for database configurations, network mappings, and validation URLs. Never hardcode sensitive production strings or local hosts.
* **Authentication Integrity:** Do not alter the core structure of `auth_controller.js` or the user registration pipeline without explicit confirmation. Protect all existing role-selection and onboarding rules.
* **Framework Depth:** Stick to strict JavaScript/Node.js ecosystem patterns unless looking at native configurations.

## 4. Operational Instructions for Jules
* **Sandbox Verification:** When spun up in your secure cloud VM sandbox, always install dependencies and run standard validation tests before generating code changes.
* **Plan Formulation:** Use Gemini's full reasoning layer to map out a clear plan covering edge cases, especially regarding data validation, before writing commits.
* **Pull Requests:** When a session concludes successfully, open a clean pull request specifying exactly which validation middleware or files were adjusted.
