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
            const response = await api.get('/maintenance/profiles/method-data');
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
    },

    async getMenuData() {
        try {
            const response = await api.get('/maintenance/profiles/menu-data');
            return response.data;
        } catch (error) {
            console.error('Error fetching menu data:', error);
            throw error;
        }
    },

    async getUserMenu() {
        try {
            const response = await api.get('/auth/user/menu');
            return response.data;
        } catch (error) {
            console.error('Error fetching user menu:', error);
            throw error;
        }
    },

    async addMenuProfile(profileName, subsystem, menuItem) {
        try {
            await api.post(`/maintenance/menu/profiles/${profileName}`, {
                subsystem,
                menu: menuItem,
                profile: profileName,
            });
            console.log(`Permission added to profile ${profileName}: ${menuItem}`);
        } catch (error) {
            console.error('Error adding menu profile:', error.response ? error.response.data : error.message);
            throw error;
        }
    },

    async removeMenuProfile(profileName, subsystem, menuItem) {
        try {
            await api.delete(`/maintenance/menu/profiles/${profileName}`, {
                data: { 
                    subsystem,
                    menu: menuItem,
                    profile: profileName,
                },
            });
            console.log(`Permission removed from profile ${profileName}: ${menuItem}`);
        } catch (error) {
            console.error('Error removing menu profile:', error.response ? error.response.data : error.message);
            throw error;
        }
    },

    async getUserProfiles(email) {
        try {
            const response = await api.get(`/maintenance/user/profiles`, {
                params: {
                    email: email
                }
            });
            console.log('Fetched user profiles:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error fetching user profiles:', error.response ? error.response.data : error.message);
            throw error;
        }
    },

    async changeProfileName(oldName, newName) {
        try {
            const response = await api.put(`/maintenance/profiles/${oldName}`, {
                newName: newName
            });
            console.log(`Profile name changed from ${oldName} to ${newName}`);
            return response.data;   
        } catch (error) {
            console.error('Error changing profile name:', error.response ? error.response.data : error.message);
            throw error;
        }
    }, 
    
    async deleteProfile(profileName) {
        try {
            await api.delete(`/maintenance/profiles/${profileName}`);
            console.log(`Profile ${profileName} deleted successfully.`);
        } catch (error) {
            console.error('Error deleting profile:', error.response ? error.response.data : error.message);
            throw error;
        }
    },

    async addProfileToUser(profileName, email) {
        try {
            await api.post(`/maintenance/user/profiles/${profileName}`, {
                email: email
            });
            console.log(`Profile ${profileName} added to user ${email}`);
        } catch (error) {
            console.error('Error adding profile to user:', error.response ? error.response.data : error.message);
            throw error;
        }
    },

    async removeProfileFromUser(profileName, email) {
        try {
            await api.delete(`/maintenance/user/profiles/${profileName}`, {
                data: {
                    email: email
                }
            });
            console.log(`Profile ${profileName} removed from user ${email}`);
        } catch (error) {
            console.error('Error removing profile from user:', error.response ? error.response.data : error.message);
            throw error;
        }
    }
}