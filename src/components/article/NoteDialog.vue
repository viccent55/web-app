_
<script setup lang="ts">
  import { ref } from "vue";
  import {
    useNoteArticleDialog,
    noteDialogVisible,
  } from "@/hooks/useNoteArticleDialog";
  import { checkPermissions } from "@/hooks/usePermisions";
  import { PERMISSION } from "@/common/permision";
  import { detail, like, collect, comment, comments } from "@/service/article";
  import CommentBlock from "./comp/CommentBlock.vue";
  import BottomAction from "./comp/BottomAction.vue";
  import { adsClick } from "@/service/advert";
  import { getCurrentDomain } from "@/service";
  import { useDisplay } from "vuetify";
  import useVariable from "@/composables/useVariable";
  import useSnackbar from "@/composables/useSnackbar";
  import { openLoginDialog } from "@/hooks/useLoginDialog";

  const bottomRef = useTemplateRef("bottomActions");
  const { store, storeUser, onCopy, route } = useVariable();
  const loading = ref(false);
  const noteDialog = useNoteArticleDialog();
  const state = reactive({
    data: {} as EmptyObjectType,
    comments: [] as EmptyObjectType[],
  });
  const snackbar = useSnackbar();
  const contentArticleRef = useTemplateRef("content-article");
  const onOpenNoteDialog = async () => {
    loading.value = true;
    try {
      const request = {
        id: noteDialog.id.value,
        visitor: storeUser.visitCode,
      };
      const response = await detail(request);
      if (response.data) {
        state.data = response.data;
        contentArticleRef.value?.init(state.data.content);
        getComments();
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

  const getComments = async () => {
    if (!noteDialog.id.value) return;
    const response = await comments({ id: noteDialog.id.value });
    if (response.data.length) {
      state.comments = response.data;
    }
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
            content_type: 2,
            content_id: id_,
          });
          if (response.errcode === 0) {
            state.data.isLike = !state.data.isLike;
            if (state.data.isLike) {
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
            content_type: 2,
            content_id: id_,
          });
          if (response.errcode == 0) {
            state.data.isStar = !state.data.isStar;
            if (state.data.isStar) {
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

    // 评论
    clickReply(id: string, to: string | null) {
      checkPermissions(PERMISSION.User, () => {
        bottomRef.value?.inputFocus(id, to);
      });
    },
    // 提交评论
    clickReplyTo(id: string, content: string, to = {}) {
      checkPermissions(PERMISSION.User, async () => {
        const request = {
          id: id,
          content: content,
          to: to,
        };
        const res: EmptyObjectType = await comment(request);
        if (res.errcode != 0) return;
        state.data.comment_count++;
        getComments();
        state.data.totalCommentCount += 1;
      });
    },
  };
  const { smAndDown } = useDisplay();
  const getStyle = computed(() =>
    smAndDown.value
      ? "scrollbar-width: none; margin-bottom: 10px"
      : "max-height: calc(100vh - 200px); overflow-y: scroll"
  );
</script>

<template>
  <v-dialog
    v-model="noteDialogVisible"
    max-width="1200"
    height="100%"
    @after-enter="onOpenNoteDialog"
    scrollable
    :fullscreen="smAndDown"
  >
    <v-card
      :loading="loading"
      class="main-contain"
    >
      <v-card-title v-if="smAndDown">
        <v-btn
          icon
          density="compact"
          @click="noteDialog.closeNoteDialog()"
          color="surface"
        >
          <v-icon size="24px">mdi-chevron-left</v-icon>
        </v-btn>
      </v-card-title>
      <v-card-text class="pa-0 pb-4">
        <v-row no-gutters>
          <!-- Left: Video area -->
          <v-col
            cols="12"
            md="7"
            lg="8"
            class="d-flex justify-center"
            :class="smAndDown ? '' : 'border-e-thin'"
          >
            <v-card
              flat
              class="py-3"
            >
              <v-card-title
                class="text-break text-wrap overflow-visible whitespace-normal"
              >
                {{ state.data?.title }}
              </v-card-title>
              <v-card-text :style="getStyle">
                <ContentArticle
                  :content="state.data?.content"
                  ref="content-article"
                />
              </v-card-text>
            </v-card>
          </v-col>

          <!-- Right: Info & Comments -->
          <v-col
            cols="12"
            md="5"
            lg="4"
            class="d-flex flex-column"
          >
            <div
              class="d-flex justify-end mt-2 py-0 pr-4"
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
            <div class="flex-grow-1 px-4 pb-4 pb-md-0 right-side">
              <div class="text-body-2 text-grey-darken-1 mb-4">
                发布日期: {{ state.data?.created_at?.split("T")[0] }}
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

              <div>
                <div class="text-subtitle-2 mb-2">
                  共 {{ state.comments?.length }} 条评论
                </div>
                <v-card
                  v-for="(app, index) in store.detailAds"
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

                <template
                  v-for="block in state.comments"
                  :key="block.id"
                >
                  <CommentBlock
                    :comment="block"
                    @click-avatar="handle.clickAuthor"
                    @click-like="handle.clickLike"
                    @click-reply="handle.clickReply"
                  />
                </template>
              </div>
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
          @click-reply="handle.clickReply"
          @click-share="handle.clickShare"
          @click-reply-to="handle.clickReplyTo"
          class="px-4"
        />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped lang="scss">
  .main-contain {
    // padding-top: env(safe-area-inset-top, 0px);
    padding-top: var(--safe-area-inset-top, 0px);
    padding-bottom: var(--safe-area-inset-bottom, 0px);
  }

  .right-side {
    max-height: calc(100vh - 180px);
    overflow-y: scroll;
  }
</style>
