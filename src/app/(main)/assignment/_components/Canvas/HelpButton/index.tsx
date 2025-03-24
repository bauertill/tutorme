import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircleQuestion } from "lucide-react";
import { useState } from "react";
import HelpBox from "./HelpBox";

export default function HelpButton({
  getCanvasDataUrl,
}: {
  getCanvasDataUrl: () => Promise<string | null>;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const onClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.1 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="flex origin-top-right"
          >
            <HelpBox
              onClose={() => setIsOpen(false)}
              getCanvasDataUrl={getCanvasDataUrl}
            />
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute right-0 top-0"
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
