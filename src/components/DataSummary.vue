<template>
  <div class="container flex flex-col items-start justify-start">
    <v-btn outlined color="primary" x-large to="/architects" class="m-2"
      >{{ architects.totalCount }} architects</v-btn
    >
    <v-btn outlined color="primary" x-large to="/buildings" class="m-2"
      >{{ buildings.totalCount }} buildings</v-btn
    >
    <v-btn outlined color="primary" x-large to="/cities" class="m-2"
      >{{ cities.totalCount }} cities</v-btn
    >
    <v-btn outlined color="primary" x-large to="/countries" class="m-2"
      >{{ countries.totalCount }} countries</v-btn
    >
  </div>
</template>

<script>
import gql from 'graphql-tag';

export default {
  name: 'DataSummary',
  data() {
    return {
      architects: null,
      buildings: null,
    };
  },
  apollo: {
    architects: {
      query: gql`
        query architects {
          architects(orderBy: NAME_ASC) {
            totalCount
          }
        }
      `,
    },
    buildings: {
      query: gql`
        query buildings {
          buildings {
            totalCount
          }
        }
      `,
    },
    countries: {
      query: gql`
        query countries {
          countries {
            totalCount
          }
        }
      `,
    },
    cities: {
      query: gql`
        query cities {
          cities {
            totalCount
          }
        }
      `,
    },
  },
};
</script>

<style lang="scss" scoped></style>
