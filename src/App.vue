<template>
  <v-app>
    <v-toolbar app>
      <v-toolbar-title class="uppercase font-bold">
        <span>TFA</span>
        <span class="ml-2 uppercase font-normal">ADMIN</span>
      </v-toolbar-title>
    </v-toolbar>

    <v-content>
      <v-container>
        <router-view />
      </v-container>
    </v-content>
  </v-app>
</template>

<script>
export default {
  name: 'App'
};
</script>
