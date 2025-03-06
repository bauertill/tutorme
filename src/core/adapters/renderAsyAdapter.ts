const BASE_URL = "http://asymptote.ualberta.ca";
type AsyResponse = {
  responseType: "ASY_OUTPUT_CREATED";
  stderr: "";
  stdout: "";
  isUpdated: true;
  path: "/clients/fe1ca46e5e6ca11039b40b0c69bbab3dcedb7c55ZKEn/workspace_1.html";
};
const HEADERS = {
  accept: "*/*",
  "accept-language": "en-GB,en;q=0.7",
  "content-type": "application/x-www-form-urlencoded",
  "sec-gpc": "1",
  Referer: "http://asymptote.ualberta.ca/",
  "Referrer-Policy": "strict-origin-when-cross-origin",
};

export class RenderAsyAdapter {
  // @TODO get id from server

  async render(code: string): Promise<string> {
    const formData = new URLSearchParams({
      reqType: "run",
      id: "SqQJ",
      workspaceId: "1",
      workspaceName: "workspace",
      codeText: code,
      isUpdated: "true",
    });
    try {
      const response = await fetch("http://asymptote.ualberta.ca/", {
        headers: HEADERS,
        body: formData.toString(),
        method: "POST",
      });

      if (!response.ok)
        throw new Error(`Server responded with status: ${response.status}`);

      const data = (await response.json()) as AsyResponse;
      const renderedAsyUrl = BASE_URL + data.path;
      const renderedAsyHtml = await (await fetch(renderedAsyUrl)).text();
      return extractSimpleSvg(renderedAsyHtml);
    } catch (err) {
      console.error("Fetch error:", err);
      return "<p>Error rendering asymptote</p>";
    }
  }
}

// Alternative simpler approach if the HTML is well-formed and has only one SVG
const extractSimpleSvg = (html: string): string => {
  const svgStartIndex = html.indexOf("<svg");
  const svgEndIndex = html.indexOf("</svg>") + 6; // +6 to include "</svg>"

  if (svgStartIndex === -1 || svgEndIndex === -1) return "";
  return html.substring(svgStartIndex, svgEndIndex);
};

export const renderAsyAdapter = new RenderAsyAdapter();
