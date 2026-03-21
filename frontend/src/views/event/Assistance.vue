<script setup>
import { ref, onMounted, watch } from 'vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Select from 'primevue/select';
import Button from 'primevue/button';
import Card from 'primevue/card';
import Checkbox from 'primevue/checkbox';
import Paginator from 'primevue/paginator';
import { toProcessService } from '@/services/to-process';

const props = defineProps({
    id: {
        type: String,
        required: true
    }
});

const eventList = ref([]);
const assistanceList = ref([]);
const selectedEventId = ref(props.id);
const event = ref(null);

const fetchEvent = async (id) => {
    try {
        const eventData = await toProcessService.getEvent({eventId: id});
        event.value = eventData;
        console.log('Fetched event: ', eventData);
    } catch (err) {
        console.error('Error fetching event: ', err);
        event.value = null;
    }
}

const fetchAttendance = async () => {
    if (!selectedEventId.value) {
        assistanceList.value = [];
        return;
    }
    try {
        const args = { eventId: selectedEventId.value };
        const attendance = await toProcessService.getEventAttendances(args);
        assistanceList.value = attendance;
        console.log('Fetched attendance:', attendance);
    } catch (err) {
        console.error('Error fetching attendance: ', err);
        assistanceList.value = [];
    }
}

const onEventChange = () => {
    fetchAttendance();
}


const checkAttendance = async (item) => {
    if (!item) return;
    const email = item.userEmail || item.userEmail || item.user_email || item.email;
    const eventId = item.eventId || item.event_id || selectedEventId.value;
    if (!email || !eventId) {
        console.error('Check-in failed: Missing email or eventId');
        return;
    }

    try {
        await toProcessService.checkInAttendee({ email, eventId });
        const idx = assistanceList.value.findIndex(a => (a.ticketId && a.ticketId === item.ticketId) || (a.userId && a.userId === item.userId) || (a.userEmail && a.userEmail === item.userEmail));
        if (idx !== -1) {
            assistanceList.value[idx] = { ...assistanceList.value[idx], attended: true };
        }
        console.log(`Checked in: ${email} marked as attended`);
    } catch (err) {
        console.error('Error checking attendance: ', err);
    }
}

onMounted(async () => {
    await fetchAttendance();
    await fetchEvent(selectedEventId.value);
});

// Watch for route id so that we can fetch the new data
watch(
    () => props.id,
    async (newId, oldId) => {
        if (newId && newId !== oldId) {
            selectedEventId.value = newId;
            await fetchAttendance();
        }
    }
);
</script>

<template>
    <!-- We choose the event that we want to check assistance, with a select -->
    <!-- Then we'll receive the people that are supposed to assist to that event -->
    <!-- We'll show the data in a dataTable and there is gonna be a check to check the assistance -->
     <!-- We dont check with a select anymore xd -->
    <div class="p-4 rounded-lg">
        <div class="flex items-center justify-between mb-4">
            <router-link :to="{ name: 'events'}" class="p-button-secondary p-button-sm">
                <i class="pi pi-arrow-left mr-2"></i> Back to Events
            </router-link>
            <h2 class="text-3xl font-semibold m-0">
                {{ event ? `${event.name} Assistance` : 'Loading Event...' }}
            </h2>
            <!-- <Select 
                v-model="selectedEventId"
                :options="eventList" 
                option-label="name"
                option-value="eventId"
                placeholder="Select Event" 
                class="w-60" 
                size="small"
                @change="onEventChange"
            />  -->
        </div>
        <!-- <div class="flex items-center justify-between">
            <Card class="mb-4 ">
                <template #content>
                    <h3 class="m-0">Checked-In: </h3>
                </template>
            </Card>
            <Card class="mb-4">
                <template #content>
                    <h3 class="m-0">Total Assistance: </h3>
                </template>
            </Card>
            <Card class="mb-4">
                <template #content>
                    <h3 class="m-0">Pending Check-In: </h3>
                </template>
            </Card>
        </div> -->
        <DataTable
            :value="assistanceList"
            :sort-order="1"
            table-style="min-width: 50rem"
            striped-rows
        >
            <Column field="userName" header="User Name"></Column>
            <!-- <Column field="attended" header="Attended">
                <template #body="slotProps">
                    <Checkbox :model-value="slotProps.data.attended" disabled/>
                </template>
            </Column> -->
            <Column field="userSurname" header="User Surname"></Column>
            <Column field="userEmail" header="User Email"></Column>

            <Column header="Attendance Status">
                <template #body="slotProps">
                    <Button
                        :label="slotProps.data.attended ? 'Checked' : 'Check In'"
                        class="p-button-sm"
                        :class="slotProps.data.attended ? 'p-button-success' : 'p-button-secondary'"
                        :disabled="slotProps.data.attended"
                        @click="() => checkAttendance(slotProps.data)"
                    />
                </template>
            </Column>

        </DataTable>
    </div>
</template>