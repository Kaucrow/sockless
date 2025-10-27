// this should be done with pinia or vuex, but im not gonna learn that in 2 days

import { reactive, readonly } from 'vue';
import { maintenanceService } from '@/services/maintenance';
import { authService } from '@/services/auth';

const state = reactive({
    userProfiles: [],
    menuPermissions: null,
    isLoadingAppData: false,
    appDataError: null,
});

const actions = {
    async fetchAppData() {
        if (!authService.isAuthenticated()) {
            state.appDataError = 'User not authenticated';
            state.userProfiles = [];
            state.menuPermissions = null;
            state.isLoadingAppData = false;
            return;
        }

        const email = localStorage.getItem('userEmail');
        if (!email) {
            state.appDataError = 'User email not found in local storage';
            state.userProfiles = [];
            state.menuPermissions = null;
            state.isLoadingAppData = false;
            return;
        }

        state.isLoadingAppData = true;
        state.appDataError = null;
        try {
            state.userProfiles = await maintenanceService.getUserProfiles(email);
            state.menuPermissions = await maintenanceService.getMenuData();
        } catch (error) {
            console.error('Error fetching app data:', error);
            state.appDataError = error.message || 'Failed to fetch app data';
            state.userProfiles = [];
            state.menuPermissions = {};
        } finally {
            state.isLoadingAppData = false;
        }
    },

    clearAppData() {
        state.userProfiles = [];
        state.menuPermissions = null;
        state.isLoadingAppData = false;
        state.appDataError = null;
    }
};

export const appStore = {
    state: readonly(state),
    ...actions,
}