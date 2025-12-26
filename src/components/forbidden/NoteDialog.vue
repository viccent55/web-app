<script setup lang="ts">
  import {
    useNoteForbidden,
    noteDialogVisible,
  } from "@/hooks/useNoteForbiddenDialog";
  import { checkPermissions } from "@/hooks/usePermisions";
  import { PERMISSION } from "@/common/permision";
  import { detail, like, collect } from "@/service/forbidden";
  import BottomAction from "./comp/BottomAction.vue";
  import { adsClick } from "@/service/advert";
  import { getCurrentDomain } from "@/service";
  import { useDisplay } from "vuetify";
  import useVariable from "@/composables/useVariable";
  import useSnackbar from "@/composables/useSnackbar";
  import { screenMode } from "@/hooks/useScreenMode";
  import VideoPlayer from "@/components/Video.vue";
  import { openLoginDialog } from "@/hooks/useLoginDialog";

  const noteDIalogRef = useTemplateRef("note-dialog");
  const { store, onCopy, route, formatDate, storeUser } = useVariable();
  const { smAndDown } = useDisplay();
  const loading = ref(false);
  const noteDialog = useNoteForbidden();
  const state = reactive({
    data: {} as EmptyObjectType,
    comments: [] as EmptyObjectType[],
  });
  const snackbar = useSnackbar();
  const onOpenNoteDialog = async () => {
    // if (noteDIalogRef.value) noteDIalogRef.value.scrollTop = 0;
    loading.value = true;
    try {
      const request = {
        id: noteDialog.id.value,
        visitor: storeUser.visitCode,
      };
      const response = await detail(request);
      if (response.data) {
        state.data = response.data;
      }
      if (response.data?.errcode === 0 && Array.isArray(response.data.data)) {
        return response.data;
      }
      // if (response.errcode === 70001) {
      //   noteDialog.closeNoteDialog();
      //   openLoginDialog();
      //   store.ruleTip.text = response.info;
      //   return;
      // }
      // if (response.errcode === 70002) {
      //   noteDialog.closeNoteDialog();
      //   store.ruleTip.isOpen = true;
      //   store.ruleTip.text = response.info;
      //   return;
      // }
    } catch (err) {
      console.error("fetchFeeds failed:", err);
    } finally {
      loading.value = false;
    }

    // disableHorizontalSwipe();
  };

  const handle = {
    clickAuthor(id: string) {
      const url = `${window.location.origin}/user/${id}`;
      window.location.href = url;
      //   window.location.reload();
    },
    // 点赞
    clickLike(item: EmptyObjectType) {
      checkPermissions(PERMISSION.User, async () => {
        const id_ = item.id;
        try {
          const response: EmptyObjectType = await like({
            content_type: 7,
            content_id: id_,
          });
          if (response.errcode === 0) {
            state.data.liked = !state.data.liked;
            if (state.data.liked) {
              state.data.like_count++;
            } else {
              state.data.like_count--;
            }
          } else {
            snackbar.showSnackbar(response.info, "warning", "center");
          }
        } catch (error) {
          console.error("Login failed:", error);
        }
      });
    },
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
            content_type: 7,
            content_id: id_,
          });
          if (response.errcode == 0) {
            state.data.stared = !state.data.stared;
            if (state.data.stared) {
              item.star_count++;
            } else {
              item.star_count--;
            }
          } else {
            snackbar.showSnackbar(response.info, "warning", "center");
          }
        } catch (error) {
          console.error("Login failed:", error);
        }
      });
    },
  };
</script>

<template>
  <v-dialog
    v-model="noteDialogVisible"
    max-width="1200"
    :persistent="screenMode === 'phone'"
    height="100%"
    @after-enter="onOpenNoteDialog"
    :fullscreen="smAndDown"
    scrollable
  >
    <v-card
      class="main-contain"
      :loading="loading"
    >
      <v-card-title
        class="px-3"
        v-if="smAndDown"
      >
        <v-btn
          icon
          density="compact"
          @click="noteDialog.closeNoteDialog"
          color="surface"
        >
          <v-icon size="24px">mdi-chevron-left</v-icon>
        </v-btn>
      </v-card-title>
      <v-card-text class="pa-0">
        <v-row no-gutters>
          <!-- Left: Video area -->
          <v-col
            cols="12"
            md="7"
            lg="8"
            class="d-flex align-center justify-center"
            :class="smAndDown ? '' : 'border-e-thin'"
          >
            <VideoPlayer
              ref="noteDIalogRef"
              v-if="state.data?.m3u8"
              :src="state.data?.m3u8"
              :poster="state.data?.cover"
              :height="smAndDown ? '300px' : 'calc(100vh - 120px)'"
            />
          </v-col>

          <!-- Right: Info & Comments -->
          <v-col
            cols="12"
            md="5"
            lg="4"
          >
            <div
              class="d-flex justify-end mb-2 pt-2 pr-4"
              v-if="!smAndDown"
            >
              <v-btn
                color="primary"
                icon
                size="small"
                @click="noteDialog.closeNoteDialog"
              >
                <v-icon>mdi-close</v-icon>
              </v-btn>
            </div>
            <!-- Scrollable Content Area -->
            <div
              class="flex-grow-1 overflow-y-auto px-4"
              ref="note-dialog"
            >
              <div class="text-body-1 font-weight-bold mb-2">
                {{ state.data?.title }}
              </div>
              <div class="text-body-2 text-grey-darken-1 mb-4">
                {{ state.data?.content }}
              </div>
              <div class="text-body-2 text-grey-darken-1 mb-4">
                发布日期: {{ formatDate(state.data?.created_at) }}
              </div>

              <v-row dense>
                <v-col
                  v-for="(app, index) in store?.detailAppAds"
                  :key="index"
                  :cols="3"
                >
                  <a
                    :href="app.url || '#'"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-decoration-none text-grey-darken-1 d-flex flex-column ga-1 align-center"
                    @click="$emit('click-ads', app.id)"
                  >
                    <AdvertSlot
                      :advert="{
                        title: app.name,
                        image: app.image,
                        url: app?.url,
                      }"
                      fit="cover"
                      style="width: 28px; height: 28px"
                    />
                    {{ app.name }}
                  </a>
                </v-col>
              </v-row>
              <v-divider
                :thickness="1"
                class="my-3 border-opacity-75"
              />

              <v-card
                v-for="(app, index) in store?.detailAds"
                :key="index"
                class="pa-0 my-2"
              >
                <a
                  :href="app.url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class=""
                  @click="adsClick(app.id)"
                >
                  <AdvertSlot
                    :advert="{
                      title: app.name,
                      image: app.image,
                      url: app?.url,
                    }"
                    height="100%"
                    fit="contain"
                  />
                </a>
              </v-card>
            </div>
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions class="border-t">
        <BottomAction
          ref="bottomActions"
          :action="state.data"
          :total="state.data?.comment_count"
          @click-like="handle.clickLike"
          @click-star="handle.clickStar"
          @click-share="handle.clickShare"
        />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped lang="scss"></style>
