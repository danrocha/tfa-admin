<template>
  <div v-if="$apollo.loading">Loading...</div>
  <div v-else>
    <v-toolbar flat color="white">
      <v-toolbar-title>Architects</v-toolbar-title>
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
      </v-dialog>
    </v-toolbar>
    <v-data-table
      :headers="headers"
      :items="architects.nodes"
      expand
      item-key="nodeId"
      class="shadow"
    >
      <template v-slot:items="props">
        <tr @click="props.expanded = !props.expanded">
          <td>{{ props.item.name }}</td>
          <td>
            <a :href="props.item.website" target="_blank">
              {{ props.item.website | formatUrl }}
            </a>
          </td>
          <td>{{ props.item.architectBuildings.totalCount }}</td>
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
            <ul v-if="props.item.architectBuildings.totalCount > 0">
              <li
                v-for="architectBuilding in props.item.architectBuildings.nodes"
                :key="architectBuilding.id"
              >
                {{ architectBuilding.building.name }} -
                {{ architectBuilding.building.city.name }}
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
const ARCHITECT_FRAGMENT = gql`
  fragment architect on Architect {
    nodeId
    id
    name
    website
    createdAt
    updatedAt
    architectBuildings {
      totalCount
      nodes {
        building {
          city {
            name
          }
          name
        }
        id
      }
    }
  }
`;
const ARCHITECTS = gql`
  query architects {
    architects(orderBy: NAME_ASC) {
      totalCount
      nodes {
        ...architect
      }
    }
  }
  ${ARCHITECT_FRAGMENT}
`;
export default {
  name: 'Architects',
  data() {
    return {
      architects: {
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
        { text: 'Website', value: 'website', align: 'left', sortable: false },
        {
          text: 'Buildings',
          value: 'architectBuildings.totalCount',
          align: 'left',
          sortable: true,
        },
        { text: 'Created At', value: 'createdAt', sortable: true },
        { text: 'Updated At', value: 'updatedAt', sortable: true },
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
      return this.editedIndex === -1 ? 'Add new architect' : 'Edit Architect';
    },
  },
  watch: {
    dialog(val) {
      val || this.close();
    },
  },
  methods: {
    editItem(item) {
      this.editedIndex = this.architects.nodes.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialog = true;
    },

    deleteItem(item) {
      const index = this.architects.nodes.indexOf(item);
      const nodeId = item.nodeId;
      confirm('Are you sure you want to delete this item?') &&
        this.$apollo.mutate({
          mutation: gql`
            mutation deleteArchitect($input: DeleteArchitectInput!) {
              deleteArchitect(input: $input) {
                deletedArchitectId
              }
            }
          `,
          variables: {
            input: {
              nodeId,
            },
          },
          update: (store, { data: { deleteArchitect } }) => {
            const data = store.readQuery({ query: ARCHITECTS });
            data.architects.nodes.splice(index, 1);
            store.writeQuery({ query: ARCHITECTS, data });
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
        await this.updateArchitect(this.editedItem);
      } else {
        // save new
        await this.addArchitect(this.editedItem);
      }
      this.close();
    },

    async addArchitect(item) {
      const architect = {
        name: item.name,
        website: item.website,
      };
      this.$apollo.mutate({
        mutation: gql`
          mutation createArchitect($input: CreateArchitectInput!) {
            createArchitect(input: $input) {
              architect {
                ...architect
              }
            }
          }
          ${ARCHITECT_FRAGMENT}
        `,
        variables: {
          input: { architect },
        },
        update: (store, { data: { createArchitect } }) => {
          const data = store.readQuery({ query: ARCHITECTS });
          data.architects.nodes.push(createArchitect.architect);
          store.writeQuery({ query: ARCHITECTS, data });
        },
      });
    },
    async updateArchitect(item) {
      const index = this.architects.nodes.indexOf(item);
      const input = {
        nodeId: item.nodeId,
        patch: {
          name: item.name,
          website: item.website,
        },
      };
      this.$apollo.mutate({
        mutation: gql`
          mutation updateArchitect($input: UpdateArchitectInput!) {
            updateArchitect(input: $input) {
              architect {
                ...architect
              }
            }
          }
          ${ARCHITECT_FRAGMENT}
        `,
        variables: {
          input,
        },
        update: (store, { data: { updateArchitect } }) => {
          const data = store.readQuery({ query: ARCHITECTS });
          data.architects.nodes[index] = updateArchitect.architect;
          store.writeQuery({ query: ARCHITECTS, data });
        },
      });
    },
  },
  apollo: {
    architects: {
      query: ARCHITECTS,
    },
  },
};
</script>

<style lang="scss" scoped></style>
