import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(process.cwd());
const sha256 = (path: string) => createHash("sha256").update(readFileSync(path)).digest("hex");

describe("De Kweker brand integrity", () => {
  it("serves the same approved De Kweker favicon from Next and the legacy root path", () => {
    expect(sha256(resolve(root, "src/app/favicon.ico"))).toBe(sha256(resolve(root, "public/favicon.ico")));
  });

  it("keeps the DeeQ Studio credit accurate and subordinate", () => {
    const footer = readFileSync(resolve(root, "src/components/Footer.tsx"), "utf8");
    expect(footer).toContain("Site by");
    expect(footer).toContain("https://deeqstudio.com");
    expect(footer).not.toContain("Hosted by");
  });

  it("does not reference Kwartier West in root metadata", () => {
    const metadata = readFileSync(resolve(root, "src/app/layout.tsx"), "utf8").toLowerCase();
    expect(metadata).not.toContain("kwartier west");
    expect(metadata).not.toContain("kwartierwest");
  });
});
