## Todo: Business objects

### Events

| Method      |  Profile    |
| :---------  | :---------- |
| createEvent() | event-admin
| getAllEvents() | all admins
| getEvent() | all admins
| updateEvent() | event-admin
| createLocation() | finance-admin |
| getAllLocations() | finance-admin |
| setEventReservation() | finance-admin
| getEventReservation() | all admins
| setEventFlyer() | event-admin
| getEventFlyer() | all users

### Registration & Attendance

| Method      |  Profile    |
| :---------  | :---------- |
| registerParticipant() | attendee, event-admin
| getRegistration() | event-admin, attendance-admin
| checkInParticipant() | attendance-admin
| getAttendeesList() | event-admin, attendance-admin

### Personnel & HR

| Method      |  Profile    |
| :---------  | :---------- |
| hirePersonnel() | event-admin
| assignRole() | event-admin
| getRolesWithCosts() | event-admin, finance-admin
| getPersonnelList() | event-admin, finance-admin

### Finances

| Method      |  Profile    |
| :---------  | :---------- |
| registerGeneralExpense() | finance-admin
| updateGeneralExpense() | finance-admin
| getAllExpenses() | finance-admin
| registerPersonnelPayment() | finance-admin
| getPersonnelPaymentHistory() | finance-admin

### Reports

| Method      |  Profile    |
| :---------  | :---------- |
| getEventStatistics() | all admins
| getFinancialReport() | finance-admin
| getDetailedParticipantList() | event-admin, attendance-admin
| getDetailedPersonnelReport() | event-admin, finance-admin