import { createClient, type SanityClient } from "next-sanity";

const projectId =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ||
  process.env.SANITY_STUDIO_PROJECT_ID;
const dataset =
  process.env.NEXT_PUBLIC_SANITY_DATASET ||
  process.env.SANITY_STUDIO_DATASET ||
  "production";

export const isSanityConfigured = !!projectId && projectId !== "seu_project_id";

let _client: SanityClient | null = null;

export function getClient(): SanityClient {
  if (!_client) {
    _client = createClient({
      projectId: projectId!,
      dataset,
      apiVersion: "2025-01-01",
      useCdn: false,
    });
  }
  return _client;
}

export const client = {
  fetch: <T>(query: string, params?: Record<string, unknown>): Promise<T> => {
    if (!isSanityConfigured) {
      console.error(
        "[sanity] Projeto não configurado. Verifique NEXT_PUBLIC_SANITY_PROJECT_ID ou SANITY_STUDIO_PROJECT_ID."
      );
      return Promise.resolve([] as T);
    }
    return getClient().fetch(query, params);
  },
};
