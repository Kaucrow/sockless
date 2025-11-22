<script setup>
import { ref, watch, onMounted } from 'vue';
import Button from 'primevue/button';
import Card from 'primevue/card';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Message from 'primevue/message';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Dialog from 'primevue/dialog';
import FileUpload from 'primevue/fileupload';
import Select from 'primevue/select';
import ConfirmDialog from 'primevue/confirmdialog';
import { useConfirm } from 'primevue/useconfirm';
import { toProcessService } from '@/services/to-process';
import { toProcessImgService } from '@/services/to-process-img';

const props = defineProps({
    id: {
        type: String,
        required: true
    }
});

const eventId = ref(props.id);
const event = ref(null);
const loading = ref(true);
const error = ref(null);

const eventFlyer = ref(null);
const flyerPreview = ref(null);
const fileUploadRef = ref(null);
const displayChangeFlyerDialog = ref(false);

const locations = ref([]);
const selectedLocation = ref(null);
const displayCreateLocationDialog = ref(false);
const newLocation = ref({
    country: '',
    city: '',
    name: ''
});

const reservation = ref({
    locationId: null,
    cost: null
});
const savingReservation = ref(false);
const costFromEndpoint = ref(false);

const attendeeSearch = ref('');
const displayAddAttendeeModal = ref(false);
const newAttendee = ref({ name: '', email: '' });

const confirm = useConfirm();   

const fetchEventFlyer = async () => {
    try {
        const flyerData = await toProcessService.getEventFlyer({ eventId: eventId.value });
        if (flyerData && flyerData.url) {
            eventFlyer.value = flyerData.url;
            flyerPreview.value = `http://localhost:8000/uploads/${flyerData.url}`;
        } else {
            eventFlyer.value = null;
            flyerPreview.value = null;
        }
    } catch (err) {
        if (err.response && err.response.status !== 400 && err.response.status !== 404) {
            console.error('Error fetching event flyer: ', err);
        }
        eventFlyer.value = null;
        flyerPreview.value = null;
    }
};

const openChangeFlyerDialog = () => {
    displayChangeFlyerDialog.value = true;
};

const uploadFlyer = async (event) => {
    const file = event.files ? event.files[0] : null;
    if (!file) return;

    try {
        const formData = new FormData();
        formData.append('imageFile', file);
        formData.append('tx', '9');
        formData.append('args', JSON.stringify({ eventId: eventId.value }));

        await toProcessImgService.setEventFlyer(formData);

        console.log('Flyer uploaded successfully');
        displayChangeFlyerDialog.value = false;
        await fetchEventFlyer();
        if (fileUploadRef.value) {
            fileUploadRef.value.clear();
        }
    } catch (err) {
        console.error('Error uploading flyer: ', err);
    }
};

const removeFlyer = async () => {
    confirm.require({
        message: 'Are you sure you want to remove the flyer?',
        header: 'Remove Flyer',
        icon: 'pi pi-exclamation-triangle',
        accept: async () => {
            try {
                eventFlyer.value = null;
                flyerPreview.value = null;
                console.log('Flyer removed');
            } catch (err) {
                console.error('Error removing flyer: ', err);
            }
        }
    })
};

const fetchAllLocations = async () => {
    try {
        const locationsData = await toProcessService.getAllLocations({});
        locations.value = Array.isArray(locationsData) ? locationsData : [];
    } catch (err) {
        console.error('Error fetching locations: ', err);
        locations.value = [];
    }
};

const openCreateLocationDialog = () => {
    newLocation.value = { country: '', city: '', name: '' };
    displayCreateLocationDialog.value = true;
};

const createLocation = async () => {
    if (!newLocation.value.country || !newLocation.value.city || !newLocation.value.name) {
        return;
    }

    try {
        const locationData = await toProcessService.createLocation({
            country: newLocation.value.country,
            city: newLocation.value.city,
            name: newLocation.value.name
        });
        
        console.log('Location created successfully');
        displayCreateLocationDialog.value = false;
        await fetchAllLocations();
        
        if (locationData && locationData.locationId) {
            selectedLocation.value = locationData.locationId;
            reservation.value.locationId = locationData.locationId;
        }
    } catch (err) {
        console.error('Error creating location: ', err);
    }
};

const fetchEventReservation = async () => {
    try {
        const reservationData = await toProcessService.getEventReservation({ eventId: eventId.value });
        if (reservationData) {
            let foundLocationId = null;
            const locationName = reservationData.locationName || reservationData.location_name;
            if (reservationData.country && reservationData.city && locationName) {
                const matchingLocation = locations.value.find(loc => 
                    loc.country === reservationData.country &&
                    loc.city === reservationData.city &&
                    loc.name === locationName
                );
                if (matchingLocation) {
                    foundLocationId = matchingLocation.locationId || matchingLocation.location_id;
                }
            }
            
            reservation.value = {
                locationId: foundLocationId,
                cost: reservationData.cost || null
            };
            selectedLocation.value = foundLocationId;
            
            const hasCost = reservationData.cost !== null && reservationData.cost !== undefined && reservationData.cost !== '';
            costFromEndpoint.value = hasCost;
        } else {
            // No reservation data returned we allow editing
            reservation.value = { locationId: null, cost: null };
            selectedLocation.value = null;
            costFromEndpoint.value = false;
        }
    } catch (err) {
        // If endpoint errors ("Failed to find reservation"), assume no existing reservation so we allow editing
        console.error('Error fetching reservation (assuming no existing reservation): ', err);
        reservation.value = { locationId: null, cost: null };
        selectedLocation.value = null;
        costFromEndpoint.value = false;
    }
};

const saveReservation = async () => {
    if (!reservation.value.locationId || reservation.value.cost === null) {
        return;
    }

    savingReservation.value = true;
    try {
        await toProcessService.setEventReservation({
            eventId: eventId.value,
            locationId: reservation.value.locationId,
            cost: reservation.value.cost
        });
        
        console.log('Reservation saved successfully');
        costFromEndpoint.value = true;
    } catch (err) {
        console.error('Error saving reservation: ', err);
    } finally {
        savingReservation.value = false;
    }
};

const onLocationChange = () => {
    // Don't allow location change if it came from endpoint (same as cost)
    if (costFromEndpoint.value) {
        selectedLocation.value = reservation.value.locationId;
        return;
    }
    reservation.value.locationId = selectedLocation.value;
    // If location changes, reset cost and allow editing (unless cost was from endpoint)
    if (!costFromEndpoint.value) {
        reservation.value.cost = null;
    }
};

const fetchEvent = async (id) => {
    loading.value = true;
    error.value = null;
    try {
        const eventData = await toProcessService.getEvent({ eventId: id });
        
        event.value = {
            ...eventData,
            eventId: eventData.eventId || id,
            name: eventData.name || '',
            attendees: eventData.attendees || []
        };
    } catch (err) {
        console.error('Error fetching event details: ', err);
        error.value = err.message || 'Failed to fetch event details.';
    } finally {
        loading.value = false;
    }
};

const fetchAttendees = async () => {
    if (event.value && event.value.attendees) {
    }
};

const openAddAttendeeModal = () => {
    newAttendee.value = { name: '', email: '' };
    displayAddAttendeeModal.value = true;
};

const addAttendee = async () => {
    if (!newAttendee.value.email || !event.value) {
        console.log('Please enter an email for the new attendee.');
        return;
    }

    try {
        await toProcessService.checkInAttendee({
            email: newAttendee.value.email,
            eventId: eventId.value
        });
        
        console.log('Attendee checked in successfully');
        displayAddAttendeeModal.value = false;
    
    } catch (err) {
        console.error('Error checking in attendee: ', err);
    }
};

const removeAttendee = async (attendeeId) => {
    if (!event.value || !event.value.attendees) return;

    confirm.require({
        message: 'Are you sure you want to remove this attendee?',
        header: 'Remove Attendee',
        icon: 'pi pi-exclamation-triangle',
        accept: async () => {
            try {
                event.value.attendees = event.value.attendees.filter(
                    (att) => att.id !== attendeeId
                );
                console.log('Attendee removed from event.');
            } catch (err) {
                console.error('Error removing attendee: ', err);
            }
        }
    });
};

onMounted(async () => {
    await Promise.all([
        fetchEvent(props.id),
        fetchEventFlyer(),
        fetchAllLocations()
    ]);
    // Fetch reservation after locations are loaded to match location properly
    await fetchEventReservation();
});

watch(
    () => props.id,
    async (newId, oldId) => {
        if (newId && newId !== oldId) {
            eventId.value = newId;
            await Promise.all([
                fetchEvent(newId),
                fetchEventFlyer(),
                fetchAllLocations()
            ]);
            await fetchEventReservation();
        }
    },
    { immediate: true }
);
</script>

<template>
    <div class="p-4 rounded-lg">
        <div class="flex items-center justify-between mb-4">
            <router-link :to="{ name: 'events' }" class="p-button p-button-secondary p-button-sm">
                <i class="pi pi-arrow-left mr-2"></i> Back to Events
            </router-link>
            <h2 class="text-3xl font-semibold m-0">
                {{ event ? ` ${event.name}` : 'Loading Event...' }}
            </h2>
        </div>

        <div v-if="loading" class="text-center p-5">
            <p class="mt-3 text-lg">Loading event details...</p>
        </div>

        <div v-else-if="error" class="p-card p-p-4 p-shadow-1">
            <Message severity="error" :closable="false">{{ error }}</Message>
            <p class="p-mt-3">Could not load event with ID: {{ eventId }}.</p>
        </div>

        <div v-else-if="event" class="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">

            <Card class="col-span-full p-shadow-2 mt-4">
                <template #title>Attendees Management</template>
                <template #subtitle>Add or remove attendees for this event.</template>
                <template #content>
                    <div class="flex items-center gap-2 mb-4">
                        <span class="p-input-icon-left flex-grow">
                            <InputText v-model="attendeeSearch" placeholder="Search or add attendee" class="w-full" />
                        </span>
                        <Button
                            label="Add New Attendee"
                            icon="pi pi-plus"
                            class="p-button-secondary"
                            @click="openAddAttendeeModal"
                        />
                    </div>
                    <DataTable :value="event?.attendees || []" responsiveLayout="scroll" striped-rows>
                        <Column field="name" header="Attendee Name"></Column>
                        <Column field="email" header="Email"></Column>
                        <Column header="Actions">
                            <template #body="slotProps">
                                <Button
                                    icon="pi pi-trash"
                                    severity="danger"
                                    text
                                    rounded
                                    aria-label="Remove"
                                    @click="removeAttendee(slotProps.data.id)"
                                />
                            </template>
                        </Column>
                        <template #empty>
                            No attendees added yet.
                        </template>
                    </DataTable>
                </template>
            </Card>
            
            <Card class="col-span-1 p-shadow-2">
                <template #title>Event Flyer</template>
                <template #content>
                    <div class="flex flex-col gap-4">
                        <div v-if="flyerPreview" class="border rounded-lg p-4 bg-surface-50 dark:bg-surface-800">
                            <img 
                                :src="flyerPreview" 
                                alt="Event Flyer" 
                                class="w-full rounded-lg object-contain max-h-64"
                                @error="flyerPreview = null"
                            />
                        </div>
                        <div v-else class="border rounded-lg p-8 bg-surface-50 dark:bg-surface-800 text-center">
                            <i class="pi pi-image text-4xl text-surface-400 mb-2"></i>
                            <p class="text-surface-500">No flyer uploaded</p>
                        </div>
                        <div class="flex gap-2">
                            <Button
                                label="Change Flyer"
                                icon="pi pi-upload"
                                @click="openChangeFlyerDialog"
                                class="flex-1"
                            />
                            <Button
                                label="Remove"
                                icon="pi pi-trash"
                                severity="secondary"
                                text
                                :disabled="!flyerPreview"
                                @click="removeFlyer"
                            />
                        </div>
                    </div>
                </template>
            </Card>

            <Card class="col-span-1 p-shadow-2">
                <template #title>Location & Reservation</template>
                <template #content>
                    <div class="flex flex-col gap-4">
                        <div>
                            <label for="locationSelect" class="block text-surface-700 dark:text-surface-300 font-bold mb-2">
                                Location
                            </label>
                            <div class="flex gap-2">
                                <Select
                                    id="locationSelect"
                                    v-model="selectedLocation"
                                    :options="locations"
                                    optionLabel="name"
                                    optionValue="locationId"
                                    placeholder="Select a location"
                                    class="flex-1"
                                    :disabled="costFromEndpoint"
                                    @change="onLocationChange"
                                />
                                <Button
                                    icon="pi pi-plus"
                                    label="New"
                                    severity="secondary"
                                    :disabled="costFromEndpoint"
                                    @click="openCreateLocationDialog"
                                />
                            </div>
                            <p v-if="costFromEndpoint" class="text-sm text-surface-500 mt-2">
                                <i class="pi pi-info-circle mr-1"></i>
                                Location is set and cannot be modified.
                            </p>
                        </div>
                        <div>
                            <label for="reservationCost" class="block text-surface-700 dark:text-surface-300 font-bold mb-2">
                                Cost
                            </label>
                            <InputNumber
                                id="reservationCost"
                                v-model="reservation.cost"
                                mode="decimal"
                                :min="0"
                                :maxFractionDigits="2"
                                showButtons
                                class="w-full"
                                prefix="$"
                                :disabled="costFromEndpoint"
                            />
                            <p v-if="costFromEndpoint" class="text-sm text-surface-500 mt-2">
                                <i class="pi pi-info-circle mr-1"></i>
                                Cost is set and cannot be modified.
                            </p>
                        </div>
                        <Button
                            label="Save Reservation"
                            icon="pi pi-save"
                            @click="saveReservation"
                            :loading="savingReservation"
                            :disabled="!selectedLocation || reservation.cost === null || costFromEndpoint"
                            class="mt-2"
                        />
                    </div>
                </template>
            </Card>            
        </div>

        <!-- Modalsssssssss -->

        <Dialog
            v-model:visible="displayChangeFlyerDialog"
            modal
            header="Upload Event Flyer"
            :style="{ width: '30rem' }"
        >
            <div class="flex flex-col gap-4">
                <FileUpload
                    ref="fileUploadRef"
                    mode="basic"
                    accept="image/*"
                    :maxFileSize="10000000"
                    @select="uploadFlyer"
                    chooseLabel="Choose Image"
                />
                <p class="text-sm text-surface-500">Select an image file to upload as the event flyer.</p>
            </div>
            <template #footer>
                <Button
                    label="Cancel"
                    icon="pi pi-times"
                    text
                    @click="displayChangeFlyerDialog = false"
                />
            </template>
        </Dialog>

        <Dialog
            v-model:visible="displayCreateLocationDialog"
            modal
            header="Create New Location"
            :style="{ width: '30rem' }"
        >
            <div class="flex flex-col gap-4">
                <div>
                    <label for="locationCountry" class="block text-surface-700 dark:text-surface-300 font-bold mb-2">Country</label>
                    <InputText id="locationCountry" v-model="newLocation.country" class="w-full" />
                </div>
                <div>
                    <label for="locationCity" class="block text-surface-700 dark:text-surface-300 font-bold mb-2">City</label>
                    <InputText id="locationCity" v-model="newLocation.city" class="w-full" />
                </div>
                <div>
                    <label for="locationName" class="block text-surface-700 dark:text-surface-300 font-bold mb-2">Name</label>
                    <InputText id="locationName" v-model="newLocation.name" class="w-full" />
                </div>
            </div>
            <template #footer>
                <Button
                    label="Cancel"
                    icon="pi pi-times"
                    text
                    @click="displayCreateLocationDialog = false"
                />
                <Button
                    label="Create Location"
                    icon="pi pi-check"
                    @click="createLocation"
                    :disabled="!newLocation.country || !newLocation.city || !newLocation.name"
                />
            </template>
        </Dialog>

        <Dialog
            v-model:visible="displayAddAttendeeModal"
            modal
            header="Add New Attendee"
            :style="{ width: '30rem' }"
        >
            <div class="flex flex-col gap-4">
                <div>
                    <label for="newAttendeeName" class="block text-surface-700 dark:text-surface-300 font-bold mb-2">Name (Optional)</label>
                    <InputText id="newAttendeeName" v-model="newAttendee.name" class="w-full" placeholder="Optional name for reference" />
                </div>
                <div>
                    <label for="newAttendeeEmail" class="block text-surface-700 dark:text-surface-300 font-bold mb-2">Email <span class="text-red-500">*</span></label>
                    <InputText id="newAttendeeEmail" v-model="newAttendee.email" type="email" class="w-full" placeholder="user@example.com" required />
                </div>
            </div>
            <template #footer>
                <Button
                    label="Cancel"
                    icon="pi pi-times"
                    text
                    @click="displayAddAttendeeModal = false"
                />
                <Button
                    label="Add Attendee"
                    icon="pi pi-check"
                    @click="addAttendee"
                    :disabled="!newAttendee.email"
                />
            </template>
        </Dialog>
        <ConfirmDialog />
    </div>
</template>

