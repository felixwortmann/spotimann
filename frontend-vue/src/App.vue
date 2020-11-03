<template>
<div>
  <h1>Willkommen bei SpotiMann</h1>
  <Login></Login>
  <SongList v-if="auth.state.loggedIn"></SongList>
</div>
</template>

<script>
import Login from './components/Login.vue'
import SongList from './components/SongList'
import Authentication from './service/Authentication'

export default {
  name: 'App',
  data() {
    return {
      auth: Authentication
    }
  },
  components: {
    Login,
    SongList
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
body {
  background-color: #eee;
}
</style>
