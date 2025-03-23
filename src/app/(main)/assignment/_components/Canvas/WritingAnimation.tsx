import { useTranslation } from "@/i18n";
import { cn } from "@/lib/utils";
import { Pencil } from "lucide-react";
import { Kalam } from "next/font/google";
import { useEffect, useMemo, useState } from "react";

const kalam = Kalam({
  weight: "400",
  subsets: ["latin"],
});

const CHAR_WIDTH = 1;

export default function WritingAnimation({
  hidden,
  delay,
}: {
  hidden: boolean;
  delay: number;
}) {
  const [isDelayed, setIsDelayed] = useState(true);
  const { t } = useTranslation();
  const text = t("write_your_answer_here");
  const width = useMemo(() => text.length * CHAR_WIDTH, [text]);

  useEffect(() => {
    console.log("Go", hidden, delay, text);
    if (hidden) return;
    const timeout = setTimeout(() => {
      setIsDelayed(false);
    }, delay);
    return () => clearTimeout(timeout);
  }, [delay, hidden, text]);

  if (isDelayed) return null;

  return (
    <div
      className={cn(
        kalam.className,
        `pointer-events-none relative w-[${width}ch] text-2xl transition-opacity duration-300`,
        hidden && "opacity-0",
      )}
    >
      <style>{`
@keyframes smoothWrite {
  0% {
    width: 0;
  }
  100% {
    width: ${width}ch; /* Adjust if you change the text length */
  }
}

.animate-smoothWrite {
  display: inline-block;
  white-space: nowrap;
  overflow: hidden;
  animation: smoothWrite 2s ease-in-out forwards;
}

/* Pencil moves from left: 0 to left: ${width}ch smoothly */
@keyframes pencilMove {
  0% {
    left: 0;
  }
  100% {
    left: ${width}ch;
  }
}

.animate-pencilMove {
  animation: pencilMove 2s ease-in-out forwards;
}
      `}</style>
      {/* Text that smoothly expands */}
      <span className="animate-smoothWrite">{text}</span>

      {/* Pencil gliding in sync */}
      <Pencil className="animate-pencilMove absolute bottom-[1.5ch] left-0 h-6 w-6" />
    </div>
  );
}
