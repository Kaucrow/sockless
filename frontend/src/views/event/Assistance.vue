<script setup>
import { ref, onMounted } from 'vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Select from 'primevue/select';
import Button from 'primevue/button';
import Card from 'primevue/card';
import Checkbox from 'primevue/checkbox';
import Paginator from 'primevue/paginator';
import { toProcessService } from '@/services/to-process';

const eventList = ref([]);
const assistanceList = ref([]);
const selectedEventId = ref(null);

const fetchEvents = async () => {
    try {
        const events = await toProcessService.getAllEvents(2, {});
        eventList.value = events;
    } catch (err) {
        console.error('Error fetching events: ', err);
    }
}

const fetchAttendance = async () => {
    if (!selectedEventId.value) {
        assistanceList.value = [];
        return;
    }
    try {
        const args = { eventId: selectedEventId.value };
        const attendance = await toProcessService.getEventAttendances(15, args);
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

onMounted(() => {
    fetchEvents();
});
</script>

<template>
    <!-- We choose the event that we want to check assistance, with a select -->
    <!-- Then we'll receive the people that are supposed to assist to that event -->
    <!-- We'll show the data in a dataTable and there is gonna be a check to check the assistance -->
    <div class="p-4 rounded-lg">
        <div class="flex items-center justify-between mb-4">
            <h2 class="text-3xl font-semibold m-0">Event Assistance</h2>
            <Select 
                v-model="selectedEventId"
                :options="eventList" 
                option-label="name"
                option-value="eventId"
                placeholder="Select Event" 
                class="w-60" 
                size="small"
                @change="onEventChange"
            /> 
        </div>
        <div class="flex items-center justify-between">
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
        </div>
        <DataTable
            :value="assistanceList"
            :sort-order="1"
            table-style="min-width: 50rem"
            striped-rows
        >
            <Column field="userId" header="employee name"></Column>
            <Column field="attended" header="Attended">
                <template #body="slotProps">
                    <Checkbox :model-value="slotProps.data.attended" disabled/>
                </template>
            </Column>

        </DataTable>
    </div>
</template>