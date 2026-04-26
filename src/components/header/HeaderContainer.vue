<script setup>
import MenuWrapper from './MenuWrapper.vue';
import { useAuthStore } from '@/stores/userauth';
import { storeToRefs } from 'pinia';

const authstore = useAuthStore();
const {isAuthenticated} = storeToRefs(authstore);
// function logoutUser(){
//     authstore.logout();
//     router.push({name:'login'})
// }
</script>

<template>
    <div class="container-fluid">
        <div class="row">
            <div class="col px-0">
                <MenuWrapper @logoutUser="authstore.logout" :isAuth="isAuthenticated"></MenuWrapper>
            </div>
        </div>
    </div>
</template>