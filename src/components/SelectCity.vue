<template>
  <div>
    <v-select
      v-model="cityId"
      :value="value"
      :loading="$apollo.loading"
      :items="cities.nodes"
      item-text="name"
      item-value="id"
      label="Select a city"
      @change="select"
      prepend-icon="map"
    ></v-select>
  </div>
</template>

<script>
import gql from 'graphql-tag';
export default {
  name: 'SelectCity',
  props: {
    value: {
      type: Number,
      default: null,
    },
  },
  data() {
    return {
      cities: null,
      cityId: null,
    };
  },
  apollo: {
    cities: {
      query: gql`
        query cities {
          cities(orderBy: NAME_ASC) {
            totalCount
            nodes {
              id
              name
            }
          }
        }
      `,
    },
  },
  methods: {
    select(e) {
      this.$emit('input', e[0]);
    },
  },
};
</script>

<style lang="scss" scoped></style>
