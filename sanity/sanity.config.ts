import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { schemaTypes } from "./schemas";

export default defineConfig({
  name: "patricia-moura-personalizados",
  title: "Patrícia Moura Personalizados",
  projectId: process.env.SANITY_STUDIO_PROJECT_ID || "",
  dataset: process.env.SANITY_STUDIO_DATASET || "production",
  plugins: [structureTool()],
  schema: {
    types: schemaTypes,
  },
});
