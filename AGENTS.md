# Frontend Agent Guide

## Scope

- Make the smallest coherent change that fully addresses the user's request, preserves existing
  behavior unless the task changes it, and preserves unrelated work.
- Do not refactor unrelated legacy code solely to make it conform to these rules.

## Project Overview

This is a Next.js App Router frontend using strict TypeScript, an FSD-inspired
architecture, Zustand, React Hook Form, Zod, and an OpenAPI-generated client (if exists).

Before implementing a change, inspect similar code in the same architectural layer and follow its
structure, naming, and public API conventions.

## Setup and Development

Use the package manager selected by the project's lockfile. Install dependencies with its
reproducible frozen-lockfile command and start development with the `dev` script.

Development and build commands may regenerate the API client and may require configured frontend
environment variables and an available backend. If a command cannot run because the required
environment is unavailable, report that explicitly.

## Architecture

The application layers are ordered from lowest to highest:

```text
shared -> entities -> features -> widgets -> views -> layouts -> app
```

- A lower layer must not import from a higher layer.
- Follow all dependency restrictions defined in `eslint.boundaries.mjs`.
- Cross-module imports in `features`, `widgets`, `views`, and `layouts` are not allowed.
- Cross-module imports in `entities` are allowed.
- Cross-module imports within `shared` are allowed.
- The FSD `pages` layer is named `views` in this project.
- This project does not use a page-first architecture.

Layer responsibilities:

- `shared`: reusable, business-agnostic code suitable for another project.
- `entities`: business objects and related logic; entity-to-entity imports are allowed.
- `features`: cohesive user interactions and scenarios; related actions may share a feature when
  consistent with existing structure.
- `widgets`: reusable page sections, optionally with their own `model` or `lib`.
- `views`: page composition, optionally with their own `model` or `lib`.
- `layouts`: shared page layouts.
- `app`: routing and framework integration.

Keep business rules, API scenarios, complex data transformations, and reusable stateful logic out
of `ui` files. Place them in the appropriate `model`, `lib`, or `api` segment of the existing slice.
Simple event handlers, display transformations, class calculations, and conditional rendering may
remain in UI components.

## Module Boundaries

- Import through an existing segment or nested-component public API, as configured in
  `eslint.boundaries.mjs`; never import another module's implementation file.
- Existing entry-point segments include `ui`, `lib`, `model`, `actions`, `api`, and `constants`.
- Do not create slice-root barrels such as `entities/User/index.ts`; segment entry points such as
  `entities/User/model/index.ts` and nested component entry points are allowed.
- Each component-local `components` directory should expose its intended public children through a
  local `index.ts`.
- Allow only one component-local level: `Component/components/Child`. Do not create a nested
  `components` directory inside `Child`.
- Do not expose private implementation details from barrel files.

```ts
// Good: public entry point
import {ProductPreviewCard} from '@/entities/Product/ui/ProductPreviewCard';

// Bad: implementation file
import {ProductPreviewCard} from '@/entities/Product/ui/ProductPreviewCard/ProductPreviewCard';
```

## React and Next.js

- Prefer Server Components. Add `'use client'` only for browser APIs, client state, effects, or
  event handlers, and keep the client boundary small.
- Keep server-only code, secrets, and privileged operations out of Client Components and the client
  bundle.
- Reuse existing components, hooks, stores, services, and utilities.
- Do not add a state-management, form, styling, or UI library without explicit approval.
- Decompose UI components that accumulate unrelated responsibilities or become excessively large;
  move logic to `model` or `lib` according to responsibility.

Name the operation performed by an effect:

```ts
useEffect(() => {
    const loadUserProfile = async () => {
        // ...
    };

    void loadUserProfile();
}, []);
```

If this structure is impractical, add a concise JSDoc `WHY`. Do not extract trivial cleanup when
that makes the effect harder to read.

Keep route and layout files focused on:

- data fetching and API initialization;
- mapping or serialization needed to prepare view data;
- guards, `notFound`, and redirects;
- provider and framework setup;
- composition of layouts and views;
- request or navigation lifecycle behavior already established by nearby routes.

Move a growing multi-step workflow into the appropriate existing `model`, `lib`, `api`, or feature
instead of allowing an `app` file to become a large business-logic module.

## TypeScript

- Preserve strict typing.
- Prefer `interface` for object contracts; use `type` for unions, intersections, mapped or
  conditional types, utility-derived types, generated DTO aliases, and similar cases.
- Prefer arrow declarations. Use function declarations for framework conventions, overloads,
  generators, `this`, hoisting, or another concrete technical reason.
- Prefer named exports and imports for project modules. Default imports remain valid when required
  or idiomatic for a framework, third-party library, or CSS Module.
- Do not introduce `any` unless no safer representation is practical and the reason is documented.
- Prefer `unknown` with explicit narrowing for values of an unknown shape.
- Do not introduce `as unknown as` unless no safer representation is practical and the reason is
  documented.
- Avoid unsafe assertions and error suppressions unless the constraint and reason are documented
  nearby.

Use fail-fast behavior for violated required invariants:

```ts
if (!user) {
    throw new Error('processUser: user is required');
}
```

Use a guard clause or an explicit result for expected states such as optional UI, an unavailable
ref, conditional rendering, cancellation, or data that has not loaded yet. Do not throw merely
because an expected state is absent.

For new handwritten enum-like values, prefer an `as const` object and a derived type:

```ts
export const OrderStatus = {Pending: 'PENDING', Shipped: 'SHIPPED'} as const;
export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];
```

When an area already uses handwritten `enum`, preserve its local consistency unless the task
explicitly includes a migration. Generated enums are exempt from this rule and must not be manually
rewritten.

## Documentation and Comments

- Document non-obvious or non-standard decisions with JSDoc:

```ts
/**
 * WHY: Explain the constraint or trade-off that makes this implementation necessary.
 */
```

- Use JSDoc tags such as `@todo` and `@description` instead of informal labels.
- Comments should explain reasons and constraints rather than narrate what the code already says.

## Change Guidelines

- Do not change lockfiles, environment files, or dependencies unless required.
- Never commit secrets or values copied from `.env`.
- Do not leave debug `console.log` calls; use the project's development-only logging utility when
  appropriate.
- Handle relevant loading, empty, error, and disabled states in user-facing flows.
- Maintain accessibility: use semantic elements, keyboard-accessible controls, associated labels,
  and meaningful alternative text.

## Validation

Use the actual scripts defined in package.json.

After changing TypeScript or React code, run the project's lint and typecheck commands when available.

Run the build script for changes affecting routing, Server/Client Component boundaries, configuration, generated API
types, or production behavior.

If a check fails, investigate and fix issues introduced by the change. Do not modify unrelated code just to make a check
pass.

Do not claim a check passed unless it was actually run.

Report skipped or failed checks and explain why.

## UI Components

Use Mantine as the primary UI component library.

Prefer existing Mantine components over custom implementations when they meet the requirements.

Follow the API supported by the version of Mantine installed in package.json and the lockfile.

Do not introduce another UI component library without explicit approval.

Use CSS Modules for custom component-specific styling when needed. Avoid duplicating styles already provided by Mantine.

## Documentation and Dependencies (Mantine)

Consult the official Mantine documentation when component APIs, props, styling, or framework integration are unclear.

Prefer documentation matching the installed Mantine version.

Do not upgrade, downgrade, or replace dependencies to fix an isolated implementation issue without explaining the reason
and asking for approval.

Do not install additional dependencies without approval unless the task explicitly requires them.

## Code Review Rules

During review, enforce the rules above and prioritize functional, architectural, security, and
maintainability risks over formatting already handled by automated tools. For each finding, identify
the affected code, explain the concrete impact, and suggest the smallest safe correction.
