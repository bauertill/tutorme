import LatexBase from "react-latex-next";
import { Asymptote } from "./Asymptote";

export function JuicyText({ children }: { children: string }) {
  const containsAsymptote = children.includes("[asy]");
  if (containsAsymptote) {
    const parts = children.split("[asy]");
    const latex = parts[0];
    const parts2 = parts[1]?.split("[/asy]");
    if (!parts2) return latex ? <JuicyText>{latex}</JuicyText> : null;
    const asymptoteCode = parts2[0];
    const rest = parts2[1];

    return (
      <div className="flex flex-col gap-2">
        {latex && <JuicyText>{latex}</JuicyText>}
        {asymptoteCode && <Asymptote>{asymptoteCode}</Asymptote>}
        {rest && <JuicyText>{rest}</JuicyText>}
      </div>
    );
  }

  return (
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
          left: "\\begin{CD}",
          right: "\\end{CD}",
          display: true,
        },
        { left: "\\[", right: "\\]", display: true },
      ]}
    >
      {children}
    </LatexBase>
  );
}
