import { SelahResponse } from "@/lib/schema";
import { motion } from "framer-motion";

type Props = {
  data: Omit<SelahResponse, "verseInput"> | null;
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
    className="group rounded-3xl bg-white/90 p-6 shadow-card ring-1 ring-selah-night/12 backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:ring-selah-night/25"
  >
    <h3 className="text-xl font-semibold text-selah-ink">
      {title}
    </h3>
    <div className="mt-3 text-[0.95rem] leading-relaxed text-selah-ink/75">
      {children}
    </div>
  </motion.article>
);

export function ResultSections({ data, verse, isLoading }: Props) {
  if (!data && !isLoading) {
    return (
      <div className="mt-12 rounded-3xl border border-dashed border-selah-night/20 bg-white/70 p-10 text-center text-selah-ink/50">
        <p className="text-base">
          묵상하고 싶은 성경 구절을 입력하면 Selah가 배경 설명부터 기도문까지
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
        <div className="rounded-3xl bg-white/80 p-6 ring-1 ring-selah-night/20">
          <p className="text-xs uppercase tracking-[0.25em] text-selah-ink/40">
            Verse
          </p>
          <p className="mt-2 text-2xl font-semibold text-selah-ink">{verse}</p>
          {data?.verseText && (
            <p className="mt-3 text-base leading-relaxed text-selah-ink/75">
              {data.verseText}
            </p>
          )}
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
              <li key={item.term} className="rounded-2xl bg-selah-cloud p-3">
                <p className="font-semibold text-selah-ink">{item.term}</p>
                <p className="text-selah-ink/70">{item.meaning}</p>
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
                <p className="font-semibold text-selah-ink">
                  {item.reference}
                </p>
                <p className="text-selah-ink/70">{item.reason}</p>
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
              <li key={idx} className="text-selah-ink/80">
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
          <p className="relative pl-4 italic text-selah-ink/80 before:absolute before:left-0 before:top-1 before:h-full before:w-1 before:rounded-full before:bg-selah-night/50">
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
      <div className="h-3 rounded-full bg-selah-night/15"></div>
      <div className="h-3 rounded-full bg-selah-night/15"></div>
      <div className="h-3 w-3/5 rounded-full bg-selah-night/15"></div>
    </div>
  );
}

function SkeletonList({ items }: { items: number }) {
  return (
    <div className="animate-pulse space-y-2">
      {Array.from({ length: items }).map((_, idx) => (
        <div key={idx} className="h-3 rounded-full bg-selah-night/15"></div>
      ))}
    </div>
  );
}
