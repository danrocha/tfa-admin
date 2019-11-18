<template>
  <div class="container flex flex-col items-start justify-start">
    <v-btn outlined color="primary" x-large to="/architects" class="m-2"
      >{{ architects.totalCount }} architects</v-btn
    >
    <building-actions :get-total-count="true">
      <template v-slot="{ totalCount, loading }">
        <v-btn outlined color="primary" x-large to="/buildings" class="m-2"
          ><span v-if="loading">...</span
          ><span v-else>{{ totalCount }}</span> buildings</v-btn
        >
      </template>
    </building-actions>
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
import BuildingActions from '@/components/BuildingActions';

export default {
  name: 'DataSummary',
  components: {
    BuildingActions,
  },
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
