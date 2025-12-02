<script setup>
import { ref } from "vue";
import Button from 'primevue/button';
import SideBarNavItem from "./SideBarNavItem.vue";

const props = defineProps({
  visible: {
    type: Boolean,
    default: true
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
                <router-link class="sidebar-brand" :to="{ name: 'home' }" @click="closeSidebar">
                    <img src="/test.svg" width="38" height="38" />
                    <span class="brand-text">Sockless</span>
                </router-link>
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
                                @navigate="closeSidebar"
                            />
                        </div>
                    </div>
                    <div v-else class="nav-section nav-section-single-item">
                        <SideBarNavItem
                        :item="itemOrSection"
                        :expanded-states="expandedStates"
                        @toggle-item="toggleItem"
                        @navigate="closeSidebar"
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
    gap: 2.5rem;
}

.sidebar-brand svg {
    fill: var(--p-primary-color) !important;
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