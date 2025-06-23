# Alignment Research Feed Frontend

A web application for browsing and searching alignment research articles, built with Remix, React, and Cloudflare Pages.

## Development

### Getting Started

Install dependencies:

```sh
npm install
```

Populate your environment variables:

```sh
cp .dev.vars.example .dev.vars
```

Run the development server:

```sh
npm run dev
```

To run with Wrangler (production-like environment):

```sh
npm run build
npm run start
```

### Code Quality

This project uses ESLint and Prettier to maintain code quality and consistency.

#### Linting

Check for linting errors:

```sh
npm run lint
```

#### Formatting

Check if code is properly formatted:

```sh
npm run format:check
```

Automatically format all files:

```sh
npm run format
```

#### Pre-commit Workflow

Before committing your code, run:

```sh
npm run format    # Format all files
npm run lint      # Check for linting errors
```
