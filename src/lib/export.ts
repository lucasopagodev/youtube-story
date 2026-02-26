/** Waits for all <img> elements inside a container to finish loading */
function waitForImages(container: HTMLElement): Promise<void> {
  const images = Array.from(container.querySelectorAll("img"));
  if (images.length === 0) return Promise.resolve();

  return Promise.all(
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
  ).then(() => undefined);
}

/**
 * Captures a DOM element as a 1080×1920 PNG and triggers download.
 * The element must already be in the DOM (can be off-screen).
 */
export async function exportStoryAsPng(element: HTMLElement): Promise<void> {
  const { toPng } = await import("html-to-image");

  // Make sure all proxied images are fully loaded before capturing
  await waitForImages(element);

  // Extra tick to let the browser finish any pending paints
  await new Promise((resolve) => setTimeout(resolve, 150));

  const dataUrl = await toPng(element, {
    width: 1080,
    height: 1920,
    pixelRatio: 1,
    cacheBust: false, // images are already proxied/loaded
    skipFonts: false,
  });

  const link = document.createElement("a");
  link.download = "instagram-story.png";
  link.href = dataUrl;
  link.click();
}
