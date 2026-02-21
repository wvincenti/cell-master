import { ref, inject, provide } from 'vue';

// A unique key (like an Interface/Token in C#)
const TableLayoutSymbol = Symbol('TableLayout');

export function provideTableLayout() {
    const tableHeight = ref('400px');

    const updateHeight = (el) => {
        if (el) tableHeight.value = `${el.offsetHeight}px`;
    };

    const state = { tableHeight, updateHeight };
    provide(TableLayoutSymbol, state);
    return state;
}

export function useTableLayout() {
    const context = inject(TableLayoutSymbol);
    if (!context) throw new Error('useTableLayout must be used within provideTableLayout');
    return context;
}