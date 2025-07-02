// This file automatically generates a sitemap.xml for search engines
// Search engines use this to understand your site structure and find all pages

import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  // Base URL of your website - replace with your actual domain
  const baseUrl = "https://www.ieltspeak.com";

  // Get current date for lastModified - tells search engines when content was updated
  const currentDate = new Date();

  return [
    // Homepage - highest priority page
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: "weekly", // How often this page changes
      priority: 1, // Importance (0-1, where 1 is most important)
    },
    // Authentication pages
    {
      url: `${baseUrl}/auth/login`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/auth/sign-up`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    // Main app pages
    {
      url: `${baseUrl}/dashboard`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.9, // High priority for logged-in users
    },
    {
      url: `${baseUrl}/levels`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.9, // Core functionality page
    },
    {
      url: `${baseUrl}/profile`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/subscribe`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.8, // Important for business
    },
    // Add more static pages as needed
  ];
}
