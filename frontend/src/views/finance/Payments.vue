<script setup>
import { ref, onMounted } from 'vue';
import Tabs from 'primevue/tabs';
import TabList from 'primevue/tablist';
import Tab from 'primevue/tab';
import TabPanels from 'primevue/tabpanels';
import TabPanel from 'primevue/tabpanel';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import { toProcessService } from '@/services/to-process';

const categories = ref([]);
const paymentMethods = ref([]);
const activeTab = ref('Categories');
const showCategoryDialog = ref(false);
const showMethodDialog = ref(false);
const showEditDialog = ref(false);
const isEditingCategory = ref(false);
const newCategory = ref({
    id: null,
    name: '',
    description: ''
});
const newMethod = ref({
    id: null,
    name: ''
});

const fetchCostCategories = async () => {
    try {
        const data = await toProcessService.getCostCategories({});
        categories.value = Array.isArray(data) ? data : [];
    } catch (error) {
        console.error('Error fetching cost categories:', error);
        categories.value = [];
    }
};

const fetchPaymentMethods = async () => {
    try {
        const data = await toProcessService.getPaymentMethods({});
        paymentMethods.value = Array.isArray(data) ? data : [];
    } catch (error) {
        console.error('Error fetching payment methods:', error);
        paymentMethods.value = [];
    }
};

const handleAddNew = () => {
    if (activeTab.value === 'Categories') {
        addNewCategory();
        console.log('Add new cost category');
    } else if (activeTab.value === 'Methods') {
        addNewPaymentMethod();
        console.log('Add new payment method');
    }
};

const addNewCategory = () => {
    newCategory.value = {
        name: '',
        description: ''
    };
    isEditingCategory.value = false;
    showCategoryDialog.value = true;
}

const addNewPaymentMethod = () => {
    newMethod.value = {
        name: ''
    };
    showMethodDialog.value = true;
}

const saveNewCategory = async () => {
    try {
        if (isEditingCategory.value) {
            await toProcessService.updateCostCategory(newCategory.value);   
        } else {
            await toProcessService.addCostCategory(newCategory.value);
        }
        isEditingCategory.value = false;
        showCategoryDialog.value = false;
        await fetchCostCategories();
    } catch (error) {
        console.error('Error saving new cost category:', error);
    }
};

const saveNewMethod = async () => {
    try {
        await toProcessService.addPaymentMethod(newMethod.value);
        showMethodDialog.value = false;
        await fetchPaymentMethods();
    } catch (error) {
        console.error('Error saving new payment method:', error);
    }
};

const editCategory = (category) => {
    isEditingCategory.value = true;
    newCategory.value = { ...category }; 
    showEditDialog.value = true;
}

const saveEditedCategory = async () => {
    try {
        await toProcessService.updateCostCategory(newCategory.value);
        showEditDialog.value = false;
        isEditingCategory.value = false;
        await fetchCostCategories();
    } catch (error) {
        console.error('Error saving edited cost category:', error);
    }
};

onMounted(async () => {
    await fetchCostCategories();
    await fetchPaymentMethods();
});
</script>

<template>
<div class="p-4">
    <div class="flex items-center justify-between mb-4">
        <h2 class="text-3xl font-semibold m-0">Payments Management</h2>
        <Button label="Add New" icon="pi pi-plus" class="p-button-sm p-mt-2" @click="handleAddNew"></Button>
    </div>
    <Tabs v-model:value="activeTab">
        <TabList>
            <Tab value="Categories">Cost Categories</Tab>
            <Tab value="Methods">Payment Methods</Tab>
        </TabList>

        <TabPanels>
            <TabPanel value="Categories">
                <div class="p-4">
                    <DataTable :value="categories" class="w-full" striped-rows>
                        <Column field="name" header="Category Name"></Column>
                        <Column field="description" header="Description"></Column>
                        <Column header="Actions" bodyClass="text-center">
                            <template #body="slotProps">
                                <Button icon="pi pi-pencil" class="p-button-text p-button-sm mr-2" @click="editCategory(slotProps.data)"></Button>
                            </template>
                        </Column>
                        <template #empty>No cost categories found.</template>
                    </DataTable>                   
                </div>
            </TabPanel>
            <TabPanel value="Methods">
                <div class="p-4">
                    <DataTable :value="paymentMethods" class="w-full" striped-rows>
                        <Column field="name" header="Method Name"></Column>
                        <template #empty>No payment methods found.</template>
                    </DataTable>
                </div>
            </TabPanel>
        </TabPanels>
    </Tabs>
    <Dialog v-model:visible="showCategoryDialog" header="Add new Cost Category" modal class="w-full max-w-md">
        <div class="flex flex-col gap-4 pt-2">
            <div class="flex flex-col gap-2">
                <label for="categoryName" class="font-semibold text-sm">Category Name</label>
                <InputText id="categoryName" v-model="newCategory.name" required autofocus />
            </div>
            <div class="flex flex-col gap-2">
                <label for="categoryDescription" class="font-semibold text-sm">Description</label>
                <InputText id="categoryDescription" v-model="newCategory.description" rows="3" />
            </div>
        </div>
        <template #footer>
            <Button label="Save" icon="pi pi-check" @click="saveNewCategory" />
        </template>
    </Dialog>

    <Dialog v-model:visible="showMethodDialog" header="Add new Payment Method" modal class="w-full max-w-md">
        <div class="flex flex-col gap-4 pt-2">
            <div class="flex flex-col gap-2">
                <label for="methodName" class="font-semibold text-sm">Method Name</label>
                <InputText id="methodName" v-model="newMethod.name" required autofocus />
            </div>
        </div>
        <template #footer>
            <Button label="Save" icon="pi pi-check" @click="saveNewMethod" />
        </template>
    </Dialog>

    <Dialog v-model:visible="showEditDialog" header="Edit Cost Category" modal class="w-full max-w-md">
        <div class="flex flex-col gap-4 pt-2">
            <div class="flex flex-col gap-2">
                <label for="editCategoryName" class="font-semibold text-sm">Category Name</label>
                <InputText id="editCategoryName" v-model="newCategory.name" required autofocus />
            </div>
            <div class="flex flex-col gap-2">
                <label for="editCategoryDescription" class="font-semibold text-sm">Description</label>
                <InputText id="editCategoryDescription" v-model="newCategory.description" rows="3" />
            </div>
        </div>
        <template #footer>
            <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="showEditDialog = false" />
            <Button label="Save" icon="pi pi-check" @click="saveEditedCategory" />
        </template>
    </Dialog>
</div>
</template>