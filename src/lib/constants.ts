export const APP_NAME = "ProcureIQ";
export const APP_DESCRIPTION = "AI-Powered Procurement Decision Intelligence";
export const APP_VERSION = "0.1.0-alpha";

export const CURRENCY = "INR";
export const CURRENCY_SYMBOL = "₹";
export const LOCALE = "en-IN";

export const NAV_ITEMS = [
  {
    label: "Command Center",
    href: "/command-center",
    icon: "LayoutDashboard" as const,
    section: "intelligence",
  },
  {
    label: "Inventory",
    href: "/inventory",
    icon: "Package" as const,
    section: "intelligence",
  },
  {
    label: "Forecasting",
    href: "/forecasting",
    icon: "TrendingUp" as const,
    section: "intelligence",
  },
  {
    label: "Recommendations",
    href: "/recommendations",
    icon: "Lightbulb" as const,
    section: "actions",
  },
  {
    label: "Suppliers",
    href: "/suppliers",
    icon: "Truck" as const,
    section: "actions",
  },
  {
    label: "Approvals",
    href: "/approvals",
    icon: "CheckCircle" as const,
    section: "actions",
  },
  {
    label: "Purchase Orders",
    href: "/purchase-orders",
    icon: "FileText" as const,
    section: "actions",
  },
  {
    label: "Settings",
    href: "/settings",
    icon: "Settings" as const,
    section: "system",
  },
] as const;

export type NavItem = (typeof NAV_ITEMS)[number];

export const NAV_SECTIONS = {
  intelligence: "Intelligence",
  actions: "Actions",
  system: "System",
} as const;

export const BRANCHES = {
  HYD: "Hyderabad",
  SDP: "Siddipet",
  WGL: "Warangal",
} as const;
