<template>
	<v-container class="notfound-wrapper" fluid>
		<div class="notfound-card">
			<!-- Left: text -->
			<div class="notfound-info">
				<div class="notfound-code">404</div>

				<div class="notfound-title">
					页面走丢了
				</div>

				<div class="notfound-subtitle">
					找不到你要访问的页面。<br />
					The page you’re looking for doesn’t exist or has been moved.
				</div>

				<div class="notfound-actions">
					<v-btn color="primary" rounded="xl" size="large" class="mr-2 mb-2" @click="onLiveChat">
						在线聊天
					</v-btn>

					<v-btn variant="tonal" rounded="xl" size="large" class="mb-2" @click="goBack">
						返回上一页
					</v-btn>
				</div>
			</div>

			<!-- Right: illustration -->
			<div class="notfound-illustration">
				<div class="notfound-bubble bubble-main" />
				<div class="notfound-bubble bubble-small-1" />
				<div class="notfound-bubble bubble-small-2" />
				<div class="notfound-floating-card">
					<span class="chip chip-top">Oops!</span>
					<span class="chip chip-bottom">404 Not Found</span>
				</div>
			</div>
		</div>
	</v-container>
</template>

<script setup lang="ts">
import useSnackbar from "@/composables/useSnackbar";
import { useRouter } from "vue-router";

defineOptions({
	name: "NotFound",
});

const router = useRouter();
const { showChatWidget } = useSnackbar();
const onLiveChat = () => {
	showChatWidget()
};

const goBack = () => {
	router.back();
};
</script>

<style scoped lang="scss">
.notfound-wrapper {
	min-height: calc(100vh - 120px); // leave some room for header/footer if any
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 24px 16px;
	background: radial-gradient(circle at top left,
			rgba(129, 140, 248, 0.35),
			transparent 60%),
		radial-gradient(circle at bottom right,
			rgba(236, 72, 153, 0.25),
			transparent 55%),
		rgb(var(--v-theme-background));
}

.notfound-card {
	width: 100%;
	max-width: 960px;
	border-radius: 24px;
	padding: 32px 24px;
	background: rgba(15, 23, 42, 0.85);
	backdrop-filter: blur(18px);
	box-shadow: 0 20px 45px rgba(15, 23, 42, 0.45);
	display: flex;
	flex-wrap: wrap;
	align-items: stretch;
	color: #e5e7eb;
}

/* Left side */
.notfound-info {
	flex: 1 1 260px;
	padding: 16px 8px 16px 16px;
	display: flex;
	flex-direction: column;
	justify-content: center;
}

.notfound-code {
	font-size: 64px;
	line-height: 1;
	font-weight: 800;
	letter-spacing: 0.08em;
	margin-bottom: 8px;
	background: linear-gradient(120deg,
			#a855f7,
			#6366f1,
			#22d3ee);
	-webkit-background-clip: text;
	background-clip: text;
	color: transparent;
}

.notfound-title {
	font-size: 24px;
	font-weight: 700;
	margin-bottom: 8px;
}

.notfound-subtitle {
	font-size: 14px;
	line-height: 1.7;
	color: #9ca3af;
	margin-bottom: 20px;
}

.notfound-actions {
	display: flex;
	flex-wrap: wrap;
}

/* Right side illustration */
.notfound-illustration {
	flex: 1 1 260px;
	position: relative;
	padding: 16px;
	min-height: 220px;
	display: flex;
	align-items: center;
	justify-content: center;
}

.notfound-bubble {
	position: absolute;
	border-radius: 999px;
	filter: blur(0.5px);
	opacity: 0.8;
}

.bubble-main {
	width: 220px;
	height: 220px;
	background: radial-gradient(circle at 30% 30%,
			#6366f1,
			#0f172a 60%);
}

.bubble-small-1 {
	width: 90px;
	height: 90px;
	background: radial-gradient(circle at 40% 20%,
			#22d3ee,
			transparent 60%);
	top: 12%;
	right: 18%;
}

.bubble-small-2 {
	width: 120px;
	height: 120px;
	background: radial-gradient(circle at 20% 50%,
			#ec4899,
			transparent 60%);
	bottom: 10%;
	left: 10%;
}

.notfound-floating-card {
	position: relative;
	z-index: 1;
	width: 200px;
	height: 120px;
	border-radius: 20px;
	background: rgba(15, 23, 42, 0.9);
	border: 1px solid rgba(148, 163, 184, 0.35);
	box-shadow: 0 16px 40px rgba(15, 23, 42, 0.9);
	display: flex;
	align-items: center;
	justify-content: center;
	color: #e5e7eb;
	font-size: 14px;
	font-weight: 500;
	text-align: center;
	animation: float-card 4s ease-in-out infinite;
}

.chip {
	position: absolute;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	border-radius: 999px;
	padding: 4px 10px;
	font-size: 11px;
	font-weight: 600;
	letter-spacing: 0.04em;
	text-transform: uppercase;
}

.chip-top {
	top: -12px;
	left: 16px;
	background: rgba(236, 72, 153, 0.9);
	color: #fdf2f8;
}

.chip-bottom {
	bottom: -12px;
	right: 10px;
	background: rgba(56, 189, 248, 0.95);
	color: #ecfeff;
}

@keyframes float-card {

	0%,
	100% {
		transform: translateY(0px);
	}

	50% {
		transform: translateY(-10px);
	}
}

/* Responsive tweaks */
@media (max-width: 768px) {
	.notfound-card {
		padding: 24px 18px;
		flex-direction: column-reverse;
	}

	.notfound-info {
		padding: 12px 4px;
		text-align: left;
	}

	.notfound-code {
		font-size: 48px;
	}

	.notfound-illustration {
		min-height: 180px;
	}

	.bubble-main {
		width: 180px;
		height: 180px;
	}
}
</style>
