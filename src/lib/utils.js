import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function constructMetadata({
  title = "Mennobots",
  description = "Powered by MENNOVA",
  image = "https://mennobots.vercel.app/opengraph-image.png",
  icons = "/favicon.ico",
} = {}) {
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: image }],
    },
    icons,
    metadataBase: new URL("https://mennobots.vercel.app/login"),
  };
}


