<script setup>
import { ref, onMounted } from 'vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';

</script>

<template>
    <div>
        <h2 class="text-3xl font-semibold mb-4">Event Assistance</h2>
        <p v-if="loading" class="text-blue-500">Loading...</p>
        <div v-else-if="people.length === 0" class="p-4 text-center border rounded-lg">
        No people found or data could not be loaded.
        </div>
    <!-- We choose the event that we want to check assistance, with a select -->
     <!-- Then we'll receive the people that are supposed to assist to that event -->
      <!-- We'll show the data in a dataTable and there is gonna be a select to check the assistance -->
    </div>
</template>