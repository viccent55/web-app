<script setup lang="ts">
import useSnackbar from '@/composables/useSnackbar';

// EXTERNAL CONTROL
const props = defineProps({
  modelValue: Boolean,
  hotAreas: {
    type: Array as PropType<EmptyArrayType>,
    default: () => [],
  },
  areas: {
    type: Array as PropType<EmptyArrayType>,
    default: () => [],
  },
});
const emit = defineEmits(["update:modelValue", "select"]);

const model = computed({
  get: () => props.modelValue,
  set: (v) => emit("update:modelValue", v),
});

// UI State
const state = reactive({
  selectedArea: <string | number>"",
  selectedProvince: <string | number>"",
  cities: [] as EmptyArrayType,
  selectedCity: <string | number>"",
  search: "",
});
const { showSnackbar } = useSnackbar();

// Actions
const onSelectProvince = (province: EmptyObjectType) => {
  state.selectedProvince = province.code;
  state.cities = province.children;
};

const onSelectCity = (city: EmptyObjectType) => {
  state.selectedCity = city.code;
};
watch(
  () => state.selectedProvince,
  () => {
    state.selectedCity = "";
  }
);

const selectHotArea = (area: Record<number | string, string>) => {
  state.selectedArea = area.code as string;
  if (area.key === "province") {
    state.selectedProvince = area.code as string;
    emit("select", {
      province: state.selectedProvince,
      city: "",
    });
  } else {
    state.selectedCity = area.code as string;
    emit("select", {
      province: "",
      city: state.selectedCity,
    });
  }
  model.value = false;
};

const closeSheet = () => {
  model.value = false;
  state.selectedCity = "";
  state.selectedProvince = "";
  state.selectedArea = "";
  state.search = "";
  state.cities = [];
};

const confirm = () => {
  if (!state.selectedProvince && !state.selectedCity) {
    return showSnackbar("请选择城市", "error", "center");
  }

  emit("select", {
    province: state.selectedProvince,
    city: state.selectedCity,
  });
  model.value = false;
};

const listHotArea = computed(() =>
  Object.entries(props.hotAreas).map(([code, arr]) => {
    const name = arr?.[0] || "";
    const key = arr?.[1] || ""; // province or city
    return {
      code,
      name,
      key,
    };
  })
);
const filteredProvinces = computed(() => {
  if (!state.search) return props.areas;
  const q = state.search.toLowerCase();
  return props.areas.filter((item: EmptyObjectType) =>
    item.name.toLowerCase().includes(q)
  );
});
const filteredCities = computed(() => {
  if (!state.search) return state.cities;
  const q = state.search.toLowerCase();
  return state.cities.filter((item: EmptyObjectType) =>
    item.name.toLowerCase().includes(q)
  );
});
</script>

<template>
  <v-bottom-sheet v-model="model" inset max-width="800px">
    <v-card class="pa-4">
      <!-- Header -->
      <div class="d-flex justify-space-between align-center mb-2">
        <span class="text-h6">城市地区</span>
        <div class="d-flex align-center ga-2">
          <v-btn density="comfortable" @click="
            () => {
              closeSheet();
              emit('select', {
                province: '',
                city: '',
              });
            }
          " variant="tonal" color="warning" rounded="xl" flat>
            重置
            <v-icon>mdi-restore</v-icon>
          </v-btn>
          <v-btn icon variant="text" color="primary" size="small" @click="closeSheet">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
      </div>

      <!-- Search Input -->
      <v-text-field v-model="state.search" color="primary" density="compact" prepend-inner-icon="mdi-magnify"
        placeholder="请输入省份市区查询" rounded="xl" hide-details variant="outlined" />

      <!-- Hot Cities -->
      <div class="mt-4 text-body-1 mb-2">热门城市</div>
      <div class="d-flex flex-wrap ga-3 mb-4">
        <v-chip v-for="(hot, index) in listHotArea" :key="index" @click="selectHotArea(hot)"
          :color="state.selectedArea === hot?.code ? 'primary' : undefined" class="px-4 py-2" rounded="lg">
          {{ hot?.name }}
        </v-chip>
      </div>

      <!-- Province + City List -->

      <v-row dense>
        <v-col cols="6">
          <div class="d-flex mt-2" style="height: 40vh; overflow-y: auto">
            <!-- Province List -->
            <v-list class="w-100" density="compact" activatable>
              <v-list-item v-for="(province, index) in filteredProvinces" :key="index" :class="state.selectedProvince == province.code
                ? 'text-primary font-weight-bold'
                : 'text-grey'
                " @click="onSelectProvince(province)">
                {{ province.name }}
              </v-list-item>
            </v-list>
          </div>
        </v-col>
        <v-col cols="6">
          <!-- City List -->
          <div class="d-flex mt-2" style="height: 40vh; overflow-y: auto">
            <v-list class="w-100" density="compact">
              <v-list-item v-for="(city, index) in filteredCities" :key="index" :class="state.selectedCity == city.code
                ? 'text-primary font-weight-bold'
                : 'text-grey'
                " @click="onSelectCity(city)">
                {{ city.name }}
              </v-list-item>
            </v-list>
          </div>
        </v-col>
      </v-row>

      <!-- Confirm Button -->
      <v-btn block color="primary" size="large" rounded="xl" class="mt-4 py-4" @click="confirm">
        确定
      </v-btn>
    </v-card>
  </v-bottom-sheet>
</template>
