import LatexBase from "react-latex-next";

export function Latex({
  children,
  ...props
}: {
  children: string | string[];
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div {...props}>
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
