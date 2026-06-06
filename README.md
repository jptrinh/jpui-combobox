# Combobox — WeWeb custom element

A searchable, accessible combobox (select with type-ahead filtering) for [WeWeb](https://www.weweb.io/). Bind any array of data, map label/value fields visually, and wire it into forms or workflows.

## Features

- **Type-ahead search** — filters options as the user types
- **Keyboard navigation** — Arrow keys, Enter, Escape, Tab all work as expected
- **ARIA-compliant** — `role="combobox"`, `aria-expanded`, `aria-activedescendant`, `aria-invalid`
- **Floating dropdown** — powered by Floating UI with auto-flip and scroll-shift
- **Clear button** — optional one-click reset
- **Form integration** — registers with WeWeb form elements for validation and submission
- **Workflow actions** — open, close, toggle, set value, reset, focus
- **Local context** — exposes `value`, `label`, `selectedOption`, `isOpen`, `searchQuery`, and `options` to the formula editor
- **States** — `focus`, `focus-visible`, `disabled`, `readonly`, `invalid` for style targeting

## Settings

| Property | Type | Description |
|---|---|---|
| Options | Array | The list of choices (`{ label, value, disabled }`) |
| Label field | Formula | Maps the display label from a bound data source |
| Value field | Formula | Maps the stored value from a bound data source |
| Disabled field | Formula | Maps the disabled flag from a bound data source |
| Init value | Text | Pre-selects an option on mount |
| Placeholder | Text | Input placeholder (multi-language) |
| Empty state text | Text | Message shown when no options match the search |
| Clearable | On/Off | Show a × button when a value is selected |
| Close on select | On/Off | Close the dropdown after picking an option |
| Disabled | On/Off | Disable the entire combobox |
| Read only | On/Off | Show the value without allowing changes |
| Invalid | On/Off | Apply the `invalid` state for validation styling |
| Required | On/Off | Mark the field as required for form submission |

## Style

The dropdown is fully customisable from the style panel, grouped into:

- **Input** — placeholder color, icon color, icon size
- **Dropdown** — position, offset, width, max height, background, border, radius, padding, shadow, z-index
- **Option** — text color, background, hover/selected variants, padding, border radius, checkmark color
- **Empty state** — text color, padding

## Trigger events

| Event | Payload | When |
|---|---|---|
| On change | `{ value }` | User selects or clears an option |
| On init value change | `{ value }` | The bound init value changes |
| On focus | — | Input receives focus |
| On blur | — | Input loses focus |
| On dropdown close | — | Dropdown closes |
| On search | `{ value }` | User types in the input |

## Workflow actions

| Action | Arguments | Description |
|---|---|---|
| Open | — | Open the dropdown |
| Close | — | Close the dropdown |
| Toggle | — | Toggle open/closed |
| Set value | `value` | Select an option by value |
| Reset value | — | Clear the current selection |
| Focus | — | Focus the input |

## Local context

Access component state in formulas via `context.local.data?.['combobox']`:

| Key | Type | Description |
|---|---|---|
| `value` | any | Currently selected value |
| `label` | string | Display label of the selected option |
| `selectedOption` | `{ value, label }` \| null | Full selected option object |
| `isOpen` | boolean | Whether the dropdown is open |
| `searchQuery` | string | Text the user is currently typing |
| `options` | array | All available options `[{ value, label, disabled }]` |

## Development

```bash
# Install dependencies
npm i

# Serve locally (add to WeWeb via the developer popup)
npm run serve --port=3100

# Check for build errors before release
npm run build --name=combobox
```
