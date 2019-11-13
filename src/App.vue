<template>
  <v-app>
    <v-app-bar app>
      <v-toolbar-title>
        <span class="uppercase font-bold">TFA</span>
        <span class="ml-2 uppercase font-normal">ADMIN</span>
      </v-toolbar-title>
      <v-spacer />
      <v-btn text to="/buildings">Buildings</v-btn>
      <v-btn text to="/architects">Architects</v-btn>
      <v-btn text to="/cities">Cities</v-btn>
      <v-btn text to="/countries">Countries</v-btn>
    </v-app-bar>

    <v-content>
      <div class="p-4"><router-view /></div>
    </v-content>
  </v-app>
</template>

<script>
export default {
  name: 'App',
};
</script>
