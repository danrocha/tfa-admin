<template>
  <div class="w-2/3">
    <v-btn flat color="primary" dark small to="/architects"
      >{{ architects.totalCount }} architects</v-btn
    >
    <v-btn flat color="primary" dark small to="/buildings"
      >{{ buildings.totalCount }} buildings</v-btn
    >
    <v-btn flat color="primary" dark small to="/cities"
      >{{ cities.totalCount }} cities</v-btn
    >
    <v-btn flat color="primary" dark small to="/countries"
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
