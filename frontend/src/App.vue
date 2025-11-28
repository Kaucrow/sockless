<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import Navbar from './components/Navbar.vue';
import Sidebar from './components/sidebar.vue';
import AuthThemeSwitch from './components/ThemeSwitcher.vue';
import { useUserStore } from '@/stores/user';
import { ALL_NAV_ITEMS } from './constants/menuItems';

const userStore = useUserStore();
const route = useRoute();
const sidebarVisible = ref(false);
const menuPermissions = computed(() => userStore.menuPermissions);
const isLoadingMenuData = computed(() => userStore.isLoadingAppData);

const toggleSidebar = () => {
  sidebarVisible.value = !sidebarVisible.value;
}
const isAuthLayout = computed(() => route.meta?.layout === 'auth');

const initialNavItems = ref(ALL_NAV_ITEMS);
	
const filterMenuItems = (items, parentSubsystem = null) => {
    const allowedMenuKeysSet = new Set(menuPermissions.value);

    if (allowedMenuKeysSet.size === 0) {
        return [];
    }
	
    const recursiveFilter = (navItems, currentSubsystem, level = 0) => {
        return navItems
            .map(item => {
                const itemSubsystem = item.subsystem || currentSubsystem; 

                const newItem = { ...item }; 
                
                if (newItem.items && newItem.items.length > 0) {
                    newItem.items = recursiveFilter(newItem.items, itemSubsystem, level + 1);
                }

                const hasVisibleChildren = newItem.items && newItem.items.length > 0;
                let isDirectlyPermitted = false;

                if (item.to && item.menuItemKey) {
                    isDirectlyPermitted = allowedMenuKeysSet.has(item.menuItemKey);
                } else if (item.to && !item.menuItemKey) {
                }
                if (hasVisibleChildren || isDirectlyPermitted) {
                    return newItem;
                }
                return null; 
            })
            .filter(Boolean);
    };
	
    const result = recursiveFilter(items, parentSubsystem);
    return result;
};
	
const filteredNavItems = computed(() => {
  if (isLoadingMenuData.value || menuPermissions.value === null) {
      return [];
  }

  return filterMenuItems(initialNavItems.value, null);
});
	
onMounted(async () => {
  if (!isAuthLayout.value) {
    await userStore.initializeUser();
  }
  
  if (!isAuthLayout.value && userStore.menuPermissions === null) {
	console.log('App.vue mounted: Fetching app data...');
	await userStore.fetchAppData();
  } else if (isAuthLayout.value) {
	console.log('App.vue mounted: Auth layout, no app data fetch needed.');
  } else {
	console.log('App.vue mounted: App data already loaded.');
  }
});
</script>

<template>
  <div id="app" :style="{ '--sidebar-width': sidebarVisible ? '280px' : '0px' }">
    <template v-if="isAuthLayout">
      <div class="auth-top">
        <AuthThemeSwitch />
      </div>
      <router-view />
    </template>
    <template v-else>
      <Navbar @toggle-sidebar="toggleSidebar" />
      <Sidebar :visible="sidebarVisible" @update:visible="sidebarVisible = $event" :nav-items="filteredNavItems" />
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

#app {
  position: relative;
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

.auth-top {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  z-index: 1200;
  pointer-events: auto;
}


</style>