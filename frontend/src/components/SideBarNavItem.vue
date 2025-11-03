<script setup>
import { computed, } from 'vue';
defineOptions({ name: 'SideBarNavItem' });

const props = defineProps({
    item: {
        type: Object,
        required: true,
    },
    expandedStates: {
        type: Object,
        required: true,
    },
    level: {
        type: Number,
        default: 0,
    }
});

const emit = defineEmits(['toggle-item', 'navigate']);

const hasSubmenu = computed(() => props.item.items && props.item.items.length > 0);
const isCurrentItemExpanded = computed(() => props.expandedStates[props.item.label] || false);

const toggleCurrentItem = () => {
    if (hasSubmenu.value) {
        emit('toggle-item', props.item.label);
    }
}

const paddingLeft = computed(() => `${1.5 + props.level * 1.5}rem`)
</script>

<template>
    <div :class="{ 'nav-item-with-submenu': hasSubmenu }">
    <router-link
      v-if="!hasSubmenu"
      :to="item.to || '#'
      "
      class="nav-item"
      :style="{ paddingLeft: paddingLeft }"
      @click="$emit('navigate')"
    >
      <i v-if="item.icon" :class="item.icon"></i>
      <span>{{ item.label }}</span>
      <span v-if="item.badge" class="badge">{{ item.badge }}</span>
    </router-link>
        <div 
            v-else
            class="nav-item"
            @click="toggleCurrentItem"
            :style="{ paddingLeft: paddingLeft }"
        >
            <i v-if="item.icon" :class="item.icon"></i>
            <span>{{ item.label }}</span>
            <i 
                class="pi pi-chevron-down"
                :class="{ 'rotated': isCurrentItemExpanded }"
            ></i>
        </div>
        <div v-if="hasSubmenu" class="submenu" :class="{ expanded: isCurrentItemExpanded }">
      <SideBarNavItem 
        v-for="(subItem, index) in item.items" 
        :key="subItem.label" 
        :item="subItem" 
        :expandedStates="expandedStates"
        :level="level + 1"
        @toggle-item="$emit('toggle-item', $event)"
        @navigate="$emit('navigate')"
      />
        </div>
    </div>
</template>

<style scoped>
.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding-right: 1.5rem; 
  color: var(--p-text-color);
  text-decoration: none;
  transition: all 0.2s ease;
  position: relative;
}

.nav-item:hover {
  background: var(--p-surface-hover);
  color: var(--p-primary-color);
}

.nav-item i {
  width: 1rem;
  text-align: center;
}

.nav-item-with-submenu > .nav-item {
  cursor: pointer;
}

.nav-item-with-submenu > .nav-item i:last-child {
  margin-left: auto;
  transition: transform 0.2s ease;
}

.nav-item-with-submenu > .nav-item i:last-child.rotated {
  transform: rotate(180deg);
}

.submenu {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease;
  background: var(--p-surface-50);
  background: transparent !important;
  color: var(--p-text-color);
}

.submenu.expanded {
  max-height: 1000px; 
}

.badge {
  margin-left: auto;
  background: var(--p-primary-color);
  color: var(--p-primary-contrast);
  border-radius: 50%;
  width: 1.5rem;
  height: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
}

.pi-chevron-down {
  transition: transform 0.2s ease;
}

.pi-chevron-down.rotated {
  transform: rotate(180deg);
}
</style>