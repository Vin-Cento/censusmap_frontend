<script setup lang="ts"></script>

<template>
  <v-app>
    <v-toolbar style="background: black">
      <router-link to="/">Home</router-link>
      <router-link to="/map">Map</router-link>
    </v-toolbar>
    <router-view></router-view>
  </v-app>
</template>

<style scoped>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
}

a {
  padding: 0.5rem;
  text-decoration: inherit;
}

a {
  font-size: 2em;
  color: #2c3e50;
}

a.router-link-exact-active {
  color: #42b983;
  font-weight: bold;
  font-size: 2em;
}
</style>
