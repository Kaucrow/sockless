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

    // users
    async getOneUser(args) { return this.toProcess(11, args); },
    async getManyUsers(args) { return this.toProcess(16, args); },

    // events
    async createEvent(args) { return this.toProcess(1, args); },
    async getAllEvents(args) { return this.toProcess(2, args); },
    async getEvent(args) { return this.toProcess(3, args); },
    async updateEvent(args) { return this.toProcess(4, args); },
    async createLocation(args) { return this.toProcess(5, args); },
    async getAllLocations(args) { return this.toProcess(6, args); },
    async setEventReservation(args) { return this.toProcess(7, args); },
    async getEventReservation(args) { return this.toProcess(8, args); },
    async getEventFlyer(args) { return this.toProcess(10, args); },
    
    // attendance
    async getEventAttendances(args) { return this.toProcess(15, args); },
    async registerAttendee(args) { return this.toProcess(12, args); },
    async getUserAttendances(args) { return this.toProcess(13, args); },
    async checkInAttendee(args) { return this.toProcess(14, args); }

}