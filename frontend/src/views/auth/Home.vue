<script setup>
import { ref, onMounted, computed } from 'vue';
import Card from 'primevue/card';
import Button from 'primevue/button';
import { toProcessService } from '@/services/to-process';
import { useUserStore } from '@/stores/user';
import { useRouter } from 'vue-router';

const router = useRouter();
const userStore = useUserStore();

const allEvents = ref([]);
const myAttendances = ref([]);
const loading = ref(false);
const error = ref(null);

const formatDate = (d) => {
  if (!d) return '';
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return '';
  return dt.toLocaleString();
};

const upcoming = computed(() => {
  // sort by date and return next 5
  const items = allEvents.value
    .map(e => ({ ...e, startDate: e.startDt ?? e.startDate ?? e.start }))
    .filter(e => e.startDate)
    .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
  return items.slice(0, 5);
});

onMounted(async () => {
  loading.value = true;
  error.value = null;
  try {
    await userStore.initializeUser();

    const eventsData = await toProcessService.getAllEvents({});
    allEvents.value = Array.isArray(eventsData) ? eventsData : (Array.isArray(eventsData?.events) ? eventsData.events : []);

    const email = userStore.email;
    if (email) {
      const att = await toProcessService.userGetUserAttendances({ email });
      myAttendances.value = Array.isArray(att) ? att : (Array.isArray(att?.attendances) ? att.attendances : []);

      const ids = Array.from(new Set(myAttendances.value
        .map(a => a.eventId ?? a.id ?? a.event_id)
        .filter(Boolean)));

      if (ids.length) {
        try {
          const promises = ids.map(id =>
            toProcessService.getEvent({ eventId: id })
              .then(ev => ({ id, name: ev?.name || ev?.title || ev?.eventName }))
              .catch(() => ({ id, name: null }))
          );

          const results = await Promise.all(promises);
          const nameMap = Object.fromEntries(results.map(r => [r.id, r.name]));

          myAttendances.value = myAttendances.value.map(a => {
            const id = a.eventId ?? a.id ?? a.event_id;
            return { ...a, eventName: a.eventName || nameMap[id] || null };
          });
        } catch (e) {
          console.warn('Failed to get the attendances with event names', e);
        }
      }
    } else {
      myAttendances.value = [];
    }
  } catch (err) {
    console.error('Home data load error:', err);
    error.value = err?.response?.data || err?.message || String(err);
  } finally {
    loading.value = false;
  }
});

const goToEvent = (id) => {
  if (!id) return;
  router.push({ name: 'event-management', params: { id } });
};
</script>

<template>
  <div class="home-grid p-4">
    <h1 class="home-title">Welcome to Sockless</h1>
    <p>Try to sock less</p>

    <div v-if="error" class="p-2 text-red-600">Error loading dashboard: {{ error }}</div>

    <div class="cards-grid">
      <Card class="card">
        <template #title>
          Upcoming Events
        </template>
        <template #content>
          <div v-if="loading" class="p-2">Loading events...</div>
          <ul v-else>
            <li v-for="evt in upcoming" :key="evt.id || evt.eventId" class="mb-3">
              <div class="flex items-center justify-between">
                <div>
                  <div class="font-semibold">{{ evt.name || evt.title || 'Untitled event' }}</div>
                  <div class="text-sm text-gray-500">{{ formatDate(evt.startDate) }}</div>
                </div>
                <div>
                  <Button label="Manage" class="p-button-sm" @click="() => goToEvent(evt.id ?? evt.eventId)" />
                </div>
              </div>
            </li>
            <li v-if="upcoming.length === 0" class="text-gray-600">No upcoming events.</li>
          </ul>
        </template>
      </Card>

      <Card class="card">
        <template #title>
          Tickets You Own
        </template>
        <template #content>
          <div v-if="loading" class="p-2">Loading your events...</div>
          <ul v-else>
            <li v-for="a in myAttendances" :key="a.attendanceId || a.eventId || a.event_id" class="mb-3">
              <div class="flex items-center justify-between">
                <div>
                  <div class="font-semibold">
                    {{ a.ticket_name || a.ticketName || a.eventName || a.name || 'Event' }}
                  </div>
                  <div class="text-sm text-gray-500">
                    <span v-if="(a.ticket_cost ?? a.ticketCost) !== undefined">
                      ${{ (a.ticket_cost ?? a.ticketCost) }}
                    </span>
                    <span v-else class="text-gray-500">Ticket</span>
                  </div>
                </div>
                <div>
                  <Button label="View Event" class="p-button-sm" @click="() => goToEvent(a.eventId ?? a.id ?? a.event_id)" />
                </div>
              </div>
            </li>
            <li v-if="myAttendances.length === 0" class="text-gray-600">You are not registered for any events.</li>
          </ul>
        </template>
      </Card>
    </div>
  </div>
</template>

<style scoped>
h1 {
  color: var(--p-text-color);
  margin-bottom: 1rem;
}

p {
  color: var(--p-text-muted-color);
  line-height: 1.6;
}
.home-grid { max-width: 1100px; margin: 0 auto; }
.home-title { margin-bottom: 1rem; color: var(--p-text-color); }
.cards-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.card { padding: 0.5rem; }
@media (max-width: 768px) { .cards-grid { grid-template-columns: 1fr; } }
</style>