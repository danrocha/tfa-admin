<template>
  <v-data-table
    :headers="headers"
    :items="buildings.nodes"
    item-key="nodeId"
    class="shadow"
    disable-pagination
    hide-default-footer
    :loading="$apollo.loading"
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
        <v-btn color="primary" dark class="mb-2" to="/add-building">Add</v-btn>
      </v-toolbar>
    </template>

    <template v-slot:item.action="{ item }">
      <v-icon small class="mr-2" @click="editItem(item)">
        edit
      </v-icon>
      <v-icon small @click="deleteItem(item)">
        delete
      </v-icon>
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
    buildings(orderBy: CREATED_AT_DESC) {
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
