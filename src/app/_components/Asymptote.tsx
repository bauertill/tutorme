import { api } from "@/trpc/react";

export const Asymptote = ({ code }: { code: string }) => {
  const { data, isLoading } = api.renderAsy.render.useQuery(code);

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
