import { useEffect, useRef } from "react";
import LatexBase from "react-latex-next";

interface LatexProps extends React.HTMLAttributes<HTMLDivElement> {
  children: string | string[];
  onTextHighlight?: (highlightedText: string) => void;
}

export function Latex({ children, onTextHighlight, ...props }: LatexProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!onTextHighlight || !containerRef.current) return;

    const handleSelection = () => {
      const selection = window.getSelection();
      if (!selection) return;

      const selectionText = selection.toString().trim();

      if (selectionText.length > 0) {
        // Check if the selection is within our container
        if (containerRef.current) {
          const range = selection.getRangeAt(0);
          const container = containerRef.current;

          // Check if the selection is within our container
          if (container.contains(range.commonAncestorContainer)) {
            onTextHighlight(selectionText);
          }
        }
      }
    };

    const container = containerRef.current;
    container.addEventListener("mouseup", handleSelection);

    return () => {
      container.removeEventListener("mouseup", handleSelection);
    };
  }, [onTextHighlight]);

  return (
    <div ref={containerRef} {...props}>
      <LatexBase
        delimiters={[
          { left: "$", right: "$", display: false },
          { left: "$$", right: "$$", display: true },
          { left: "\\(", right: "\\)", display: false },
          {
            left: "\\begin{equation}",
            right: "\\end{equation}",
            display: true,
          },
          {
            left: "\\begin{align}",
            right: "\\end{align}",
            display: true,
          },
          {
            left: "\\begin{align*}",
            right: "\\end{align*}",
            display: true,
          },
          {
            left: "\\begin{alignat}",
            right: "\\end{alignat}",
            display: true,
          },
          {
            left: "\\begin{gather}",
            right: "\\end{gather}",
            display: true,
          },
          {
            left: "\\begin{tabular}",
            right: "\\end{tabular}",
            display: true,
          },
          {
            left: "\\begin{array}",
            right: "\\end{array}",
            display: true,
          },
          {
            left: "\\begin{CD}",
            right: "\\end{CD}",
            display: true,
          },
          { left: "\\[", right: "\\]", display: true },
        ]}
      >
        {children}
      </LatexBase>
    </div>
  );
}
