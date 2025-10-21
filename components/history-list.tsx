import { LumiHistoryItem } from "@/lib/schema";
import { motion } from "framer-motion";

type Props = {
  history: LumiHistoryItem[];
  onSelect: (item: LumiHistoryItem) => void;
};

export function HistoryList({ history, onSelect }: Props) {
  if (history.length === 0) {
    return null;
  }

  return (
    <section aria-label="최근 묵상 기록" className="mt-8">
      <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-sage">
        History
      </h2>
      <div className="mt-3 flex flex-wrap gap-2">
        {history.map((item) => (
          <motion.button
            key={item.timestamp}
            type="button"
            whileHover={{ y: -2, boxShadow: "0 12px 20px -12px rgba(82,101,84,0.45)" }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onSelect(item)}
            className="rounded-full bg-white/80 px-4 py-2 text-sm text-slate-700 shadow-sm ring-1 ring-sage/30 transition-colors hover:bg-sage/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/70"
          >
            {item.verseInput}
          </motion.button>
        ))}
      </div>
    </section>
  );
}
