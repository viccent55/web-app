<script lang="ts" setup>
import useVariable from '@/composables/useVariable';
import { screenMode } from '@/hooks/useScreenMode';

defineProps({
  item: {
    type: Object as PropType<EmptyObjectType>,
    default: () => ({}),
  },
  routeParam: {
    type: String,
    default: () => "",
  },
});
const { formatTime } = useVariable();

const articleCard = ref(null);
// get reactive width and height of the element
const imageDimensions = ref();

onMounted(() => { });

const isHoverImage = ref(false);
const displayLogicStyle = () => {
  if (isHoverImage.value) {
    return {
      position: "absolute",
      zIndex: 3,
      pointerEvents: "auto",
    };
  } else {
    return {
      position: "absolute",
      zIndex: 2,
      pointerEvents: "auto",
    };
  }
};
</script>

<template>
  <v-sheet color="transparent">
    <v-hover v-slot="{ isHovering, props: hoverProps }">
      <v-card ref="articleCard" v-bind="screenMode === 'phone' ? {} : hoverProps" :class="[
        'd-flex mb-0 mb-md-2 py-0 py-md-2 position-relative',
        screenMode === 'phone' ? 'flex-column' : '',
        isHovering ? 'bg-default' : 'bg-none',
      ]" tag="article" flat>
        <Image v-if="screenMode === 'phone'" v-show="!isHovering" :src="item?.cover"
          @image-dimensions="(v) => (imageDimensions = v)" contain height="auto" width="100%" />
        <v-avatar v-else size="180" rounded="0" class="mr-md-3">
          <Image v-show="!isHovering" :src="item?.cover" @image-dimensions="(v) => (imageDimensions = v)" contain
            height="180" width="100%" />
        </v-avatar>
        <!-- {{ (imageDimensions?.width / height) * 180 }} == {{ (width, height) }} -->
        <Image v-show="isHovering" :style="displayLogicStyle()" :src="item?.cover"
          @image-dimensions="(v) => (imageDimensions = v)" @mouseenter="isHoverImage = true"
          @mouseleave="isHoverImage = false" :width="String((imageDimensions?.width / imageDimensions?.height) * 180)
            " :height="screenMode === 'phone' ? '160' : '100%'" contain position="center"></Image>
        <v-card-text class="pt-2 pb-0" v-if="screenMode === 'phone'">
          <h4>{{ item?.title }}</h4>
          <v-row no-gutters class="mt-1" align="center">
            <v-col>
              <v-row dense class="text-caption text-grey">
                <v-col cols="12">
                  <div class="d-flex ga-2 align-center justify-end">
                    <div>
                      {{ formatTime(item?.created) }}
                    </div>
                    <div class="d-flex ga-2">
                      <v-icon>mdi-eye</v-icon>
                      <span>{{ item?.view_count }}</span>
                    </div>
                    <div class="d-flex ga-2">
                      <v-icon>mdi-chat-outline</v-icon>
                      <span>{{ item?.comment_count }}</span>
                    </div>
                    <div class="d-flex ga-2">
                      <v-icon>mdi-thumb-up-outline</v-icon>
                      <span>{{ item?.like_count }}</span>
                    </div>
                  </div>
                </v-col>
              </v-row>
            </v-col>
            <v-col cols="12">
              <div class="scroll-x d-flex w-full justify-end">
                <div class="d-flex align-center text-grey" v-if="item?.actors?.length > 0"
                  v-for="author in item?.actors" :key="author.id">
                  <DesktopActorProfile :item="author" :to="`/actor/${author.id}`" class="cursor-pointer" />
                </div>
                <div class="d-flex align-center text-grey" v-if="item?.categories?.length > 0"
                  v-for="category in item?.categories" :key="category.id">
                  <v-hover v-slot="{ isHovering, props }">
                    <v-chip v-bind="props" size="x-small" class="ma-1" :class="isHovering ? '' : 'bg-none text-grey'"
                      :color="isHovering ? 'primary' : ''" @click.stop :to="`/category_${category.id}`" flat>
                      {{ category.name }}
                    </v-chip>
                  </v-hover>
                </div>
                <div class="d-flex align-center text-grey" v-if="item?.subjects?.length > 0"
                  v-for="subject in item?.subjects" :key="subject.id">
                  <v-hover v-slot="{ isHovering, props }">
                    <v-chip v-bind="props" size="x-small" class="ma-1" :class="isHovering ? '' : 'bg-none text-grey'"
                      :color="isHovering ? 'primary' : ''" :to="`/subject/${subject.id}`" flat>
                      {{ subject.name }}
                    </v-chip>
                  </v-hover>
                </div>
              </div>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-text class="text-content" v-else>
          <div>
            <h3>{{ item?.title }}</h3>
            <div class="text-caption mt-1 text-grey truncatte-3">
              {{ item?.intro }}
            </div>
          </div>
          <v-row no-gutters class="mt-1">
            <v-col cols="12" v-if="
              (item.tags?.length ?? 0) > 0 ||
              (item.categories?.length ?? 0) > 0
            ">
              <div class="d-flex flex-wrap justify-end">
                <!-- Tags -->
                <template v-for="tag in item?.tags" :key="'tag-' + tag.id">
                  <v-hover v-slot="{ isHovering, props }">
                    <v-chip v-bind="props" size="x-small" class="ma-1" :class="isHovering ? '' : 'bg-none text-grey'"
                      :color="isHovering ? 'primary' : ''" @click.stop flat :to="'/tag/' + tag.id">
                      {{ tag.name }}
                    </v-chip>
                  </v-hover>
                </template>

                <!-- Categories -->
                <template v-for="category in item?.categories" :key="'category_' + category.id">
                  <v-hover v-slot="{ isHovering, props }">
                    <v-chip v-bind="props" size="x-small" class="ma-1" :class="isHovering ? '' : 'bg-none text-grey'"
                      :color="isHovering ? 'primary' : ''" :to="`/category_${category.id}`" flat>
                      {{ category.name }}
                    </v-chip>
                  </v-hover>
                </template>
              </div>
            </v-col>

            <v-col cols="12" v-if="
              (item.actors?.length ?? 0) > 0 ||
              (item.subjects?.length ?? 0) > 0
            ">
              <div class="d-flex flex-wrap justify-end ga-2 align-center text-grey">
                <!-- Actors -->
                <template v-for="author in item?.actors" :key="'actor-' + author.id">
                  <DesktopActorProfile :item="author" :to="`/actor/${author.id}`" />
                </template>

                <!-- Subjects -->
                <template v-for="subject in item?.subjects" :key="'subject-' + subject.id">
                  <v-hover v-slot="{ isHovering, props }">
                    <v-chip v-bind="props" size="x-small" class="ma-1" :class="isHovering ? '' : 'bg-none text-grey'"
                      :color="isHovering ? 'primary' : ''" @click.stop flat :to="`/subject/${subject.id}`">
                      {{ subject.name }}
                    </v-chip>
                  </v-hover>
                </template>
              </div>
            </v-col>

            <v-col cols="12">
              <div cols="12" class="d-flex align-center ga-4 justify-end text-caption text-grey pr-1">
                <div>
                  {{ formatTime(item?.created) }}
                </div>
                <div class="d-flex ga-2">
                  <v-icon>mdi-eye</v-icon>
                  <span>{{ item?.view_count }}</span>
                </div>
                <div class="d-flex ga-2">
                  <v-icon>mdi-chat-outline</v-icon>
                  <span>{{ item?.comment_count }}</span>
                </div>
                <div class="d-flex ga-2">
                  <v-icon>mdi-thumb-up-outline</v-icon>
                  <span>{{ item?.like_count }}</span>
                </div>
              </div>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-hover>
  </v-sheet>
</template>

<style scoped lang="scss">
.chip-top-left {
  position: absolute;
  top: 8px;
  left: 8px;
  z-index: 100;
  margin: 0;
  pointer-events: none;
}

.text-content {
  position: relative;
  padding-left: 5px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.position-relative {
  overflow: visible !important;
}

/* Mobile-specific styles */
@media (max-width: 467px) {
  .v-avatar {
    width: 100% !important;
    height: auto !important;
    aspect-ratio: 16/9;
  }

  .v-card {
    padding: 8px;
  }

  .text-content {
    padding: 8px !important;
  }

  .truncate-1 {
    display: -webkit-box;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .truncatte-3 {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}
</style>
