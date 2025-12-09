<script setup lang="ts">
  import { onMounted, watch } from "vue";

  const props = defineProps({
    analytics: {
      type: String,
      required: false,
      default: "",
    },
  });

  /**
   * Injects analytics scripts into the document head.
   * Works for both proper <script> tags or raw JS code.
   */
  const loadAnalytics = (scriptContent: string) => {
    if (!scriptContent) return;

    // Remove old analytics scripts if needed
    document
      .querySelectorAll("script[data-analytics]")
      .forEach((el) => el.remove());

    // Use DOMParser to extract proper <script> tags
    const parser = new DOMParser();
    const doc = parser.parseFromString(scriptContent, "text/html");
    const scripts = Array.from(doc.querySelectorAll("script"));

    if (scripts?.length > 0) {
      scripts.forEach((script) => {
        const newScript = document.createElement("script");
        if (script.src) {
          newScript.src = script.src;
          newScript.async = true;
        } else if (script.textContent) {
          newScript.textContent = script.textContent;
        }
        newScript.setAttribute("data-analytics", "true");
        document.head.appendChild(newScript);
      });
    } else {
      // If no <script> tags found, inject the entire string as one script
      const newScript = document.createElement("script");
      newScript.type = "text/javascript";
      newScript.textContent = scriptContent;
      newScript.setAttribute("data-analytics", "true");
      document.head.appendChild(newScript);
    }
  };

  onMounted(() => {
    console.log(
      "Before injection:",
      document.querySelectorAll("script[data-analytics]")
    );
    loadAnalytics(props.analytics);
    console.log(
      "After injection:",
      document.querySelectorAll("script[data-analytics]")
    );
  });

  watch(
    () => props.analytics,
    (newAnalytics) => {
      loadAnalytics(newAnalytics);
    }
  );
</script>

<template>
  <div></div>
</template>
