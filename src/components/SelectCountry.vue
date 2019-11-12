<template>
  <div>
    <v-select
      v-model="countryId"
      :value="value"
      :loading="$apollo.loading"
      autofocus
      :items="countries ? countries.nodes : []"
      item-text="name"
      item-value="id"
      label="Select an country"
      :menu-props="{ openOnClick: true }"
      @change="selectArchitect"
    ></v-select>
  </div>
</template>

<script>
import gql from 'graphql-tag';
export default {
  name: 'SelectCountry',
  props: {
    value: {
      type: Number,
      default: null,
    },
  },
  data() {
    return {
      countries: null,
      countryId: null,
    };
  },
  apollo: {
    countries: {
      query: gql`
        query countries {
          countries(orderBy: NAME_ASC) {
            totalCount
            nodes {
              id
              name
              iso
            }
          }
        }
      `,
    },
  },
  methods: {
    selectArchitect() {
      this.$emit('input', this.countryId);
    },
  },
};
</script>

<style lang="scss" scoped></style>
