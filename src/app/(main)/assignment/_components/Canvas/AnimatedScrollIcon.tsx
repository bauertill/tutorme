import { cn } from "@/lib/utils";
import { useStore } from "@/store";
import { motion } from "motion/react";
import { useEffect } from "react";

const SVG = () => (
  <svg
    width="63"
    height="125"
    viewBox="0 0 63 125"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M18.5001 123.5V112L4.00007 90C2.8334 81.5 3.30007 64.7 14.5001 65.5V80V31.5C14.5001 27.5 21 22 26.5001 29.5V70.5V24.5C27 18.5 37 17 38.0002 25.5V62M38.0002 74.5001V62M38.0002 62C40 57.9999 46.5 56 50.0002 63.5001V65.5M50.0002 78.5001V65.5M50.0002 65.5C52 62 60 61 61.5 68L61.5002 84.5001L53.5002 112V123.5M9.50015 27.0001C9.5 21.5 12.5 14.5 22.5001 16.5001M26.5001 11.5001C31 8.5 43.0002 9 43.0002 21.0001M7.00015 40.0001C1.00002 35.9999 -4.50019 11 18.5 8C27.4999 -6.00019 64.5001 5.9999 45.5001 34.0001"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default function AnimatedScrollIcon(
  props: React.HTMLAttributes<HTMLDivElement>,
) {
  const isTourRunning = useStore.use.isTourRunning();
  const hasShownScrollFingers = useStore.use.hasShownScrollFingers();
  const setHasShownScrollFingers = useStore.use.setHasShownScrollFingers();
  console.log("hasShownScrollFingers", hasShownScrollFingers);
  useEffect(() => {
    return () => {
      if (!isTourRunning && !hasShownScrollFingers) {
        setHasShownScrollFingers(true);
      }
    };
  }, [isTourRunning]);
  if (isTourRunning || hasShownScrollFingers) return null;

  return (
    <div {...props} className={cn("", props.className)}>
      <motion.div
        initial={{ y: 0, opacity: 0 }}
        animate={{
          y: -40,
          opacity: [0, 1, 1, 0],
        }}
        transition={{
          y: {
            duration: 1.0,
            ease: "easeInOut",
            repeat: Infinity,
            repeatType: "loop",
            repeatDelay: 0.5,
          },
          opacity: {
            times: [0, 0.3, 0.7, 1],
            duration: 1.0,
            ease: "linear",
            repeat: Infinity,
            repeatType: "loop",
            repeatDelay: 0.5,
          },
        }}
      >
        <SVG />
      </motion.div>
    </div>
  );
}
