# Environment Variables

This project keeps runtime configuration simple. For most deployments you only need **two** variables (plus one convenience flag for local `.env.*` selection).

### Required variables

- `API_BASE_URL` – Base URL to the TMD REST-v3 endpoint. Example:
  `https://www.tangomarathons.com/wp-json/tmd/v3`

- `WORDPRESS_URL` – Root WordPress domain used for login / registration redirects and for
  GraphQL calls. Example: `https://www.tangomarathons.com`

### Optional helpers

- `APP_ENV` – Selects which `.env.<app_env>` file Quasar loads at build-time. Useful in
  local dev or CI. Example: `prod-api`

## Derived values

- **GraphQL endpoint** – calculated at runtime as
  `${WORDPRESS_URL}/graphql` if the optional `GRAPHQL_ENDPOINT` variable is not
  set.

- **Local development** – when the browser runs on `localhost` or
  `127.0.0.1` and no `API_BASE_URL` is provided, the code automatically falls
  back to `http://localhost:10014/wp-json/tmd/v3`.

## Quick-start for new contributors

```bash
# Clone the repo and install packages
pnpm install

# Create a local .env (or copy the template below)
cp docs/env.local .env

# Start the dev server
pnpm dev
```
