# CRITICAL RULES - MUST FOLLOW

## Stack
- Package manager: pnpm (not npm)
- Runtime: Node.js + Express 5, ESM (`"type": "module"`)
- Language: TypeScript with `verbatimModuleSyntax`
- Database: PostgreSQL via Drizzle ORM
- Lint/Format: Biome
- Build: tsdown → `dist/server.mjs`
- Dev: `pnpm run dev`

## Planning Mode
- Always ask for clarification if the prompt is not clear
- Use deep-dive sub-agents to assist with research
- Use deep-dive sub-agents to review the different aspects of your plan before presenting to the user

## Change / edit mode
- Never implement features yourself when possible - use sub-agents
- Identify changes from the plan that can be implemented in parallel, and use sub-agents to implement the features efficiently
- When using sub-agents to implement features, act as a coordinator only
- After completing features (large or small), always run commands like lint, type check and build to check code quality

## Rules
- Follow the existing project structure and patterns
- Search the codebase for existing implementations before creating new ones
- Prefer consistency over introducing new abstractions
- Suggest simpler solutions before complex ones
- Suggest modern industry-standard technologies before implementing
- Prefer incremental changes over large rewrites
- Explain tradeoffs before major architectural decisions

## TypeScript
- Use `import type` for type-only imports
- Avoid `any`
- Prefer strict and explicit typing
- Avoid unsafe type assertions
- Use `satisfies` when appropriate
- Avoid circular dependencies when appropriate

## Architecture
- Reuse existing utilities before creating new ones
- Avoid deeply nested logic and massive files

## API
- Use RESTful naming conventions
- Return consistent error responses
- Validate all request bodies
- Use proper HTTP status codes
- Never expose internal errors to clients

## Validation
- Validate all external input
- Use Zod for schema validation and follow the file naming convention: `name.validation.ts`
- Validate environment variables at startup

## Database
- Ask permission before schema changes or database migrations
- Never run destructive migrations automatically and drizzle push
- Whenever you make changes to the database schema, always run the drizzle generate and migrate commands
- Use transactions for critical operations
- Prefer Drizzle query builder over raw SQL
- Add indexes for frequently queried fields
- Prevent N+1 query problems and others query problems like this.

## Swagger
- Use swagger for API documentation
- Keep swagger documentation updated with route changes
- Keep swagger schemas consistent with TypeScript and validation schemas
- Avoid duplicated schema definitions

## Security
- Sanitize all user input
- Never trust client-side validation
- Never log secrets, tokens, or sensitive data
- Avoid leaking sensitive data in logs or responses
- Rate limit authentication endpoints
- Use environment variables for secrets

## Performance
- Avoid unnecessary database queries
- Use pagination for large datasets
- Prefer lazy loading for heavy modules when appropriate

## Dependencies
- Do not add new dependencies unless necessary
- Suggest and explain dependencies before installing them
- Prefer lightweight and actively maintained modern packages

<!-- ## Testing
- Never assume your changes simply work, always test
- If the project does not have any testing tools, scripts, MCP tools, skills, etc. available for testing, ask the user whether testing should be skipped -->

<!-- ## UI Design
- Always follow the UI design system when creating or reviewing components or pages.
- Design System: @DESIGN.md -->