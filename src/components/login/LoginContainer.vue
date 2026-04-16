<script setup>
import { InputText, Message, Button } from 'primevue';
import { Form } from '@primevue/forms';
import { useToast } from 'primevue/usetoast';

import { useSpreadsheetStore } from '@/stores/spreadsheet';

import { ref } from 'vue';

const spreadsheetStore = useSpreadsheetStore();
// const toast = useToast();

const initialValues = ref({
    username: '',
    email: '',
    password: ''
});

// const resolver = ({ values }) => {
//     const errors = {};

//     if (!values.username) {
//         errors.username = [{ message: 'Username is required.' }];
//     }

//     if (!values.email) {
//         errors.email = [{ message: 'First name is required.' }];
//     }

//     if (!values.password) {
//         errors.password = [{ message: 'Last name is required.' }];
//     }

//     return {
//         errors
//     };
// };

const onFormSubmit = async ({valid, values}) => {
    // See what's actually inside
   // const { values, valid, states } = state;
    console.log(values);
    console.log(valid);
 //   console.log(states);

    if (valid) {
        // toast.add({ severity: 'success', summary: 'Form is submitted.', life: 3000 });
        console.log('valid: ')
        console.log(values);
        const response = await spreadsheetStore.loginUser(values);
        console.log(response);
    }

    console.log('NOT VALID!');
}


</script>

<template>

    <div class="container-fluid bg-secondary my-auto">
        <div class="row justify-content-center align-items-center">
            <div class="col-5">

                <Form v-slot="$form" :initialValues :validateOnValueUpdate="false" :validateOnBlur="true"
                    :validateOnMount="['email']" @submit="onFormSubmit" method="post" class="row gy-1">

                    <div class="col-12">
                        <InputText name="email" type="text" placeholder="Email" fluid required
                            :formControl="{ validateOnValueUpdate: true }" />
                        <Message v-if="$form?.email?.invalid" severity="error" size="small" variant="simple">{{
                            $form?.email?.error?.message }}</Message>
                    </div>

                    <div class="col-12">
                        <InputText name="password" type="text" placeholder="Password" fluid required />
                        <Message v-if="$form?.password?.invalid" severity="error" size="small" variant="simple">{{
                            $form?.password?.error?.message }}</Message>
                    </div>

                    <div class="col-12">
                        <Button class="w-100" type="submit" label="Submit" />
                    </div>

                </Form>
            </div>
            <div class="col-12 text-center mt-2">
                <!-- <router-link to="/register" custom v-slot="{ navigate }">
                    <Button class="w-100" label="Register" @click="navigate" />
                </router-link> -->
                <span>Don't have an account?</span>
                <br>
                <span>Log in as a guest</span>
                or
                <router-link to="/register" >
                 <span class="text-white">register</span>
                </router-link>
            </div>
        </div>
    </div>
</template>