export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "VisionAI",
  description: "CCTV analuser for your factory",
  navItems: [
    {
      label: "Feed",
      href: "/feed",
    },
    {
      label: "Alerts",
      href: "/alerts",
    },
  ],
  links: {
    github: "https://github.com/heroui-inc/heroui",
    demo: "https://github.com/heroui-inc/heroui",
  },
};
