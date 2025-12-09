<script lang="ts" setup>
import { adsClick } from "@/service/advert";
import { getCurrentDomain } from "@/service";
import { checkPermissions } from "@/hooks/usePermisions";
import { PERMISSION } from "@/common/permision";
import Swiper from "@/components/Swiper.vue";
import CommentBlock from "@/components/explore/comp/CommentBlock.vue";
import BottomAction from "@/components/explore/comp/BottomAction.vue";
import {
  like,
  collect,
  follow,
  reply,
  detail,
  comments,
} from "@/service/explore";
import { openPage } from "@/service";

const bottomRef = useTemplateRef("bottomActions");

const state = reactive({
  data: {} as EmptyObjectType,
  comments: [] as EmptyObjectType[],
  loading: false,
});
const { store, onCopy, route, isMobile, storeUser } = useVariable();
const snackbar = useSnackbar();

const _id = computed(() => route.params.id);

const getComments = async () => {
  const response = await comments({ id: _id.value });
  if (response.data) {
    state.comments = response.data;
  }
};
const { data: fetchedData, pending } = await useAsyncData(
  `detail-feed-${route.params.id}`,
  async () => {
    try {
      const request = {
        id: route.params.id as string,
        code: !storeUser.visitCode ? generateCode() : storeUser.visitCode,
      };
      const response = await detail(request);
      return response.data || {};
    } catch (err) {
      console.error("fetchDetail failed:", err);
      return {};
    }
  },
  { watch: [() => route.params.id] }
);

// Assign the fetched data to the reactive state
if (fetchedData.value) {
  state.data = fetchedData.value;
  getComments();
}

const swiperInstanceRef = ref<InstanceType<typeof Swiper> | null>(null);

const handle = {
  clickAuthor(id: string) {
    const url = `${window.location.origin}/user/${id}`;
    window.location.href = url;
    //   window.location.reload();
  },
  // 关注
  clickFollow(id: number) {
    checkPermissions(PERMISSION.User, async () => {
      const response: EmptyObjectType = await follow({
        id: id,
      });
      if (response.errcode == 0) {
        state.data.isFollow = !state.data.isFollow;
      } else {
        snackbar.showSnackbar(response.info, "warning");
      }
    });
  },
  // 点赞
  clickLike(item: EmptyObjectType) {
    checkPermissions(PERMISSION.User, async () => {
      const id_ = item.id;
      try {
        const response: EmptyObjectType = await like({
          id: id_,
        });
        if (response.errcode === 0) {
          state.data.isLike = !state.data.isLike;
          if (state.data.isLike) {
            state.data.like_count++;
          } else {
            state.data.like_count--;
          }
        } else {
          snackbar.showSnackbar(response.info, "warning");
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
          id: id_,
        });
        if (response.errcode == 0) {
          state.data.isStar = !state.data.isStar;
          if (state.data.isStar) {
            item.collect_count++;
          } else {
            item.collect_count--;
          }
        } else {
          snackbar.showSnackbar(response.info, "warning");
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
      const res: EmptyObjectType = await reply(request);
      if (res.errcode != 0) return;
      state.data.comment_count++;
      getComments();
      state.data.totalCommentCount += 1;
    });
  },
};
const categories = computed(
  () =>
    state.data.categories?.map((item: EmptyObjectType) => ({
      title: item.name,
      to: `/category/${item.id}`,
      disabled: false,
    })) || []
);

const breadcrumbs = computed(() => [
  {
    title: store.configuration?.name || "首页",
    to: "/",
    disabled: false,
  },
  ...categories.value,
]);

useSeo(
  computed(() => state.data?.title),
  computed(() => state.data?.seo_description || state.data?.title),
  computed(() => state.data?.seo_keywords || "")
);

const hashtagList = computed(() => {
  const keywords = state.data?.seo_keywords?.trim();
  if (!keywords) return [];
  return keywords.split(",").map((tag: string) => `#${tag.trim()}`);
});

const chan = computed(() => route.query.chan);
const onOpenPage = () => {
  openPage(
    `${store.configuration?.download_app_url}?chan=${chan.value ?? ""}`
  );
};
const handleClick = () => {
  window.open(store.configuration?.tg_chan, "_blank");
};
</script>

<template>
  <v-container>
    <v-breadcrumbs :items="breadcrumbs" class="pa-0"></v-breadcrumbs>
    <v-card class="main-contain mt-0 mt-md-6" flat :loading="state.loading">
      <v-row no-gutters>
        <!-- Left: Video area -->
        <v-col cols="12" md="7" lg="8" class="d-flex align-center justify-center"
          :class="isMobile ? '' : 'border-e-thin'">
          <Swiper ref="swiperInstanceRef" v-if="state.data?.fields" :media-info="state.data.fields"
            :height="isMobile ? '300px' : '460px'" />
        </v-col>

        <!-- Right: Info & Comments -->
        <v-col cols="12" md="5" lg="4" class="d-flex flex-column">
          <div class="d-flex justify-space-between align-center mb-2 py-2 pr-4 d-none">
            <AuthorHeader :author="{
              ...state.data?.author,
              isFollow: state.data?.isFollow,
            }" @click-author="handle.clickAuthor" @click-follow="handle.clickFollow" />
          </div>
          <!-- Scrollable Content Area -->
          <div class="flex-grow-1 overflow-y-auto px-4" ref="note-dialog">
            <div class="text-body-1 font-weight-bold mb-2">
              {{ state.data?.title }}
            </div>
            <div class="text-body-2 text-grey-darken-1 mb-2">
              {{ state.data?.content }}
            </div>
            <div class="text-body-2 text-grey-darken-1 mb-2">
              发布日期: {{ state.data?.created_at }}
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
            <v-divider class="border-opacity-75" />

            <div>
              <div class="text-subtitle-2 mb-2">
                共 {{ state.comments?.length }} 条评论
              </div>
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
                <CommentBlock :comment="block" @click-avatar="handle.clickAuthor" @click-like="handle.clickLike"
                  @click-reply="handle.clickReply" />
              </template>
            </div>
          </div>
          <BottomAction ref="bottomActions" :action="state.data" :total="state.data?.comment_count"
            @click-like="handle.clickLike" @click-star="handle.clickStar" @click-reply="handle.clickReply"
            @click-share="handle.clickShare" @click-reply-to="handle.clickReplyTo" class="px-4" />
        </v-col>
      </v-row>
    </v-card>
    <v-footer class="d-flex justify-center ga-3 mt-4 flex-wrap" v-if="hashtagList.length">
      <div class="font-weight-bold" v-for="hashtag in hashtagList" :key="hashtag">
        {{ hashtag }}
      </div>
    </v-footer>
    <v-sheet class="mt-4 pa-4">
      <!-- Notice Section -->
      <div class="mb-2">
        <p>
          创作不易：喜欢的朋友 请多多分享，您的支持是
          <strong class="text-primary">{{ store.configuration?.name }}</strong>
          前进的动力
        </p>

        <p>
          最新国内地址：
          <a :href="store.configuration?.home_url" target="_blank" class="text-primary">
            {{ store.configuration?.home_url }}
          </a>
        </p>
        <p>
          备用地址：
          <a :href="store.configuration?.domain_next" target="_blank" class="text-primary">
            {{ store.configuration?.domain_next }}
          </a>
        </p>
        <p>
          发邮件获取
          <strong>{{ store.configuration?.email }}</strong>
        </p>
        <p>
          海外永久地址(需翻墙)：
          <a :href="store.configuration?.domain_latest" target="_blank" class="text-primary">
            {{ store.configuration?.domain_latest }}
          </a>
        </p>
        <p>推荐使用 Edge / 夸克 / UC / Chrome / Safari 浏览器访问 网站。</p>

        <p>
          视频播放异常？请刷新或使用
          <a @click="onOpenPage" target="_blank" class="text-primary cursor-pointer">
            {{ store.configuration?.name }} APP
          </a>
          |
          <a @click="handleClick" target="_blank" class="text-primary cursor-pointer">
            点击加入 {{ store.configuration?.name }} 官方TG群
          </a>
        </p>
      </div>

      <!-- Copyright Section -->
      <div>
        <p>
          该文章由
          <a href="/" class="text-primary">
            {{ store.configuration?.name }}
          </a>
          发布，转载请注明来源并附上原文链接：
          <a :href="`/detail/${_id}`" class="text-primary">
            {{ state.data?.title }}
          </a>
        </p>
        <p>
          版权声明：本文著作权归
          <strong>{{ store.configuration?.name }}</strong>
          所有。任何媒体、
          网站或个人未经授权不得复制、转载、摘编或以其他方式使用，否则将依法追究法律责任。
        </p>
      </div>
    </v-sheet>
  </v-container>
</template>
<style scoped lang="scss">
.main-contain {
  // max-height: calc(100vh - 20rem);
  // overflow-y: scroll;
}

p {
  margin: 2px;
}
</style>
