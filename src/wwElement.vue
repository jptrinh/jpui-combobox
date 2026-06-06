<template>
    <div
        ref="triggerRef"
        class="combobox"
        :class="{
            'is-disabled': isDisabled,
            'is-readonly': isReadonly,
            'is-open': isOpenEffective,
        }"
        :style="triggerCssVars"
        @keydown="handleKeydown"
    >
        <!-- Search input -->
        <input
            ref="inputRef"
            class="combobox__input"
            type="text"
            autocomplete="off"
            role="combobox"
            :aria-expanded="isOpenEffective"
            :aria-haspopup="'listbox'"
            :aria-activedescendant="activeDescendantId"
            :aria-invalid="isInvalid || undefined"
            :disabled="isDisabled"
            :readonly="isReadonly"
            :placeholder="placeholderText"
            :value="inputText"
            @input="handleInput"
            @focus="handleFocus"
            @blur="handleInputBlur"
            @click="handleInputClick"
        />

        <!-- Clear button -->
        <button
            v-if="isClearable && hasValue"
            class="combobox__clear-btn"
            type="button"
            tabindex="-1"
            @click.stop="clearValue"
            @mousedown.prevent
            @mouseenter="handleClearBtnMouseEnter"
            @mouseleave="handleClearBtnMouseLeave"
        >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
        </button>

        <!-- Chevron button -->
        <button
            class="combobox__chevron-btn"
            :class="{ 'is-open': isOpenEffective }"
            type="button"
            tabindex="-1"
            @click.stop="toggleDropdown"
            @mousedown.prevent
            @mouseenter="handleChevronMouseEnter"
            @mouseleave="handleChevronMouseLeave"
        >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="6 9 12 15 18 9" />
            </svg>
        </button>

        <!-- Dropdown (teleported to #app) -->
        <teleport v-if="isOpenEffective" :to="appRoot">
            <div
                ref="dropdownRef"
                class="combobox__dropdown"
                :style="[floatingStyles, dropdownCssVars]"
                role="listbox"
                :id="dropdownId"
                @mousedown.prevent
            >
                <div class="combobox__options">
                    <template v-if="filteredOptions.length > 0">
                        <div
                            v-for="(option, index) in filteredOptions"
                            :key="option._uid"
                            :id="`${dropdownId}-opt-${index}`"
                            class="combobox__option"
                            :class="{
                                'is-selected': option.isSelected,
                                'is-active': activeIndex === index,
                                'is-disabled': option.disabled,
                            }"
                            role="option"
                            :aria-selected="option.isSelected"
                            :aria-disabled="option.disabled || undefined"
                            @click="selectOption(option)"
                            @mouseenter="activeIndex = index"
                        >
                            <span class="combobox__option-check" aria-hidden="true">
                                <svg
                                    v-if="option.isSelected"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-width="2.5"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                >
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                            </span>
                            <span class="combobox__option-label">{{ option.label }}</span>
                        </div>
                    </template>
                    <div v-else-if="!showCreateOption" class="combobox__empty">
                        {{ emptyText }}
                    </div>
                    <div
                        v-if="showCreateOption"
                        :id="`${dropdownId}-opt-create`"
                        class="combobox__option combobox__create-option"
                        :class="{ 'is-active': activeIndex === filteredOptions.length }"
                        role="option"
                        :aria-selected="false"
                        @click="selectCreateOption"
                        @mouseenter="activeIndex = filteredOptions.length"
                    >
                        <span class="combobox__option-check" aria-hidden="true">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                <line x1="12" y1="5" x2="12" y2="19" />
                                <line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                        </span>
                        <span class="combobox__option-label">{{ createOptionText }}</span>
                    </div>
                </div>
            </div>
        </teleport>

        <!-- Hidden form input -->
        <input
            type="hidden"
            tabindex="-1"
            class="combobox__fake-input"
            :name="fieldNameValue"
            :value="variableValue"
            :required="content?.required"
            :disabled="isDisabled"
        />
    </div>
</template>

<script>
import { ref, computed, watch, inject, onMounted, onBeforeUnmount, shallowRef, nextTick } from 'vue';
import { useFloating, autoUpdate, flip, shift, offset, size } from '@floating-ui/vue';

export default {
    props: {
        content: { type: Object, required: true },
        uid: { type: String, required: true },
        /* wwEditor:start */
        wwEditorState: { type: Object, required: true },
        /* wwEditor:end */
        wwElementState: { type: Object, required: true },
    },
    emits: ['trigger-event', 'update:content', 'update:sidepanel-content', 'add-state', 'remove-state'],
    setup(props, { emit }) {
        /* wwEditor:start */
        inject('_wwForm:selectForm', () => {});
        /* wwEditor:end */

        const isEditing = computed(() => {
            /* wwEditor:start */
            if (props.wwEditorState?.isEditing) return true;
            /* wwEditor:end */
            return false;
        });

        // ── Refs ──────────────────────────────────────────────────────────────
        const triggerRef = ref(null);
        const dropdownRef = ref(null);
        const inputRef = ref(null);
        const isOpen = ref(false);
        const isReallyFocused = ref(false);
        const isFocusVisible = ref(false);
        const activeIndex = ref(-1);
        const inputText = ref('');
        const isTyping = ref(false);
        const isChevronHovered = ref(false);
        const isClearHovered = ref(false);

        const isOpenEffective = computed(() => {
            /* wwEditor:start */
            if (props.content?.forceOpen) return true;
            /* wwEditor:end */
            return isOpen.value;
        });

        const appRoot = computed(() => wwLib.getFrontDocument().querySelector('#app'));
        const dropdownId = `combobox-${props.uid}`;

        // ── Floating UI ───────────────────────────────────────────────────────
        const floatingMiddleware = computed(() => [
            offset(props.content?.offsetY ?? 4),
            flip({ padding: 8 }),
            shift({ padding: 8 }),
            size({
                apply({ availableHeight, rects, elements }) {
                    const floating = elements.floating;
                    const maxH = parseFloat(props.content?.dropdownMaxHeight) || 300;
                    floating.style.maxHeight = `${Math.min(availableHeight - 8, maxH)}px`;
                    if ((props.content?.dropdownWidth || 'match') !== 'auto') {
                        floating.style.width = `${rects.reference.width}px`;
                    }
                    const minW = props.content?.dropdownMinWidth || '0px';
                    floating.style.minWidth = minW;
                },
            }),
        ]);

        const { floatingStyles } = useFloating(triggerRef, dropdownRef, {
            placement: computed(() => props.content?.side || 'bottom-start'),
            middleware: floatingMiddleware,
            whileElementsMounted: autoUpdate,
        });

        // ── Options processing ─────────────────────────────────────────────────
        const { resolveMappingFormula } = wwLib.wwFormula.useFormula();

        const rawChoices = computed(() => {
            const c = props.content?.choices;
            return Array.isArray(c) ? c : [];
        });

        const processedOptions = computed(() =>
            rawChoices.value.map((item, index) => {
                const label = String(
                    resolveMappingFormula(props.content?.mappingLabel, item) ??
                        item?.label ??
                        item?.name ??
                        item?.value ??
                        ''
                );
                const value =
                    resolveMappingFormula(props.content?.mappingValue, item) ??
                    item?.value ??
                    item?.id ??
                    index;
                const disabled = Boolean(
                    resolveMappingFormula(props.content?.mappingDisabled, item) ?? item?.disabled ?? false
                );
                return { _uid: `${index}-${String(value)}`, label, value, disabled };
            })
        );

        // ── Internal variable ─────────────────────────────────────────────────
        const initValue = computed(() => props.content?.initValue ?? null);

        const { value: variableValue, setValue } = wwLib.wwVariable.useComponentVariable({
            uid: props.uid,
            name: 'value',
            type: 'any',
            defaultValue: initValue,
        });

        watch(
            initValue,
            newVal => {
                setValue(newVal ?? null);
                emit('trigger-event', { name: 'initValueChange', event: { value: newVal } });
            }
        );

        // ── Derived state ──────────────────────────────────────────────────────
        const selectedOption = computed(() => {
            const val = variableValue.value;
            if (val === null || val === undefined || val === '') return null;
            return (
                processedOptions.value.find(
                    o => o.value === val || String(o.value) === String(val)
                ) ?? null
            );
        });

        const selectedLabel = computed(() => selectedOption.value?.label ?? '');
        const hasValue = computed(
            () => variableValue.value !== null && variableValue.value !== undefined && variableValue.value !== ''
        );

        // Sync inputText ← selectedLabel when not actively typing
        watch(
            [selectedLabel, isTyping],
            ([label, typing]) => {
                if (!typing) inputText.value = label;
            },
            { immediate: true }
        );

        const filteredOptions = computed(() => {
            /* wwEditor:start */
            if (props.content?.forceEmptyState) return [];
            /* wwEditor:end */
            const val = variableValue.value;
            const hasVal = val !== null && val !== undefined && val !== '';
            const markSelected = o => ({
                ...o,
                isSelected: hasVal && (o.value === val || String(o.value) === String(val)),
            });
            if (!isTyping.value) return processedOptions.value.map(markSelected);
            const q = (inputText.value ?? '').toLowerCase().trim();
            if (!q) return processedOptions.value.map(markSelected);
            return processedOptions.value.filter(o => o.label.toLowerCase().includes(q)).map(markSelected);
        });

        // ── Computed state flags ───────────────────────────────────────────────
        const isDisabled = computed(() => props.content?.disabled || false);
        const isReadonly = computed(() => props.content?.readonly || false);
        const isInvalid = computed(() => props.content?.invalid || false);
        const isClearable = computed(() => props.content?.clearable !== false);
        const closeOnSelect = computed(() => props.content?.closeOnSelect !== false);
        const placeholderText = computed(() => wwLib.wwLang?.getText(props.content?.placeholder) || '');
        const emptyText = computed(() => wwLib.wwLang?.getText(props.content?.emptyStateText) || 'No results found.');

        const allowCreate = computed(() => props.content?.allowCreate || false);
        const createOptionText = computed(() => {
            const template = wwLib.wwLang?.getText(props.content?.createOptionLabel) || 'Create "{query}"';
            return template.replace('{query}', inputText.value || '');
        });
        const showCreateOption = computed(() => {
            if (!allowCreate.value || !isTyping.value) return false;
            const q = (inputText.value || '').trim();
            if (!q) return false;
            return !processedOptions.value.some(
                o => o.label.toLowerCase() === q.toLowerCase()
            );
        });

        const activeDescendantId = computed(() => {
            if (!isOpenEffective.value || activeIndex.value < 0) return undefined;
            if (showCreateOption.value && activeIndex.value === filteredOptions.value.length) {
                return `${dropdownId}-opt-create`;
            }
            return `${dropdownId}-opt-${activeIndex.value}`;
        });

        // ── Focus / state helpers ─────────────────────────────────────────────
        function handleChevronMouseEnter() {
            isChevronHovered.value = true;
        }

        function handleChevronMouseLeave() {
            isChevronHovered.value = false;
        }

        function handleClearBtnMouseEnter() {
            isClearHovered.value = true;
        }

        function handleClearBtnMouseLeave() {
            isClearHovered.value = false;
        }

        function setFocused(focused) {
            isReallyFocused.value = focused;
            if (focused) {
                emit('add-state', 'focus');
                if (isFocusVisible.value) emit('add-state', 'focus-visible');
            } else {
                emit('remove-state', 'focus');
                emit('remove-state', 'focus-visible');
                isFocusVisible.value = false;
            }
        }

        // ── Sync disabled / readonly / invalid WeWeb states ───────────────────
        watch(isDisabled, val => { emit(val ? 'add-state' : 'remove-state', 'disabled'); }, { immediate: true });
        watch(isReadonly, val => { emit(val ? 'add-state' : 'remove-state', 'readonly'); }, { immediate: true });
        watch(isInvalid, val => { emit(val ? 'add-state' : 'remove-state', 'invalid'); }, { immediate: true });

        // ── Open / close ──────────────────────────────────────────────────────
        function openDropdown() {
            if (isDisabled.value || isReadonly.value || isEditing.value) return;
            isOpen.value = true;
            emit('trigger-event', { name: 'dropdownOpen', event: null });
            // Pre-focus the currently selected option
            if (selectedOption.value) {
                const idx = filteredOptions.value.findIndex(
                    o => o.value === selectedOption.value.value
                );
                activeIndex.value = idx >= 0 ? idx : -1;
            } else {
                activeIndex.value = -1;
            }
        }

        function closeDropdown(opts = {}) {
            if (!isOpen.value) return;
            isOpen.value = false;
            isTyping.value = false;
            inputText.value = selectedLabel.value;
            activeIndex.value = -1;
            if (!opts.silent) {
                emit('trigger-event', { name: 'dropdownClose', event: null });
            }
        }

        function toggleDropdown() {
            if (isOpen.value) closeDropdown();
            else openDropdown();
        }

        // ── Input handlers ────────────────────────────────────────────────────
        function handleInput(event) {
            inputText.value = event.target.value;
            isTyping.value = true;
            activeIndex.value = -1;
            if (!isOpen.value) openDropdown();
            emit('trigger-event', { name: 'search', event: { value: event.target.value } });
        }

        function handleInputClick() {
            if (!isOpen.value) openDropdown();
        }

        function handleFocus() {
            isFocusVisible.value = true;
            setFocused(true);
            if (!isOpen.value) openDropdown();
            emit('trigger-event', { name: 'focus', event: null });
        }

        function handleInputBlur() {
            setTimeout(() => {
                const doc = wwLib.getFrontDocument();
                const focused = doc.activeElement;
                const drop = dropdownRef.value;
                const trigger = triggerRef.value;
                if (!drop?.contains(focused) && !trigger?.contains(focused)) {
                    setFocused(false);
                    closeDropdown();
                    emit('trigger-event', { name: 'blur', event: null });
                }
            }, 150);
        }

        // ── Selection ─────────────────────────────────────────────────────────
        function selectOption(option) {
            if (option.disabled) return;
            const prev = variableValue.value;
            setValue(option.value);
            inputText.value = option.label;
            isTyping.value = false;
            if (prev !== option.value) {
                emit('trigger-event', { name: 'change', event: { value: option.value } });
            }
            if (closeOnSelect.value) {
                closeDropdown();
                nextTick(() => inputRef.value?.focus());
            }
        }

        function clearValue() {
            setValue(null);
            inputText.value = '';
            isTyping.value = false;
            emit('trigger-event', { name: 'change', event: { value: null } });
            nextTick(() => {
                inputRef.value?.focus();
                openDropdown();
            });
        }

        function selectCreateOption() {
            const q = (inputText.value || '').trim();
            if (!q) return;
            emit('trigger-event', { name: 'create', event: { value: q } });
            closeDropdown();
            nextTick(() => inputRef.value?.focus());
        }

        function isOptionSelected(option) {
            const val = variableValue.value;
            if (val === null || val === undefined || val === '') return false;
            return option.value === val || String(option.value) === String(val);
        }

        // ── Keyboard navigation ───────────────────────────────────────────────
        function handleKeydown(event) {
            if (isDisabled.value || isReadonly.value) return;
            switch (event.key) {
                case 'ArrowDown':
                    event.preventDefault();
                    if (!isOpen.value) { openDropdown(); return; }
                    activeIndex.value = Math.min(
                        activeIndex.value + 1,
                        filteredOptions.value.length - 1 + (showCreateOption.value ? 1 : 0)
                    );
                    scrollActiveOptionIntoView();
                    break;
                case 'ArrowUp':
                    event.preventDefault();
                    if (!isOpen.value) { openDropdown(); return; }
                    activeIndex.value = Math.max(activeIndex.value - 1, 0);
                    scrollActiveOptionIntoView();
                    break;
                case 'Enter':
                    event.preventDefault();
                    if (isOpen.value && activeIndex.value >= 0) {
                        if (showCreateOption.value && activeIndex.value === filteredOptions.value.length) {
                            selectCreateOption();
                        } else {
                            const opt = filteredOptions.value[activeIndex.value];
                            if (opt) selectOption(opt);
                        }
                    }
                    break;
                case 'Escape':
                    event.preventDefault();
                    closeDropdown();
                    inputRef.value?.focus();
                    break;
                case 'Tab':
                    if (isOpen.value) closeDropdown();
                    break;
            }
        }

        function scrollActiveOptionIntoView() {
            nextTick(() => {
                const isCreate = showCreateOption.value && activeIndex.value === filteredOptions.value.length;
                const id = isCreate ? `${dropdownId}-opt-create` : `${dropdownId}-opt-${activeIndex.value}`;
                const el = wwLib.getFrontDocument().getElementById(id);
                el?.scrollIntoView({ block: 'nearest' });
            });
        }

        // ── Click outside ─────────────────────────────────────────────────────
        function handleClickOutside(event) {
            if (!isOpen.value) return;
            const t = event.target;
            if (!triggerRef.value?.contains(t) && !dropdownRef.value?.contains(t)) {
                closeDropdown();
            }
        }

        onMounted(() => {
            wwLib.getFrontDocument().addEventListener('mousedown', handleClickOutside, true);
        });

        onBeforeUnmount(() => {
            wwLib.getFrontDocument().removeEventListener('mousedown', handleClickOutside, true);
        });

        // ── Form integration ──────────────────────────────────────────────────
        const fieldNameValue = computed(
            () => props.content?.fieldName || props.wwElementState?.name || ''
        );
        const validation = computed(() => props.content?.validation);
        const customValidation = computed(() => props.content?.customValidation);

        const useForm = inject('_wwForm:useForm', () => {});
        useForm(
            variableValue,
            { fieldName: fieldNameValue, validation, customValidation, initialValue: initValue },
            { elementState: props.wwElementState, emit, sidepanelFormPath: 'form', setValue }
        );

        // ── CSS variables ─────────────────────────────────────────────────────
        const triggerCssVars = computed(() => ({
            '--placeholder-color': props.content?.placeholderColor || '#9ca3af',
            '--icon-color': props.content?.iconColor || '#6b7280',
            '--icon-size': props.content?.iconSize || '16px',
            '--chevron-btn-bg': isChevronHovered.value
                ? (props.content?.iconBtnBgHover ?? props.content?.iconBtnBg ?? 'transparent')
                : (props.content?.iconBtnBg ?? 'transparent'),
            '--chevron-btn-border-radius': isChevronHovered.value
                ? (props.content?.iconBtnBorderRadiusHover ?? props.content?.iconBtnBorderRadius ?? '4px')
                : (props.content?.iconBtnBorderRadius ?? '4px'),
            '--clear-btn-bg': isClearHovered.value
                ? (props.content?.iconBtnBgHover ?? props.content?.iconBtnBg ?? 'transparent')
                : (props.content?.iconBtnBg ?? 'transparent'),
            '--clear-btn-border-radius': isClearHovered.value
                ? (props.content?.iconBtnBorderRadiusHover ?? props.content?.iconBtnBorderRadius ?? '4px')
                : (props.content?.iconBtnBorderRadius ?? '4px'),
            '--input-font-size': props.content?.inputFontSize || '16px',
            '--input-font-weight': props.content?.inputFontWeight || null,
        }));

        const dropdownCssVars = computed(() => ({
            '--dropdown-bg': props.content?.dropdownBgColor || '#ffffff',
            '--dropdown-border': props.content?.dropdownBorderAll || '1px solid #e5e7eb',
            '--dropdown-radius': props.content?.dropdownBorderRadius || '6px',
            '--dropdown-padding': props.content?.dropdownPadding || '4px',
            '--dropdown-shadow': props.content?.dropdownShadow || '0 4px 6px -1px rgba(0,0,0,0.1),0 2px 4px -2px rgba(0,0,0,0.1)',
            '--dropdown-z-index': props.content?.zIndex || 9999,
            '--option-color': props.content?.optionFontColor || '#111827',
            '--option-bg': props.content?.optionBgColor || 'transparent',
            '--option-bg-hover': props.content?.optionBgColorHover || '#f3f4f6',
            '--option-bg-selected': props.content?.optionBgColorSelected || '#f3f4f6',
            '--option-color-hover': props.content?.optionFontColorHover || 'inherit',
            '--option-color-selected': props.content?.optionFontColorSelected || 'inherit',
            '--option-padding': props.content?.optionPadding || '6px 8px',
            '--option-radius': props.content?.optionBorderRadius || '4px',
            '--option-check-color': props.content?.optionCheckmarkColor || '#111827',
            '--empty-color': props.content?.emptyStateFontColor || '#6b7280',
            '--empty-padding': props.content?.emptyStatePadding || '8px 12px',
            '--create-option-color': props.content?.createOptionFontColor || '#111827',
            '--create-option-bg': props.content?.createOptionBgColor || 'transparent',
            '--create-option-bg-hover': props.content?.createOptionBgColorHover || '#f3f4f6',
            '--option-font-size': props.content?.optionFontSize || null,
            '--option-font-weight': props.content?.optionFontWeight || null,
            '--create-option-font-size': props.content?.createOptionFontSize || null,
            '--create-option-font-weight': props.content?.createOptionFontWeight || null,
        }));

        // ── Local context ─────────────────────────────────────────────────────
        const localSelectedOption = computed(() =>
            selectedOption.value
                ? { value: selectedOption.value.value, label: selectedOption.value.label }
                : null
        );
        const localSearchQuery = computed(() => (isTyping.value ? inputText.value : ''));
        const localOptions = computed(() => processedOptions.value.map(({ _uid, ...o }) => o));

        const localData = ref({
            value: variableValue,
            label: selectedLabel,
            selectedOption: localSelectedOption,
            isOpen,
            searchQuery: localSearchQuery,
            options: localOptions,
        });

        const localMarkdown = `### Combobox local information

#### value
The currently selected value.

#### label
The display label of the currently selected option.

#### selectedOption
The full selected option \`{ value, label }\`, or \`null\` if nothing is selected.

#### isOpen
Boolean indicating whether the dropdown is open.

#### searchQuery
The text the user is currently typing (empty string when not searching).

#### options
Array of all available options \`[{ value, label, disabled }]\`.

**Usage Example:**
\`\`\`
context.local.data?.['combobox']?.['value']
context.local.data?.['combobox']?.['label']
context.local.data?.['combobox']?.['isOpen']
\`\`\`
`;

        wwLib.wwElement.useRegisterElementLocalContext('combobox', localData.value, {}, localMarkdown);

        // ── Workflow actions ───────────────────────────────────────────────────
        function actionOpenDropdown() { openDropdown(); }
        function actionCloseDropdown() { closeDropdown(); }
        function actionToggleDropdown() { toggleDropdown(); }

        function actionSetValue(val) {
            const option = processedOptions.value.find(
                o => o.value === val || String(o.value) === String(val)
            );
            if (option) {
                selectOption(option);
            } else {
                setValue(val ?? null);
                isTyping.value = false;
                inputText.value = val != null ? String(val) : '';
                emit('trigger-event', { name: 'change', event: { value: val } });
            }
        }

        function actionResetValue() { clearValue(); }
        function actionFocus() { inputRef.value?.focus(); }

        return {
            triggerRef,
            dropdownRef,
            inputRef,
            isOpen,
            isOpenEffective,
            isDisabled,
            isReadonly,
            isInvalid,
            isClearable,
            hasValue,
            inputText,
            activeIndex,
            filteredOptions,
            placeholderText,
            emptyText,
            floatingStyles,
            dropdownId,
            activeDescendantId,
            variableValue,
            fieldNameValue,
            appRoot,
            isOptionSelected,
            showCreateOption,
            createOptionText,
            selectCreateOption,
            triggerCssVars,
            dropdownCssVars,
            handleInput,
            handleInputClick,
            handleFocus,
            handleInputBlur,
            handleKeydown,
            selectOption,
            clearValue,
            toggleDropdown,
            handleChevronMouseEnter,
            handleChevronMouseLeave,
            handleClearBtnMouseEnter,
            handleClearBtnMouseLeave,
            actionOpenDropdown,
            actionCloseDropdown,
            actionToggleDropdown,
            actionSetValue,
            actionResetValue,
            actionFocus,
            /* wwEditor:start */
            isEditing,
            /* wwEditor:end */
        };
    },
};
</script>

<style lang="scss" scoped>
.combobox {
    position: relative;
    display: flex !important;
    align-items: center;
    cursor: text;
    width: 100%;

    &.is-disabled {
        opacity: 0.5;
        cursor: not-allowed;
        pointer-events: none;
    }

    &.is-readonly {
        cursor: default;
    }

    &__input {
        flex: 1;
        min-width: 0;
        height: 100%;
        border: none;
        outline: none;
        background: transparent;
        font: inherit;
        font-size: var(--input-font-size, inherit);
        font-weight: var(--input-font-weight, inherit);
        color: inherit;
        padding: 0;
        cursor: inherit;

        &::placeholder {
            color: var(--placeholder-color, #9ca3af);
            font: inherit;
        }

        &:disabled {
            cursor: not-allowed;
        }
    }

    &__clear-btn,
    &__chevron-btn {
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 28px;
        height: 100%;
        border: none;
        cursor: pointer;
        color: var(--icon-color, #6b7280);
        padding: 0;
        margin: 0;
        transition: background 0.2s ease;

        svg {
            width: var(--icon-size, 16px);
            height: var(--icon-size, 16px);
            display: block;
        }
    }

    &__clear-btn {
        background: var(--clear-btn-bg, transparent);
        border-radius: var(--clear-btn-border-radius, 4px);
    }

    &__chevron-btn {
        background: var(--chevron-btn-bg, transparent);
        border-radius: var(--chevron-btn-border-radius, 4px);

        svg {
            transition: transform 0.15s ease;
        }

        &.is-open svg {
            transform: rotate(180deg);
        }
    }

    &__fake-input {
        position: absolute;
        width: 0;
        height: 0;
        opacity: 0;
        pointer-events: none;
    }
}

// Dropdown — rendered via teleport, outside .combobox scope
.combobox__dropdown {
    position: absolute;
    z-index: var(--dropdown-z-index, 9999);
    background: var(--dropdown-bg, #ffffff);
    border: var(--dropdown-border, 1px solid #e5e7eb);
    border-radius: var(--dropdown-radius, 6px);
    box-shadow: var(--dropdown-shadow, 0 4px 6px -1px rgba(0, 0, 0, 0.1));
    overflow: hidden;

    .combobox__options {
        overflow-y: auto;
        padding: var(--dropdown-padding, 4px);
        max-height: inherit;
    }

    .combobox__option {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: var(--option-padding, 6px 8px);
        border-radius: var(--option-radius, 4px);
        color: var(--option-color, #111827);
        background: var(--option-bg, transparent);
        font-size: var(--option-font-size, inherit);
        font-weight: var(--option-font-weight, inherit);
        cursor: pointer;
        user-select: none;
        transition: background 0.1s ease, color 0.1s ease;

        &:hover,
        &.is-active {
            background: var(--option-bg-hover, #f3f4f6);
            color: var(--option-color-hover, inherit);
        }

        &.is-selected {
            background: var(--option-bg-selected, #f3f4f6);
            color: var(--option-color-selected, inherit);
        }

        &.is-disabled {
            opacity: 0.4;
            cursor: not-allowed;
            pointer-events: none;
        }
    }

    .combobox__option-check {
        flex-shrink: 0;
        width: 16px;
        height: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--option-check-color, #111827);

        svg {
            width: 14px;
            height: 14px;
        }
    }

    .combobox__option-label {
        flex: 1;
        min-width: 0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .combobox__empty {
        padding: var(--empty-padding, 8px 12px);
        color: var(--empty-color, #6b7280);
        text-align: center;
        font-size: 0.875em;
    }

    .combobox__create-option {
        color: var(--create-option-color, #111827);
        background: var(--create-option-bg, transparent);
        font-size: var(--create-option-font-size, var(--option-font-size, inherit));
        font-weight: var(--create-option-font-weight, var(--option-font-weight, inherit));

        &:hover,
        &.is-active {
            background: var(--create-option-bg-hover, #f3f4f6);
        }
    }
}
</style>
