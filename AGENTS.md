# AGENTS.md

## Coding conventions

These rules are enforced by code review, not lint, but follow them strictly.

- **File names: lowercase, kebab-case, module-prefixed.** All files prefix with their module name so the directory structure stays scannable. Examples: `editor-layers-panel.tsx`, `editor-properties-panel.tsx`, `editor-store.ts`, `editor-template-aurora.ts`. Hooks keep the React-recognized `use-` prefix and embed the module: `use-editor-image-element.ts`. App Router directories (`app/editor/`, `app/editor/[designId]/`) follow Next.js conventions, not this rule.
- **Function declarations are named, not arrow constants.** Top-level helpers and React components must be `function Foo() {...}`, never `const Foo = () => {...}`. The same applies to component-scope helpers (e.g. a local `function refresh()` inside a component body). Inline callbacks — those passed to `useEffect`, `useMemo`, `useCallback`, JSX event handlers (`onClick`, `onChange`, etc.), array methods (`.map`, `.filter`, `.sort`), zustand selectors (`useEditorStore((state) => state.foo)`), and similar — stay as arrow functions. The rule targets _declarations_, not _callbacks_.
- **No single-letter variable names.** Use meaningful names: `state` not `s`, `event` not `e`, `layer` not `l`, `index` not `i`, `match` not `c`, `value` not `v`. Two-letter names are fine when they're domain conventions (`id`, `bg`, `el`, `ts`, `cx`, `cy`, `dx`, `dy`). Coordinate `x`/`y` is acceptable inside graphics drawing loops where canvas-coord meaning is unambiguous, OR when destructuring from an object whose property names are literally `x`/`y`.
- **Module boundaries and separation of concerns.** Each top-level directory under `lib/` and `components/` represents a module. Files within a module share the module prefix and only reach across modules via the `@/...` alias — never via `../../`. Keep concerns split: `lib/editor/editor-store.ts` owns state, `lib/editor/editor-storage.ts` owns persistence, `components/editor/editor-canvas.tsx` owns interactive rendering, `components/editor/canvas/*` owns read-only preview rendering. Don't blur these.
- **Comments: default to none.** Only write a comment when something is non-trivial or genuinely hard to understand — a hidden constraint, a non-obvious tradeoff, a surprising decision, or behavior that would mislead a careful reader. Do _not_ paraphrase the code, restate types, label sections ("auto-save block", "DB load"), or narrate what an effect / middleware / hook does. Well-named identifiers carry that. One short line max, never multi-paragraph blocks. When in doubt, leave it out.
- **Always use braces, never single-line `if`.** Every `if`, `else`, `for`, `while`, etc. body must be wrapped in `{ ... }` on its own lines — even for a single-statement guard. Write `if (sessionPending) {\n  return;\n}`, not `if (sessionPending) return;`. Applies to `return`, `break`, `continue`, `throw`, and any other body.

## Tailwind CSS — always group utilities by purpose

When writing Tailwind classes (inside `className`, `cn(...)`, `cva(...)`, etc.), split the string into multiple string arguments, one per purpose group, in this canonical order:

1. **Layout** — display (`flex`, `grid`, `block`, `inline-*`, `hidden`), alignment (`items-*`, `justify-*`), `gap-*`, sizing (`w-*`, `h-*`, `size-*`, `max-w-*`), positioning (`absolute`, `relative`, `sticky`, `top-*`, `z-*`), `overflow-*`
2. **Spacing** — padding and margin: `p-*`, `px-*`, `py-*`, `m-*`, `mx-auto`, `ml-auto`, `mt-*`, etc.
3. **Shape** — `rounded-*`, `border`, `border-*` (width only), `shadow-*`, `backdrop-blur`, `opacity-*`
4. **Typography** — `text-*` (size), `font-*`, `leading-*`, `tracking-*`, `uppercase`, `italic`
5. **Colors** — `bg-*`, `text-*` (color), `border-*` (color), `fill-*`, `stroke-*`
6. **Interaction** — `cursor-*`, `select-*`, `pointer-events-*`, `outline-none`
7. **Transitions** — `transition-*`, `duration-*`, `ease-*`, `animate-*`, `origin-*`
8. **Hover/focus states** — `hover:*`, `focus-visible:*`, `active:*`, `group-hover:*`, `group-focus-visible:*`
9. **Data/aria states** — `data-*:*`, `aria-*:*`, `data-starting-style:*`, `data-ending-style:*`

Rules:

- One string argument per group. Keep related utilities together in that string.
- **Do not add `// Layout` / `// Shape` etc. comments.** The grouping itself is the structure.
- Omit a group entirely if it has no classes.
- Responsive modifiers (`sm:*`, `md:*`) stay in their natural group — `hidden sm:flex` both live under Layout.
- Conditional strings (`active ? 'bg-muted' : '...'`) still belong to the correct group.
- Apply this to every new component and to any file you edit.

Example:

```tsx
className={cn(
  'inline-flex items-center gap-1',
  'px-3 py-2',
  'rounded-sm',
  'text-sm font-medium',
  'bg-transparent text-foreground',
  'cursor-pointer select-none outline-none',
  'transition-colors',
  'hover:bg-muted focus-visible:bg-muted focus-visible:ring-2 focus-visible:ring-ring',
  'data-open:bg-muted',
)}
```
