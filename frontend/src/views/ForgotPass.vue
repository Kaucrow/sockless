<script setup>
import Card from 'primevue/card';
import { Form } from '@primevue/forms';
import Message from 'primevue/message';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import { z } from 'zod';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { ref } from 'vue';


const initialValue = ref({
  email: ''
});

const resolver = zodResolver(
  z.object({
    email: z.email({ message: 'Invalid email' })
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