<template>
  <div>
    <v-select
      v-model="architect"
      :loading="$apollo.loading"
      autofocus
      :items="architects.nodes"
      item-text="name"
      item-value="id"
      label="Select an architect/office"
      multiple
      chips
      deletable-chips
      prepend-icon="person"
      @change="selectArchitect"
    ></v-select>
  </div>
</template>

<script>
import gql from 'graphql-tag';
export default {
  name: 'SelectArchitect',
  data() {
    return {
      architects: null,
      architect: null,
    };
  },
  apollo: {
    architects: {
      query: gql`
        query architects {
          architects(orderBy: NAME_ASC) {
            totalCount
            nodes {
              id
              name
              website
            }
          }
        }
      `,
    },
  },
  methods: {
    selectArchitect() {
      this.$emit('input', this.architect);
    },
  },
};
</script>

<style lang="scss" scoped></style>
