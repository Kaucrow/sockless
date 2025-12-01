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
    async checkInAttendee(args) { return this.toProcess(14, args); },
    async adminGetUserAttendances(args) { return this.toProcess(13, args); },
    async userGetUserAttendances(args) { return this.toProcess(32, args); },

    // staff
    async getRoles(args) { return this.toProcess(18, args); },
    async createRoles(args) { return this.toProcess(19, args); },
    async addStaff(args) { return this.toProcess(17, args); },
    async addStaffToEvent(args) { return this.toProcess(20, args); },
    async getAllStaffInEvent(args) { return this.toProcess(21, args); },

    // finances
    async getCostCategories(args) { return this.toProcess(22, args); },
    async addCostCategory(args) { return this.toProcess(23, args); },
    async updateCostCategory(args) { return this.toProcess(24, args); },
    async getPaymentMethods(args) { return this.toProcess(25, args); },
    async addPaymentMethod(args) { return this.toProcess(26, args); },
    async userPayForTicket(args) { return this.toProcess(27, args); },
    async adminPayForTicket(args) { return this.toProcess(30, args); },

    // tickets
    async createEventTickets(args) { return this.toProcess(28, args); },
    async getEventTickets(args) { return this.toProcess(29, args); }
}