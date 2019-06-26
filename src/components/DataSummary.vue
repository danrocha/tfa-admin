<template>
  <div>
    <p v-if="architects">{{ architects.totalCount }} architects.</p>
    <p v-if="buildings">{{ buildings.totalCount }} buildings.</p>
  </div>
</template>

<script>
import gql from 'graphql-tag';

export default {
  name: 'DataSummary',
  data() {
    return {
      architects: null,
      buildings: null
    };
  },
  apollo: {
    architects: {
      query: gql`
        query architects {
          architects {
            totalCount
          }
        }
      `
    },
    buildings: {
      query: gql`
        query buildings {
          buildings {
            totalCount
          }
        }
      `
    }
  }
};
</script>

<style lang="scss" scoped></style>
