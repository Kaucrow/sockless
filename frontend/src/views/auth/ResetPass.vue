<script setup>
import Card from 'primevue/card';
import { Form } from '@primevue/forms';
import Message from 'primevue/message';
import Button from 'primevue/button';
import Password from 'primevue/password';
import InputText from 'primevue/inputtext';
import { z } from 'zod';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { ref } from 'vue';
import { authService } from '@/services/auth';

const initialValues = ref({
    token: '',
    password: '',
    confirmPassword: ''
});

const resolver = zodResolver(
    z.object({
        token: z.string().nonempty({ message: 'Token is required' }),
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

const status = ref({ message: '', type: '' });
const isLoading = ref(false);

const onFormSubmit = async (data) => {
    if (data.valid) {
        isLoading.value = true;
        status.value = { message: '', type: '' };
        console.log('Form Data:', data.values);
        try {
            await authService.resetPassword(data.values.token, data.values.password);
            status.value = { message: 'Password reset successfully. You can now log in.', type: 'success' };
        } catch (err) {
            console.error('Reset password failed:', err);
            status.value = { message: 'Failed to reset password. Please try again later.', type: 'error' };
        } finally {
            isLoading.value = false;
        }
    } else {
        console.log('errors:', data.errors);
        status.value = { message: 'Please fix the errors above and try again.', type: 'error' };
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
        <p class="m-0 text-center">Enter your verification token and new password below</p>
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
                <Message v-if="status.message" :severity="status.type" size="small" variant="simple" class="mb-2">
                    {{ status.message }}
                </Message>
                <InputText
                    name="token"
                    placeholder="Verification Token"
                    fluid
                    class="w-full"
                />
                <Message v-if="$form.token?.invalid" severity="error" size="small" variant="simple" class="text-red-600 text-sm mt-1">
                    {{ $form.token.error.message }}
                </Message>
            </div>
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