<script setup>
import { Form } from '@primevue/forms';
import { InputText, Message, Button } from 'primevue';
import { useSpreadsheetStore } from '@/stores/spreadsheet';

const spreadsheetStore = useSpreadsheetStore();

const onFormSubmit = async (state) => {

    const { values, valid, states } = state;
    console.log(state);

    if (valid) {
        // toast.add({ severity: 'success', summary: 'Form is submitted.', life: 3000 });
        console.log('valid: ')
        const response = await spreadsheetStore.registerUser(values);
        console.log(response);
    }

    console.log('NOT VALID!');

}
</script>
<template>
    <div class="container-fluid my-auto bg-secondary">
        <div class="row justify-content-center align-items-center">
            <div class="col-5">
                <Form v-slot="$form" :initialValues :resolver :validateOnValueUpdate="false" :validateOnBlur="true"
                    :validateOnMount="['email']" @submit="onFormSubmit" method="post" class="row gy-1">

                    <div class="col-12">
                        <InputText name="username" type="text" placeholder="Username" fluid />
                        <Message v-if="$form?.username?.invalid" severity="error" size="small" variant="simple">{{
                            $form?.username?.error?.message }}</Message>
                    </div>

                    <div class="col-12">
                        <InputText name="email" type="text" placeholder="Email address *" fluid required
                            :formControl="{ validateOnValueUpdate: true }" />
                        <Message v-if="$form?.email?.invalid" severity="error" size="small" variant="simple">{{
                            $form?.email?.error?.message }}</Message>
                    </div>

                    <div class="col-12">
                        <InputText name="password" type="text" placeholder="Password *" fluid required />
                        <Message v-if="$form?.password?.invalid" severity="error" size="small" variant="simple">{{
                            $form?.password?.error?.message }}</Message>
                    </div>

                    <div class="col-12">
                        <Button class="w-100" type="submit" label="Submit" />
                    </div>

                </Form>
            </div>
            <div class="col-12 text-center mt-2">
                <span>Already have an account?</span>
                <router-link to="/login" class="text-white">
                    Login
                </router-link>
            </div>
        </div>

    </div>
</template>