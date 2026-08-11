/** Waits for all <img> elements inside a container to finish loading */
async function waitForImages(container: HTMLElement): Promise<void> {
  const images = Array.from(container.querySelectorAll("img"));
  await Promise.all(
    images.map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete && img.naturalWidth > 0) {
            resolve();
          } else {
            img.onload = () => resolve();
            img.onerror = () => resolve(); // continue even if one image fails
          }
        })
    )
  );
}

/** Fetches a URL and returns it as a base64 data URL */
async function fetchAsDataUrl(src: string): Promise<string> {
  const res = await fetch(src, { mode: "cors", credentials: "omit" });
  const blob = await res.blob();
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export type StoryExportResult =
  | { action: "shared" | "downloaded" | "cancelled" }
  | { action: "ready-to-save"; dataUrl: string };

const FILE_NAME = "instagram-story.png";

/** Identifies phones and tablets, including iPads that report themselves as Macs. */
export function isMobileDevice(): boolean {
  if (typeof navigator === "undefined") return false;

  return (
    /Android|iPhone|iPad|iPod|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

function pngDataUrlToFile(dataUrl: string): File {
  const [, base64] = dataUrl.split(",");
  const bytes = Uint8Array.from(atob(base64), (character) =>
    character.charCodeAt(0)
  );
  return new File([bytes], FILE_NAME, { type: "image/png" });
}

/**
 * Captures a DOM element as a 1080×1920 PNG.
 *
 * Two Safari/iOS fixes:
 *  1. Pre-inline all images as base64 data URLs before calling toPng — Safari's
 *     foreignObject does not fetch/render external URLs reliably.
 *  2. Call toPng twice — the first call warms up Safari's SVG/foreignObject
 *     rendering pipeline (often returns blank); the second call captures correctly.
 */
export async function exportStoryAsPng(
  element: HTMLElement
): Promise<StoryExportResult> {
  const { toPng } = await import("html-to-image");

  // 1. Wait for proxy URL images to finish loading
  await waitForImages(element);

  // 2. Pre-fetch all image URLs as base64 in parallel, then apply synchronously
  //    to minimise the window where React could reconcile and reset img.src
  const imgs = Array.from(element.querySelectorAll<HTMLImageElement>("img"));
  const dataUrls = await Promise.all(
    imgs.map(async (img) => {
      if (!img.src || img.src.startsWith("data:")) return img.src;
      try {
        return await fetchAsDataUrl(img.src);
      } catch {
        return img.src; // fallback; image may appear blank
      }
    })
  );
  imgs.forEach((img, i) => {
    img.src = dataUrls[i];
  });

  // 3. Double RAF — ensures the browser has painted the new data URL images
  await new Promise<void>((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
  );

  const opts = {
    width: 1080,
    height: 1920,
    pixelRatio: 1,
    cacheBust: false,
    skipFonts: false,
  };

  // 4. Warmup call — Safari needs at least one toPng to initialise the
  //    foreignObject rendering pipeline; result is discarded
  await toPng(element, opts).catch(() => {});

  // 5. One more RAF to let Safari finish after the warmup render
  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

  // 6. Actual capture
  const dataUrl = await toPng(element, opts);

  if (isMobileDevice()) {
    const image = pngDataUrlToFile(dataUrl);
    const shareData = {
      files: [image],
      title: "Story para Instagram",
    };

    if (
      typeof navigator.share === "function" &&
      (typeof navigator.canShare !== "function" || navigator.canShare(shareData))
    ) {
      try {
        await navigator.share(shareData);
        return { action: "shared" };
      } catch (error) {
        // The person deliberately closed the native share sheet.
        if (error instanceof DOMException && error.name === "AbortError") {
          return { action: "cancelled" };
        }
      }
    }

    // Some Safari versions do not allow sharing a generated file after an
    // asynchronous render. The UI can then offer a user-initiated link that
    // opens the PNG, from where iOS and Android expose their save/share tools.
    return { action: "ready-to-save", dataUrl };
  }

  const link = document.createElement("a");
  link.download = FILE_NAME;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  link.remove();
  return { action: "downloaded" };
}
