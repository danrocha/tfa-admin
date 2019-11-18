<template>
  <div>
    <slot
      :sources="linkSources"
      :add-Source="addSource"
      :loading="loading || $apollo.loading"
    />
  </div>
</template>

<script>
import gql from 'graphql-tag';
export default {
  name: 'LinkSourceActions',
  data() {
    return {
      linkSources: null,
      loading: false,
    };
  },
  apollo: {
    linkSources: {
      query: gql`
        query linkSources {
          linkSources(orderBy: NAME_ASC) {
            nodes {
              id
              name
              website
            }
            totalCount
          }
        }
      `,
    },
  },
  methods: {
    async addSource(name, website) {
      this.loading = true;
      const input = {
        linkSource: {
          website,
          name,
        },
      };
      try {
        await this.createLinkSource(input);
        this.success();
      } catch (e) {
        console.error(e);
      } finally {
        this.loading = false;
      }
    },
    async createLinkSource(input) {
      this.$apollo.mutate({
        mutation: gql`
          mutation createLinkSource($input: CreateLinkSourceInput!) {
            createLinkSource(input: $input) {
              clientMutationId
            }
          }
        `,
        variables: {
          input,
        },
        refetchQueries: ['linkSources'],
      });
    },
    success() {
      this.$emit('success');
    },
  },
};
</script>
