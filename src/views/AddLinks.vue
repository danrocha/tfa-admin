<template>
  <div class="w-2/3 px-4">
    <h1 class="text-2xl uppercase mb-8">Add Links to Building</h1>
    <building-actions :building-id="buildingId" :get-building="true">
      <template v-slot="{ building, loading }">
        <div v-if="loading">Loading...</div>
        <div v-else>
          <h2 class="text-2xl font-bold mb-4">{{ building.name }}</h2>
        </div>
      </template>
    </building-actions>
    <link-actions :building-id="buildingId" @success="clear()">
      <template v-slot="{ loading, addLink, links }">
        <div v-if="links.totalCount">
          <ul class="list-disc mb-6">
            <li v-for="link in links.nodes" :key="link.id">
              <a :href="link.url" target="_blank">{{ link.title }}</a>
              <span v-if="link.source"> ({{ link.source.name }})</span>
            </li>
          </ul>
        </div>
        <div class="mb-4">
          <select-source v-model="sourceId" />
          <v-text-field v-model="title" label="Title" required></v-text-field>
          <v-text-field
            v-model="url"
            label="URL"
            required
            placeholder="https://..."
          ></v-text-field>
        </div>
        <div>
          <v-btn
            color="primary"
            :disabled="!url || !title"
            @click="addLink(buildingId, sourceId, title, url)"
            >Add</v-btn
          >
          <v-btn text to="/">Cancel</v-btn>
        </div>
      </template>
    </link-actions>
  </div>
</template>

<script>
import BuildingActions from '@/components/BuildingActions';
import LinkActions from '@/components/LinkActions';
import SelectSource from '@/components/SelectSource';
export default {
  name: 'AddBuilding',
  components: {
    SelectSource,
    LinkActions,
    BuildingActions,
  },
  data() {
    return {
      buildingId: this.$route.query.buildingId,
      url: '',
      title: '',
      sourceId: null,
    };
  },
  methods: {
    clear() {
      this.url = '';
      this.title = '';
      this.sourceId = '';
    },
  },
};
</script>

<style lang="scss" scoped></style>
