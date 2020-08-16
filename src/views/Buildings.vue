<template>
  <building-actions :get-all-buildings="true">
    <template v-slot="{ loading, buildings }">
      <div v-if="loading">Loading...</div>
      <v-data-table
        v-else-if="buildings"
        :headers="headers"
        :items="buildings.nodes"
        item-key="nodeId"
        class="shadow"
        disable-pagination
        hide-default-footer
        :loading="loading"
        :search="search"
        show-expand
        single-expand
      >
        <template v-slot:top>
          <v-toolbar>
            <v-toolbar-title>Buildings</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-text-field
              v-model="search"
              append-icon="search"
              label="Search"
              single-line
              hide-details
            ></v-text-field>
            <v-spacer></v-spacer>
            <v-btn color="primary" dark class="mb-2" to="/add-building"
              >Add</v-btn
            >
          </v-toolbar>
        </template>

        <template v-slot:item.action="{ item }">
          <v-btn text small :to="`/add-links?buildingId=${item.id}`"
            >add links</v-btn
          >
          <!-- <v-icon small class="mr-2" @click="editItem(item)">
          edit
        </v-icon>
        <v-icon small @click="deleteItem(item)">
          delete
        </v-icon> -->
        </template>

        <template v-slot:expanded-item="{ item, headers }">
          <td :colspan="headers.length" class="py-4">
            <p>
              <v-icon small class="mr-2">link</v-icon
              ><a :href="item.website" target="_blank">{{ item.website }}</a>
            </p>
            <p class="flex">
              <v-icon small class="mr-2">person</v-icon>
              <span
                v-for="({ architect }, index) in item.architectBuildings.nodes"
                :key="architect.id"
              >
                {{ architect.name
                }}<span v-if="index < item.architectBuildings.totalCount - 1"
                  >,&nbsp;</span
                >
              </span>
            </p>
            <div class="flex flex-wrap">
              <p class="mr-2">{{ item.year }}</p>
              <p v-if="item.gfa" class="mr-2">{{ item.gfa }}sqm</p>
              <p v-if="item.height > 0" class="mr-2">{{ item.height }}m</p>
              <p class="mr-2">{{ item.typology }}</p>
            </div>
          </td>
        </template>
      </v-data-table>
    </template>
  </building-actions>
</template>

<script>
import BuildingActions from '../components/BuildingActions';

export default {
  name: 'Buildings',
  components: {
    BuildingActions,
  },
  data() {
    return {
      search: '',
      buildings: {
        totalCount: 0,
        nodes: [],
      },
      dialog: false,
      headers: [
        {
          text: 'ID',
          sortable: true,
          value: 'id',
        },
        {
          text: 'Name',
          sortable: true,
          value: 'name',
        },

        {
          text: 'City',
          sortable: true,
          value: 'city.name',
        },
        {
          text: 'Lat',
          sortable: true,
          value: 'lat',
        },
        {
          text: 'Lng',
          sortable: true,
          value: 'lng',
        },

        { text: 'Actions', value: 'action', sortable: false },
      ],
      editedIndex: -1,
      editedItem: {
        name: '',
        website: '',
      },
      defaultItem: {
        name: '',
        website: '',
      },
    };
  },
};
</script>

<style lang="scss" scoped></style>
