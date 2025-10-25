<script setup>
import { ref, onMounted } from 'vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import MultiSelect from 'primevue/multiselect';
import { maintenanceService } from '@/services/maintenance';

const menuItems = ref([]);
const availableProfiles = ref([]);
const loading = ref(true);


/**
 * Converts the nested structure into a array for the DataTable
 * From -> { subsystem: { class: { method: [profiles] } } }
 * To -> [{ id: string, subsystem: string, class: string, methodName: string, fullMethod: string, profiles: string[] }]
 */
const flattenMenuData = (data) => {
  const flatData = [];
  for (const subsystem in data) {
    for (const menuName in data[subsystem]) {
      flatData.push({
        id: `${subsystem}:${menuName}`,
        subsystem: subsystem,
        menuName: menuName,
        fullMenu: `${subsystem}/${menuName}`,
        // multiselect will bind to the profiles array
        profiles: data[subsystem][menuName] || [] 
      });
    }
  }
  return flatData;
}

const handleProfileChange = async (newProfiles, rowData) => {
  const oldProfiles = rowData.profiles;
  const { subsystem, menuName } = rowData;

  const profilesToRemove = oldProfiles.filter(profile => !newProfiles.includes(profile));

  const profilesToAdd = newProfiles.filter(profile => !oldProfiles.includes(profile));

  rowData.profiles = newProfiles;

  try {
    await Promise.all([
      ...profilesToAdd.map(profile => 
        maintenanceService.addMenuProfile(profile, subsystem, menuName)
      ),
      ...profilesToRemove.map(profile => 
        maintenanceService.removeMenuProfile(profile, subsystem, menuName)
      )
    ]);
  } catch (error) {
    console.error('Error updating menu profiles:', error);
    rowData.profiles = oldProfiles; // revert on error
  }
}

onMounted(async () => {
  try {
    const [profileNames, menuData] = await Promise.all([
      maintenanceService.getAvailableProfiles(),
      maintenanceService.getMenuData()
    ]);

    availableProfiles.value = profileNames;

    menuItems.value = flattenMenuData(menuData);

  } catch (error) {
    console.error('Failed to load initial data:', error);
  } finally {
    loading.value = false;
  }
})

</script>


<template>
  <div class="p-4 rounded-lg bg-white">
    <h2 class="text-3xl font-semibold mb-4 text-gray-800">Menu Management</h2>
    <p v-if="loading" class="text-blue-500">Loading menu permissions...</p>
    <div v-else-if="menuItems.length === 0" class="p-4 text-center border rounded-lg bg-gray-50">
      No menus found or data could not be loaded.
    </div>
    <DataTable 
      v-else
      :value="menuItems" 
      :loading="loading"
      sort-field="fullMenu" 
      :sort-order="1"
      table-style="min-width: 50rem"
      striped-rows
    >
      <Column field="fullMenu" header="Menu Name" :sortable="true" class="font-medium text-gray-700 w-1/3">
        <template #body="{ data }">
            <span class="text-sm font-mono bg-gray-100 p-1 rounded">{{ data.fullMenu }}</span>
        </template>
      </Column>

      <Column field="profiles" header="Current Profiles" class="w-1/3">
        <template #body="{ data }">
          <div class="flex flex-wrap gap-2">
            <span 
              v-for="profile in data.profiles" 
              :key="profile" 
              class="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800"
            >
              {{ profile }}
            </span>
            <span v-if="data.profiles.length === 0" class="text-xs text-gray-500 italic">
              No profiles assigned
            </span>
          </div>
        </template>
      </Column>

      <Column header="Assign Profiles" class="w-1/3">
        <template #body="{ data }">
          <MultiSelect
            :modelValue="data.profiles"
            :options="availableProfiles"
            @update:modelValue="($event) => handleProfileChange($event, data)"
            placeholder="Select profiles to assign"
            display="chip"
            class="w-full md:w-20rem"
          />
        </template>
      </Column>

    </DataTable> 
  </div>
</template>