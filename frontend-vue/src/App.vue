<template>
<div>
  Joa nichts weiter
  <br>
  <Login></Login>
  <SongList></SongList>
</div>
</template>

<script>
import Login from './components/Login.vue'
import SongList from './components/SongList'

export default {
  name: 'App',
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
</style>
