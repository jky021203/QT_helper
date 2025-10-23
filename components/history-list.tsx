import { SelahHistoryItem } from "@/lib/schema";
import { motion } from "framer-motion";

type Props = {
  history: SelahHistoryItem[];
  onSelect: (item: SelahHistoryItem) => void;
};

export function HistoryList({ history, onSelect }: Props) {
  if (history.length === 0) {
    return null;
  }

  return (
    <section aria-label="최근 묵상 기록" className="mt-8">
      <h2 className="text-xs font-semibold uppercase tracking-[0.28em] text-selah-ink/50">
        History
      </h2>
      <div className="mt-3 flex flex-wrap gap-2">
        {history.map((item) => (
          <motion.button
            key={item.timestamp}
            type="button"
            whileHover={{
              y: -2,
              boxShadow: "0 12px 24px -18px rgba(47,43,74,0.45)"
            }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onSelect(item)}
            className="rounded-full bg-white/80 px-4 py-2 text-sm text-selah-ink/75 shadow-sm ring-1 ring-selah-night/15 transition-colors hover:bg-selah-cloud focus:outline-none focus-visible:ring-2 focus-visible:ring-selah-night/40"
          >
            {item.verseInput}
          </motion.button>
        ))}
      </div>
    </section>
  );
}
