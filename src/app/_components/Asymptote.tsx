import { api } from "@/trpc/react";

export const Asymptote = ({ children }: { children: string }) => {
  const { data, isLoading } = api.renderAsy.render.useQuery(children);

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div
          dangerouslySetInnerHTML={{ __html: data ?? "" }}
          className="asymptote-svg-container"
        />
      )}
    </div>
  );
};
