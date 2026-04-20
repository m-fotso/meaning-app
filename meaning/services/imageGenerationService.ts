const DEFAULT_TIMEOUT_MS = 12000;
const DEFAULT_TEXT_SNIPPET_LEN = 500;
const DEFAULT_LOCAL_ENDPOINT = 'http://localhost:5050/generate-image';

type ImageGenerationResponse = {
  url?: string;
  image?: string;
  imageUrl?: string;
  imageBase64?: string;
  error?: string;
};

const withTimeout = async <T>(promise: Promise<T>, timeoutMs: number): Promise<T> => {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error('Image generation request timed out'));
    }, timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
};

const getApiEndpoint = (): string => {
  const endpoint =
    process.env.EXPO_PUBLIC_IMAGE_GENERATION_API_URL ??
    process.env.IMAGE_GENERATION_API_URL ??
    DEFAULT_LOCAL_ENDPOINT;
  return endpoint.trim();
};

const normalizeImageUrl = (data: ImageGenerationResponse): string | null => {
  if (typeof data.url === 'string' && data.url.trim().length > 0) {
    return data.url.trim();
  }

  if (typeof data.imageUrl === 'string' && data.imageUrl.trim().length > 0) {
    return data.imageUrl.trim();
  }

  if (typeof data.image === 'string' && data.image.trim().length > 0) {
    const img = data.image.trim();
    if (img.startsWith('data:')) {
      return img;
    }
    return `data:image/png;base64,${img}`;
  }

  if (typeof data.imageBase64 === 'string' && data.imageBase64.trim().length > 0) {
    return `data:image/png;base64,${data.imageBase64.trim()}`;
  }

  return null;
};

/**
 * Calls the image API with page text. Matches the local server's `/generate-image` shape:
 * POST { prompt } → { url } | { image } | { error: 'NO_API_KEY' }.
 * Falls back to placeholder in the UI when this returns null.
 */
export const generateImageForPageText = async (pageText: string): Promise<string | null> => {
  const endpoint = getApiEndpoint();
  if (!endpoint) {
    return null;
  }

  const trimmedText = pageText.trim();
  if (!trimmedText) {
    return null;
  }

  const snippet =
    trimmedText.length > DEFAULT_TEXT_SNIPPET_LEN
      ? `${trimmedText.slice(0, DEFAULT_TEXT_SNIPPET_LEN)}...`
      : trimmedText;

  const prompt = `Illustrate this scene from a book: ${snippet}`;

  try {
    const response = await withTimeout(
      fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          sourceText: snippet,
        }),
      }),
      DEFAULT_TIMEOUT_MS
    );

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as ImageGenerationResponse;

    if (data.error === 'NO_API_KEY') {
      return null;
    }

    return normalizeImageUrl(data);
  } catch (error) {
    console.warn('Image generation unavailable; using placeholder image.', error);
    return null;
  }
};
