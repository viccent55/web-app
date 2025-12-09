<script lang="ts" setup>
  defineProps({
    item: {
      type: Object as PropType<EmptyObjectType>,
      default: () => ({}),
    },
    cover: {
      type: Boolean,
      default: false,
    },
    height: {
      type: String,
      default: "160px",
    },
    width: {
      type: String,
      default: "auto",
    },
  });
</script>
<template>
  <v-sheet color="transparent">
    <v-hover v-slot="{ isHovering, props }">
      <v-card
        tag="article"
        v-bind="props"
        flat
        class="transition-fast-in-fast-out"
        :class="[isHovering ? 'bg-default' : 'bg-none']"
      >
        <div class="pa-md-4 d-flex justify-center">
          <Image
            :height="height"
            :width="width"
            :cover="cover"
            :src="item.cover"
          ></Image>
        </div>
        <v-card-text class="text-subtitle-2 pt-2 pb-0">
          {{ item.name }}
        </v-card-text>

        <v-card-text class="text-body-2 text-grey-darken-1 py-1">
          <div class="truncate-2 mb-2">
            {{ item.intro }}
          </div>
        </v-card-text>
      </v-card>
    </v-hover>
  </v-sheet>
</template>
