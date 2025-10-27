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


const initialValue = ref({
  email: ''
});

const resolver = zodResolver(
  z.object({
    email: z.email({ message: 'Invalid email' })
  })
);

const status = reactive({ message: '', type: '' });

const onFormSubmit = async (data) => {
  if (!data.valid) {
    console.log('errors:', data.errors);
    status.message = 'Please fix the errors in the form.';
    status.type = 'error';
    return;
  }

  const email = data.values.email;

  try {
    await authService.forgotPassword(email);
    status.message = 'If that email exists, a password reset link was sent.';
    status.type = 'success';
  } catch (err) {
    console.error('Forgot password submission failed:', err);
    if (err.response && err.response.data && err.response.data.message) {
      status.message = err.response.data.message; 
    } else {
      status.message = 'Failed to send reset email. Please try again later.';
    }
    status.type = 'error';
  }
}
</script>

<template>
  <div class="min-h-screen flex justify-center items-center">
    <Card>
      <template #title>
        <h2 class="m-0 text-center">Forgot Password</h2>
      </template>
      <template #subtitle>
        <p class="m-0 text-center">Provide the email address associated with your account</p>
      </template>
      <template #content>
        <Form
          v-slot="$form"
          :resolver="resolver"
          :initialValues="initialValue"
          @submit="onFormSubmit"
          class="flex flex-col gap-3 p-5 bg-surface-0 dark:bg-surface-900 w-full sm:w-[20rem] md:w-[30rem]"
          >
          <div class="flex flex-col gap-1">
            <Message v-if="status.message" :severity="status.type" size="small" variant="simple" class="mb-2">
              {{ status.message }}
            </Message>
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
          <Button type="submit" label="Submit" class="mt-4" />
        </Form>
      </template>
    </Card>
  </div>
</template>

<style scoped></style>