# Combobox — WeWeb custom element

A searchable, accessible combobox (select with type-ahead filtering) for [WeWeb](https://www.weweb.io/). Bind any array of data, map label/value fields visually, and wire it into forms or workflows.

## Features

- **Type-ahead search** — filters options as the user types
- **Single or multiple** — multiple selection renders removable chips inside the field
- **Keyboard navigation** — Arrow keys, Enter, Escape, Tab all work as expected; Backspace removes the last chip
- **ARIA-compliant** — `role="combobox"`, `aria-expanded`, `aria-controls`, `aria-activedescendant`, `aria-invalid`, named buttons, and a keyboard-only focus ring
- **Floating dropdown** — powered by Floating UI with auto-flip and scroll-shift
- **Clear button** — optional one-click reset
- **Create option** — lets users create new values when no match is found
- **Custom option content** — swap the built-in option row for your own dropzone layout, repeated per option
- **Form integration** — registers with WeWeb form elements for validation and submission
- **Workflow actions** — open, close, toggle, set value, reset, focus
- **Local context** — exposes `value`, `label`, `selectedOption`, `selectedOptions`, `multiple`, `isOpen`, `searchQuery`, and `options` to the formula editor
- **States** — `focus`, `focus-visible`, `disabled`, `readonly`, `invalid` for style targeting

## Settings

| Property | Type | Description |
|---|---|---|
| Options | Array | The list of choices (`{ label, value, disabled }`) |
| Label field | Formula | Maps the display label from a bound data source |
| Value field | Formula | Maps the stored value from a bound data source |
| Disabled field | Formula | Maps the disabled flag from a bound data source |
| Init value | Text | Pre-selects an option on mount. Option **values**, not labels — an array in multiple mode |
| Multiple | On/Off | Allow several selections, shown as removable chips. `value` becomes an array |
| Placeholder | Text | Input placeholder (multi-language) |
| Empty state text | Text | Message shown when no options match the search |
| Allow create | On/Off | Show a "Create" option when no option exactly matches the typed query |
| Create option label | Text | Label template for the create option — use `{query}` as a placeholder |
| Clearable | On/Off | Show a × button when a value is selected |
| Close on select | On/Off | Close the dropdown after picking an option |
| Disabled | On/Off | Disable the entire combobox |
| Read only | On/Off | Show the value without allowing changes |
| Invalid | On/Off | Sets `aria-invalid` and applies the `invalid` state for validation styling |
| Required | On/Off | Mark the field as required for form submission |
| Accessible label | Text | Screen-reader name. Falls back to the form field name, then the element name |
| Clear button label | Text | Screen-reader name for the × button |
| Toggle button label | Text | Screen-reader name for the chevron button |
| Remove chip label | Text | Prefix for chip remove buttons — "Remove" announces as "Remove Banana" |

## Custom option content

Turn on **Style → Option → Custom content** to design the option row yourself instead of using the built-in label + checked icon.

An **Option** dropzone then appears in the navigator. What you drop there is authored **once** and repeated for every option — it's a template, not a per-option layout. Bind text, images and styles to the repeat context:

| Binding | Value |
|---|---|
| `context.item.data.label` | The option's mapped label |
| `context.item.data.value` | The option's mapped value |
| `context.item.index` | Its position in the filtered list |

The row wrapper keeps `role="option"`, click-to-select, hover highlighting, keyboard navigation and the `is-selected` / `is-active` / `is-disabled` classes — so the **Option** style properties (background, hover/selected background, padding, border radius) all still apply. Only the row's *contents* become yours.

### Things to know

- **Label field is still required.** Search filtering, the input's displayed text and multi-select chips all read the mapped label, whether or not you render it.
- **No built-in selection mark.** The checked icon is part of the built-in row. Selected options still get the selected background from the style panel; add your own indicator inside the dropzone if you want a mark. `isSelected` is not yet exposed in the repeat context.
- **Keep dropped elements non-focusable.** The combobox holds focus on the search input and points at the active option with `aria-activedescendant`. A `ww-button` or input inside an option steals that focus and breaks keyboard navigation — prefer `ww-text`, `ww-image`, `ww-div`.
- **Options are announced by their mapped label** via `aria-label` on the row, so an icon-only row is still named.
- **Authoring tip**: turn on **Force open** (Settings → Behavior) to keep the dropdown open on the canvas while you build the row. While custom content is on, the dropdown renders in place rather than teleporting, so drag & drop and selection work; at runtime it always teleports.

Turning the toggle back off keeps the dropped elements — they stay stored on the element and reappear when you re-enable it.

## Style

The dropdown is fully customisable from the style panel, grouped into:

- **Input** — font size, font weight, placeholder color, focus ring color, icon color, icon size, chevron icons (closed/open), icon button background and border radius (default and hover)
- **Dropdown** — position, offset, width, max height, background, border, radius, padding, shadow, z-index
- **Option** — custom content toggle (see above), font size, font weight, text color, background, hover/selected variants, padding, border radius, checked icon (icon, color, size)
- **Empty state** — font size, text color, padding
- **Chips** *(multiple mode)* — background, text color, font size/weight, height, radius, padding, gap, label-to-icon gap, remove icon color/hover/size
- **Create option** — font size, font weight, text color, background, hover background, create icon and its color/size

### Focus styling

The **`focus-visible`** state activates only when focus arrived by keyboard (the
browser's own `:focus-visible` heuristic decides), while **`focus`** activates however
focus arrived. Select `focus-visible` in the state picker and set **outline** from the
native style panel to get a keyboard-only focus ring — no coded property involved.

**Focus ring color** is only a default, and it is the *only* way to reach the chevron
and clear buttons: WeWeb states apply to the component root, so they can't style those
inner nodes. Anything you set on the `focus-visible` state overrides the default ring
on the field itself.

## Trigger events

| Event | Payload | When |
|---|---|---|
| On change | `{ value }` | User selects or clears an option |
| On init value change | `{ value }` | The bound init value changes |
| On focus | — | Input receives focus |
| On blur | — | Input loses focus |
| On dropdown open | — | Dropdown opens |
| On dropdown close | — | Dropdown closes |
| On search | `{ value }` | User types in the input |
| On create | `{ value }` | User confirms a new value via the create option |
| On chip remove | `{ value }` | A chip is removed (fires alongside On change). Multiple mode only |

> **On create does not add the option.** It only reports the typed value — append it
> to whatever backs **Options** in a workflow, then set the value.

## Workflow actions

| Action | Arguments | Description |
|---|---|---|
| Open | — | Open the dropdown |
| Close | — | Close the dropdown |
| Toggle | — | Toggle open/closed |
| Set value | `value` | Select an option by value (an array in multiple mode) |
| Reset value | — | Clear the current selection. Does *not* focus the field or open the dropdown |
| Focus | — | Focus the input |

## Local context

Access component state in formulas via `context.local.data?.['combobox']`:

| Key | Type | Description |
|---|---|---|
| `value` | any | Currently selected value (array in multiple mode) |
| `label` | string | Display label of the selected option (comma-joined in multiple mode) |
| `selectedOption` | `{ value, label }` \| null | Full selected option object. Always `null` in multiple mode |
| `selectedOptions` | `[{ value, label }]` | Selected options. Always empty when multiple is off |
| `multiple` | boolean | Whether multiple selection is enabled |
| `isOpen` | boolean | Whether the dropdown is open |
| `searchQuery` | string | Text the user is currently typing |
| `options` | array | All available options `[{ value, label, disabled }]` |

## Development

```bash
# Install dependencies
npm i

# Serve locally (add to WeWeb via the developer popup)
npm run serve -- port=3100

# Check for build errors before release
npm run build -- name=combobox type=wwobject
```

> The CLI parses bare `name=` / `port=` args, not `--name=` / `--port=`. Passing
> `--name=combobox` fails with `arg 'name="name"' not specified`.
