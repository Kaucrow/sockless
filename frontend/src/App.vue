<script setup>
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import Navbar from './components/Navbar.vue';
import Sidebar from './components/sidebar.vue';

const route = useRoute();
const sidebarVisible = ref(false);

const toggleSidebar = () => {
  sidebarVisible.value = !sidebarVisible.value;
}
const isAuthLayout = computed(() => route.meta?.layout === 'auth');

// example json for the sidebar
const myNavItems = ref([
  {
    label: "FAVORITES",
    items: [
      { label: "Dashboard", icon: "pi pi-home", to: "/dashboard" },
      { label: "Bookmarks", icon: "pi pi-bookmark", to: "/bookmarks" },
      {
        label: "Reports",
        icon: "pi pi-chart-line",
        items: [
          {
            label: "Revenue",
            icon: "pi pi-chart-line",
            items: [
              { label: "View", icon: "pi pi-table", to: "/reports/revenue/view" },
              { label: "Search", icon: "pi pi-search", to: "/reports/revenue/search" },
            ],
          },
          { label: "Expenses", icon: "pi pi-chart-line", to: "/reports/expenses" },
        ],
      },
      { label: "Team", icon: "pi pi-users", to: "/team" },
      { label: "Messages", icon: "pi pi-comments", badge: 3, to: "/messages" },
      { label: "Calendar", icon: "pi pi-calendar", to: "/calendar" },
    ],
  },
  {
    label: "APPLICATION",
    items: [
      { label: "Projects", icon: "pi pi-folder", to: "/projects" },
      { label: "Performance", icon: "pi pi-chart-bar", to: "/performance" },
    ],
  },
  {
    label: "SYSTEM", icon: "pi pi-cog", to: "/system"
  }
]);
</script>

<template>
  <div id="app" :style="{ '--sidebar-width': sidebarVisible ? '280px' : '0px' }">
    <template v-if="isAuthLayout">
      <router-view />
    </template>
    <template v-else>
      <Navbar @toggle-sidebar="toggleSidebar" />
      <Sidebar :visible="sidebarVisible" @update:visible="sidebarVisible = $event" :nav-items="myNavItems" />
      <main class="main-content">
        <div class="content-wrapper">
          <router-view />
        </div>
      </main>
    </template>
  </div>
</template>

<style>
html, body, #app {
  height: 100%;
  margin: 0;
  padding: 0;
}

.main-content {
  flex: 1;
  padding: 2rem;
  margin-top: 0;
}

@media (min-width: 769px) {
  .main-content {
    transition: margin-left 0.3s ease;
    margin-left: var(--sidebar-width);
  }
}

.content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
}
</style>
