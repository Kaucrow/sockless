<script setup>
import Card from 'primevue/card';
import Button from 'primevue/button';
</script>

<template>
    <div class="p-6">
        <h1 class="text-3xl font-bold mb-6">Permissions Console</h1>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
                <template #title>
                    <h3 class="text-xl font-semibold mb-2">Menu Permissions by Profile</h3>
                </template>
                <template #content>
                    <p class="text-sm text-gray-600 mb-4">Manage menu access permissions based on user profiles.</p>
                    <div>
                        <router-link :to="{ name: 'menu-management' }">
                            <Button label="Go to Menu Permissions" class="p-button-secondary" />
                        </router-link>
                    </div>
                </template>
            </Card>

            <Card>
                <template #title>
                    <h3 class="text-xl font-semibold mb-2">Method Permissions Management</h3>
                </template>
                <template #content>
                    <p class="text-sm text-gray-600 mb-4">Control access to specific methods or functions within the system.</p>
                    <div>
                        <router-link :to="{ name: 'method-management' }">
                            <Button label="Go to Method Permissions" class="p-button-secondary" />
                        </router-link>
                    </div>
                </template>
            </Card>
        </div>
    </div>
</template>

<style scoped></style>