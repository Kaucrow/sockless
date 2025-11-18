import api from './api';

export const toProcessService = {
    async toProcess(tx, args) {
        try {
            const response = await api.post('/to-process', { tx, args });
            return response.data;
        } catch (error) {
            console.error(`Error calling to-process (${tx}):`, error);
            throw error;
        }
    },

    // wrappers
    async getOneUser(tx, args) { return this.toProcess(tx, args); },
    async createEvent(tx, args) { return this.toProcess(tx, args); },
    async getAllEvents(tx, args) { return this.toProcess(tx, args); },
    async getEvent(tx, args) { return this.toProcess(tx, args); },
    async updateEvent(tx, args) { return this.toProcess(tx, args); },
    async setEventFlyer(tx, args) { return this.toProcess(tx, args); },
    async createLocation(tx, args) { return this.toProcess(tx, args); },
    async getAllLocations(tx, args) { return this.toProcess(tx, args); },
    async setEventReservation(tx, args) { return this.toProcess(tx, args); },
    async getEventReservations(tx, args) { return this.toProcess(tx, args); },
    async getEventAttendances(tx, args) { return this.toProcess(tx, args); }
}