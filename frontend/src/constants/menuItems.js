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
        to: "/permission-console",
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
      {
        label: "Payments",
        icon: "pi pi-credit-card", 
        to: "/finance/payment",
        menuItemKey: "Payments"
      }
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
  {
    label: "EVENT MANAGEMENT",
    subsystem: "events",
    items: [
      {
        label: "Events",
        icon: "pi pi-calendar",
        to: "/events",
        menuItemKey: "events"
      }
    ]
  },
  {
    label: "STAFF MANAGEMENT",
    subsystem: "staff",
    items: [
      {
        label: "Staff Management",
        icon: "pi pi-users",
        to: "/events/staff",
        menuItemKey: "Staff Management"
      }
    ]
  }, 
  {
    label: "EVENTS",
    subsystem: "events",
    items: [
      {
        label: "Pay For Event",
        icon: "pi pi-credit-card",
        to: "/events/pay",
        menuItemKey: "Pay For Event"
      }
    ]
  }
];