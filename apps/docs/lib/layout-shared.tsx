import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import { clsx } from "clsx";

import { Logo } from "@/components/brand/brand-logo";

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: (
        <span className={clsx("flex items-center gap-2", "font-semibold")}>
          <Logo size={24} />
        </span>
      ),
    },
    links: [
      {
        text: "Docs",
        url: "/docs/guide/getting-started",
        active: "nested-url",
      },
      {
        text: "Playground",
        url: "/playground",
        active: "url",
      },
      {
        text: "GitHub",
        url: "https://github.com/niteshseram/masonix",
        external: true,
      },
    ],
  };
}
