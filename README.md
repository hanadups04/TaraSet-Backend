# TaraSet Backend
This project utilizes Supabase as a plain PostgreSQL Database, while having my own backend that handles authentication and database interaction. 

### DISCLAIMER 
This is not to solve any particular issues with Supabase's JS SDK. It is primarily to learn the basics of backend development using ExpressJs.

### Tech Stacks
* NodeJs
* ExpressJs
* PostgreSQL

### Prerequisuites
* Node.Js v24.14.1
* ExpressJs v5.2.1
* Typescipt v5.9.3
* PostgreSQL v17.6.1.155

### Architecture Overview
1. Frontend (Separate Origin) - fetch via apiFetch() / plain fetch() / axios request
2. Express App (app.ts) - cors -> helmet -> cookieParser -> express.json -> rate limiters
3. Routes (routes/*.routes.ts) - maps URL + method + controller, with per route middleware
4. Middleware (requireAuth, verifyCsrfToken) - classify/gatekeep the request
5. Controllers (controllers/*.controller.ts) - read req. call service(s), shape the HTTP Response
6. Services (service/*.service.ts) - business logic, parameterized queries, transactions
7. Postgres (Supabase) - Obtain schema by running node-pg-migrate up

### Design Decisions
- **Layered Architecture**: for a simple project like TaraSet, having a linear and predictable path makes development and maintenance easier because all requests follow a set path from *.routes.ts -> /middleware ->
  *.controllers.ts -> *.service.ts. Wherein each directory has its own clear responsibility. It does or is planned to grow further, Feature-based Architecture may be adopted for a cleaner architecture.

### Components
- **API Layer**: Routes and Controllers: handles auth, CSRF validation, and HTTP concerns.
- **Service Layer**: Holds the business logic, kept independent of Express so that it's easy to test.
- **Postgres**: Primary data store for users, paper, generated analysis.
- **Postgres**: Primary data store for users, paper, generated analysis.
- **Express-Rate-Limiter**: Simple implementation of rate limiting. Can be substituted with Redis for a more robust rate limiter.

### Request Flow: /circles/createCircle
1. Request hits the requireAuth middleware first, to validate the user's JWT
2. Request hits the verifyCsrfToken next to check whether the request actually came from your own frontend
3. After all the validation finishes, the container validates the payload via Zod, and if successful, calls the 'createCircleService()'
4. The service then executes the parameterized query to write the data onto Postgres
5. If successful, reurns a status 200 immediately
  
### Installation and Setup
1. Clone repository via GitHub Desktop or via GitHub CLI
2. Extract the zip file
3. Open the project in preferred text editor
4. Create your .env file
5. Add the needed values: PORT(to select which port to run the project in), NODE_ENV(dev or prod, DATABASE_URL(progres db url provided by supabase), JWT_ACCESS_SECRET, JWT_REFRESH_SECRET 
6. Run npm install to install the dependencies
7. Run npm run dev
8. Test in postman first http://localhost:YOUR_PORT/api/health to see if project is running
9. Then run in your terminal npx ts-node src/scripts/test-db.ts to see if database is responding

### Database Setup   
1. Run npx node-pg-migration up to create the scheme in supabase

### Project Structure
* src/
*   config/
*   controllers/
*   middleware/
*   routes/
*   scripts/
*   services/
*   types/
*   app.ts
*   server.ts
  

 
