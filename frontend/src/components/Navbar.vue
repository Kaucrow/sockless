<script setup>
import { useRoute } from 'vue-router';
import { Moon, Sun } from 'lucide-vue-next'; 
import { computed } from 'vue';

const route = useRoute();

const currentPageName = computed(() => {
  const routeName = route.name;
  if (!routeName) return 'Home';
  
  const nameMap = {
    'home': 'Home',
    'login': 'Login',
    'forgot-password': 'Forgot Password',
    'reset-password': 'Reset Password',
    'admin': 'Admin Panel',
    'settings': 'Settings'
  };
  
  return nameMap[routeName] || routeName.charAt(0).toUpperCase() + routeName.slice(1);
});
</script>

<template>
  <nav class="navbar">
    <div class="nav-container">
      <div class="nav-left">
        <button @click="$emit('toggle-sidebar')" class="menu-btn">
          <i class="pi pi-bars"></i>
        </button>
      </div>

      <div class="nav-center">
        <h1 class="page-title">{{ currentPageName }}</h1>
      </div>

      <div class="nav-right">
        <!-- <button @click="toggleDarkMode" class="theme-toggle" :class="{ 'dark': isDarkMode }">
          <span v-if="isDarkMode">
            <Moon />
          </span>
          <span v-else>
            <Sun />
          </span>
        </button> -->
      </div>
    </div>
  </nav>
</template>

<style scoped>
.navbar {
  background: var(--p-surface-card);
  border-bottom: 1px solid var(--p-surface-border);
  padding: 0;
  position: sticky;
  top: 0;
  z-index: 1000;
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.8rem 2rem;
  position: relative;
}

.nav-left {
  display: flex;
  align-items: center;
}

.menu-btn {
  background: var(--p-primary-color);
  color: white;
  border: none;
  padding: 0.5rem;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  width: 40px;
  height: 40px;
}

.menu-btn:hover {
  transform: translateY(-1px);
}

.nav-center {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}

.page-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--p-text-color);
  text-align: center;
}

.nav-right {
  display: flex;
  align-items: center;
}

/* .theme-toggle {
  background: transparent;
  border: 1px solid var(--p-surface-border);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  color: var(--p-text-color);
}

.theme-toggle:hover {
  background: var(--p-surface-hover);
  transform: scale(1.1);
}

.theme-toggle.dark {
  color: var(--p-text-color);
} */

@media (max-width: 768px) {
  .nav-container {
    padding: 1rem;
  }
  
  .page-title {
    font-size: 1.2rem;
  }
}

/* Shift navbar on desktop when sidebar is open */
@media (min-width: 769px) {
  .navbar {
    transition: margin-left 0.3s ease;
  }
  .nav-container {
    transition: padding-left 0.3s ease;
    padding-left: calc(2rem + var(--sidebar-width));
  }
}
</style>
