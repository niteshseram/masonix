import { useState } from "react";
import { DEFAULT_CONFIG } from "./components/config-panel";
import type { Config } from "./components/config-panel";
import { makePhotos } from "./demo-data";
import { Sidebar } from "./components/sidebar";
import { MasonryPreview } from "./components/masonry-preview";

export default function App() {
  const [config, setConfig] = useState<Config>(DEFAULT_CONFIG);
  const [shuffleKey, setShuffleKey] = useState(0);

  const items = config.showEmpty ? [] : makePhotos(config.itemCount, shuffleKey, config);

  function handleReset() {
    setConfig(DEFAULT_CONFIG);
    setShuffleKey(0);
  }

  return (
    <div className="flex h-full overflow-hidden bg-[#0d0d0d] text-sm">
      <Sidebar
        config={config}
        setConfig={setConfig}
        onReset={handleReset}
        onShuffle={() => setShuffleKey((k) => k + 1)}
      />

      <div className="min-w-0 flex-1 overflow-auto p-6">
        <h1 className="mb-1 text-xl font-bold text-white">masonix playground</h1>
        <p className="mb-6 text-xs text-zinc-600">
          {config.component === "masonry" ? (
            <>
              <span className="text-zinc-400">{"<Masonry>"}</span> — CSS flexbox masonry,
              round-robin column distribution
            </>
          ) : (
            <>
              <span className="text-zinc-400">{"<MasonryBalanced>"}</span> — JS-measured masonry,
              shortest-column-first placement
            </>
          )}
        </p>

        <MasonryPreview items={items} config={config} />
      </div>
    </div>
  );
}
