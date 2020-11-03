<template>
<div>
    <p v-if="auth.state.loggedIn">Willkommen, {{auth.state.name}}</p>
    <p v-else>Bitte melden Sie sich zuerst an.</p>
    <button v-if="auth.state.loggedIn" @click="auth.logout">Abmelden</button>
    <button v-else @click="auth.login">Anmelden</button>
</div>
</template>

<script>
import auth from '../service/Authentication'

export default {
    data() {
        return {
            auth: auth
        }
    },
    methods: {
        login() {
            console.log("Login");
            auth.login();
        }
    }

}
</script>

<style>

</style>