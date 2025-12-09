<script setup lang="ts">
import { ref } from "vue";
import {
  useNoteHookupDialog,
  noteDialogVisible,
} from "@/hooks/useNoteHookupDialog";
import { checkPermissions } from "@/hooks/usePermisions";
import { PERMISSION } from "@/common/permision";
import { detail, collect } from "@/service/hookup";
import CommentBlock from "./comp/CommentBlock.vue";
import BottomAction from "./comp/BottomAction.vue";
import { adsClick } from "@/service/advert";
import { getCurrentDomain } from "@/service";
import { useDialogUXLock } from "@/hooks/useDialogUXLock";
import { useDisplay } from "vuetify";
import useVariable from "@/composables/useVariable";
import useSnackbar from "@/composables/useSnackbar";
import { screenMode } from "@/hooks/useScreenMode";
import Swiper from "@/components/Swiper/index.vue"

const { store, onCopy, route } = useVariable();
const noteDialog = useNoteHookupDialog();
const { smAndDown } = useDisplay();
const state = reactive({
  data: {} as EmptyObjectType,
  comments: [] as EmptyObjectType[],
  loading: false,
});
const snackbar = useSnackbar();
const onOpenNoteDialog = async () => {
  state.loading = true;
  try {
    const request = {
      id: noteDialog.id.value,
    };
    const response = await detail(request);
    if (response.data) {
      state.data = response.data;
      state.data.images = response.data.images.map((item: string) => {
        return {
          name: "image",
          value: item,
        };
      });
    }
    if (response.data?.errcode === 0 && Array.isArray(response.data.data)) {
      return response.data;
    }
  } catch (err) {
    console.error("fetchFeeds failed:", err);
  } finally {
    state.loading = false;
  }
  // disableHorizontalSwipe();
};

const handle = {
  // 分享`
  clickShare() {
    snackbar.showSnackbar("链接已复制!", "success", "top");
    onCopy(getCurrentDomain() + route.fullPath);
  },
  // 收藏
  clickStar(item: EmptyObjectType) {
    checkPermissions(PERMISSION.User, async () => {
      const id_ = item.id;
      try {
        const response: EmptyObjectType = await collect({
          content_id: id_,
          content_type: 6,
        });
        if (response.errcode == 0) {
          state.data.is_star = !state.data.is_star;
          if (state.data.is_star) {
            item.star_count++;
          } else {
            item.star_count--;
          }
        } else {
          snackbar.showSnackbar(response.info, "warning");
        }
      } catch (error) {
        console.error("Login failed:", error);
      }
    });
  },
};
const { showChatWidget } = useSnackbar();
const onLiveChat = () => {
  showChatWidget();
};

watch(
  () => noteDialogVisible.value,
  (val) => {
    state.loading = true;

    useDialogUXLock(noteDialogVisible);
  }
);
</script>

<template>
  <v-dialog v-model="noteDialogVisible" max-width="1200" min-height="520px" persistent @after-enter="onOpenNoteDialog"
    scrollable :fullscreen="screenMode === 'phone'">
    <v-card :loading="state.loading" class="main-contain">
      <v-card-title>
        <div v-if="screenMode === 'phone'" class="d-flex justify-space-between align-center">
          <v-btn icon density="compact" flat @click="
            () => {
              noteDialog.closeNoteDialog();
              state.data = {};
            }
          ">
            <v-icon>mdi-chevron-left</v-icon>
          </v-btn>
          <div>茶女郎详情</div>
          <div></div>
        </div>

        <div v-else class="d-flex justify-end py-0">
          <v-btn icon size="small" color="primary" @click="
            () => {
              noteDialog.closeNoteDialog();
              state.data = {};
            }
          ">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
      </v-card-title>
      <v-card-text class="pa-0 pb-4">
        <v-row no-gutters>
          <v-col cols="12" md="7" lg="8">
            <v-card flat>
              <v-card-title class="text-break text-wrap overflow-visible whitespace-normal">
                {{ state.data?.title }}
              </v-card-title>
              <v-card-text>
                <Swiper v-if="state.data.images?.length > 0" :media-info="state.data.images"
                  :height="smAndDown ? '300px' : '60vh'" light-box />

                <div v-if="state.loading" style="
                    height: 180px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                  ">
                  <v-progress-circular :size="80" color="primary" indeterminate></v-progress-circular>
                </div>
                <div v-if="!state.loading && !state.data.images?.length" style="
                    height: 180px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                  ">
                  <v-empty-state icon="mdi-image-off" title="无图像显示" />
                </div>
                <v-row dense class="px-2 mt-2">
                  <v-col cols="12">
                    {{ state.data?.name }}
                  </v-col>
                </v-row>
                <v-toolbar density="compact" color="surface">
                  <div class="d-flex justify-space-between align-center rounded w-100">
                    <div class="d-flex ga-2">
                      <v-chip v-for="(item, index) in state.data?.tags" :key="index" variant="tonal" color="primary"
                        class="rounded-lg">
                        {{ item?.name }}
                      </v-chip>
                    </div>
                    <v-chip v-if="state.data?.is_official" size="small" color="success" flat>
                      <v-icon>mdi-check-decagram</v-icon>
                      官方认证
                    </v-chip>
                  </div>
                </v-toolbar>

                <v-row no-gutters class="my-2 bg-red-lighten-2 rounded-lg">
                  <v-col cols="5">
                    <div class="pa-2 d-flex flex-column align-center justify-center bg-primary h-100"
                      style="border-radius: 8px">
                      <div class="text-caption font-weight-bold">小编打分</div>
                      <div class="text-h4 font-weight-black text-warning">
                        {{ state.data?.service_score }}
                      </div>
                      <div class="text-caption">女郎颜值</div>
                    </div>
                  </v-col>

                  <v-col cols="7">
                    <div class="px-4 py-2 d-flex flex-column justify-center elevation-2 h-100">
                      <div class="text-caption font-weight-regular">
                        {{ state.data?.address || "未知地址 ..." }}
                      </div>
                    </div>
                  </v-col>
                </v-row>
                <v-card class="pa-2 mb-4" flat color="surface-varient">
                  <v-row dense class="align-start">
                    <v-col cols="4" md="2" class="d-flex align-center">
                      <v-icon size="small" class="mr-2" color="warning">
                        mdi-list-box
                      </v-icon>
                      <span class="text-body-2 font-weight-medium">
                        基本信息：
                      </span>
                    </v-col>
                    <v-col cols="8" md="10">
                      <span class="text-body-2 font-weight-regular">
                        {{ state.data?.age }}岁 {{ state.data?.height }}cm E罩杯
                      </span>
                    </v-col>

                    <v-col cols="4" md="2" class="d-flex align-center">
                      <v-icon size="small" class="mr-2" color="warning">
                        mdi-map-marker
                      </v-icon>
                      <span class="text-body-2 font-weight-medium">
                        所在地区：
                      </span>
                    </v-col>

                    <v-col cols="8" md="10">
                      <span class="text-body-2 font-weight-regular">
                        {{ state.data?.address || "未知地址" }}
                      </span>
                    </v-col>

                    <v-col cols="4" md="2" class="d-flex align-center">
                      <v-icon size="small" class="mr-2" color="warning">
                        mdi-currency-cny
                      </v-icon>
                      <span class="text-body-2 font-weight-medium">
                        消费情况：
                      </span>
                    </v-col>

                    <v-col cols="8" md="10">
                      <span class="text-body-2 font-weight-regular">
                        {{ state.data?.price || "未知" }}
                      </span>
                    </v-col>
                    <v-col cols="4" md="2" class="d-flex align-center">
                      <v-icon size="small" class="mr-2" color="warning">
                        mdi-clock
                      </v-icon>
                      <span class="text-body-2 font-weight-medium">
                        服务项目：
                      </span>
                    </v-col>

                    <v-col cols="8" md="10">
                      <span class="text-body-2 font-weight-regular">
                        {{ state.data?.service || "未知" }}
                      </span>
                    </v-col>
                  </v-row>

                  <v-divider class="my-3"></v-divider>
                  <v-sheet class="mt-0 pt-0">
                    {{ state.data?.intro || "No intro---" }}
                  </v-sheet>
                </v-card>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- Right: Info & Comments -->
          <v-col cols="12" md="5" lg="4" class="d-flex flex-column">
            <!-- Scrollable Content Area -->
            <div class="flex-grow-1 overflow-y-auto px-4" ref="note-dialog">
              <div class="text-body-2 text-grey-darken-1 mb-4">
                发布日期: {{ state.data?.created_at?.split("T")[0] }}
              </div>
              <v-row dense>
                <v-col v-for="(app, index) in store?.detailAppAds" :key="index" :cols="3">
                  <a :href="app.url || '#'" target="_blank" rel="noopener noreferrer"
                    class="text-decoration-none text-grey-darken-1 d-flex flex-column ga-1 align-center"
                    @click="$emit('click-ads', app.id)">
                    <AdvertSlot :advert="{
                      title: app.name,
                      image: app.image,
                      url: app?.url,
                    }" fit="cover" style="width: 28px; height: 28px" />
                    {{ app.name }}
                  </a>
                </v-col>
              </v-row>
              <v-divider :thickness="1" class="my-3 text-grey border-opacity-75" />

              <div>
                <v-card v-for="(app, index) in store.detailAds" :key="index" class="pa-0 my-2">
                  <a :href="app.url" target="_blank" rel="noopener noreferrer" class="" @click="adsClick(app.id)">
                    <AdvertSlot :advert="{
                      title: app.name,
                      image: app.image,
                      url: app?.url,
                    }" height="100%" fit="contain" />
                  </a>
                </v-card>
                <template v-for="block in state.comments" :key="block.id">
                  <CommentBlock :comment="block" />
                </template>
              </div>
            </div>
          </v-col>
        </v-row>
      </v-card-text>

      <v-card-actions class="border-t">
        <BottomAction ref="bottomActions" :action="state.data" :total="state.data?.comment_count"
          @click-star="handle.clickStar" @click-share="handle.clickShare" @live-chat="onLiveChat" class="px-4" />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped lang="scss">
.image-cover {
  min-height: 150px;
  max-height: 200px;
}
</style>
