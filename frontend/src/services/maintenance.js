import api from './api.js';
import router from '@/router';

export const maintenanceService = {
    async getAvailableProfiles() {
        try {
            const response = await api.get('/maintenance/profiles');
            return response.data;
        } catch (error) {
            console.error('Error fetching profiles:', error);
            throw error;
        }
    },

    async getMethodProfileData() {
        try {
            const response = await api.get('maintenance/profiles/method-data');
            return response.data;
        } catch (error) {
            console.error('Error fetching method profile data:', error);
            throw error;
        }
    },

    async addMethodProfile(profileName, subsystem, className, method) {
        try {
            await api.post(`/maintenance/method/profiles/${profileName}`, {
                subsystem,
                class: className,
                method,
            });
            console.log(`Permission added to profile ${profileName}. can access ${subsystem}/${className}/${method}`);
        } catch (error) {
            console.error('Error adding method profile:', error.response ? error.response.data : error.message);
            throw error;
        }
    },

    async removeMethodProfile(profileName, subsystem, className, method) {
        try {
            await api.delete(`/maintenance/method/profiles/${profileName}`, {
                data: { // axios requires 'data' key for DELETE body
                    subsystem,
                    class: className,
                    method,
                },
            });
            console.log(`Permission removed from profile ${profileName}. can no longer access ${subsystem}/${className}/${method}`);
        } catch (error) {
            console.error('Error removing method profile:', error.response ? error.response.data : error.message);
            throw error;
        }
    }
}