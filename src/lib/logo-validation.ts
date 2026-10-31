export const LOGO_MAX_BYTES = 2 * 1024 * 1024;
const TYPES: Record<string, string> = { png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", svg: "image/svg+xml", webp: "image/webp" };

export function validateLogo(file: Pick<File, "name" | "type" | "size">) {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (!TYPES[extension] || file.type !== TYPES[extension]) throw new Error("Choose a PNG, JPG, SVG or WebP image.");
  if (file.size > LOGO_MAX_BYTES) throw new Error("Logo must be 2 MB or smaller.");
  if (file.size === 0) throw new Error("The image file is empty.");
  return extension;
}

/** Reject executable SVG content before putting it on a publicly readable URL. */
export function validateSVG(text: string) {
  const doc = new DOMParser().parseFromString(text, "image/svg+xml");
  const allowed = new Set(["svg", "g", "path", "rect", "circle", "ellipse", "line", "polyline", "polygon", "text", "tspan", "defs", "linearGradient", "radialGradient", "stop", "clipPath", "mask", "use", "symbol", "title", "desc"]);
  if (doc.documentElement.localName !== "svg" || doc.querySelector("parsererror")) throw new Error("Choose a valid SVG image.");
  for (const element of Array.from(doc.querySelectorAll("*"))) {
    if (!allowed.has(element.localName)) throw new Error("SVG contains unsupported or unsafe content. Use PNG, JPG or WebP instead.");
    for (const attribute of Array.from(element.attributes)) {
      if (/^on/i.test(attribute.name) || ((attribute.localName === "href") && !attribute.value.startsWith("#")) || /(?:javascript:|data:|https?:|\/\/|@import)/i.test(attribute.value)) {
        throw new Error("SVG must not contain scripts or external resources.");
      }
    }
  }
}