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

const initialValues = ref({
    email: '',
    password: ''
});

const resolver = zodResolver(
    z.object({
        email: z.email({ message: 'Invalid email' }),
        password: z.string().nonempty({ message: 'Password is required' })
    })  
);

const onFormSubmit = (data) => {
    if (data.valid) {
        console.log('Form Data:', data.values);
        // we send to the server

        // Simulate a server request
        setTimeout(() => {
            console.log('User logged in successfully');
            router.push('/home');
        }, 1000);
    } else {
        console.log('errors:', data.errors);
    }
}

</script>

<template>
    <div class="min-h-screen flex justify-center items-center">
    <Card>
        <template #title>
            <h2 class="m-0 text-center">Welcome Back</h2>
        </template>
        <template #subtitle>
            <p class="m-0 text-center">Enter your credentials</p>
        </template>
        <template #content>
            <Form
                v-slot="$form"
                :initialValues="initialValues"
                :resolver="resolver"
                @submit="onFormSubmit"
                class="flex flex-col gap-3 p-8 bg-surface-0 dark:bg-surface-900 w-full sm:w-[20rem] md:w-[25rem]"
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
                <Button type="submit" label="Login" severity="secondary" :disabled="$form.isSubmitting" class="mt-6"/>
                <div class="text-center mt-1">
                    <router-link to="/forgot-password" class="p-button p-component p-button-link">Forgot Password?</router-link>
                </div>

            </Form>
        </template>
    </Card>
    </div>
</template>

<style scoped></style>