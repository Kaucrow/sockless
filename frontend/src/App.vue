<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import Navbar from './components/Navbar.vue';
import Sidebar from './components/sidebar.vue';
import AuthThemeSwitch from './components/ThemeSwitcher.vue';
import { appStore } from './stores/appStore';

import { ALL_NAV_ITEMS } from './constants/menuItems';

const route = useRoute();
const sidebarVisible = ref(false);
const userProfiles = computed(() => appStore.state.userProfiles);
const menuPermissions = computed(() => appStore.state.menuPermissions);
const isLoadingMenuData = computed(() => appStore.state.isLoadingAppData);

const toggleSidebar = () => {
  sidebarVisible.value = !sidebarVisible.value;
}
const isAuthLayout = computed(() => route.meta?.layout === 'auth');

const initialNavItems = ref(ALL_NAV_ITEMS);
	
const filterMenuItems = (items, parentSubsystem = null) => {
    
    const allowedMenuKeys = new Set();
    const currentUserProfiles = userProfiles.value;
    const allMenuPermissions = menuPermissions.value;

    if (currentUserProfiles.length === 0) {
        return [];
    }
    if (allMenuPermissions === null || Object.keys(allMenuPermissions).length === 0) {
        return [];
    }
	
    currentUserProfiles.forEach(profile => {
        for (const subsystemKey in allMenuPermissions) {
            if (Object.hasOwnProperty.call(allMenuPermissions, subsystemKey)) {
                const subsystemPermissions = allMenuPermissions[subsystemKey];
                for (const menuItemPermKey in subsystemPermissions) {
                    if (Object.hasOwnProperty.call(subsystemPermissions, menuItemPermKey)) {
                        const profilesAllowed = subsystemPermissions[menuItemPermKey];
                        if (profilesAllowed.includes(profile)) {
                            const keyToAdd = `${subsystemKey}/${menuItemPermKey}`;
                            allowedMenuKeys.add(keyToAdd);
                        }
                    }
                }
            }
        }
    });
	
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

                if (item.to && itemSubsystem && item.menuItemKey) {
                    const permissionKeyChecked = `${itemSubsystem}/${item.menuItemKey}`;
                    isDirectlyPermitted = allowedMenuKeys.has(permissionKeyChecked);
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
  // If data is still loading or not available, return an empty array immediately
  if (isLoadingMenuData.value || userProfiles.value.length === 0 || menuPermissions.value === null) {
      return [];
  }

  return filterMenuItems(initialNavItems.value, null);
});
	
onMounted(async () => {
  if (!isAuthLayout.value && !appStore.state.userProfiles.length || appStore.state.menuPermissions === null) {
	console.log('App.vue mounted: Fetching app data...');
	await appStore.fetchAppData();
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