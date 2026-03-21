import api from './api';

export const toProcessImgService = {
    async toProcessImg(formData) {
        try {
            const response = await api.post('/to-process-img', formData);
            return response.data;
        } catch (error) {
            console.error(`Error calling to-process-img:`, error);
            throw error;
        }
    },

    async setEventFlyer(formData) { 
        return this.toProcessImg(formData); 
    },    
    
}