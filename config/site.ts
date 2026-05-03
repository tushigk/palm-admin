export const siteConfig = {
  name: "Palm Admin",
  description: "Palm platform admin panel",
};

export const siteUrl =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3080";

export type SiteConfig = typeof siteConfig;
