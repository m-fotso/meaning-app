const DEFAULT_TIMEOUT_MS = 12000;
const DEFAULT_TEXT_MAX_LENGTH = 1400;

type ImageGenerationResponse = {
  imageUrl?: string;
  imageBase64?: string;
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
    '';
  return endpoint.trim();
};

const normalizeImageUrl = (data: ImageGenerationResponse): string | null => {
  if (typeof data.imageUrl === 'string' && data.imageUrl.trim().length > 0) {
    return data.imageUrl.trim();
  }

  if (typeof data.imageBase64 === 'string' && data.imageBase64.trim().length > 0) {
    return `data:image/png;base64,${data.imageBase64.trim()}`;
  }

  return null;
};

export const generateImageForPageText = async (pageText: string): Promise<string | null> => {
  const endpoint = getApiEndpoint();
  if (!endpoint) {
    return null;
  }

  const trimmedText = pageText.trim();
  if (!trimmedText) {
    return null;
  }

  const promptText =
    trimmedText.length > DEFAULT_TEXT_MAX_LENGTH
      ? `${trimmedText.slice(0, DEFAULT_TEXT_MAX_LENGTH)}...`
      : trimmedText;

  try {
    const response = await withTimeout(
      fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: `Generate a safe, context-relevant illustration for this reading page:\n\n${promptText}`,
          sourceText: promptText,
        }),
      }),
      DEFAULT_TIMEOUT_MS
    );

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as ImageGenerationResponse;
    return normalizeImageUrl(data);
  } catch (error) {
    console.warn('Image generation unavailable; using placeholder image.', error);
    return null;
  }
};
