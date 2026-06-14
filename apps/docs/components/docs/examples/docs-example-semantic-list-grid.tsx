"use client";

// docs:start semantic-list-grid
import { clsx } from "clsx";
import { MasonryBalanced } from "masonix";
// docs:end semantic-list-grid

import { DemoFrame } from "@/components/docs/examples/docs-example-frame";
import { productItems } from "@/components/docs/examples/docs-example-product-grid";

// docs:start semantic-list-grid
type Product = {
  id: string;
  name: string;
  category: string;
  price: string;
  rating: string;
  badge: string;
  gradient: string;
  height: number;
};

function ProductCard({ product }: { product: Product }) {
  return (
    <article
      className={clsx(
        "overflow-hidden",
        "rounded-xl border",
        "border-zinc-200 bg-white text-zinc-950 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50",
      )}
    >
      <div className="relative" style={{ height: product.height, background: product.gradient }}>
        <span
          className={clsx(
            "absolute left-3 top-3",
            "px-2 py-1",
            "rounded-full",
            "text-xs font-medium",
            "bg-white/85 text-zinc-900",
          )}
        >
          {product.badge}
        </span>
      </div>
      <div className="p-4">
        <p className="text-xs text-zinc-500 dark:text-zinc-400">{product.category}</p>
        <h3 className="mt-1 text-sm font-semibold">{product.name}</h3>
        <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
          Rating {product.rating} / 5.0
        </p>
      </div>
    </article>
  );
}

export function FeaturedProducts({ products }: { products: Product[] }) {
  return (
    <MasonryBalanced
      as="ul"
      itemAs="li"
      role="list"
      aria-label="Featured products"
      className="m-0 list-none p-0"
      itemClassName="m-0 list-none p-0"
      items={products.slice(0, 4)}
      columnWidth={210}
      maxColumns={2}
      gap={16}
      estimatedItemHeight={360}
      itemKey={(product) => product.id}
      render={({ data }) => <ProductCard product={data} />}
    />
  );
}
// docs:end semantic-list-grid

export function SemanticListGridDemo() {
  return (
    <DemoFrame>
      <FeaturedProducts products={productItems} />
    </DemoFrame>
  );
}
