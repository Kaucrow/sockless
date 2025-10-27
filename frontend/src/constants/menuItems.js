export const ALL_NAV_ITEMS = [
  {
    label: "USERS & ADMINISTRATION",
    subsystem: "users", 
    items: [
      {
        label: "User Management",
        icon: "pi pi-users",
        to: "/users/management", 
        menuItemKey: "User Management" 
      },
      {
        label: "Permissions Console",
        icon: "pi pi-shield",
        to: "/users/permissions",
        menuItemKey: "Permissions Console"
      },
      {
        label: "Guest Landing Page",
        icon: "pi pi-globe", 
        to: "/users/guest-landing", 
        menuItemKey: "Guest Landing Page" 
      },
    ],
  },
  {
    label: "BILLING & PAYMENTS",
    subsystem: "billing", 
    items: [
      {
        label: "Payment History",
        icon: "pi pi-money-bill",
        to: "/billing/history", 
        menuItemKey: "Payment History"
      },
      {
        label: "View Invoices",
        icon: "pi pi-file-o", 
        to: "/billing/invoices",
        menuItemKey: "View Invoices" 
      },
    ],
  },
  {
    label: "REPORTS & ANALYTICS",
    subsystem: "reports", 
    items: [
      {
        label: "System Reports",
        icon: "pi pi-chart-line",
        to: "/reports/system", 
        menuItemKey: "System Reports"
      },
    ],
  },
];