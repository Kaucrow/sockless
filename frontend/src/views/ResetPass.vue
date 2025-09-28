<script setup>
import Card from 'primevue/card';
import { Form } from '@primevue/forms';
import Message from 'primevue/message';
import Button from 'primevue/button';
import Password from 'primevue/password';
import { z } from 'zod';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { ref } from 'vue';

const initialValues = ref({
    password: '',
    confirmPassword: ''
});

const resolver = zodResolver(
    z.object({
        password: z.string().min(2, { message: 'Password must be at least 2 characters' }),
        confirmPassword: z.string()
    }).superRefine(({ confirmPassword, password }, ctx) => {
        if (confirmPassword !== password) {
            ctx.addIssue({
                code: 'custom',
                message: 'Passwords do not match',
                path: ['confirmPassword']
            });
        }
    })
);

const onFormSubmit = (data) => {
    if (data.valid) {
        console.log('Form Data:', data.values);
        // we send to the server
    } else {
        console.log('errors:', data.errors);
    }
}
</script>

<template>
  <div class="min-h-screen flex justify-center items-center">
    <Card>
      <template #title>
        <h2 class="m-0 text-center">Reset Password</h2>
      </template>
      <template #subtitle>
        <p class="m-0 text-center">Enter your new password below</p>
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
                <Password
                    name="password"
                    placeholder="New Password"
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
                <Password
                    name="confirmPassword"
                    placeholder="Confirm New Password"
                    :feedback="false"
                    toggleMask
                    fluid
                    class="w-full"
                />
                <Message v-if="$form.confirmPassword?.invalid" severity="error" size="small" variant="simple" class="text-red-600 text-sm mt-1">
                    {{ $form.confirmPassword.error.message }}
                </Message>
            </div>
            <Button type="submit" label="Reset Password" class="mt-4" />
        </Form>
      </template>
    </Card>
  </div>
</template>

<style scoped></style>