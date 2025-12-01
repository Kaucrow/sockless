<script setup>
import { ref, onMounted, computed } from 'vue';
import Button from 'primevue/button';
import Select from 'primevue/select';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Card from 'primevue/card';
import Dialog from 'primevue/dialog';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import { toProcessService } from '@/services/to-process';

const allEvents = ref([]);
const paymentMethods = ref([]);

const selectedEvent = ref(null);
const eventTickets = ref([]);
const selectedTicketForPayment = ref(null);

const selectedPaymentMethod = ref(null);
const paymentAmount = ref(null);

const showTicketSelectionDialog = ref(false);
const isLoading = ref(false);
const errorMessage = ref(null);
const paymentResult = ref(null);

const ticketPrice = computed(() => {
    const p = selectedTicketForPayment.value ? selectedTicketForPayment.value.price : null;
    const n = Number(p);
    return Number.isFinite(n) ? n : null;
});

onMounted(async () => {
    isLoading.value = true;
    errorMessage.value = null;
    try {
        const eventsData = await toProcessService.getAllEvents({});
        allEvents.value = (Array.isArray(eventsData) ? eventsData : []).map(e => ({
            ...e,
            id: e.id ?? e.eventId ?? e.event_id ?? null
        }));

        const methodsData = await toProcessService.getPaymentMethods({});
        paymentMethods.value = Array.isArray(methodsData) ? methodsData : [];
    } catch (err) {
        console.error('Error fetching initial data:', err);
        errorMessage.value = 'Failed to load initial data.';
    } finally {
        isLoading.value = false;
    }
});

const onEventSelect = async () => {
    if (!selectedEvent.value) {
        eventTickets.value = [];
        selectedTicketForPayment.value = null;
        return;
    }

    isLoading.value = true;
    errorMessage.value = null;
    eventTickets.value = [];
    selectedTicketForPayment.value = null;

    try {
        const eventId = selectedEvent.value.id ?? selectedEvent.value.eventId ?? selectedEvent.value.event_id;
        if (!eventId) throw new Error('Selected event has no id/eventId');
        const args = { eventId };
        console.log('Fetching tickets with args:', args);
        const data = await toProcessService.getEventTickets(args);

        const rawList = Array.isArray(data) ? data : (Array.isArray(data?.tickets) ? data.tickets : []);
        eventTickets.value = rawList.map(t => {
            const rawPrice = t.price ?? t.cost ?? t.amount ?? t.priceStr ?? null;
            const priceNum = Number(rawPrice);
            return {
                ...t,
                price: Number.isFinite(priceNum) ? priceNum : null,
                totalAvailable: t.totalAvailable ?? t.available ?? t.quantity ?? null
            };
        });
        showTicketSelectionDialog.value = true;
    } catch (err) {
        console.error('Error fetching event tickets:', err);
        errorMessage.value = 'Failed to load tickets for selected event.';
    } finally {
        isLoading.value = false;
    }
};

const confirmTicketSelection = () => {
    if (!selectedTicketForPayment.value) {
        errorMessage.value = 'Please select a ticket type.';
        return;
    }
    showTicketSelectionDialog.value = false;
    const p = selectedTicketForPayment.value.price ?? selectedTicketForPayment.value.cost ?? null;
    paymentAmount.value = Number.isFinite(Number(p)) ? Number(p) : null;
    errorMessage.value = null;
};

const onTicketDialogHide = () => {
    if (!selectedTicketForPayment.value) {
        selectedEvent.value = null;
        paymentAmount.value = null;
        selectedPaymentMethod.value = null;
        errorMessage.value = null;
    }
};

const submitPayment = async () => {
    errorMessage.value = null;
    paymentResult.value = null;

    if (!selectedTicketForPayment.value || !selectedPaymentMethod.value || !paymentAmount.value || paymentAmount.value <= 0) {
        errorMessage.value = 'Please select ticket, payment method and enter a valid amount.';
        return;
    }

    isLoading.value = true;
    try {
        const ticketDescId = selectedTicketForPayment.value.ticketDescId ?? selectedTicketForPayment.value.id ?? selectedTicketForPayment.value.ticketId;
        const paymentMethodId = selectedPaymentMethod.value.id ?? selectedPaymentMethod.value.paymentMethodId ?? selectedPaymentMethod.value.methodId;
        const amount = Number(paymentAmount.value);

        if (!ticketDescId) throw new Error('Missing ticketDescId');
        if (!paymentMethodId) throw new Error('Missing payment method id');
        if (Number.isNaN(amount) || amount <= 0) throw new Error('Invalid amount');

        const args = {
            ticketDescId,
            payments: [{ paymentMethod: paymentMethodId, amount }]
        };

        console.log('Submitting payment args:', args);

        const response = await toProcessService.userPayForTicket(args);
        paymentResult.value = response;

        selectedEvent.value = null;
        selectedTicketForPayment.value = null;
        selectedPaymentMethod.value = null;
        paymentAmount.value = null;
    } catch (err) {
        console.error('Payment submission error:', err);
        errorMessage.value = 'Payment failed: ' + (err?.message || 'Unknown error');
    } finally {
        isLoading.value = false;
    }
};

</script>

<template>
    <div class="p-4">
        <h2 class="text-3xl font-semibold mb-4">Ticket Payment</h2>

        <Card>
            <template #content>
                <div v-if="isLoading" class="flex items-center justify-center">
                    <i class="pi pi-spin pi-spinner mr-2" style="font-size: 2rem"></i>
                    <p>Loading data...</p>
                </div>

                <div v-else class="p-fluid">
                    <div v-if="paymentResult" class="mb-4 text-green-700">
                        Payment successful.
                        <span v-if="paymentResult.difference !== undefined"> Difference: {{ paymentResult.difference }}</span>
                    </div>

                    <div class="field mb-4">
                        <label for="event" class="font-bold block mb-2">Select Event</label>
                        <Select id="event" v-model="selectedEvent" :options="allEvents" optionLabel="name"
                            placeholder="Select an Event" class="w-full" :disabled="isLoading" @change="onEventSelect" />
                    </div>

                    <div v-if="selectedTicketForPayment">
                        <h3 class="text-xl font-semibold mt-4 mb-3">Selected Ticket</h3>
                        <div class="field mb-4">
                            <label class="font-bold block mb-1">Price:</label>
                            <InputText :value="`$${ticketPrice !== null ? ticketPrice.toFixed(2) : '0.00'}`" disabled class="w-full" />
                        </div>
                    </div>

                    <div class="field mb-4">
                        <label for="paymentMethod" class="font-bold block mb-2">Payment Method</label>
                        <Select id="paymentMethod" v-model="selectedPaymentMethod" :options="paymentMethods"
                            optionLabel="name" placeholder="Select Payment Method" class="w-full" :disabled="isLoading || !selectedTicketForPayment"
                            :filter="true" />
                    </div>

                    <div class="field mb-4">
                        <label for="amount" class="font-bold block mb-2">Amount to Pay</label>
                        <InputNumber id="amount" v-model="paymentAmount" mode="currency" currency="USD" locale="en-US"
                            :min="0.01" :max="selectedTicketForPayment?.price" :disabled="isLoading || !selectedTicketForPayment" class="w-full" />
                    </div>

                    <div class="flex justify-content-end mt-4">
                        <Button label="Submit Payment" icon="pi pi-money-bill" class="p-button-primary"
                            @click="submitPayment" :loading="isLoading"
                            :disabled="!selectedTicketForPayment || !selectedPaymentMethod || !paymentAmount || paymentAmount <= 0" />
                    </div>
                </div>
            </template>
        </Card>

        <Dialog v-model:visible="showTicketSelectionDialog" header="Select Ticket Type" modal class="w-full max-w-2xl"
            @hide="onTicketDialogHide">
            <div v-if="isLoading" class="flex items-center justify-center">
                <i class="pi pi-spin pi-spinner mr-2" style="font-size: 1.5rem"></i>
                <p>Loading tickets...</p>
            </div>
            <div v-else>
                <div v-if="eventTickets.length === 0" class="p-2 text-gray-600">No tickets available for this event.</div>
                <DataTable v-else :value="eventTickets" selectionMode="single" v-model:selection="selectedTicketForPayment"
                    dataKey="ticketDescId" class="p-datatable-sm">
                    <Column selectionMode="single" headerStyle="width: 3rem"></Column>
                    <Column field="name" header="Ticket Type"></Column>
                    <Column field="price" header="Price">
                        <template #body="slotProps">
                            <span v-if="Number.isFinite(slotProps.data.price)">${{ slotProps.data.price.toFixed(2) }}</span>
                            <span v-else>—</span>
                        </template>
                    </Column>
                    <Column field="totalAvailable" header="Available"></Column>
                </DataTable>
            </div>
            <template #footer>
                <Button label="Select" icon="pi pi-check" @click="confirmTicketSelection" :disabled="!selectedTicketForPayment" />
            </template>
        </Dialog>
    </div>
</template>