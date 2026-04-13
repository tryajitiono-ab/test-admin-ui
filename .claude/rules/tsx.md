---
description: Rules for editing .tsx files in this project
paths:
  - '**/*.tsx'
---

# Tailwind Class Prefix

This project uses `@import 'tailwindcss' prefix(adminui)` in `src/index.css`. Every Tailwind utility class in `.tsx` files **must** be prefixed with `adminui:`.

## Rules

- All Tailwind classes in `className` attributes must use the `adminui:` prefix.
- This applies to every form of `className` usage:
  - String literals: `className="adminui:flex adminui:p-4"`
  - Template literals (static parts and string literals inside expressions): ``className={`adminui:flex ${condition ? 'adminui:p-4' : 'adminui:p-2'}`}``
  - Array/expression patterns: `className={['adminui:flex', condition && 'adminui:p-4'].filter(Boolean).join(' ')}`
- Important modifier (`!`) stays at the end of the class, after the utility name: `adminui:m-0!`
- Variant prefixes (hover, dark, etc.) come after `adminui:`: `adminui:hover:bg-blue-500`
- Arbitrary values keep their brackets: `adminui:bg-[#fff]`, `adminui:grid-cols-[repeat(auto-fill,minmax(300px,1fr))]`

## Examples

```tsx
// ✅ Correct
<div className="adminui:flex adminui:gap-4 adminui:p-8" />
<div className="adminui:text-white! adminui:m-0!" />
<div className={`adminui:border-2 adminui:rounded-md ${active ? 'adminui:bg-blue-500' : 'adminui:bg-white'}`} />
<div className={['adminui:px-2 adminui:py-1', isActive && 'adminui:font-bold'].filter(Boolean).join(' ')} />

// ❌ Wrong — missing prefix
<div className="flex gap-4 p-8" />
<div className={`border-2 rounded-md ${active ? 'bg-blue-500' : 'bg-white'}`} />
```
