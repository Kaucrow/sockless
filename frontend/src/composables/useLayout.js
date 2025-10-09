import { computed, ref } from 'vue';

const appState = ref({
    darkMode: false
})

let initialDarkModeApplied = false;
export function useLayout() {
    function setDarkMode(value) {
        appState.value.darkMode = value;
        if (value) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');   
        }
    } 

    function toggleDarkMode() {
        appState.value.darkMode = !appState.value.darkMode;
        document.documentElement.classList.toggle('dark');
    }

    const isDarkMode = computed(() => appState.value.darkMode);
    if (!initialDarkModeApplied) {
        setDarkMode(appState.value.darkMode);
        initialDarkModeApplied = true;
    }

    return {
        isDarkMode,
        setDarkMode,
        toggleDarkMode
    }
}

