<template>
  <div>
    <v-autocomplete
      v-show="!place"
      id="autocomplete"
      v-model="place"
      auto-select-first
      clearable
      item-text="formatted_address"
      :menu-props="{ closeOnClick: true, closeOnContentClick: true }"
    ></v-autocomplete>

    <div v-if="place" class="flex items-center justify-between">
      <p>{{ place.formatted_address }}</p>
      <v-btn normal small round @click="architect = null">change</v-btn>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AddressAutocomplete',
  data() {
    return {
      autocomplete: null,
      componentForm: {
        street_number: 'short_name',
        route: 'long_name',
        locality: 'long_name',
        administrative_area_level_1: 'short_name',
        country: 'long_name',
        postal_code: 'short_name',
      },
      street_number: '',
      route: '',
      locality: '',
      administrative_area_level_1: '',
      country: '',
      postal_code: '',
      place: null,
    };
  },
  mounted() {
    this.autocomplete = new google.maps.places.Autocomplete(
      document.getElementById('autocomplete'),
      { types: ['geocode'] }
    );

    // Avoid paying for data that you don't need by restricting the set of
    // place fields that are returned to just the address components.
    this.autocomplete.setFields([
      'address_component',
      'geometry',
      'formatted_address',
    ]);

    // When the user selects an address from the drop-down, populate the
    // address fields in the form.
    this.autocomplete.addListener('place_changed', this.fillInAddress);
  },
  methods: {
    setAddress() {},
    fillInAddress() {
      const place = this.autocomplete.getPlace();
      console.log(place);
      this.place = { ...place };

      // Get each component of the address from the place details,
      // and then fill-in the corresponding field on the form.
      for (let i = 0; i < this.place.address_components.length; i++) {
        const addressType = this.place.address_components[i].types[0];
        if (this.componentForm[addressType]) {
          let val = this.place.address_components[i][
            this.componentForm[addressType]
          ];
          this[addressType] = val;
        }
      }
    },
  },
};
</script>

<style lang="scss" scoped></style>
