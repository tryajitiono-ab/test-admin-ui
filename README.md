# Extend App UI Templates

Templates and examples for building Extend App UIs that embed in the AGS Admin Portal.

## Repository structure

```
├── templates/   # Starter templates — clone these via extend-helper-cli or tiged
└── examples/    # Focused code examples — cross-referenced in the Doc Portal
```

### Templates

Clone a template to start a new App UI project:

| Template                                                             | Description                                                                              |
| -------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| [`react-minimal`](templates/react-minimal)                           | Blank-slate React template — start here for a new App UI                                 |
| [`react`](templates/react)                                           | Full-featured React template with tournament management UI and generated AGS API clients |
| [`react-multiple-extend-apps`](templates/react-multiple-extend-apps) | React template demonstrating how to manage multiple Extend apps from a single App UI     |

**Clone a template:**

```bash
# Minimal (blank slate)
extend-helper-cli clone-template --scenario "Extend App UI" --template react-minimal -d react-minimal

# Full example with generated AGS API clients
extend-helper-cli clone-template --scenario "Extend App UI" --template react -d react

# Multiple Extend apps example
extend-helper-cli clone-template --scenario "Extend App UI" --template react-multiple-extend-apps -d react-multiple-extend-apps
```

### Examples

Focused, self-contained code examples that illustrate specific patterns. These are referenced from the Doc Portal.

| Example                                                               | Description                                          |
| --------------------------------------------------------------------- | ---------------------------------------------------- |
| [`react-api-reference-example`](examples/react-api-reference-example) | Demonstrates `useAppUIContext` and permission checks |

## Prerequisites

- [Node.js](https://nodejs.org/)
- [`extend-helper-cli`](https://github.com/AccelByte/extend-helper-cli) — for registering App UIs and managing AGS credentials
