<script setup lang="ts">
import axios from "axios";
import debounce from "lodash.debounce";
import "leaflet/dist/leaflet.css";
import { LMap, LTileLayer, LGeoJson } from "@vue-leaflet/vue-leaflet";
import { ref, computed, watch } from "vue";

const baseURL = "http://127.0.0.1:8000";

const censuscodeItems = ref([""]);
const censuscodeSearch = ref("");
const censuscodeSelect = ref();
const censuscodeLoading = ref(false);
const sideBar = ref(null);

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
  const props = layer.feature.geometry;
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
    let query = `${baseURL}/app_gis/new_geojson?`;
    for (const i in censuscodeSelect.value) {
      query = query + "censuscode=" + censuscodeSelect.value[i] + "&";
    }
    // formating query result
    axios.get(query).then((response) => {
      let datas = response.data;
      console.log(datas);
      datas.forEach(function (item: any) {
        item.geojson.state = item.state;
        item.geojson.blkgrpce = item.blkgrpce;
        item.geojson.censuscode = item.censuscode;
        res.push(item.geojson);
      });
      geojsonSelect.value = res;
    });
  }
}

function centerUpdate(new_center: any){
  center.value = new_center;
}

function bugLog() {
  console.log(geojsonSelect.value);
}
</script>

<template>
  <!-- sidebar -->
  <v-navigation-drawer v-model="sideBar" temporary>
    <div class="list" v-if="geojsonSelect != null" style="text-align: center">
      <h1 style="margin-top: 25px">RESULTS</h1>
      <v-btn class="button" v-for="feature in geojsonSelect" :key="feature" @click="centerUpdate([32.3528055,-90.8777342])">
        {{ `${feature.censuscode} - ${feature.blkgrpce}` }}
      </v-btn>
    </div>
    <div v-else style="text-align: center">
      <h1 style="margin-top: 25px">EMPTY</h1>
    </div>
  </v-navigation-drawer>

  <v-toolbar style="background: #e86221; margin: 0px">
    <v-btn @click="sideBar = !sideBar" style="margin-left: 0px">
      <v-icon
        icon="fa-solid fa-bars"
        style="color: black"
        size="x-large"
      ></v-icon>
    </v-btn>

    <v-autocomplete
      v-model="censuscodeSelect"
      v-model:search.sync="censuscodeSearch"
      label="Enter CensusCode"
      :loading="censuscodeLoading"
      :items="censuscodeItems"
      type="number"
      variant="solo"
      multiple
      clearable
      style="padding-top: 1rem; padding-right: 5px; font-size: 2rem"
    />
    <v-btn flat icon="fas fa-search" @click="geojsonUpdate" class="button" />
    <!-- https://vuetifyjs.com/en/components/inputs/ -->
    <v-text-field
      label="Enter Location"
      v-model="addressSelect"
      style="padding-top: 1rem; padding-right: 5px; font-size: 2rem"
    />
    <v-btn flat icon="fas fa-search" @click="addressUpdate" class="button" />
    <v-btn flat icon="fas fa-bug" @click="bugLog" />
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
        <!-- url="http://{s}.mqcdn.com/tiles/1.0.0/sat/{z}/{x}/{y}.png" -->
        <!-- :options = "{subdomains: ['otile1','otile2','otile3','otile4']}" -->

<style scoped>
.v-text-field:deep() input {
  font-size: 1.3rem;
  background: #212121;
}

.v-text-field {
  background: #212121;
}

.button {
  margin: 3px;
  background: #e86221;
  color: black;
}
</style>
