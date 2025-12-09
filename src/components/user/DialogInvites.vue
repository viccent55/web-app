<script lang="ts" setup>
import useVariable from "@/composables/useVariable";
import { screenMode } from "@/hooks/useScreenMode";
import { getInvitedLogs } from "@/service/user";

const props = defineProps({
  userInfo: {
    type: Object,
    default: () => ({}),
  },
});
const state = reactive({
  isOpen: false,
  data: [] as EmptyObjectType[],
  loading: false,
  isNomore: false,
  isLoadmore: false,
  page: 1,
  limit: 30,
  currentType: "note",
  total: 0,
});

const { formatDate } = useVariable();

const getInvites = async () => {
  try {
    const res = await getInvitedLogs({
      page: state.page,
      limit: state.limit,
    });
    state.data = res.data?.items ?? [];
    state.total = res.data?.count || 0;
  } catch (e) {
    console.log(e);
  } finally {
    state.loading = false;
  }
};

defineExpose({
  open: () => {
    state.isOpen = true;
    getInvites();
  },
});
</script>

<template>
  <v-dialog v-model="state.isOpen" scrollable :fullscreen="screenMode === 'phone'" max-width="750">
    <v-card flat class="main-contain">
      <v-card-title class="pb-0">
        <v-btn icon="mdi-chevron-left" flat density="comfortable" @click="state.isOpen = false" style="
            position: absolute;
            top: 10px;
            left: 10px;
            padding-top: var(--safe-area-inset-top, 0px);
          ">
          <v-icon></v-icon>
        </v-btn>
        <!-- Title -->
        <div class="text-center text-md-h6 mb-2">邀请记录</div>
      </v-card-title>

      <v-card-text class="px-4 pt-0">
        <Referralnfo :userInfo="props.userInfo" />
        <!-- Top Stats -->
        <v-row class="text-center my-5">
          <v-col cols="6">
            <div class="text-subtitle-2 mb-1">已邀请人数</div>
            <div class="text-h5 font-weight-bold">{{ state.total }}</div>
          </v-col>

          <v-divider vertical class="mx-2" />

          <v-col cols="5">
            <div class="text-subtitle-2 mb-1">还需邀请人数</div>
            <div class="text-h5 font-weight-bold">
              {{ userInfo.invite_count }} / 5
            </div>
          </v-col>
        </v-row>

        <!-- Title -->
        <div class="text-subtitle-1 font-weight-bold mb-3">邀请记录</div>

        <!-- Invite List -->
        <v-row dense>
          <v-col v-for="(item, i) in state.data" :key="i" cols="12" class="mb-2">
            <v-card rounded="lg" color="surface" class="pa-3 d-flex align-center justify-space-between">
              <div class="d-flex align-center">
                <v-avatar class="me-3" density="comfortable" :size="screenMode === 'phone' ? 40 : 60">
                  <Image :src="item.invited_avatar" cover />
                </v-avatar>
                <span class="text-body-1">
                  {{ item.invited_nickname || "--" }}
                </span>
              </div>
              <span class="text-body-2">
                {{ formatDate(item.created_at, "DD/MM/YYYY hh:mm A") }}
              </span>
            </v-card>
          </v-col>

          <v-col v-if="!state.data.length && !state.loading" cols="12" align="center">
            <v-empty-state title="空头支票" text="请邀请您的朋友!" />
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>
<style scoped lang="scss">
.main-contain {
  // padding-top: env(safe-area-inset-top, 0px);
  padding-top: var(--safe-area-inset-top, 0px);
}
</style>
