export type SiteConfig = typeof siteConfig

export const siteConfig = {
  name: "IotaFlow",
  description:
    "Decentralized payment automation platform for smart revenue splitting and transparent subscription management.",
  mainNav: [
    {
      title: "Home",
      href: "/",
    },
    {
      title: "Dashboard",
      href: "/dashboard",
    },
    {
      title: "Subscriptions",
      href: "/subscription",
    },
    {
      title: "Payments",
      href: "/payments",
    },
    {
      title: "Faucet",
      href: "/faucet",
    },
  ],
  links: {
    twitter: "https://x.com/kamalbuilds",
    github: "https://github.com/kamalbuilds/iotaflow",
    docs: "https://docs.iota.org/",
  },
}
