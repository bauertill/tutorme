import { useTrackEvent } from "@/app/_components/GoogleTagManager";
import { Button } from "@/components/ui/button";
import { useActiveStudentSolution } from "@/store/problem.selectors";
import { MessageCircleQuestion } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import HelpBox from "./HelpBox";

export default function HelpButton({
  getCanvasDataUrl,
  open,
  setOpen,
}: {
  getCanvasDataUrl: () => Promise<string | null>;
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const trackEvent = useTrackEvent();
  const onClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    trackEvent("opened_helpbox");
    setOpen(true);
  };
  const studentSolution = useActiveStudentSolution();

  return (
    <>
      <AnimatePresence>
        {open && studentSolution && (
          <motion.div
            initial={{ opacity: 0, scale: 0.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.1 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="get-help-section flex origin-top-right"
          >
            <HelpBox
              onClose={() => setOpen(false)}
              getCanvasDataUrl={getCanvasDataUrl}
              studentSolutionId={studentSolution.id}
            />
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {!open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="get-help-section absolute right-0 top-0"
          >
            <Button
              onClick={onClick}
              size="icon"
              className="size-12 rounded-full text-xl"
            >
              <MessageCircleQuestion className="!size-6" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
