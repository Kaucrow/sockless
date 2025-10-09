<script setup>
import { ref } from "vue";
import Button from 'primevue/button';
import SideBarNavItem from "./SideBarNavItem.vue";

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  navItems: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['update:visible']);
const expandedStates = ref({})

const toggleItem = (itemLabel) => {
    expandedStates.value[itemLabel] = !expandedStates.value[itemLabel];
}

const closeSidebar = () => {
    emit('update:visible', false);
};

const isExpanded = (itemLabel) => {
    return expandedStates.value[itemLabel] || false;
}

const isSection = (item) => {
    return item.label && Array.isArray(item.items)
}
</script>

<template>
    <div class="sidebar-container">
        <div 
            v-if="props.visible" 
            class="sidebar-overlay" 
            @click="closeSidebar"
        ></div>
        
        <div 
            class="sidebar" 
            :class="{ 'sidebar-open': props.visible }"
        >
            <div class="sidebar-header">
                <div class="sidebar-brand">
                    <!-- primevue logo svg -->
                    <svg width="24" height="28" viewBox="0 0 35 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M25.87 18.05L23.16 17.45L25.27 20.46V29.78L32.49 23.76V13.53L29.18 14.73L25.87 18.04V18.05ZM25.27 35.49L29.18 31.58V27.67L25.27 30.98V35.49ZM20.16 17.14H20.03H20.17H20.16ZM30.1 5.19L34.89 4.81L33.08 12.33L24.1 15.67L30.08 5.2L30.1 5.19ZM5.72 14.74L2.41 13.54V23.77L9.63 29.79V20.47L11.74 17.46L9.03 18.06L5.72 14.75V14.74ZM9.63 30.98L5.72 27.67V31.58L9.63 35.49V30.98ZM4.8 5.2L10.78 15.67L1.81 12.33L0 4.81L4.79 5.19L4.8 5.2ZM24.37 21.05V34.59L22.56 37.29L20.46 39.4H14.44L12.34 37.29L10.53 34.59V21.05L12.42 18.23L17.45 26.8L22.48 18.23L24.37 21.05ZM22.85 0L22.57 0.69L17.45 13.08L12.33 0.69L12.05 0H22.85Z"
                                    fill="var(--p-primary-color)"
                                />
                                <path
                                    d="M30.69 4.21L24.37 4.81L22.57 0.69L22.86 0H26.48L30.69 4.21ZM23.75 5.67L22.66 3.08L18.05 14.24V17.14H19.7H20.03H20.16H20.2L24.1 15.7L30.11 5.19L23.75 5.67ZM4.21002 4.21L10.53 4.81L12.33 0.69L12.05 0H8.43002L4.22002 4.21H4.21002ZM21.9 17.4L20.6 18.2H14.3L13 17.4L12.4 18.2L12.42 18.23L17.45 26.8L22.48 18.23L22.5 18.2L21.9 17.4ZM4.79002 5.19L10.8 15.7L14.7 17.14H14.74H15.2H16.85V14.24L12.24 3.09L11.15 5.68L4.79002 5.2V5.19Z"
                                    fill="var(--p-text-color)"
                                />
                            </svg>
                    <span class="brand-text">Sockless</span>
                </div>
                <Button 
                    icon="pi pi-times" 
                    @click="closeSidebar" 
                    class="close-btn"
                    text
                    rounded
                    size="small"
                />
            </div>
            
            <div class="sidebar-content">
                <template v-for="itemOrSection in props.navItems" :key="itemOrSection.label">
                    <div v-if="isSection(itemOrSection)" class="nav-section">
                        <div class="nav-section-header" @click="toggleItem(itemOrSection.label)">
                            <span class="section-title">{{ itemOrSection.label }}</span>
                            <i class="pi pi-chevron-down" :class="{ 'rotated': isExpanded(itemOrSection.label) }"></i>
                        </div>
                        <div class="nav-items" :class="{ 'expanded': isExpanded(itemOrSection.label) }">
                            <SideBarNavItem
                                v-for="item in itemOrSection.items"
                                :key="item.label"
                                :item="item"
                                :expanded-states="expandedStates"
                                @toggle-item="toggleItem"
                            />
                        </div>
                    </div>
                    <div v-else class="nav-section nav-section-single-item">
                        <SideBarNavItem
                        :item="itemOrSection"
                        :expanded-states="expandedStates"
                        @toggle-item="toggleItem"
                        />
                    </div>
                </template>
            </div>
            <!-- TODO: user profile will be in the navbar with its photo. when its clicked log out will appear  -->
            <!-- <div class="sidebar-footer">
                <hr class="divider" />
                <a href="#" class="user-profile">
                    <Avatar 
                        image="https://primefaces.org/cdn/primevue/images/avatar/amyelsner.png" 
                        shape="circle" 
                        size="small"
                    />
                    <span class="user-name">Amy Elsner</span>
                </a>
            </div> -->
        </div>
    </div>
</template>

<style scoped>
.sidebar-container {
    position: relative;
}


.sidebar {
    position: fixed;
    top: 0;
    left: 0;
    width: 280px;
    height: 100vh;
    background: var(--p-surface-card);
    border-right: 1px solid var(--p-surface-border);
    z-index: 1000;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
    display: flex;
    flex-direction: column;
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
}

.sidebar-open {
    transform: translateX(0);
}

.sidebar-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.25rem 1.5rem;
    border-bottom: 1px solid var(--p-surface-border);
    flex-shrink: 0;
}

.sidebar-brand {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.brand-text {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--p-primary-color);
}

.close-btn {
    color: var(--p-text-muted-color);
}

.sidebar-content {
    flex: 1;
    overflow-y: auto;
    padding: 1rem 0;
}

.nav-section {
    margin-bottom: 1rem;
}

.nav-section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.5rem 1.5rem;
    cursor: pointer;
    color: var(--p-text-muted-color);
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    transition: color 0.2s ease;
}

.nav-section-header:hover {
    color: var(--p-text-color);
}

.nav-items {
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.3s ease;
}

.nav-items.expanded {
    max-height: 1000px;
}

.nav-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1.5rem;
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

.nav-item-with-submenu {
    position: relative;
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
}

.submenu.expanded {
    max-height: 1000px;
}

.submenu .nav-item {
    padding-left: 3rem;
    font-size: 0.9rem;
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

.sidebar-footer {
    flex-shrink: 0;
    padding: 1rem 1.5rem;
}

.divider {
    border: none;
    border-top: 1px solid var(--p-surface-border);
    margin: 0 0 1rem 0;
}

.user-profile {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.5rem;
    border-radius: 0.5rem;
    text-decoration: none;
    color: var(--p-text-color);
    transition: background 0.2s ease;
}

.user-profile:hover {
    background: var(--p-surface-hover);
}

.user-name {
    font-weight: 600;
    font-size: 0.9rem;
}

.pi-chevron-down {
    transition: transform 0.2s ease;
}

.pi-chevron-down.rotated {
    transform: rotate(180deg);
}

@media (max-width: 768px) {
    .sidebar {
        width: 100%;
        max-width: 320px;
    }
}
</style>