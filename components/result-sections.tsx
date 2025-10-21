import { LumiResponse } from "@/lib/schema";
import { motion } from "framer-motion";

type Props = {
  data: Omit<LumiResponse, "verseInput"> | null;
  verse: string;
  isLoading: boolean;
};

const containerVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      staggerChildren: 0.08
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
};

const SectionShell = ({
  title,
  children
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <motion.article
    variants={itemVariants}
    className="group rounded-3xl bg-white/90 p-6 shadow-card ring-1 ring-sage/15 backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:ring-sage/40"
  >
    <h3 className="font-display text-xl font-semibold text-slate-800">
      {title}
    </h3>
    <div className="mt-3 text-[0.95rem] leading-relaxed text-slate-700">
      {children}
    </div>
  </motion.article>
);

export function ResultSections({ data, verse, isLoading }: Props) {
  if (!data && !isLoading) {
    return (
      <div className="mt-12 rounded-3xl border border-dashed border-sage/40 bg-white/60 p-10 text-center text-slate-500">
        <p className="text-base">
          묵상하고 싶은 성경 구절을 입력하면 루미가 배경 설명부터 기도문까지
          함께 정리해 드릴게요.
        </p>
      </div>
    );
  }

  return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="mt-12 grid gap-6"
    >
      <motion.div variants={itemVariants}>
        <div className="rounded-3xl bg-sage/15 p-6 ring-1 ring-sage/40">
          <p className="text-xs uppercase tracking-[0.25em] text-sage/80">
            Verse
          </p>
          <p className="mt-2 font-display text-2xl text-sage">{verse}</p>
        </div>
      </motion.div>

      <SectionShell title="배경 설명">
        {isLoading ? (
          <SkeletonParagraph />
        ) : (
          <p>{data?.background}</p>
        )}
      </SectionShell>

      <SectionShell title="핵심 키워드">
        {isLoading ? (
          <SkeletonList items={3} />
        ) : (
          <ul className="grid gap-2">
            {data?.keywords?.map((item) => (
              <li key={item.term} className="rounded-2xl bg-sage/10 p-3">
                <p className="font-semibold text-sage">{item.term}</p>
                <p className="text-slate-600">{item.meaning}</p>
              </li>
            ))}
          </ul>
        )}
      </SectionShell>

      <SectionShell title="관련 구절">
        {isLoading ? (
          <SkeletonList items={3} />
        ) : (
          <ul className="grid gap-2">
            {data?.relatedVerses?.map((item) => (
              <li key={item.reference}>
                <p className="font-semibold text-slate-800">{item.reference}</p>
                <p className="text-slate-600">{item.reason}</p>
              </li>
            ))}
          </ul>
        )}
      </SectionShell>

      <SectionShell title="묵상 포인트">
        {isLoading ? (
          <SkeletonList items={3} />
        ) : (
          <ul className="list-inside list-disc space-y-2">
            {data?.reflections?.map((point, idx) => (
              <li key={idx} className="text-slate-700">
                {point}
              </li>
            ))}
          </ul>
        )}
      </SectionShell>

      <SectionShell title="한 줄 기도문">
        {isLoading ? (
          <SkeletonParagraph />
        ) : (
          <p className="relative pl-4 italic text-slate-700 before:absolute before:left-0 before:top-1 before:h-full before:w-1 before:rounded-full before:bg-accent/70">
            {data?.prayer}
          </p>
        )}
      </SectionShell>
    </motion.section>
  );
}

function SkeletonParagraph() {
  return (
    <div className="animate-pulse space-y-2">
      <div className="h-3 rounded-full bg-sage/30"></div>
      <div className="h-3 rounded-full bg-sage/30"></div>
      <div className="h-3 w-3/5 rounded-full bg-sage/30"></div>
    </div>
  );
}

function SkeletonList({ items }: { items: number }) {
  return (
    <div className="animate-pulse space-y-2">
      {Array.from({ length: items }).map((_, idx) => (
        <div key={idx} className="h-3 rounded-full bg-sage/30"></div>
      ))}
    </div>
  );
}
