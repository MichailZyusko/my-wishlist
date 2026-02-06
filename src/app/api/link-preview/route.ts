import { NextResponse } from 'next/server';

type LinkPreview = {
  title?: string;
  image?: string;
};

const MAX_BYTES = 512_000;

const escapeRegex = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const getMetaContent = (html: string, keys: string[]) => {
  for (const key of keys) {
    const pattern = new RegExp(
      `<meta[^>]+(?:property|name)=["']${escapeRegex(key)}["'][^>]*>`,
      'i',
    );
    const tagMatch = html.match(pattern);
    if (!tagMatch) {
      continue;
    }
    const contentMatch = tagMatch[0].match(/content=["']([^"']+)["']/i);
    if (contentMatch?.[1]) {
      return contentMatch[1].trim();
    }
  }
  return undefined;
};

const getTitle = (html: string) => {
  const metaTitle = getMetaContent(html, [
    'og:title',
    'twitter:title',
    'title',
  ]);
  if (metaTitle) {
    return metaTitle;
  }
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (titleMatch?.[1]) {
    return titleMatch[1].trim();
  }
  return undefined;
};

const getImage = (html: string) =>
  getMetaContent(html, [
    'og:image',
    'og:image:url',
    'twitter:image',
    'twitter:image:src',
  ]);

const resolveUrl = (value: string, baseUrl: string) => {
  try {
    return new URL(value, baseUrl).toString();
  } catch {
    return undefined;
  }
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get('url');

  if (!targetUrl) {
    return NextResponse.json({ error: 'Missing url' }, { status: 400 });
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(targetUrl);
  } catch {
    return NextResponse.json({ error: 'Invalid url' }, { status: 400 });
  }

  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    return NextResponse.json({ error: 'Unsupported url' }, { status: 400 });
  }

  try {
    const response = await fetch(parsedUrl.toString(), {
      redirect: 'follow',
      headers: {
        Accept: 'text/html,application/xhtml+xml',
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
      },
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Unable to fetch url' }, { status: 400 });
    }

    const contentType = response.headers.get('content-type') ?? '';
    if (!contentType.includes('text/html')) {
      return NextResponse.json({ error: 'Unsupported content type' }, { status: 400 });
    }

    const reader = response.body?.getReader();
    if (!reader) {
      return NextResponse.json({ error: 'Empty response' }, { status: 400 });
    }

    const chunks: Uint8Array[] = [];
    let total = 0;

    while (true) {
      const { value, done } = await reader.read();
      if (done) {
        break;
      }
      if (value) {
        chunks.push(value);
        total += value.length;
        if (total > MAX_BYTES) {
          break;
        }
      }
    }

    const decoder = new TextDecoder('utf-8');
    let buffer: Uint8Array;
    if (chunks.length === 1) {
      buffer = chunks[0];
    } else {
      buffer = new Uint8Array(total);
      let offset = 0;
      for (const chunk of chunks) {
        buffer.set(chunk, offset);
        offset += chunk.length;
      }
    }
    const html = decoder.decode(buffer);

    const preview: LinkPreview = {
      title: getTitle(html),
      image: getImage(html),
    };

    if (preview.image) {
      preview.image = resolveUrl(preview.image, parsedUrl.toString());
    }

    return NextResponse.json(preview);
  } catch {
    return NextResponse.json({ error: 'Failed to read metadata' }, { status: 400 });
  }
}
