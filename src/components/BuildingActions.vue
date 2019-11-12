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
    async add(building) {
      this.loading = true;
      console.log('adding from Building Actions', building);
      try {
        await this.$apollo.mutate({
          mutation: gql`
            addBuilding ($input: AddBuildingInput!) {
              addBuilding(input: $input) {
                clientMutationId
              }
            }
          `,
          variables: {
            input: {
              building,
            },
          },
          refetchQueries: ['buildings'],
        });
        this.success();
      } catch (e) {
        this.$emit('error', e);
        console.error(e);
      } finally {
        this.loading = false;
      }
    },
    success() {
      this.$emit('success');
    },
  },
};
</script>

<style scoped></style>
