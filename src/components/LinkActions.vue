<template>
  <div>
    <slot
      :links="links"
      :add-link="addLink"
      :loading="loading || $apollo.loading"
    />
  </div>
</template>

<script>
import gql from 'graphql-tag';
export default {
  name: 'LinkActions',
  props: {
    buildingId: {
      type: [Number, String],
      required: true,
    },
  },
  data() {
    return {
      links: null,
      loading: false,
    };
  },
  apollo: {
    links: {
      query: gql`
        query links($condition: LinkCondition) {
          links(condition: $condition) {
            nodes {
              id
              source {
                name
                website
              }
              title
              url
            }
            totalCount
          }
        }
      `,
      variables() {
        return {
          condition: {
            buildingId: Number(this.buildingId),
          },
        };
      },
    },
  },
  methods: {
    async addLink(buildingId, sourceId, title, url) {
      this.loading = true;
      const input = {
        link: {
          buildingId: Number(buildingId),
          sourceId,
          url,
          title,
        },
      };
      try {
        await this.createLink(input);
        this.success();
      } catch (e) {
        console.error(e);
      } finally {
        this.loading = false;
      }
    },
    async createLink(input) {
      this.$apollo.mutate({
        mutation: gql`
          mutation createLink($input: CreateLinkInput!) {
            createLink(input: $input) {
              clientMutationId
            }
          }
        `,
        variables: {
          input,
        },
        refetchQueries: ['links'],
      });
    },
    success() {
      this.$emit('success');
    },
  },
};
</script>
