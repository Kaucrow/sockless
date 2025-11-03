<script setup>
import { Form } from '@primevue/forms';
import InputText from 'primevue/inputtext';
import Message from 'primevue/message';
import Button from 'primevue/button';
import Card from 'primevue/card';
import Password from 'primevue/password';
import { z } from 'zod';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { ref } from 'vue';
import router from '@/router';
import { authService } from '@/services/auth';

const isLoading = ref(false);
const errorMessage = ref('');

const initialValues = ref({
    email: '',
    password: '',
    name: '',
    surname: ''
})

const resolver = zodResolver(
    z.object({
        email: z.email({ message: 'Invalid email' }),
        password: z.string().nonempty({ message: 'Password must be at least 6 characters' }),
        name: z.string().nonempty({ message: 'Name is required' }),
        surname: z.string().nonempty({ message: 'Surname is required' })
    })
);

const onFormSubmit = async (data) => {
    if (data.valid) {
        isLoading.value = true;
        errorMessage.value = '';

        try {
            await authService.register(
                data.values.email,
                data.values.password,
                data.values.name,
                data.values.surname
            );

            console.log('Email sent for verification');

            router.push('/validate-email');
        } catch (error) {
            errorMessage.value = 'Registration failed. Please try again.';
        } finally {
            isLoading.value = false;
        }
    } else {
        console.log('errors:', data.errors);
    }
}
</script>

<template>
    <div class="min-h-screen flex justify-center items-center shadow-xl/30 ">
        <Card>
            <template #title>
                <h2 class="m-0 text-center">Register</h2>
            </template>
            <template #subtitle>
                <p class="m-0 text-center">Enter your information</p>
            </template>
            <template #content>
                <Form 
                    v-slot="$form"
                    :initialValues="initialValues"
                    :resolver="resolver"
                    @submit="onFormSubmit"
                    class="flex flex-col gap-3 p-8 bg-surface-0 dark:bg-surface-900 w-full sm:w-[25rem] md:w-[25rem]"
                    >
                    <div class="flex flex-col gap-1">
                        <InputText
                            name="email"
                            placeholder="Email"
                            fluid
                            class="w-full"
                        />
                        <Message v-if="$form.email?.invalid" severity="error" size="small" variant="simple" class="text-red-600 text-sm mt-1">
                            {{ $form.email.error.message }}
                        </Message>
                    </div>
                    <div class="flex flex-col gap-1">
                        <Password
                            name="password"
                            placeholder="Password"
                            :feedback="false"
                            toggleMask
                            fluid
                            class="w-full"
                        />
                        <Message v-if="$form.password?.invalid" severity="error" size="small" variant="simple" class="text-red-600 text-sm mt-1">
                            {{ $form.password.error.message }}
                        </Message>
                    </div>
                    <div class="flex flex-col gap-1">
                        <InputText
                            name="name"
                            placeholder="Name"
                            fluid
                            class="w-full"
                        />
                        <Message v-if="$form.name?.invalid" severity="error" size="small" variant="simple" class="text-red-600 text-sm mt-1">
                            {{ $form.name.error.message }}
                        </Message>
                    </div>
                    <div class="flex flex-col gap-1">
                        <InputText
                            name="surname"
                            placeholder="Surname"
                            fluid
                            class="w-full"
                        />
                        <Message v-if="$form.surname?.invalid" severity="error" size="small" variant="simple" class="text-red-600 text-sm mt-1">
                            {{ $form.surname.error.message }}
                        </Message>
                    </div>
                    <Message
                        v-if="errorMessage"
                        severity="error"
                        :closable="false"
                        class="mb-4"
                    >
                        {{ errorMessage }}
                    </Message>
                    <Button type="submit" label="Register" severity="secondary" :disabled="$form.isSubmitting" class="mt-6"/>
                    <div class="text-center mt-1">
                        <router-link to="/login" class="p-button p-component p-button-link">Already have an account? Login</router-link>
                    </div>
                </Form>
            </template>
        </Card>
    </div>
</template>

<style scoped></style>