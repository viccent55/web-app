import { onMounted } from "vue";

let loaded = false;
let interval = null;

export function useTawk() {

  function loadScript() {
    if (loaded) return;
    loaded = true;

    window.Tawk_API = window.Tawk_API || {};
    window.Tawk_LoadStart = new Date();

    const s1 = document.createElement("script");
    const s0 = document.getElementsByTagName("script")[0];

    s1.async = true;
    s1.src = "https://embed.tawk.to/69d89bfb3091751c36bdbc95/1jlr22kbt";
    s1.charset = "UTF-8";
    s1.setAttribute("crossorigin", "*");

    s0.parentNode.insertBefore(s1, s0);

    // ❗关键：不要在这里绑定 onLoad 逻辑
    waitForTawkReady();
  }

  function waitForTawkReady() {
    // console.log('123123=-=-=--⚠️');
    interval = setInterval(() => {
      if (!window.Tawk_API) {
        // console.log('👀 ');
        return;
      }
      try {
        // SDK ready 判断（关键）
        if (typeof window.Tawk_API.maximize === "function") {

          clearInterval(interval);

          console.log("Tawk ready");

          // 默认隐藏
          window.Tawk_API.hideWidget();

          // 注册消息监听（这里才是正确时机）

          window.Tawk_API.onChatMessageVisitor = function () {
            console.log("新消息来了");

            if (!window.Tawk_API.isChatMaximized()) {
            //   window.Tawk_API.maximize();
              window.Tawk_API.showWidget();
            }
          };
        console.log(window.Tawk_API.onChatMessageVisitor )

          // 轮询未读（最稳定）
        //   startUnreadCheck();
        }
      } catch (e) {
        console.log("wait error", e);
      }
    }, 300);
  }

//   function startUnreadCheck() {
//     setInterval(() => {
//       if (!window.Tawk_API?.getUnreadCount) return;

//       window.Tawk_API.getUnreadCount((count) => {
//         if (count > 0) {
//           if (!window.Tawk_API.isChatMaximized()) {
//             window.Tawk_API.maximize();
//           }
//         }
//       });
//     }, 3000);
//   }

  function openChat() {
    window.Tawk_API?.maximize();
    window.Tawk_API?.showWidget();
  }

  onMounted(() => {
    loadScript();
  });

  return { openChat };
}

// ✅ ✅ 延迟加载
// import { onMounted } from "vue";

// let loaded = false;

// export function useTawk() {

//   function loadTawk() {
//     if (loaded) return;
//     loaded = true;

//     window.Tawk_API = window.Tawk_API || {};
//     window.Tawk_LoadStart = new Date();

//     // 加载脚本
//     (function () {
//       var s1 = document.createElement("script");
//       var s0 = document.getElementsByTagName("script")[0];

//       s1.async = true;
//       s1.src = "https://embed.tawk.to/69d89bfb3091751c36bdbc95/1jlr22kbt";
//       s1.charset = "UTF-8";
//       s1.setAttribute("crossorigin", "*");

//       s0.parentNode.insertBefore(s1, s0);
//     })();

//     // 加载完成隐藏
//     window.Tawk_API.onLoad = function () {
//       window.Tawk_API.hideWidget();
//     };

//     // 新消息自动弹出
//     window.Tawk_API.onChatMessageVisitor = function () {
//          window.Tawk_API.maximize();
//     //   if (!window.Tawk_API.isChatMaximized()) {
//     //     window.Tawk_API.maximize();
//     //   }
//     };
//   }

//   function openChat() {
//     loadTawk();

//     const timer = setInterval(() => {
//       if (window.Tawk_API && window.Tawk_API.maximize) {
//         window.Tawk_API.maximize();
//         clearInterval(timer);
//       }
//     }, 200);
//   }

//   onMounted(() => {
//     // 可选：延迟加载（避免首屏卡）
//     // loadTawk();
//   });

//   return {
//     openChat,
//     loadTawk
//   };
// }