<template>
  <div v-if="$apollo.loading">Loading...</div>
  <div v-else>
    <v-toolbar flat color="white">
      <v-toolbar-title>Countries</v-toolbar-title>
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
              <v-text-field v-model="editedItem.name" label="Name"></v-text-field>

              <v-text-field v-model="editedItem.iso" label="ISO"></v-text-field>
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
      :items="countries.nodes"
      expand
      item-key="nodeId"
      class="shadow"
    >
      <template v-slot:items="props">
        <tr @click="props.expanded = !props.expanded">
          <td>{{ props.item.name }}</td>
          <td>{{ props.item.iso }}</td>
          <td>{{ props.item.cities.totalCount }}</td>
          <td>{{ props.item.createdAt | formatDate }}</td>
          <td>{{ props.item.updatedAt | formatDate }}</td>
          <td class="justify-center layout px-0">
            <v-icon small class="mr-2" @click="editItem(props.item)">edit</v-icon>
            <v-icon small @click="deleteItem(props.item)">delete</v-icon>
          </td>
        </tr>
      </template>
      <template v-slot:expand="props">
        <v-card flat class="bg-gray-200">
          <v-card-text>
            <ul v-if="props.item.cities.totalCount > 0">
              <li v-for="city in props.item.cities.nodes" :key="city.id">{{ city.name }}</li>
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
const COUNTRY_FRAGMENT = gql`
  fragment country on Country {
    name
    iso
    id
    nodeId
    updatedAt
    createdAt
    cities {
      nodes {
        id
        name
      }
      totalCount
    }
  }
`;
const COUNTRIES = gql`
  query countries {
    countries(orderBy: NAME_ASC) {
      totalCount
      nodes {
        ...country
      }
    }
  }
  ${COUNTRY_FRAGMENT}
`;
export default {
  name: 'Countries',
  data() {
    return {
      countries: {
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
        { text: 'ISO', value: 'iso', align: 'left', sortable: true },
        {
          text: 'Cities',
          value: 'cities.totalCount',
          align: 'left',
          sortable: true,
        },
        { text: 'Created At', value: 'createdAt', sortable: true },
        { text: 'Updated At', value: 'updatedAt', sortable: true },
      ],
      editedIndex: -1,
      editedItem: {
        name: '',
        iso: '',
      },
      defaultItem: {
        name: '',
        iso: '',
      },
    };
  },
  computed: {
    formTitle() {
      return this.editedIndex === -1 ? 'Add new country' : 'Edit Country';
    },
  },
  watch: {
    dialog(val) {
      val || this.close();
    },
  },
  methods: {
    editItem(item) {
      this.editedIndex = this.countries.nodes.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialog = true;
    },

    deleteItem(item) {
      const index = this.countries.nodes.indexOf(item);
      const nodeId = item.nodeId;
      confirm('Are you sure you want to delete this item?') &&
        this.$apollo.mutate({
          mutation: gql`
            mutation deleteCountry($input: DeleteCountryInput!) {
              deleteCountry(input: $input) {
                deletedCountryId
              }
            }
          `,
          variables: {
            input: {
              nodeId,
            },
          },
          update: (store, { data: { deleteCountry } }) => {
            const data = store.readQuery({ query: COUNTRIES });
            data.countries.nodes.splice(index, 1);
            store.writeQuery({ query: COUNTRIES, data });
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
        await this.updateCountry(this.editedItem);
      } else {
        // save new
        await this.addCountry(this.editedItem);
      }
      this.close();
    },

    async addCountry(item) {
      const country = {
        name: item.name,
        iso: item.iso,
      };
      this.$apollo.mutate({
        mutation: gql`
          mutation createCountry($input: CreateCountryInput!) {
            createCountry(input: $input) {
              country {
                ...country
              }
            }
          }
          ${COUNTRY_FRAGMENT}
        `,
        variables: {
          input: { country },
        },
        update: (store, { data: { createCountry } }) => {
          const data = store.readQuery({ query: COUNTRIES });
          data.countries.nodes.push(createCountry.country);
          store.writeQuery({ query: COUNTRIES, data });
        },
      });
    },
    async updateCountry(item) {
      const index = this.countries.nodes.indexOf(item);
      const input = {
        nodeId: item.nodeId,
        patch: {
          name: item.name,
          iso: item.iso,
        },
      };
      this.$apollo.mutate({
        mutation: gql`
          mutation updateCountry($input: UpdateCountryInput!) {
            updateCountry(input: $input) {
              country {
                ...country
              }
            }
          }
          ${COUNTRY_FRAGMENT}
        `,
        variables: {
          input,
        },
        update: (store, { data: { updateCountry } }) => {
          const data = store.readQuery({ query: COUNTRIES });
          data.countries.nodes[index] = updateCountry.country;
          store.writeQuery({ query: COUNTRIES, data });
        },
      });
    },
  },
  apollo: {
    countries: {
      query: COUNTRIES,
    },
  },
};
</script>

<style lang="scss" scoped></style>
