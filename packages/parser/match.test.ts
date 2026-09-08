import { describe, expect, it } from "vitest";
import { matchCatalog, normalize } from "./match";
import type { MatchableProduct } from "./match";

const catalog: MatchableProduct[] = [
  {
    _id: "caneca-basica-branca",
    name: "Caneca Básica Branca Personalizável",
    price: 38,
  },
  {
    _id: "caneca-basica-preta",
    name: "Caneca Básica Preta Personalizável",
    price: 40,
    variants: [
      { name: "Alça de Coração", price: 48 },
      { name: "Alça de Estrela", price: 48 },
    ],
  },
  {
    _id: "chaveiro-redondo",
    name: "Chaveiro Redondo Personalizado",
    price: 25,
  },
];

describe("normalize", () => {
  it("lowercases and strips accents", () => {
    expect(normalize("Caneca Básica Branca Personalizável")).toBe(
      "caneca basica branca personalizavel"
    );
  });
});

describe("matchCatalog", () => {
  it("matches exact name", () => {
    const match = matchCatalog(catalog, "Caneca Básica Branca Personalizável");
    expect(match.productId).toBe("caneca-basica-branca");
    expect(match.confidence).toBe(1);
    expect(match.price).toBe(38);
  });

  it("matches fuzzy name with accents", () => {
    const match = matchCatalog(catalog, "caneca basica branca");
    expect(match.productId).toBe("caneca-basica-branca");
    expect(match.matchedName).toBe("Caneca Básica Branca Personalizável");
    expect(match.confidence).toBeGreaterThan(0.5);
  });

  it("matches by partial inclusion", () => {
    const match = matchCatalog(catalog, "Chaveiro Redondo");
    expect(match.productId).toBe("chaveiro-redondo");
    expect(match.confidence).toBe(0.9);
  });

  it("detects variant and uses its price", () => {
    const match = matchCatalog(catalog, "Caneca Básica Preta Alça de Coração");
    expect(match.productId).toBe("caneca-basica-preta");
    expect(match.variantName).toBe("Alça de Coração");
    expect(match.price).toBe(48);
  });

  it("returns no match for unrelated text", () => {
    const match = matchCatalog(catalog, "bolo de chocolate");
    expect(match.productId).toBeNull();
    expect(match.matchedName).toBeNull();
    expect(match.price).toBeNull();
  });

  it("handles empty input", () => {
    const match = matchCatalog(catalog, "");
    expect(match.productId).toBeNull();
  });
});