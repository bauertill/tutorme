import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import HelpBox from "./HelpBox";

export default function HelpButton() {
  const [isOpen, setIsOpen] = useState(false);

  const onClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  return (
    <div className="">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.1 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute right-0 top-0 origin-top-right"
          >
            <HelpBox onClose={() => setIsOpen(false)} />
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
            <Button onClick={onClick} size="icon" className="size-12 text-xl">
              ?
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
