<script setup>
import { onMounted, ref } from 'vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import DatePicker from 'primevue/datepicker';
import Chip from 'primevue/chip';
import Paginator from 'primevue/paginator';
import { toProcessService } from '@/services/to-process';

const eventList = ref([]);
const createVisible = ref(false);
const editVisible = ref(false);

const editingEvent = ref(null);

const newEvent = ref({
    name: '',
    startDate: null,
    endDate: null,
    description: ''
});

const BASE_HOUR_UTC = 9;
const BASE_MINUTE_UTC = 0;
const BASE_SECOND_UTC = 0;
const BASE_MILLISECOND_UTC = 0;

const combineDateWithBaseTimeUTC = (date) => {
    if (!date) return null;
    const combinedDate = new Date(date);
    combinedDate.setUTCHours(BASE_HOUR_UTC, BASE_MINUTE_UTC, BASE_SECOND_UTC, BASE_MILLISECOND_UTC);
    return combinedDate.toISOString();
};

const createEvent = async () => {
    if (!newEvent.value.name || !newEvent.value.startDate || !newEvent.value.endDate || !newEvent.value.description) {
        console.log('Please fill in all required fields (Name, Start Date, End Date, description).');
        return;
    }

    const eventArgs = {
        name: newEvent.value.name,
        startDt: combineDateWithBaseTimeUTC(newEvent.value.startDate),
        endDt: combineDateWithBaseTimeUTC(newEvent.value.endDate),
        description: newEvent.value.description || '', 
    };

    try {
        await toProcessService.createEvent(eventArgs);
        console.log('Event created successfully!');
        createVisible.value = false;
        fetchEvents(); // Re-fetch events to update the list
        resetNewEvent();
    } catch (err) {
        console.error('Error creating event: ', err);
        alert('Failed to create event. Please try again.');
    }
};

const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);

    const options = {
        year: 'numeric',
        month: 'short', 
        day: 'numeric',
        hour: '2-digit', 
        minute: '2-digit', 
        // second: '2-digit', 
        // timeZoneName: 'short', 
    };
    return new Intl.DateTimeFormat('en-US', options).format(date);
};

const resetNewEvent = () => {
    newEvent.value = {
        name: '',
        startDate: null,
        endDate: null,
        description: ''
    };
};

const fetchEvents = async () => {
    try {
        const events = await toProcessService.getAllEvents({});
        eventList.value = events.map(e => ({
            ...e,
            description: e.description ?? e.descTxt ?? ''
        }));
        console.log('Fetched events: ', events);
    } catch (err) {
        console.error('Error fetching events: ', err);
    }
}

const editEvent = (event) => {
    editingEvent.value = {
        ...event,
        description: event.description ?? event.descTxt ?? ''
    };
    if (editingEvent.value.startDt) {
        editingEvent.value.startDate = new Date(editingEvent.value.startDt);
    } else {
        editingEvent.value.startDate = null;
    }
    if (editingEvent.value.endDt) {
        editingEvent.value.endDate = new Date(editingEvent.value.endDt);
    } else {
        editingEvent.value.endDate = null;
    }
    editVisible.value = true;
};

const updateEvent = async () => {
    if (!editingEvent.value.name || !editingEvent.value.startDate || !editingEvent.value.endDate || !editingEvent.value.description) {
        console.log('Please fill in all required fields (Name, Start Date, End Date, description).');
        return;
    }

    const eventArgs = {
        eventId: editingEvent.value.eventId,
        name: editingEvent.value.name,
        startDt: combineDateWithBaseTimeUTC(editingEvent.value.startDate),
        endDt: combineDateWithBaseTimeUTC(editingEvent.value.endDate),
        description: editingEvent.value.description || '', 
    };

    try {
        await toProcessService.updateEvent(eventArgs);
        console.log('Event updated successfully!');
        editVisible.value = false;
        fetchEvents(); 
        editingEvent.value = null;
    } catch (err) {
        console.error('Error updating event: ', err);
        alert('Failed to update event. Please try again.');
    }
}

onMounted(() => {
    fetchEvents();
});
</script>
<template>
    <div class="p-4 rounded-lg">
        <div class="flex items-center justify-between mb-4">
            <h2 class="text-3xl font-semibold m-0">Event List</h2>
            <Button label="Create New Event" @click="createVisible = true" />
        </div>
        <Dialog v-model:visible="createVisible" modal header="Create Event" :style="{ width: '25rem' }">
            <span class="text-surface-500 dark:text-surface-400 block mb-8">Create a new Event.</span>
            <div class="flex flex-col gap-4">
                <InputText placeholder="Event Name" class="w-full" v-model="newEvent.name" />
                <DatePicker 
                    placeholder="Event Date Start" 
                    class="w-full" 
                    v-model="newEvent.startDate"
                    showTime 
                    hourFormat="12" 
                    showClear 
                    variant="filled" 
                    showIcon 
                    show-seconds 
                    fluid
                />
                <DatePicker 
                    placeholder="Event Date End" 
                    class="w-full" 
                    v-model="newEvent.endDate"
                    showTime 
                    hourFormat="12" 
                    showClear 
                    variant="filled" 
                    showIcon 
                    show-seconds 
                    fluid
                />
                <InputText placeholder="Description" class="w-full" v-model="newEvent.description" />
                <Button label="Create Event" class="mt-4" @click="createEvent" />
            </div>
        </Dialog>

        <Dialog v-model:visible="editVisible" modal header="Edit Event" :style="{ width: '25rem' }">
            <template v-if="editingEvent">
                <span class="text-surface-500 dark:text-surface-400 block mb-8">Edit the Event details.</span>
                <div class="flex flex-col gap-4">
                    <InputText placeholder="Event Name" class="w-full" v-model="editingEvent.name" />
                    <DatePicker 
                        placeholder="Event Date Start" 
                        class="w-full" 
                        v-model="editingEvent.startDate"
                        showTime 
                        hourFormat="12" 
                        showClear 
                        variant="filled" 
                        showIcon 
                        show-seconds 
                        fluid
                    />
                    <DatePicker 
                        placeholder="Event Date End" 
                        class="w-full" 
                        v-model="editingEvent.endDate"
                        showTime 
                        hourFormat="12" 
                        showClear 
                        variant="filled" 
                        showIcon 
                        show-seconds 
                        fluid
                    />
                    <InputText placeholder="Description" class="w-full" v-model="editingEvent.description" />
                    <Button label="Update Event" class="mt-4" @click="updateEvent" />
                </div>
            </template>
        </Dialog>
        <DataTable
            :value="eventList"
            :sort-order="1"
            table-style="min-width: 50rem"
            striped-rows
        >
            <Column field="name" header="Event Name"></Column>
            <Column field="startDt" header="Event Date Start">
                <template #body="slotProps">
                    {{  formatDate(slotProps.data.startDt)  }}
                </template>
            </Column>
            <Column field="endDt" header="Event Date End">
                <template #body="slotProps">
                    {{  formatDate(slotProps.data.endDt)  }}
                </template>
            </Column>
            <Column field="descTxt" header="Description"></Column>
            <Column header="Actions" :exportable="false" style="min-width: 8rem;">
                <template #body="slotProps">
                    <div class="flex gap-2">
                        <Button 
                            icon="pi pi-pencil"
                            severity="info"
                            text
                            rounded
                            aria-label="Edit"
                            @click="editEvent(slotProps.data)"
                        />
                    <router-link :to="{name: 'event-management', params: { id: slotProps.data.eventId }}">
                        <Button 
                            icon="pi pi-eye"
                            severity="secondary"
                            text
                            rounded
                            aria-label="View Details"
                        />
                    </router-link>
                    <!-- <router-link :to="{name: 'event-assistance'}"> maybe not)?
                        <Button 
                            icon="pi pi-users"
                            severity="help"
                            text
                            rounded
                            aria-label="View Assistance"
                        />
                    </router-link> -->
                    </div>
                </template>
            </Column>
        </DataTable>
    </div>
</template>