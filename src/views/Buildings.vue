<template>
  <div v-if="$apollo.loading">Loading...</div>
  <div v-else>
    <v-toolbar flat color="white">
      <v-toolbar-title>Buildings</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn
        color="primary"
        dark
        class="mb-2"
        @push="$router.push('/add-building')"
        >Add</v-btn
      >
      <!-- <v-dialog v-model="dialog" max-width="500px">
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
              <v-text-field
                v-model="editedItem.website"
                label="Website"
              ></v-text-field>
            </v-container>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="secondary" flat @click="close">Cancel</v-btn>
            <v-btn color="primary" @click="save">Save</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog> -->
    </v-toolbar>
    <v-data-table
      :headers="headers"
      :items="buildings.nodes"
      expand
      item-key="nodeId"
      class="shadow"
    >
      <template v-slot:items="props">
        <tr @click="props.expanded = !props.expanded">
          <td>{{ props.item.name }}</td>
          <td>
            <ul>
              <li
                v-for="architectBuilding in props.item.architectBuildings.nodes"
                :key="architectBuilding.id"
              >
                {{ architectBuilding.architect.name }}
              </li>
            </ul>
          </td>
          <td>
            <p>{{ props.item.city.name }}</p>
            <p v-if="props.item.address" class="text-gray-500">
              {{ props.item.address }}
            </p>
          </td>
          <td>{{ props.item.year }}</td>
          <td>
            <p>{{ props.item.typology }}</p>
            <p v-if="props.item.gfa">{{ props.item.gfa }}sqm</p>
            <p v-if="props.item.height > 0">{{ props.item.height }}m</p>
          </td>
          <td>
            <a :href="props.item.website" target="_blank">{{
              props.item.website | formatUrl
            }}</a>
          </td>
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

      <template v-slot:no-data>
        <!-- <v-btn color="primary" @click="initialize">Reset</v-btn> -->
      </template>
    </v-data-table>
  </div>
</template>

<script>
import gql from 'graphql-tag';
const BUILDING_FRAGMENT = gql`
  fragment building on Building {
    nodeId
    id
    name
    address
    architectBuildings {
      totalCount
      nodes {
        id
        architectId
        architect {
          id
          name
        }
      }
    }
    city {
      name
    }
    website
    year
    typology
    gfa
    height
    createdAt
    updatedAt
  }
`;
const BUILDINGS = gql`
  query buildings {
    buildings(orderBy: NAME_ASC) {
      totalCount
      nodes {
        ...building
      }
    }
  }
  ${BUILDING_FRAGMENT}
`;
export default {
  name: 'Buildings',
  data() {
    return {
      buildings: {
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
        {
          text: 'Architects',
          align: 'left',
          sortable: false,
        },
        {
          text: 'Location',
          align: 'left',
          sortable: true,
          value: 'city.name',
        },

        {
          text: 'Year',
          align: 'left',
          sortable: true,
          value: 'year',
          width: '25px',
        },
        {
          text: 'Details',
          align: 'left',
          sortable: false,
          value: 'details',
        },
        { text: 'Website', value: 'website', align: 'left', sortable: false },

        {
          text: 'Created At',
          value: 'createdAt',
          sortable: true,
          width: '75',
        },
        {
          text: 'Updated At',
          value: 'updatedAt',
          sortable: true,
          width: '75',
        },
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
  computed: {
    formTitle() {
      return this.editedIndex === -1 ? 'Add new building' : 'Edit Building';
    },
  },
  watch: {
    dialog(val) {
      val || this.close();
    },
  },
  methods: {
    editItem(item) {
      this.editedIndex = this.buildings.nodes.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialog = true;
    },

    deleteItem(item) {
      const index = this.buildings.nodes.indexOf(item);
      const nodeId = item.nodeId;
      confirm('Are you sure you want to delete this item?') &&
        this.$apollo.mutate({
          mutation: gql`
            mutation deleteBuilding($input: DeleteBuildingInput!) {
              deleteBuilding(input: $input) {
                deletedBuildingId
              }
            }
          `,
          variables: {
            input: {
              nodeId,
            },
          },
          update: (store, { data: { deleteBuilding } }) => {
            const data = store.readQuery({ query: BUILDINGS });
            data.buildings.nodes.splice(index, 1);
            store.writeQuery({ query: BUILDINGS, data });
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
        await this.updateBuilding(this.editedItem);
      } else {
        // save new
        await this.addBuilding(this.editedItem);
      }
      this.close();
    },

    async addBuilding(item) {
      const building = {
        name: item.name,
        website: item.website,
      };
      this.$apollo.mutate({
        mutation: gql`
          mutation createBuilding($input: CreateBuildingInput!) {
            createBuilding(input: $input) {
              building {
                ...building
              }
            }
          }
          ${BUILDING_FRAGMENT}
        `,
        variables: {
          input: { building },
        },
        update: (store, { data: { createBuilding } }) => {
          const data = store.readQuery({ query: BUILDINGS });
          data.buildings.nodes.push(createBuilding.building);
          store.writeQuery({ query: BUILDINGS, data });
        },
      });
    },
    async updateBuilding(item) {
      const index = this.buildings.nodes.indexOf(item);
      const input = {
        nodeId: item.nodeId,
        patch: {
          name: item.name,
          website: item.website,
        },
      };
      this.$apollo.mutate({
        mutation: gql`
          mutation updateBuilding($input: UpdateBuildingInput!) {
            updateBuilding(input: $input) {
              building {
                ...building
              }
            }
          }
          ${BUILDING_FRAGMENT}
        `,
        variables: {
          input,
        },
        update: (store, { data: { updateBuilding } }) => {
          const data = store.readQuery({ query: BUILDINGS });
          data.buildings.nodes[index] = updateBuilding.building;
          store.writeQuery({ query: BUILDINGS, data });
        },
      });
    },
  },
  apollo: {
    buildings: {
      query: BUILDINGS,
    },
  },
};
</script>

<style lang="scss" scoped></style>
