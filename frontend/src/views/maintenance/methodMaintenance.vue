<script setup>
import { ref, onMounted } from 'vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import MultiSelect from 'primevue/multiselect';
import { maintenanceService } from '@/services/maintenance';

const methodPermissions = ref([]); 
const availableProfiles = ref([]); 
const loading = ref(true);

/**
 * Converts the nested structure into a array for the DataTable
 * From -> { subsystem: { class: { method: [profiles] } } }
 * To -> [{ id: string, subsystem: string, class: string, methodName: string, fullMethod: string, profiles: string[] }]
 */
const flattenMethodData = (data) => {
    const flatData = [];
    for (const subsystem in data) {
        for (const className in data[subsystem]) {
            for (const methodName in data[subsystem][className]) {
                flatData.push({
                    id: `${subsystem}:${className}:${methodName}`,
                    subsystem: subsystem,
                    class: className,
                    methodName: methodName,
                    fullMethod: `${subsystem}/${className}/${methodName}`,
                    // multiselect will bind to the profiles array
                    profiles: data[subsystem][className][methodName] || [] 
                });
            }
        }
    }
    return flatData;
};

/**
 * Handles the change event from the MultiSelect component.
 * Determine profiles to REMOVE (in oldProfiles but not in newProfiles) and
 * profiles to ADD (in newProfiles but not in oldProfiles)
 */
const handleProfileChange = async (newProfiles, rowData) => {
    const oldProfiles = rowData.profiles;
    const { subsystem, class: className, methodName } = rowData;

    const profilesToRemove = oldProfiles.filter(profile => !newProfiles.includes(profile));
    
    const profilesToAdd = newProfiles.filter(profile => !oldProfiles.includes(profile));

    rowData.profiles = newProfiles; 

    try {
        await Promise.all([
            ...profilesToAdd.map(profile => 
                maintenanceService.addMethodProfile(profile, subsystem, className, methodName)
            ),
            ...profilesToRemove.map(profile => 
                maintenanceService.removeMethodProfile(profile, subsystem, className, methodName)
            )
        ]);
    } catch (error) {
        console.error('Failed to update method permissions:', error);
        rowData.profiles = oldProfiles;
        // TODO: add user feedback about the error
    }
};

onMounted(async () => {
    try {
        const [profileNames, methodData] = await Promise.all([
            maintenanceService.getAvailableProfiles(),
            maintenanceService.getMethodProfileData()
        ]);

        availableProfiles.value = profileNames; 

        methodPermissions.value = flattenMethodData(methodData);
    } catch (error) {
        console.error('Failed to load maintenance data:', error);
    } finally {
        loading.value = false;
    }
});

</script>


<template>
  <div class="p-4 rounded-lg">
    <h2 class="text-3xl font-semibold mb-4 ">Method Management</h2>
    <p v-if="loading" class="text-blue-500">Loading method permissions...</p>
    <div v-else-if="methodPermissions.length === 0" class="p-4 text-center border rounded-lg">
      No methods found or data could not be loaded.
    </div>
    <DataTable 
      v-else
      :value="methodPermissions" 
      :loading="loading"
      sort-field="fullMethod" 
      :sort-order="1"
      table-style="min-width: 50rem"
      striped-rows
    >
      <Column field="fullMethod" header="Method Name" :sortable="true" class="font-medium w-1/3">
        <template #body="{ data }">
            <span class="text-sm font-mono p-1 rounded">{{ data.fullMethod }}</span>
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

<style scoped>
</style>
