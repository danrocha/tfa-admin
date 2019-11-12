<template>
  <div v-if="$apollo.loading">Loading...</div>
  <div v-else>
    <v-toolbar flat color="white">
      <v-toolbar-title>Cities</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-dialog v-model="dialog" max-width="500px">
        <template v-slot:activator="{ on }">
          <v-btn color="primary" dark class="mb-2" v-on="on">Add</v-btn>
        </template>
        <v-card>
          <v-card-title>
            <h1 class="uppercase text-xl">{{ formTitle }}</h1>
          </v-card-title>

          <v-card-text>
            <v-container>
              <v-text-field
                v-model="editedItem.name"
                label="Name"
              ></v-text-field>
              <selectCountry v-model="editedItem.countryId" />
            </v-container>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="secondary" flat @click="close">Cancel</v-btn>
            <v-btn color="primary" @click="save">Save</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-toolbar>
    <v-data-table
      :headers="headers"
      :items="cities.nodes"
      expand
      item-key="nodeId"
      class="shadow"
    >
      <template v-slot:items="props">
        <tr @click="props.expanded = !props.expanded">
          <td>{{ props.item.name }}</td>
          <td>{{ props.item.country.name }}</td>
          <td>{{ props.item.buildings.totalCount }}</td>
          <td>{{ props.item.createdAt | formatDate }}</td>
          <td>{{ props.item.updatedAt | formatDate }}</td>
          <td class="justify-center layout px-0">
            <v-icon small class="mr-2" @click="editItem(props.item)"
              >edit</v-icon
            >
            <v-icon small @click="deleteItem(props.item)">delete</v-icon>
          </td>
        </tr>
      </template>
      <template v-slot:expand="props">
        <v-card flat class="bg-gray-200">
          <v-card-text>
            <ul v-if="props.item.buildings.totalCount > 0">
              <li
                v-for="building in props.item.buildings.nodes"
                :key="building.id"
              >
                {{ building.name }}
                <span
                  v-for="architectBuilding in building.architectBuildings.nodes"
                  :key="architectBuilding.id"
                  class="mr-2 text-gray-500"
                  >{{ architectBuilding.architect.name }}</span
                >
              </li>
            </ul>
          </v-card-text>
        </v-card>
      </template>
      <template v-slot:no-data>
        <!-- <v-btn color="primary" @click="initialize">Reset</v-btn> -->
      </template>
    </v-data-table>
  </div>
</template>

<script>
import gql from 'graphql-tag';
import SelectCountry from '../components/SelectCountry';
const CITY_FRAGMENT = gql`
  fragment city on City {
    id
    name
    nodeId
    countryId
    country {
      id
      name
    }
    buildings {
      totalCount
      nodes {
        id
        name
        architectBuildings {
          nodes {
            id
            architect {
              name
            }
          }
        }
      }
    }
    createdAt
    updatedAt
  }
`;
const CITIES = gql`
  query cities {
    cities(orderBy: NAME_ASC) {
      totalCount
      nodes {
        ...city
      }
    }
  }
  ${CITY_FRAGMENT}
`;
export default {
  name: 'Cities',
  components: { SelectCountry },
  data() {
    return {
      cities: {
        totalCount: 0,
        nodes: [],
      },
      dialog: false,
      headers: [
        {
          text: 'Name',
          align: 'left',
          sortable: true,
          value: 'name',
        },
        { text: 'Country', value: 'website', align: 'left', sortable: true },
        {
          text: 'Buildings',
          value: 'buildings.totalCount',
          align: 'left',
          sortable: true,
        },
        { text: 'Created At', value: 'createdAt', sortable: true },
        { text: 'Updated At', value: 'updatedAt', sortable: true },
      ],
      editedIndex: -1,
      editedItem: {
        name: '',
        countryId: null,
      },
      defaultItem: {
        name: '',
        countryId: null,
      },
    };
  },
  computed: {
    formTitle() {
      return this.editedIndex === -1 ? 'Add new city' : 'Edit City';
    },
  },
  watch: {
    dialog(val) {
      val || this.close();
    },
  },
  methods: {
    editItem(item) {
      this.editedIndex = this.cities.nodes.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialog = true;
    },

    deleteItem(item) {
      const index = this.cities.nodes.indexOf(item);
      const nodeId = item.nodeId;
      confirm('Are you sure you want to delete this item?') &&
        this.$apollo.mutate({
          mutation: gql`
            mutation deleteCity($input: DeleteCityInput!) {
              deleteCity(input: $input) {
                deletedCityId
              }
            }
          `,
          variables: {
            input: {
              nodeId,
            },
          },
          update: (store, { data: { deleteCity } }) => {
            const data = store.readQuery({ query: CITIES });
            data.cities.nodes.splice(index, 1);
            store.writeQuery({ query: CITIES, data });
          },
        });
    },

    close() {
      this.dialog = false;
      setTimeout(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      }, 300);
    },

    async save() {
      if (this.editedIndex > -1) {
        // update
        await this.updateCity(this.editedItem);
      } else {
        // save new
        await this.addCity(this.editedItem);
      }
      this.close();
    },

    async addCity(item) {
      const city = {
        name: item.name,
        countryId: item.countryId,
      };
      this.$apollo.mutate({
        mutation: gql`
          mutation createCity($input: CreateCityInput!) {
            createCity(input: $input) {
              city {
                ...city
              }
            }
          }
          ${CITY_FRAGMENT}
        `,
        variables: {
          input: { city },
        },
        update: (store, { data: { createCity } }) => {
          const data = store.readQuery({ query: CITIES });
          data.cities.nodes.push(createCity.city);
          store.writeQuery({ query: CITIES, data });
        },
      });
    },
    async updateCity(item) {
      const index = this.cities.nodes.indexOf(item);
      const input = {
        nodeId: item.nodeId,
        patch: {
          name: item.name,
          countryId: item.countryId,
        },
      };
      this.$apollo.mutate({
        mutation: gql`
          mutation updateCity($input: UpdateCityInput!) {
            updateCity(input: $input) {
              city {
                ...city
              }
            }
          }
          ${CITY_FRAGMENT}
        `,
        variables: {
          input,
        },
        update: (store, { data: { updateCity } }) => {
          const data = store.readQuery({ query: CITIES });
          data.cities.nodes[index] = updateCity.city;
          store.writeQuery({ query: CITIES, data });
        },
      });
    },
  },
  apollo: {
    cities: {
      query: CITIES,
    },
  },
};
</script>

<style lang="scss" scoped></style>
