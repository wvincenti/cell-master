<script setup>
import { Form } from '@primevue/forms';
import { InputText, Message, Button } from 'primevue';
import { useAuthStore } from '@/stores/userauth';


const userauth = useAuthStore();

const onFormSubmit = async (state) => {

    const { values, valid, states } = state;
    console.log(state);

    if (valid) {
        // toast.add({ severity: 'success', summary: 'Form is submitted.', life: 3000 });
        console.log('valid: ')
        const response = await userauth.registerUser(values);
        console.log(response);
    }

    console.log('NOT VALID!');

}
</script>
<template>
    <div class="container-fluid my-auto">
        <div class="row justify-content-center align-items-center">
            <div class="col-10 col-sm-8 col-md-4 col-xxl-3">
                <Form v-slot="$form" :initialValues :resolver :validateOnValueUpdate="true" :validateOnBlur="true"
                    :validateOnMount="['email']" @submit="onFormSubmit" method="post" class="row gy-1">

                    <div class="col-12">
                        <InputText name="username" type="text" placeholder="Username" fluid />
                        <Message v-if="$form?.username?.invalid" severity="error" size="small" variant="simple">{{
                            $form?.username?.error?.message }}</Message>
                    </div>

                    <div class="col-12">
                        <InputText name="email" type="email" placeholder="Email address *" fluid required
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