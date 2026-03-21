import { defineStore } from "pinia";
import { toProcessService } from "@/services/to-process";
import { authService } from "@/services/auth";
import { maintenanceService } from "@/services/maintenance";
import { toRaw } from "vue";
import router from "@/router";

export const useUserStore = defineStore("user", {
    state: () => ({
        email: null,
        name: null,
        surname: null,
        menuPermissions: null,
        isLoadingAppData: false,
        appDataError: null,
    }),
    getters: {
        isAuthenticated: (state) => !!state.email,
        userInitials: (state) => {
            let initials = '';
            if (state.name) initials += state.name.charAt(0).toUpperCase();
            if (state.surname) initials += state.surname.charAt(0).toUpperCase();
            return initials;
        },
        fullName: (state) => {
            return `${state.name || ''} ${state.surname || ''}`.trim();
        },
    },
    actions: {
        setUser(payload) {
            this.email = payload.email;
            this.name = payload.name;
            this.surname = payload.surname;
            // Store email in localStorage for persistence across refreshes
            if (payload.email) {
                localStorage.setItem('userEmail', payload.email);
            }
        },
        clearUser() {
            this.email = null;
            this.name = null;
            this.surname = null;
            localStorage.removeItem('userEmail');
        },
        async fetchAppData() {
            if (!authService.isAuthenticated()) {
                this.appDataError = 'User not authenticated';
                this.menuPermissions = [];
                this.isLoadingAppData = false;
                return;
            }

            // If email is not in store but we're authenticated, try to restore it from localStorage
            if (!this.email) {
                const storedEmail = localStorage.getItem('userEmail');
                if (storedEmail) {
                    this.email = storedEmail;
                } else {
                    this.appDataError = 'User email not found';
                    this.menuPermissions = null;
                    this.isLoadingAppData = false;
                    return;
                }
            }

            this.isLoadingAppData = true;
            this.appDataError = null;
            try {
                this.menuPermissions = await maintenanceService.getUserMenu();
                console.log('Fetched menu permissions:', toRaw(this.menuPermissions));
            } catch (error) {
                console.error('Error fetching app data:', error);
                this.appDataError = error.message || 'Failed to fetch app data';
                this.menuPermissions = [];
            } finally {
                this.isLoadingAppData = false;
            }
        },
        clearAppData() {
            this.menuPermissions = [];
            this.isLoadingAppData = false;
            this.appDataError = null;
        },
        async fetchUserProfile() {
            if (!this.email) {
                const storedEmail = localStorage.getItem('userEmail');
                if (storedEmail) {
                    this.email = storedEmail;
                } else {
                    console.warn("No email set in user store to fetch profile.");
                    return;
                }
            }
            try {
                const args = { email: this.email };
                const userData = await toProcessService.getOneUser(args);
                this.setUser({
                    email: userData.email || this.email,
                    name: userData.name,
                    surname: userData.surname
                });
            } catch (error) {
                console.error("Error fetching user profile:", error);
            }
        },
        // Initialize user data from localStorage if authenticated
        async initializeUser() {
            if (authService.isAuthenticated() && !this.email) {
                const storedEmail = localStorage.getItem('userEmail');
                if (storedEmail) {
                    this.email = storedEmail;
                    // Fetch user profile to get name and surname
                    await this.fetchUserProfile();
                }
            }
        },
        async logout() {
            try {
                await authService.logout();
                console.log("User logged out successfully.");
            } catch (error) {
                console.error("Error during logout:", error);
            } finally {
                this.clearUser();
                this.clearAppData();
                router.push('/login');
            }
        }
    }
})