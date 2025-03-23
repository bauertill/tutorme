import { useCallback, useEffect } from "react";

export function useScrollToBottom(
  container: React.RefObject<HTMLDivElement | null>,
) {
  const scrollToBottom = useCallback(() => {
    if (container.current) {
      container.current.scrollTop = container.current.scrollHeight;
    }
  }, [container]);

  useEffect(() => {
    scrollToBottom();
    if (container.current) {
      const observer = new MutationObserver(scrollToBottom);
      observer.observe(container.current, { childList: true, subtree: true });
      return () => {
        observer.disconnect();
      };
    }
  }, [container, scrollToBottom]);
}
