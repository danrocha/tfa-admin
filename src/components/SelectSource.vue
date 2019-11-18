<template>
  <source-actions @success="dialog = false">
    <template v-slot="{ sources, addSource, loading }">
      <div class="flex items-center">
        <v-select
          v-if="!loading"
          v-model="sourceId"
          :value="value"
          :loading="loading"
          :items="sources.nodes"
          item-text="name"
          item-value="id"
          label="Select a source"
          prepend-icon="map"
          clearable
          @change="select"
        ></v-select>
        <v-dialog v-model="dialog" max-width="500px">
          <template v-slot:activator="{ on }">
            <v-btn icon v-on="on"><v-icon>add</v-icon></v-btn>
          </template>
          <v-card>
            <v-card-title>
              <h3 class="uppercase text-xl">Add Source</h3>
            </v-card-title>

            <v-card-text>
              <v-container>
                <v-text-field v-model="name" label="Name"></v-text-field>
                <v-text-field v-model="website" label="Website"></v-text-field>
              </v-container>
            </v-card-text>

            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="secondary" text @click="close">Cancel</v-btn>
              <v-btn color="primary" @click="addSource(name, website)"
                >Save</v-btn
              >
            </v-card-actions>
          </v-card>
        </v-dialog>
      </div>
    </template>
  </source-actions>
</template>

<script>
import SourceActions from '@/components/SourceActions';
export default {
  name: 'SelectSource',
  components: {
    SourceActions,
  },
  props: {
    value: {
      type: Number,
      default: null,
    },
  },
  data() {
    return {
      linkSources: null,
      sourceId: this.value,
      dialog: false,
      name: '',
      website: '',
    };
  },

  methods: {
    select() {
      this.$emit('input', this.sourceId);
    },
    close() {
      this.dialog = false;
    },
  },
};
</script>

<style lang="scss" scoped></style>
