<template>
  <div>
    <slot
      :add="add"
      :loading="loading || $apollo.loading"
      :building="building"
      :buildings="buildings"
      :totalCount="totalCount"
    />
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
    lat
    lng
    createdAt
    updatedAt
  }
`;
export default {
  name: 'BuildingActions',
  props: {
    buildingId: {
      type: [Number, String],
      default: null,
    },
    getAllBuildings: {
      type: Boolean,
      default: false,
    },
    getTotalCount: {
      type: Boolean,
      default: false,
    },
    getBuilding: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      loading: false,
      buildings: null,
      building: null,
      totalCount: null,
    };
  },
  mounted() {
    this.$apollo.queries.buildingsTotalCount.skip = !this.getTotalCount;
    this.$apollo.queries.buildings.skip = !this.getAllBuildings;
    this.$apollo.queries.building.skip = !this.getBuilding && this.buildingId;
  },
  apollo: {
    buildingsTotalCount: {
      query: gql`
        query buildings {
          buildings {
            totalCount
          }
        }
      `,
      update(data) {
        return (this.totalCount = data.buildings.totalCount);
      },
      skip: true,
    },
    buildings: {
      query: gql`
        query buildings {
          buildings(orderBy: CREATED_AT_DESC) {
            totalCount
            nodes {
              ...building
            }
          }
        }
        ${BUILDING_FRAGMENT}
      `,
      skip: true,
    },
    building: {
      query: gql`
        query building($id: Int!) {
          building(id: $id) {
            ...building
          }
        }
        ${BUILDING_FRAGMENT}
      `,
      variables() {
        return {
          id: Number(this.buildingId),
        };
      },
      skip: true,
    },
  },
  watch: {
    getTotalCount(newVal) {
      if (newVal)
        return (this.$apollo.queries.buildingsTotalCount.skip = false);
    },
  },
  methods: {
    async add(buildingInfo) {
      this.loading = true;
      console.log('ADD...', buildingInfo);
      const {
        name,
        website,
        gmapsLink,
        gmapsEmbed,
        gfa,
        height,
        typology,
        cityId,
        year,
        architectIds,
      } = buildingInfo;
      const building = {
        name,
        website,
        gmapsLink,
        gmapsEmbed,
        gfa,
        height,
        typology,
        cityId,
        year: Number(year),
      };
      try {
        const buildingId = await this.addBuilding(building);
        console.log(`...added (id ${buildingId})`);
        await this.addBuildingArchitects(buildingId, architectIds);
        console.log('...added!');
        this.loading = false;
        this.success();
      } catch (e) {
        this.$emit('error', e);
        console.error(e);
      } finally {
        this.loading = false;
      }
    },
    async addBuilding(building) {
      console.log('... adding building...');
      try {
        const result = await this.$apollo.mutate({
          mutation: gql`
            mutation createBuilding($input: CreateBuildingInput!) {
              createBuilding(input: $input) {
                building {
                  id
                }
              }
            }
          `,
          variables: {
            input: {
              building,
            },
          },
        });
        return result.data.createBuilding.building.id;
      } catch (e) {
        console.error(e);
      }
    },
    async addBuildingArchitects(buildingId, architectIds) {
      console.log('...adding building <> architects...');
      for (const architectId of architectIds) {
        console.log(`...architect id ${architectId}`);
        const architectBuilding = {
          buildingId,
          architectId,
        };
        try {
          await this.$apollo.mutate({
            mutation: gql`
              mutation createArchitectBuilding(
                $input: CreateArchitectBuildingInput!
              ) {
                createArchitectBuilding(input: $input) {
                  clientMutationId
                }
              }
            `,
            variables: {
              input: {
                architectBuilding,
              },
            },
            refetchQueries: ['buildings'],
          });
        } catch (e) {
          console.error(e);
        }
      }
    },
    success() {
      console.log('FINISHED!');
      this.$emit('success');
    },
  },
};
</script>

<style scoped></style>
