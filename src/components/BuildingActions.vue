<template>
  <div>
    <slot :add="add" :loading="loading" />
  </div>
</template>

<script>
import gql from 'graphql-tag';
export default {
  data() {
    return {
      loading: false,
    };
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
