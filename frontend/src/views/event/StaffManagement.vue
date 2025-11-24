<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Dialog from 'primevue/dialog';
import Select from 'primevue/select';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import InputNumber from 'primevue/inputnumber';
import Button from 'primevue/button';
import Tabs from 'primevue/tabs';
import TabList from 'primevue/tablist';
import Tab from 'primevue/tab';
import TabPanels from 'primevue/tabpanels';
import TabPanel from 'primevue/tabpanel';
import { toProcessService } from '@/services/to-process';


const roles = ref([]);
const events = ref([]); 
const selectedEvent = ref(null);
const eventStaffList = ref([]);


const newRole = ref({ name: '', description: '' });

const newStaff = ref({ email: '', phoneNumber: '', address: '' });

const assignForm = ref({
    email: '',
    staffRoleId: null,
    cost: 0
});

const loading = ref(false);
const showAddStaffDialog = ref(false);
const showAssignDialog = ref(false);

const fetchRoles = async () => {
    try {
        const res = await toProcessService.getRoles({});
        roles.value = res;
        console.log('Roles fetched:', roles.value);
    } catch (e) {
        console.error('Error fetching roles:', e);
        roles.value = [];
    }
};

const createRole = async () => {
    if (!newRole.value.name) return;

    try {
        await toProcessService.createRoles({
            name: newRole.value.name,
            description: newRole.value.description
        });
        console.log('Role created');
        newRole.value = { name: '', description: '' }; 
        await fetchRoles(); 
    } catch (e) {
        console.error('Error creating role:', e);
    }
};

const createStaffUser = async () => {
    try {
        await toProcessService.addStaff({
            email: newStaff.value.email,
            phoneNumber: newStaff.value.phoneNumber,
            address: newStaff.value.address
        });
        console.log('Staff created');
        showAddStaffDialog.value = false;
        newStaff.value = { email: '', phoneNumber: '', address: '' }; 
    } catch (e) {
        console.error('Error creating staff:', e);
    }
};

const fetchEventStaff = async () => {
    if (!selectedEvent.value) return;
    loading.value = true;

    try {
        const eventId = selectedEvent.value.eventId || selectedEvent.value.id || selectedEvent.value;
        const res = await toProcessService.getAllStaffInEvent({
            eventId: eventId
        });
        eventStaffList.value = res;
        console.log('Event Staff:', eventStaffList.value);
    } catch (e) {
        console.error('Error fetching event staff:', e);
        eventStaffList.value = [];
    } finally {
        loading.value = false;
    }
};

const assignStaffToEvent = async () => {
    if (!selectedEvent.value || !assignForm.value.staffRoleId) return;

    try {
        const eventId = selectedEvent.value.eventId || selectedEvent.value.id || selectedEvent.value;
        await toProcessService.addStaffToEvent({
            email: assignForm.value.email,
            eventId: eventId,
            staffRoleId: assignForm.value.staffRoleId,
            cost: assignForm.value.cost
        });
        console.log('Assigned staff');
        showAssignDialog.value = false;
        assignForm.value = { email: '', staffRoleId: null, cost: 0 };
        await fetchEventStaff();
    } catch (e) {
        console.error('Error assigning staff:', e);
    }
};

const selectedEventObj = computed(() => {
    if (!selectedEvent.value) return null;
    const eventId = typeof selectedEvent.value === 'string' ? selectedEvent.value : selectedEvent.value.eventId || selectedEvent.value.id;
    return events.value.find(e => e.eventId === eventId) || null;
});

watch(selectedEvent, (newVal) => {
    if (newVal) fetchEventStaff();
});

const fetchEvents = async () => {
    try {
        const res = await toProcessService.getAllEvents({});
        events.value = res;
    } catch (e) {
        console.error('Error fetching events:', e);
        events.value = [];
    }
};

onMounted(async () => {
    await Promise.all([
        fetchRoles(),
        fetchEvents()
    ]);
});
</script>

<template>
    <div class="p-4 rounded-lg shadow-sm">
        <h2 class="text-3xl font-semibold mb-6">Staff Management</h2>

        <Tabs value="config">
            <TabList>
                <Tab value="config">Configuration</Tab>
                <Tab value="operations">Event Staffing</Tab>
            </TabList>
            
            <TabPanels>
                <TabPanel value="config">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
                        
                        <div class="p-4">
                            <h3 class="text-xl font-bold mb-4 ">Roles</h3>
                            <div class="flex flex-col gap-3 mb-4 p-3 ">
                                <span class="text-sm font-semibold">Create New Role</span>
                                <InputText v-model="newRole.name" placeholder="Role Name" />
                                <Textarea v-model="newRole.description" placeholder="Description" rows="2" autoResize />
                                <Button icon="pi pi-plus" label="Create Role" @click="createRole" size="small" />
                            </div>
                            
                            <h4 class="font-semibold text-sm mb-2">Available Roles</h4>
                            <div class=" max-h-64 overflow-y-auto">
                                <ul class="divide-y">
                                    <li v-for="role in roles" :key="role.staffRoleId" class="p-3 ">
                                        <div class="font-medium">{{ role.name }}</div>
                                        <div class="text-xs">{{ role.desc_txt }}</div>
                                    </li>
                                    <li v-if="roles.length === 0" class="p-4 text-center text-sm">
                                        No roles defined yet.
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <div class="p-4 h-fit">
                            <h3 class="text-xl font-bold mb-4">Staff Database</h3>
                            <p class="mb-6 text-sm">
                                Register new staff members into the system. You can assign them roles and costs later per event.
                            </p>
                            <Button label="Register New Staff Member" icon="pi pi-user-plus" class="w-full" @click="showAddStaffDialog = true" />
                        </div>
                    </div>
                </TabPanel>

                <TabPanel value="operations">
                    <div class="flex flex-col gap-6 mt-4">
                        <div class="flex items-center gap-4 p-6 rounded-lg border border-gray-200 ">
                            <div class="flex flex-col gap-1">
                                <label class="font-semibold">Active Event Context</label>
                                <span class="text-xs">Select an event to view schedules</span>
                            </div>
                            <Select 
                                v-model="selectedEvent" 
                                :options="events" 
                                optionLabel="name"
                                optionValue="eventId"
                                placeholder="Select an Event..." 
                                class="w-72"
                            />
                        </div>

                        <div v-if="selectedEvent" class="border rounded-lg overflow-hidden">
                            <div class=" p-4 border-b flex justify-between items-center">
                                <h3 class="font-bold text-lg">Staff In : {{ selectedEventObj?.name || 'Event' }}</h3>
                                <Button label="Assign Staff" icon="pi pi-plus" size="small" @click="showAssignDialog = true" />
                            </div>
                            
                            <DataTable :value="eventStaffList" :loading="loading" stripedRows tableStyle="min-width: 50rem">
                                <Column field="email" header="Staff Email"></Column>
                                <Column field="roleName" header="Role"></Column> 
                                <Column field="cost" header="Cost">
                                    <template #body="slotProps">
                                        ${{ slotProps.data.cost }}
                                    </template>
                                </Column>
                                <template #empty>
                                    <div class="text-center p-4 ">No staff assigned to this event yet.</div>
                                </template>
                            </DataTable>
                        </div>
                        
                        <div v-else class="text-center p-12 border-2 border-dashed rounded-lg">
                            <i class="pi pi-calendar text-4xl mb-2"></i>
                            <p>Please select an event above to manage its staff.</p>
                        </div>
                    </div>
                </TabPanel>
            </TabPanels>
        </Tabs>

        <Dialog v-model:visible="showAddStaffDialog" header="Register New Staff" modal class="w-full max-w-md">
            <div class="flex flex-col gap-4 pt-2">
                <div class="flex flex-col gap-2">
                    <label class="font-semibold text-sm">Email Address</label>
                    <InputText v-model="newStaff.email" placeholder="user@example.com" />
                </div>
                <div class="flex flex-col gap-2">
                    <label class="font-semibold text-sm">Phone Number</label>
                    <InputText v-model="newStaff.phoneNumber" placeholder="+1 555-0123" />
                </div>
                <div class="flex flex-col gap-2">
                    <label class="font-semibold text-sm">Address</label>
                    <Textarea v-model="newStaff.address" rows="2" />
                </div>
                <div class="flex justify-end gap-2 mt-4 border-t pt-4">
                    <Button label="Cancel" severity="secondary" @click="showAddStaffDialog = false" />
                    <Button label="Register" @click="createStaffUser" />
                </div>
            </div>
        </Dialog>

        <Dialog v-model:visible="showAssignDialog" header="Assign Staff to Event" modal class="w-full max-w-md">
            <div class="flex flex-col gap-4 pt-2">
                <p class="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                    Assigning to: <strong>{{ selectedEventObj?.name || 'Event' }}</strong>
                </p>
                
                <div class="flex flex-col gap-2">
                    <label class="font-semibold text-sm">Staff Email</label>
                    <InputText v-model="assignForm.email" placeholder="user@example.com" />
                    <small class="text-gray-400">Enter the email of the registered staff member.</small>
                </div>

                <div class="flex flex-col gap-2">
                    <label class="font-semibold text-sm">Role for this Event</label>
                    <Select 
                        v-model="assignForm.staffRoleId" 
                        :options="roles" 
                        optionLabel="name" 
                        optionValue="staffRoleId"
                        placeholder="Select Role" 
                        class="w-full" 
                    />
                </div>

                <div class="flex flex-col gap-2">
                    <label class="font-semibold text-sm">Cost</label>
                    <InputNumber v-model="assignForm.cost" mode="currency" currency="USD" locale="en-US" />
                </div>

                <div class="flex justify-end gap-2 mt-4 border-t pt-4">
                    <Button label="Cancel" severity="secondary" @click="showAssignDialog = false" />
                    <Button label="Assign Staff" @click="assignStaffToEvent" :disabled="!assignForm.email || !assignForm.staffRoleId" />
                </div>
            </div>
        </Dialog>
    </div>
</template>