import { describe, expect, it } from "vitest";
import { validateLogo, validateSVG } from "@/lib/logo-validation";

describe("Website logo requirements", () => {
  it.each([["png", "image/png"], ["jpg", "image/jpeg"], ["svg", "image/svg+xml"], ["webp", "image/webp"]])("accepts %s logos", (extension, type) => {
    expect(validateLogo({ name: `logo.${extension}`, type, size: 100 })).toBe(extension);
  });
  it("accepts exactly 2 MB and rejects anything larger", () => {
    expect(validateLogo({ name: "logo.png", type: "image/png", size: 2097152 })).toBe("png");
    expect(() => validateLogo({ name: "logo.png", type: "image/png", size: 2097153 })).toThrow();
  });
  it("rejects unsupported image formats", () => {
    expect(() => validateLogo({ name: "logo.gif", type: "image/gif", size: 100 })).toThrow();
  });
  it("rejects SVG scripts and external resources", () => {
    expect(() => validateSVG('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>')).toThrow();
    expect(() => validateSVG('<svg xmlns="http://www.w3.org/2000/svg"><use href="https://example.com/a.svg"/></svg>')).toThrow();
    expect(() => validateSVG('<svg xmlns="http://www.w3.org/2000/svg"><path d="M0 0L10 10"/></svg>')).not.toThrow();
  });
});