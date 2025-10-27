<script setup>
import Card from 'primevue/card';
import { Form } from '@primevue/forms';
import Message from 'primevue/message';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import { z } from 'zod';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { ref, reactive } from 'vue';
import { authService } from '@/services/auth';
import router from '@/router';

const errorMessage = ref('');

const initialValues = ref({
    token: ''
});

const resolver = zodResolver(
  z.object({
    token: z.string().nonempty({ message: 'Token is required' })
  })
);

const onFormSubmit = async (data) => {
    if (data.valid) {
        errorMessage.value = '';
        try {
            await authService.validateEmail(data.values.token);
            console.log('Email validated successfully');
            router.push('/login');
        } catch (error) {
            errorMessage.value = 'Email validation failed. Please try again.';
        }
    } else {
        console.log('errors:', data.errors);
    }
}
</script>

<template>
    <div class="min-h-screen flex justify-center items-center">
        <Card>
            <template #title>
                <h2 class="m-0 text-center">Validate email</h2>
            </template>
            <template #subtitle>
                <p class="m-0 text-center">Enter the token sent to your email to validate your account</p>
            </template>
            <template #content>
                <Form
                    v-slot="$form"
                    :initialValues="initialValues"
                    :resolver="resolver"
                    @submit="onFormSubmit"
                    class="flex flex-col gap-3 p-8 bg-surface-0 dark:bg-surface-900 w-full sm:w-[20rem] md:w-[30rem]"
                >
                <div class="flex flex-col gap-1">
                    <InputText
                       name="token"
                       placeholder="Enter token"
                       fluid 
                       class="w-full"
                    />
                    <Message v-if="$form.token?.invalid" severity="error" size="small" variant="simple" class="p-error text-sm mt-1">
                        {{ $form.token.error.message }}
                    </Message>
                    <Button type="submit" label="Validate Email" class="mt-4" fluid />
                </div>
                </Form>
            </template>
        </Card>
    </div>
</template>