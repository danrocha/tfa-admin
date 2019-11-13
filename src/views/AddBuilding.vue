<template>
  <div class="w-2/3 px-4">
    <h1 class="text-4xl uppercase mb-8">Add Building</h1>
    <div class="mb-4">
      <select-architect v-model="building.architect" />
      <select-city v-model="building.cityId" />
    </div>
    <building-actions>
      <template v-slot="{ add, loading }">
        <v-overlay absolute :value="loading">
          <v-progress-circular indeterminate size="64"></v-progress-circular>
        </v-overlay>

        <div class="mb-4">
          <v-text-field
            v-model="building.name"
            label="Building Name"
            required
          ></v-text-field>
          <v-text-field
            v-model="building.website"
            label="Official Website"
            placeholder="https://..."
          ></v-text-field>
          <v-text-field
            v-model="building.typology"
            label="Typology"
            placeholder="Residential, Office, etc..."
          ></v-text-field>
        </div>
        <div class="mb-4">
          <v-text-field
            v-model="building.gmapsLink"
            label="Google Maps Link"
            placeholder="https://..."
          ></v-text-field>
          <v-text-field
            v-model="building.gmapsEmbed"
            label="Google Maps Embed Code"
            placeholder="!1m18!1m12!..."
          ></v-text-field>
        </div>
        <div class="flex mb-8">
          <v-text-field
            v-model="building.year"
            label="Year completed"
            placeholder="YYYY"
            class="pr-4"
          ></v-text-field>

          <v-text-field
            v-model="building.height"
            label="Height (m)"
            placeholder="234"
            class="pr-4"
          ></v-text-field>

          <v-text-field
            v-model="building.gfa"
            label="GFA (sqm)"
            placeholder="72641"
          ></v-text-field>
        </div>
        <div>
          <v-btn
            color="primary"
            :disabled="building.name.length === 0"
            @click="add(building)"
            >Add</v-btn
          >
          <v-btn text to="/">Cancel</v-btn>
        </div>
      </template>
    </building-actions>
  </div>
</template>

<script>
import SelectArchitect from '../components/SelectArchitect';
import SelectCity from '../components/SelectCity';
import BuildingActions from '../components/BuildingActions';
export default {
  name: 'AddBuilding',
  components: {
    SelectArchitect,
    BuildingActions,
    SelectCity,
  },
  data() {
    return {
      building: {
        architect: null,
        name: '',
        website: '',
        address: null,
        cityId: null,
        gmapsLink: null,
        gmapsEmbed: null,
        year: null,
        gfa: null,
        height: null,
        typology: null,
      },
    };
  },
};
</script>

<style lang="scss" scoped></style>
