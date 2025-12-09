<script setup lang="ts">
import {
  getLogs,
  getBalance,
  reedemPoint,
  getPointConfig,
} from "@/service/hookup";
import { screenMode } from "@/hooks/useScreenMode";
import useSnackbar from "@/composables/useSnackbar";

const props = defineProps({
  modelValue: Boolean,
});
const emit = defineEmits(["update:modelValue"]);

const model = computed({
  get: () => props.modelValue,
  set: (v) => emit("update:modelValue", v),
});

const state = reactive({
  paginate: {
    page: 1,
    limit: 30,
    type: 1,
  },
  records: [] as EmptyArrayType,
  loading: false,
  balance: 0,
  config: {} as EmptyObjectType,
  todaySigned: false, // ✅ has user signed today?
});

const snackbar = useSnackbar();

/** helper: compare two Date objects by yyyy-mm-dd */
const isSameDay = (d1: Date, d2: Date) => {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};

const checkTodaySigned = () => {
  const today = new Date();

  state.todaySigned = state.records.some((item: any) => {
    // 🔴 IMPORTANT: adjust this field if your API uses another name
    // e.g. item.date, item.createdAt, item.log_date, etc.
    const createdAt = item.created_at || item.date || item.createdAt;

    if (!createdAt) return false;

    const d = new Date(createdAt);
    if (isNaN(d.getTime())) return false;

    return isSameDay(d, today);
  });
};

const getTableRecord = async () => {
  state.loading = true;
  try {
    const response = await getLogs(state.paginate);
    if (response.errcode === 0) {
      state.records = response.data?.items ?? [];
      // 🧠 after we load records, check if today already has a sign-in
      checkTodaySigned();
    }
  } catch (e) {
    console.error(e);
  } finally {
    state.loading = false;
  }
};

const getCurrentBalance = async () => {
  try {
    const response = await getBalance();
    if (response.errcode == 0) {
      state.balance = response.data;
    }
  } catch (e) {
    console.log(e);
  }
};

const getConfig = async () => {
  try {
    const response = await getPointConfig();
    if (response.errcode == 0) {
      state.config = response.data ?? {};
    }
  } catch (e) {
    console.log(e);
  }
};

const getRedeemPoint = async () => {
  // ✅ extra guard on frontend
  if (state.todaySigned) {
    snackbar.showSnackbar("今天已签到，请明天再来～", "warning", "top");
    return;
  }

  try {
    state.loading = true;
    const response = await reedemPoint();

    if (response.errcode === 0) {
      snackbar.showSnackbar("兑换成功", "success", "top");

      // refresh data
      await getCurrentBalance();
      await getTableRecord();

      // ✅ mark as signed today (even before records reload)
      state.todaySigned = true;
    } else {
      snackbar.showSnackbar(response.info || "兑换失败", "warning", "top");

      // 如果后台用特定错误码标记“今天已经签到过了”，可以在这里同步状态
      // e.g. if (response.errcode === 4003) state.todaySigned = true;
    }
  } catch (e) {
    console.error(e);
  } finally {
    state.loading = false;
  }
};

const closeSheet = () => {
  model.value = false;
};

const onInit = () => {
  getCurrentBalance();
  getTableRecord();
  getConfig();
};
</script>

<template>
  <v-dialog v-model="model" @after-enter="onInit" transition="slide-y-transition" max-width="550px"
    :fullscreen="screenMode === 'phone'" scrollable>
    <v-card class="dialog-custom" :loading="state.loading">
      <!-- Header -->
      <v-card-title>
        <div class="d-flex align-center justify-space-between text-white">
          <v-btn icon="mdi-chevron-left" density="compact" variant="text" @click="closeSheet" />
          <div class="text-h6">签到</div>
          <div></div>
        </div>
      </v-card-title>

      <!-- Content -->
      <v-card-text class="pt-2 pb-8">
        <v-row class="text-white">
          <v-col cols="12">
            <div>我的积分</div>
            <div class="d-flex justify-space-between align-center">
              <div class="text-h4 font-weight-bold">{{ state.balance }}</div>
              <v-avatar size="40">
                <img src="/hookgirl/currency.png" alt="" />
              </v-avatar>
            </div>
          </v-col>

          <v-col cols="12">
            <v-card class="pa-3 rounded-lg" color="white">
              <div class="text-subtitle-1 mb-2 font-weight-bold">
                签到领取积分
              </div>
              <div class="mb-4 text-subtitle-2">
                已经签到
                <span class="text-purple font-weight-bold">
                  {{ state.config?.points_per_rmb }}
                </span>
                天领取
                <span class="text-purple font-weight-bold">
                  {{ state.config?.daily_sign_point }}
                </span>
                积分
              </div>

              <v-row class="d-flex flex-wrap" dense>
                <v-col v-for="(point, index) in state.records" :key="index" :cols="screenMode === 'phone' ? 3 : 2"
                  class="mb-2">
                  <v-sheet color="purple-lighten-2"
                    class="d-flex flex-column align-center justify-center px-2 py-3 rounded-lg">
                    <v-avatar size="20">
                      <img src="/hookgirl/noto_coin.png" alt="" />
                    </v-avatar>
                    <span class="text-subtitle-2">
                      +{{ state.config?.daily_sign_point }}
                    </span>
                  </v-sheet>
                  <div class="text-center mt-1 f12">
                    {{ point.remark }}
                  </div>
                </v-col>

                <v-col cols="12" align="center">
                  <v-btn color="indigo" width="200px" rounded="xl" size="large"
                    :disabled="state.loading || state.todaySigned" @click="getRedeemPoint">
                    <!-- 🔥 Change label based on todaySigned -->
                    {{ state.todaySigned ? "今日已签到" : "立即签到" }}
                  </v-btn>
                  <div v-if="state.todaySigned" class="mt-2 text-caption text-grey">
                    今天已经签到过了，明天再来哦～
                  </div>
                </v-col>
              </v-row>
            </v-card>
          </v-col>

          <v-col cols="12">
            <v-card rounded="lg">
              <v-card-text class="text-caption grey--text">
                <div>签到规则</div>
                <ol class="pl-4">
                  <li>
                    每日签到得{{ state.config?.daily_sign_point }}积分，{{
                      state.config?.deduct_max_per_time
                    }}积分可抵扣{{
                      state.config?.deduct_max_per_time
                    }}元约炮费用，每次最高抵扣{{
                      state.config?.deduct_max_per_time
                    }}元
                  </li>

                  <li>
                    积分满100可联系客服兑换抵扣,每月可抵扣
                    {{ state.config?.monthly_deduct_limit }}次
                  </li>
                </ol>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<style scoped lang="scss">
.dialog-custom {

  background: linear-gradient(to bottom,
      #5e20ff 0%,
      #633dc6 40%,
      black 40%,
      black 100%);
}
</style>
