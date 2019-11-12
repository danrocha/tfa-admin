<template>
  <div>
    <v-select
      v-if="!architect"
      v-model="architect"
      :loading="$apollo.loading"
      autofocus
      :items="architects ? architects.nodes : []"
      item-text="name"
      item-value="id"
      label="Select an architect/office"
      :hint="architect ? architect.website : ''"
      return-object
      :menu-props="{ openOnClick: true }"
      @change="selectArchitect"
    ></v-select>
    <div v-else class="flex justify-between items-center">
      <p class="text-lg font-bold">
        {{ architect.name }}
        <br />
        <span v-if="architect.website" class="text-sm font-normal">
          {{ architect.website }}
        </span>
      </p>
      <v-btn normal small round @click="architect = null">change</v-btn>
    </div>
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
