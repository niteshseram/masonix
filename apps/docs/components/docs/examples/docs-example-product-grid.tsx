"use client";

// docs:start product-grid
import { clsx } from "clsx";
import { Masonry } from "masonix";
// docs:end product-grid

import { DemoFrame } from "@/components/docs/examples/docs-example-frame";

// docs:start product-grid
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
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">{product.category}</p>
            <h3 className="mt-1 text-sm font-semibold">{product.name}</h3>
          </div>
          <span className="shrink-0 text-sm font-semibold">{product.price}</span>
        </div>
        <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
          Rating {product.rating} / 5.0
        </p>
      </div>
    </article>
  );
}

export function ProductGrid({ products }: { products: Product[] }) {
  return (
    <Masonry
      items={products}
      columnWidth={180}
      maxColumns={3}
      gap={16}
      itemKey={(product) => product.id}
      render={({ data }) => <ProductCard product={data} />}
    />
  );
}
// docs:end product-grid

export const productItems: Product[] = [
  {
    id: "linen-chair",
    name: "Linen lounge chair",
    category: "Furniture",
    price: "$420",
    rating: "4.8",
    badge: "New",
    gradient: "linear-gradient(135deg, #d9f99d, #65a30d)",
    height: 238,
  },
  {
    id: "task-lamp",
    name: "Halo task lamp",
    category: "Lighting",
    price: "$148",
    rating: "4.9",
    badge: "Low stock",
    gradient: "linear-gradient(135deg, #bfdbfe, #2563eb)",
    height: 188,
  },
  {
    id: "ceramic-set",
    name: "Ceramic desk set",
    category: "Workspace",
    price: "$86",
    rating: "4.7",
    badge: "Bundle",
    gradient: "linear-gradient(135deg, #fecdd3, #e11d48)",
    height: 212,
  },
  {
    id: "weekend-bag",
    name: "Canvas weekend bag",
    category: "Travel",
    price: "$196",
    rating: "4.6",
    badge: "Popular",
    gradient: "linear-gradient(135deg, #fde68a, #d97706)",
    height: 256,
  },
  {
    id: "wool-throw",
    name: "Soft wool throw",
    category: "Home",
    price: "$112",
    rating: "4.9",
    badge: "Gift pick",
    gradient: "linear-gradient(135deg, #e9d5ff, #7e22ce)",
    height: 198,
  },
  {
    id: "glass-vase",
    name: "Frosted glass vase",
    category: "Decor",
    price: "$74",
    rating: "4.8",
    badge: "Limited",
    gradient: "linear-gradient(135deg, #ccfbf1, #0f766e)",
    height: 224,
  },
];

export function ProductGridDemo() {
  return (
    <DemoFrame>
      <ProductGrid products={productItems} />
    </DemoFrame>
  );
}
