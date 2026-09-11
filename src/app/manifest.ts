import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Supergirl — meet Future You",
    short_name: "Supergirl",
    description: "Log workouts and meals and watch the body you're building take shape.",
    start_url: "/",
    display: "standalone",
    background_color: "#0b0a12",
    theme_color: "#0b0a12",
    orientation: "portrait",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "maskable" },
    ],
  };
}
