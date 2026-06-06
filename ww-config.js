export default {
    editor: {
        label: 'Combobox',
        icon: 'select',
        customStylePropertiesOrder: [
            {
                label: 'Input',
                isCollapsible: true,
                properties: ['inputFontSize', 'inputFontWeight', 'placeholderColor', 'iconColor', 'iconSize'],
            },
            {
                label: 'Dropdown',
                isCollapsible: true,
                properties: [
                    'side',
                    'offsetY',
                    'dropdownWidth',
                    'dropdownMinWidth',
                    'dropdownMaxHeight',
                    'dropdownBgColor',
                    'dropdownBorderAll',
                    'dropdownBorderRadius',
                    'dropdownPadding',
                    'dropdownShadow',
                    'zIndex',
                ],
            },
            {
                label: 'Option',
                isCollapsible: true,
                properties: [
                    'optionFontSize',
                    'optionFontWeight',
                    'optionFontColor',
                    'optionBgColor',
                    'optionBgColorHover',
                    'optionBgColorSelected',
                    'optionFontColorHover',
                    'optionFontColorSelected',
                    'optionPadding',
                    'optionBorderRadius',
                    'optionCheckmarkColor',
                ],
            },
            {
                label: 'Empty state',
                isCollapsible: true,
                properties: ['emptyStateFontColor', 'emptyStatePadding'],
            },
            {
                label: 'Create option',
                isCollapsible: true,
                properties: ['createOptionFontSize', 'createOptionFontWeight', 'createOptionFontColor', 'createOptionBgColor', 'createOptionBgColorHover'],
            },
        ],
        customSettingsPropertiesOrder: [
            'choices',
            'mappingLabel',
            'mappingValue',
            'mappingDisabled',
            'initValue',
            {
                label: 'Behavior',
                isCollapsible: true,
                properties: [
                    'placeholder',
                    'emptyStateText',
                    'allowCreate',
                    'createOptionLabel',
                    'clearable',
                    'closeOnSelect',
                    'disabled',
                    'readonly',
                    'invalid',
                    'required',
                    'forceOpen',
                    'forceEmptyState',
                ],
            },
            'formInfobox',
            ['fieldName', 'customValidation', 'validation'],
        ],
    },
    options: {
        autoByContent: true,
        displayAllowedValues: ['block'],
    },
    states: ['focus', 'focus-visible', 'disabled', 'readonly', 'invalid'],
    triggerEvents: [
        { name: 'change', label: { en: 'On change' }, event: { value: '' }, default: true },
        { name: 'initValueChange', label: { en: 'On init value change' }, event: { value: '' } },
        { name: 'focus', label: { en: 'On focus' }, event: null },
        { name: 'blur', label: { en: 'On blur' }, event: null },
        { name: 'dropdownClose', label: { en: 'On dropdown close' }, event: null },
        { name: 'search', label: { en: 'On search' }, event: { value: '' } },
        { name: 'create', label: { en: 'On create' }, event: { value: '' } },
    ],
    actions: [
        { label: 'Open', action: 'actionOpenDropdown', args: [] },
        { label: 'Close', action: 'actionCloseDropdown', args: [] },
        { label: 'Toggle', action: 'actionToggleDropdown', args: [] },
        {
            label: 'Set value',
            action: 'actionSetValue',
            args: [{ name: 'Value', type: 'any', required: true }],
        },
        { label: 'Reset value', action: 'actionResetValue', args: [] },
        { label: 'Focus', action: 'actionFocus', args: [] },
    ],
    properties: {
        // ── DATA ──────────────────────────────────────────────────────────────
        choices: {
            label: { en: 'Options' },
            type: 'Array',
            section: 'settings',
            bindable: true,
            defaultValue: [
                { label: 'Apple', value: 'apple' },
                { label: 'Banana', value: 'banana' },
                { label: 'Cherry', value: 'cherry' },
            ],
            options: {
                expandable: true,
                getItemLabel(item) {
                    return item.label || item.name || String(item.value ?? 'Option');
                },
                item: {
                    type: 'Object',
                    defaultValue: { label: 'New Option', value: '' },
                    options: {
                        item: {
                            label: { label: { en: 'Label' }, type: 'Text' },
                            value: { label: { en: 'Value' }, type: 'Text' },
                            disabled: { label: { en: 'Disabled' }, type: 'OnOff' },
                        },
                    },
                },
            },
            /* wwEditor:start */
            bindingValidation: {
                type: 'array',
                tooltip: 'An array of option objects: `[{ label: "Option", value: "val" }]`',
            },
            /* wwEditor:end */
        },
        mappingLabel: {
            label: { en: 'Label field' },
            type: 'Formula',
            section: 'settings',
            options: content => ({
                template:
                    Array.isArray(content.choices) && content.choices.length > 0 ? content.choices[0] : null,
            }),
            defaultValue: { type: 'f', code: "context.mapping?.['label']" },
            hidden: (content, sidepanelContent, boundProps) =>
                !Array.isArray(content.choices) || !content.choices?.length || !boundProps.choices,
        },
        mappingValue: {
            label: { en: 'Value field' },
            type: 'Formula',
            section: 'settings',
            options: content => ({
                template:
                    Array.isArray(content.choices) && content.choices.length > 0 ? content.choices[0] : null,
            }),
            defaultValue: { type: 'f', code: "context.mapping?.['value']" },
            hidden: (content, sidepanelContent, boundProps) =>
                !Array.isArray(content.choices) || !content.choices?.length || !boundProps.choices,
        },
        mappingDisabled: {
            label: { en: 'Disabled field' },
            type: 'Formula',
            section: 'settings',
            options: content => ({
                template:
                    Array.isArray(content.choices) && content.choices.length > 0 ? content.choices[0] : null,
            }),
            defaultValue: { type: 'f', code: "context.mapping?.['disabled']" },
            hidden: (content, sidepanelContent, boundProps) =>
                !Array.isArray(content.choices) || !content.choices?.length || !boundProps.choices,
        },
        initValue: {
            label: { en: 'Init value' },
            type: 'Text',
            section: 'settings',
            bindable: true,
            defaultValue: null,
            /* wwEditor:start */
            bindingValidation: {
                validations: [{ type: 'string' }, { type: 'number' }],
                tooltip: 'The initial value matching one of the option values.',
            },
            /* wwEditor:end */
        },

        // ── BEHAVIOR ──────────────────────────────────────────────────────────
        placeholder: {
            label: { en: 'Placeholder' },
            type: 'Text',
            section: 'settings',
            multiLang: true,
            bindable: true,
            defaultValue: { en: 'Search...' },
            /* wwEditor:start */
            bindingValidation: {
                type: 'string',
                tooltip: 'Placeholder text shown when no option is selected.',
            },
            /* wwEditor:end */
        },
        emptyStateText: {
            label: { en: 'Empty state text' },
            type: 'Text',
            section: 'settings',
            multiLang: true,
            bindable: true,
            defaultValue: { en: 'No results found.' },
            /* wwEditor:start */
            bindingValidation: {
                type: 'string',
                tooltip: 'Text shown when no options match the search query.',
            },
            /* wwEditor:end */
        },
        allowCreate: {
            label: { en: 'Allow create' },
            type: 'OnOff',
            section: 'settings',
            defaultValue: false,
            bindable: true,
            /* wwEditor:start */
            bindingValidation: {
                type: 'boolean',
                tooltip: 'Show a "Create" option when the search query has no exact match.',
            },
            /* wwEditor:end */
        },
        createOptionLabel: {
            label: { en: 'Create option label' },
            type: 'Text',
            section: 'settings',
            multiLang: true,
            bindable: true,
            defaultValue: { en: 'Create "{query}"' },
            hidden: content => !content?.allowCreate,
            /* wwEditor:start */
            bindingValidation: {
                type: 'string',
                tooltip: 'Label for the create option. Use {query} as a placeholder for the typed value.',
            },
            /* wwEditor:end */
        },
        clearable: {
            label: { en: 'Clearable' },
            type: 'OnOff',
            section: 'settings',
            defaultValue: true,
            bindable: true,
            /* wwEditor:start */
            bindingValidation: {
                type: 'boolean',
                tooltip: 'Show a clear (×) button when a value is selected.',
            },
            /* wwEditor:end */
        },
        closeOnSelect: {
            label: { en: 'Close on select' },
            type: 'OnOff',
            section: 'settings',
            defaultValue: true,
            bindable: true,
            /* wwEditor:start */
            bindingValidation: {
                type: 'boolean',
                tooltip: 'Automatically close the dropdown when an option is selected.',
            },
            /* wwEditor:end */
        },
        disabled: {
            label: { en: 'Disabled' },
            type: 'OnOff',
            section: 'settings',
            defaultValue: false,
            bindable: true,
            /* wwEditor:start */
            bindingValidation: {
                type: 'boolean',
                tooltip: 'Disable the combobox entirely.',
            },
            /* wwEditor:end */
        },
        readonly: {
            label: { en: 'Read only' },
            type: 'OnOff',
            section: 'settings',
            defaultValue: false,
            bindable: true,
            /* wwEditor:start */
            bindingValidation: {
                type: 'boolean',
                tooltip: 'Prevent user interaction while still showing the value.',
            },
            /* wwEditor:end */
        },
        invalid: {
            label: { en: 'Invalid' },
            type: 'OnOff',
            section: 'settings',
            defaultValue: false,
            bindable: true,
            /* wwEditor:start */
            bindingValidation: {
                type: 'boolean',
                tooltip: 'Mark the combobox as invalid (adds `invalid` CSS state).',
            },
            /* wwEditor:end */
        },
        required: {
            label: { en: 'Required' },
            type: 'OnOff',
            section: 'settings',
            defaultValue: false,
            bindable: true,
            /* wwEditor:start */
            bindingValidation: {
                type: 'boolean',
                tooltip: 'Make the field required for form validation.',
            },
            /* wwEditor:end */
        },
        /* wwEditor:start */
        forceOpen: {
            label: { en: 'Force open (editor)' },
            type: 'OnOff',
            section: 'settings',
            defaultValue: false,
        },
        forceEmptyState: {
            label: { en: 'Force empty state (editor)' },
            type: 'OnOff',
            section: 'settings',
            defaultValue: false,
        },
        /* wwEditor:end */

        // ── FORM ──────────────────────────────────────────────────────────────
        /* wwEditor:start */
        form: {
            editorOnly: true,
            hidden: true,
            defaultValue: false,
        },
        formInfobox: {
            type: 'InfoBox',
            section: 'settings',
            options: (_, sidePanelContent) => ({
                variant: sidePanelContent.form?.name ? 'success' : 'warning',
                icon: 'pencil',
                title: sidePanelContent.form?.name || 'Unnamed form',
                content: !sidePanelContent.form?.name && 'Give your form a meaningful name.',
                cta: { label: 'Select form', action: 'selectForm' },
            }),
            hidden: (_, sidePanelContent) => !sidePanelContent.form?.uid,
        },
        /* wwEditor:end */
        fieldName: {
            label: 'Field name',
            section: 'settings',
            type: 'Text',
            defaultValue: '',
            bindable: true,
            hidden: (_, sidePanelContent) => !sidePanelContent.form?.uid,
        },
        customValidation: {
            label: 'Custom validation',
            section: 'settings',
            type: 'OnOff',
            defaultValue: false,
            bindable: true,
            hidden: (_, sidePanelContent) => !sidePanelContent.form?.uid,
        },
        validation: {
            label: 'Validation',
            section: 'settings',
            type: 'Formula',
            defaultValue: '',
            hidden: (content, sidePanelContent) => !sidePanelContent.form?.uid || !content.customValidation,
        },

        // ── STYLE: INPUT ──────────────────────────────────────────────────────
        inputFontSize: {
            label: { en: 'Font size' },
            type: 'Length',
            section: 'style',
            options: {
                unitChoices: [
                    { value: 'px', label: 'px', min: 8, max: 72 },
                    { value: 'rem', label: 'rem', min: 0.5, max: 4 },
                    { value: 'em', label: 'em', min: 0.5, max: 4 },
                ],
                noRange: true,
            },
            bindable: true,
            responsive: true,
            defaultValue: '16px',
            /* wwEditor:start */
            bindingValidation: {
                type: 'string',
                tooltip: 'Font size of the input text (e.g. "14px", "1rem").',
            },
            /* wwEditor:end */
        },
        inputFontWeight: {
            label: { en: 'Font weight' },
            type: 'Number',
            section: 'style',
            options: { min: 100, max: 900, step: 100 },
            bindable: true,
            responsive: true,
            defaultValue: 400,
            /* wwEditor:start */
            bindingValidation: {
                type: 'number',
                tooltip: 'Font weight of the input text (100–900).',
            },
            /* wwEditor:end */
        },
        placeholderColor: {
            label: { en: 'Placeholder color' },
            type: 'Color',
            options: { nullable: true },
            bindable: true,
            responsive: true,
            states: true,
            classes: true,
            defaultValue: '#9ca3af',
            /* wwEditor:start */
            bindingValidation: {
                cssSupports: 'color',
                type: 'string',
                tooltip: 'Color of the placeholder text.',
            },
            /* wwEditor:end */
        },
        iconColor: {
            label: { en: 'Icon color' },
            type: 'Color',
            bindable: true,
            responsive: true,
            states: true,
            classes: true,
            defaultValue: '#6b7280',
            /* wwEditor:start */
            bindingValidation: {
                cssSupports: 'color',
                type: 'string',
                tooltip: 'Color of the chevron and clear icons.',
            },
            /* wwEditor:end */
        },
        iconSize: {
            label: { en: 'Icon size' },
            type: 'Length',
            options: {
                unitChoices: [
                    { value: 'px', label: 'px', min: 8, max: 48 },
                    { value: 'em', label: 'em', min: 0.5, max: 3 },
                ],
                noRange: true,
            },
            bindable: true,
            responsive: true,
            defaultValue: '16px',
            /* wwEditor:start */
            bindingValidation: {
                type: 'string',
                tooltip: 'Size of the icons in the trigger.',
            },
            /* wwEditor:end */
        },

        // ── STYLE: DROPDOWN POSITIONING ───────────────────────────────────────
        side: {
            label: { en: 'Position' },
            type: 'TextSelect',
            section: 'style',
            options: {
                options: [
                    { value: 'bottom-start', label: 'Bottom start' },
                    { value: 'bottom', label: 'Bottom center' },
                    { value: 'bottom-end', label: 'Bottom end' },
                    { value: 'top-start', label: 'Top start' },
                    { value: 'top', label: 'Top center' },
                    { value: 'top-end', label: 'Top end' },
                ],
            },
            defaultValue: 'bottom-start',
            bindable: true,
            /* wwEditor:start */
            bindingValidation: {
                type: 'string',
                tooltip: 'Valid values: bottom-start | bottom | bottom-end | top-start | top | top-end',
            },
            /* wwEditor:end */
        },
        offsetY: {
            label: { en: 'Offset' },
            type: 'Number',
            section: 'style',
            options: { min: -100, max: 100, step: 1 },
            defaultValue: 4,
            bindable: true,
        },
        dropdownWidth: {
            label: { en: 'Dropdown width' },
            type: 'TextSelect',
            section: 'style',
            options: {
                options: [
                    { value: 'match', label: 'Match trigger' },
                    { value: 'auto', label: 'Auto' },
                ],
            },
            defaultValue: 'match',
            bindable: true,
        },
        dropdownMinWidth: {
            label: { en: 'Min width' },
            type: 'Length',
            section: 'style',
            options: {
                unitChoices: [
                    { value: 'px', label: 'px', min: 0, max: 1000 },
                    { value: '%', label: '%', min: 0, max: 200 },
                ],
                noRange: true,
            },
            defaultValue: '0px',
            bindable: true,
        },
        dropdownMaxHeight: {
            label: { en: 'Max height' },
            type: 'Length',
            section: 'style',
            options: {
                unitChoices: [
                    { value: 'px', label: 'px', min: 50, max: 1000 },
                    { value: 'vh', label: 'vh', min: 10, max: 90 },
                ],
                noRange: true,
            },
            defaultValue: '300px',
            bindable: true,
        },

        // ── STYLE: DROPDOWN APPEARANCE ────────────────────────────────────────
        dropdownBgColor: {
            label: { en: 'Background' },
            type: 'Color',
            section: 'style',
            bindable: true,
            responsive: true,
            states: true,
            classes: true,
            defaultValue: '#ffffff',
            /* wwEditor:start */
            bindingValidation: {
                cssSupports: 'color',
                type: 'string',
                tooltip: 'Background color of the dropdown.',
            },
            /* wwEditor:end */
        },
        dropdownBorderAll: {
            label: { en: 'Border' },
            type: 'Border',
            section: 'style',
            states: true,
            classes: true,
            bindable: true,
            responsive: true,
            defaultValue: '1px solid #e5e7eb',
        },
        dropdownBorderRadius: {
            label: { en: 'Border radius' },
            type: 'Spacing',
            section: 'style',
            options: {
                unitChoices: [
                    { value: 'px', label: 'px', min: 0, max: 48 },
                    { value: '%', label: '%', min: 0, max: 50 },
                ],
                isCorner: true,
                noRange: true,
            },
            bindable: true,
            responsive: true,
            states: true,
            classes: true,
            defaultValue: '6px',
            /* wwEditor:start */
            bindingValidation: {
                type: 'string',
                tooltip: 'Border radius of the dropdown.',
            },
            /* wwEditor:end */
        },
        dropdownPadding: {
            label: { en: 'Padding' },
            type: 'Spacing',
            section: 'style',
            options: {
                unitChoices: [{ value: 'px', label: 'px', min: 0, max: 48 }],
                noRange: true,
            },
            bindable: true,
            responsive: true,
            defaultValue: '4px',
        },
        dropdownShadow: {
            label: { en: 'Shadow' },
            type: 'Shadows',
            section: 'style',
            options: { nullable: true },
            bindable: true,
            responsive: true,
            states: true,
            classes: true,
            defaultValue: '0 4px 6px -1px rgba(0,0,0,0.1),0 2px 4px -2px rgba(0,0,0,0.1)',
        },
        zIndex: {
            label: { en: 'Z-index' },
            type: 'Number',
            section: 'style',
            options: { min: 1, max: 99999 },
            defaultValue: 9999,
            bindable: true,
        },

        // ── STYLE: OPTIONS ────────────────────────────────────────────────────
        optionFontSize: {
            label: { en: 'Font size' },
            type: 'Length',
            section: 'style',
            options: {
                unitChoices: [
                    { value: 'px', label: 'px', min: 8, max: 72 },
                    { value: 'rem', label: 'rem', min: 0.5, max: 4 },
                    { value: 'em', label: 'em', min: 0.5, max: 4 },
                ],
                noRange: true,
            },
            bindable: true,
            responsive: true,
            defaultValue: "16px",
            /* wwEditor:start */
            bindingValidation: {
                type: 'string',
                tooltip: 'Font size of option items (e.g. "14px", "1rem").',
            },
            /* wwEditor:end */
        },
        optionFontWeight: {
            label: { en: 'Font weight' },
            type: 'Number',
            section: 'style',
            options: { min: 100, max: 900, step: 100 },
            bindable: true,
            responsive: true,
            defaultValue: 400,
            /* wwEditor:start */
            bindingValidation: {
                type: 'number',
                tooltip: 'Font weight of option items (100–900).',
            },
            /* wwEditor:end */
        },
        optionFontColor: {
            label: { en: 'Text color' },
            type: 'Color',
            section: 'style',
            bindable: true,
            responsive: true,
            states: true,
            classes: true,
            defaultValue: '#111827',
            /* wwEditor:start */
            bindingValidation: {
                cssSupports: 'color',
                type: 'string',
                tooltip: 'Default text color of each option.',
            },
            /* wwEditor:end */
        },
        optionBgColor: {
            label: { en: 'Background' },
            type: 'Color',
            section: 'style',
            options: { nullable: true },
            bindable: true,
            responsive: true,
            defaultValue: null,
        },
        optionBgColorHover: {
            label: { en: 'Background (hover / focused)' },
            type: 'Color',
            section: 'style',
            bindable: true,
            responsive: true,
            defaultValue: '#f3f4f6',
        },
        optionBgColorSelected: {
            label: { en: 'Background (selected)' },
            type: 'Color',
            section: 'style',
            bindable: true,
            responsive: true,
            defaultValue: '#f3f4f6',
        },
        optionFontColorHover: {
            label: { en: 'Text color (hover / focused)' },
            type: 'Color',
            section: 'style',
            options: { nullable: true },
            bindable: true,
            responsive: true,
            defaultValue: null,
        },
        optionFontColorSelected: {
            label: { en: 'Text color (selected)' },
            type: 'Color',
            section: 'style',
            options: { nullable: true },
            bindable: true,
            responsive: true,
            defaultValue: null,
        },
        optionPadding: {
            label: { en: 'Padding' },
            type: 'Spacing',
            section: 'style',
            options: {
                unitChoices: [{ value: 'px', label: 'px', min: 0, max: 48 }],
                noRange: true,
            },
            bindable: true,
            responsive: true,
            defaultValue: '6px 8px',
        },
        optionBorderRadius: {
            label: { en: 'Border radius' },
            type: 'Spacing',
            section: 'style',
            options: {
                unitChoices: [{ value: 'px', label: 'px', min: 0, max: 24 }],
                isCorner: true,
                noRange: true,
            },
            bindable: true,
            responsive: true,
            defaultValue: '4px',
        },
        optionCheckmarkColor: {
            label: { en: 'Checkmark color' },
            type: 'Color',
            section: 'style',
            bindable: true,
            responsive: true,
            defaultValue: '#111827',
        },

        // ── STYLE: EMPTY STATE ────────────────────────────────────────────────
        emptyStateFontColor: {
            label: { en: 'Text color' },
            type: 'Color',
            section: 'style',
            bindable: true,
            responsive: true,
            defaultValue: '#6b7280',
        },
        emptyStatePadding: {
            label: { en: 'Padding' },
            type: 'Spacing',
            section: 'style',
            options: {
                unitChoices: [{ value: 'px', label: 'px', min: 0, max: 48 }],
                noRange: true,
            },
            bindable: true,
            responsive: true,
            defaultValue: '8px 12px',
        },

        // ── STYLE: CREATE OPTION ──────────────────────────────────────────────
        createOptionFontSize: {
            label: { en: 'Font size' },
            type: 'Length',
            section: 'style',
            options: {
                unitChoices: [
                    { value: 'px', label: 'px', min: 8, max: 72 },
                    { value: 'rem', label: 'rem', min: 0.5, max: 4 },
                    { value: 'em', label: 'em', min: 0.5, max: 4 },
                ],
                noRange: true,
            },
            bindable: true,
            responsive: true,
            defaultValue: "16px",
            /* wwEditor:start */
            bindingValidation: {
                type: 'string',
                tooltip: 'Font size of the create option button (e.g. "14px", "1rem").',
            },
            /* wwEditor:end */
        },
        createOptionFontWeight: {
            label: { en: 'Font weight' },
            type: 'Number',
            section: 'style',
            options: { min: 100, max: 900, step: 100 },
            bindable: true,
            responsive: true,
            defaultValue: 500,
            /* wwEditor:start */
            bindingValidation: {
                type: 'number',
                tooltip: 'Font weight of the create option button (100–900).',
            },
            /* wwEditor:end */
        },
        createOptionFontColor: {
            label: { en: 'Text color' },
            type: 'Color',
            section: 'style',
            bindable: true,
            responsive: true,
            states: true,
            classes: true,
            defaultValue: '#111827',
            /* wwEditor:start */
            bindingValidation: {
                cssSupports: 'color',
                type: 'string',
                tooltip: 'Text color of the create option.',
            },
            /* wwEditor:end */
        },
        createOptionBgColor: {
            label: { en: 'Background' },
            type: 'Color',
            section: 'style',
            options: { nullable: true },
            bindable: true,
            responsive: true,
            defaultValue: null,
        },
        createOptionBgColorHover: {
            label: { en: 'Background (hover / focused)' },
            type: 'Color',
            section: 'style',
            bindable: true,
            responsive: true,
            defaultValue: '#f3f4f6',
        },
    },
};
