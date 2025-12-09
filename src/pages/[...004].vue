<template>
  <v-container v-if="$route.path.startsWith('/.well-known')">
    <!-- Silently ignore Chrome's request -->
  </v-container>
  <v-container
    v-else
    class="fill-height"
    fluid
  >
    <v-row
      align="center"
      justify="center"
      class="text-center"
    >
      <v-col
        cols="12"
        md="8"
        lg="6"
      >
        <v-card
          flat
          class="transparent"
        >
          <v-card-text>
            <div
              class="text-h1 text-md-h1 text-lg-h1 font-weight-bold primary--text mb-4"
            >
              4
              <span class="error--text">0</span>
              4
            </div>

            <h2 class="text-h4 text-md-h4 text-lg-h4 mb-4">哎呀！页面未找到</h2>

            <p class="text-body-1 text-md-h6 mb-8">
              您要查找的页面不存在或已被移动。
            </p>

            <div class="d-flex flex-wrap justify-center gap-4 mb-4">
              <v-btn
                color="error"
                x-large
                rounded
                flat
                @click="$router.go(-1)"
              >
                <v-icon left>mdi-arrow-left</v-icon>
                Go Back
              </v-btn>

              <v-btn
                color="secondary"
                x-large
                rounded
                flat
                to="/"
              >
                <v-icon left>mdi-home</v-icon>
                Home Page
              </v-btn>

              <v-btn
                v-if="!contactDialog"
                color="grey lighten-2"
                x-large
                rounded
                flat
                @click="contactDialog = true"
              >
                <v-icon left>mdi-help-circle</v-icon>
                Need Help?
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Contact Dialog -->
    <v-dialog
      v-model="contactDialog"
      max-width="600"
    >
      <v-card>
        <v-card-title class="text-h5">Contact Support</v-card-title>
        <v-card-text>
          <p class="mb-4">
            Can't find what you're looking for? Our team is happy to help.
          </p>

          <v-text-field
            label="Your Email"
            v-model="contactEmail"
            outlined
            class="mb-4"
          ></v-text-field>

          <v-textarea
            label="How can we help?"
            v-model="contactMessage"
            outlined
            rows="3"
          ></v-textarea>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            text
            @click="contactDialog = false"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            @click="sendHelpRequest"
          >
            Send
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
  import { ref } from "vue";

  const contactDialog = ref(false);
  const contactEmail = ref("");
  const contactMessage = ref("");

  const sendHelpRequest = () => {
    // Here you would typically send the request to your backend
    console.log("Help request sent:", {
      email: contactEmail.value,
      message: contactMessage.value,
    });

    // Show success message and close dialog
    contactDialog.value = false;
    contactEmail.value = "";
    contactMessage.value = "";
  };
</script>

<style scoped>
  .gap-4 {
    gap: 16px;
  }

  /* Animation for the 404 text */
  .text-h1 {
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.05);
    }
    100% {
      transform: scale(1);
    }
  }

  /* Responsive adjustments */
  @media (max-width: 600px) {
    .text-h1 {
      font-size: 5rem !important;
    }

    .text-h4 {
      font-size: 1.5rem !important;
    }
  }
</style>
