<script setup lang="ts">
import axios from "axios";
import debounce from "lodash.debounce";
import GeoJson from "geojson";
import "leaflet/dist/leaflet.css";
import { LMap, LTileLayer, LGeoJson } from "@vue-leaflet/vue-leaflet";
import { ref, computed, watch } from "vue";

const baseURL = "http://127.0.0.1:8000";

const censuscodeItems = ref([""]);
const censuscodeSearch = ref("");
const censuscodeSelect = ref();
const censuscodeLoading = ref(false);
const drawer = ref(null);

const addressSelect = ref([""]);

let center = ref([32.474125, -86.419951]);
let centers: any;
let zoom = 14;
let geojsonSelect = ref(null);

function censuscodeItemsUpdate(v: string) {
  censuscodeLoading.value = true;
  axios
    .get(`${baseURL}/app_gis/censuscode?censuscode=${v}`)
    .then((response) => {
      censuscodeItems.value = response.data;
      censuscodeLoading.value = false;
    });
}

function getLabel(layer: any) {
  const props = layer.feature.properties;
  return `censuscode: ${props.censuscode}<br>blkgrpce: ${props.blkgrpce}<br>state: ${props.state}`;
}

const geojsonOptions = computed(() => {
  return {
    onEachFeature: (_: null, layer: any) => {
      layer.bindPopup((l: any) => getLabel(l));
      layer.on("mouseover", () => {
        layer.openPopup();
      });
      layer.on("mouseout", () => {
        layer.closePopup();
      });
    },
  };
});

watch(
  censuscodeSearch,
  debounce((val: string) => {
    censuscodeItemsUpdate(val);
  }, 500)
);

function addressUpdate() {
  axios
    .get(`${baseURL}/app_gis/lat_lon?address=${addressSelect.value}`)
    .then((response) => {
      center.value = response.data;
    });
}

function geojsonUpdate() {
  if (censuscodeSelect.value !== undefined) {
    let res = [];
    // create the query
    let query = `${baseURL}/app_gis/geojson?`;
    for (const i in censuscodeSelect.value) {
      query = query + "censuscode=" + censuscodeSelect.value[i] + "&";
    }
    // formating query result
    axios.get(query).then((response) => {
      let datas = response.data;
      // TODO: make an interface
      datas.forEach(function (item: any) {
        let data: object;
        if (item.type == "POLYGON") {
          data = {
            state: item.state,
            censuscode: item.censuscode,
            blkgrpce: item.blkgrpce,
            geo_str: eval(item.geo_str),
          };
        } else if (item.type == "MULTIPOLYGON") {
          data = {
            state: item.state,
            censuscode: item.censuscode,
            blkgrpce: item.blkgrpce,
            geo_metry: eval(item.geo_str),
          };
        }
        res.push(data);
      });
      geojsonSelect.value = GeoJson.parse(res, {
        Polygon: "geo_str",
        MultiPolygon: "geo_metry",
      });
    });
  }
}

function bugLog() {
  // console.log(geojsonSelect.value.features[0].properties.censuscode);
  // console.log(centers);
  console.log(geojsonSelect.value);
  for (const i in geojsonSelect.value){
    console.log(i)
  }
}
</script>

<template>
  <!-- sidebar -->
  <v-navigation-drawer v-model="drawer" temporary>
    <div class="list" v-if="geojsonSelect != null">
      <ul>
        <li v-for="feature in geojsonSelect.value" :key="feature">
          {{ feature }}
        </li>
      </ul>
      <!-- <h1>not null</h1> -->
    </div>
    <div v-else>
      <h1>null</h1>
    </div>
  </v-navigation-drawer>

  <v-toolbar>
    <v-app-bar-nav-icon
      @click="drawer = !drawer"
      style="margin: 3px"
    ></v-app-bar-nav-icon>

    <v-autocomplete
      v-model="censuscodeSelect"
      v-model:search.sync="censuscodeSearch"
      label="Enter CensusCode"
      :loading="censuscodeLoading"
      :items="censuscodeItems"
      type="number"
      variant="solo"
      multiple
      style="padding-top: 1rem; padding-right: 5px; font-size: 2rem"
    />
    <v-btn
      flat
      icon="fas fa-search"
      variant="outlined"
      @click="geojsonUpdate"
    />
    <v-spacer />
    <!-- https://vuetifyjs.com/en/components/inputs/ -->
    <v-text-field
      label="Enter Location"
      v-model="addressSelect"
      style="padding-top: 1rem; padding-right: 5px; font-size: 2rem"
    />
    <v-btn
      flat
      icon="fas fa-search"
      variant="outlined"
      @click="addressUpdate"
    />
    <v-btn flat icon="fas fa-bug" variant="outlined" @click="bugLog" />
  </v-toolbar>
  <div style="height: 87vh; width: 100vw">
    <l-map ref="map" :zoom="zoom" :center="center">
      <l-tile-layer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        layer-type="base"
        name="OpenStreetMap"
      ></l-tile-layer>
      <l-geo-json :geojson="geojsonSelect" :options="geojsonOptions">
      </l-geo-json>
    </l-map>
  </div>
</template>

<style scoped>
.v-text-field:deep() input {
  font-size: 1.3rem;
  background: #212121;
}

.v-text-field {
  background: #212121;
}
</style>
