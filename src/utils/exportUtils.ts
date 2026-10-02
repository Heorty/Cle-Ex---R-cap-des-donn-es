import { toPng, toSvg } from 'html-to-image';

export async function downloadElementAsPng(
  element: HTMLElement,
  filename: string = 'export_statistiques.png'
) {
  try {
    const dataUrl = await toPng(element, {
      quality: 0.98,
      pixelRatio: 2, // High DPI for PowerPoint sharpness
      backgroundColor: '#0c0a09', // Dark stone background
      style: {
        borderRadius: '0px',
      }
    });

    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    link.click();
    return true;
  } catch (error) {
    console.error('Error generating PNG:', error);
    return false;
  }
}

export async function downloadElementAsSvg(
  element: HTMLElement,
  filename: string = 'export_statistiques.svg'
) {
  try {
    const dataUrl = await toSvg(element, {
      backgroundColor: '#0c0a09',
    });

    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    link.click();
    return true;
  } catch (error) {
    console.error('Error generating SVG:', error);
    return false;
  }
}

export async function copyElementToClipboard(element: HTMLElement): Promise<boolean> {
  try {
    const dataUrl = await toPng(element, {
      quality: 0.98,
      pixelRatio: 2,
      backgroundColor: '#0c0a09',
    });

    const response = await fetch(dataUrl);
    const blob = await response.blob();

    if (navigator.clipboard && window.ClipboardItem) {
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error copying to clipboard:', error);
    return false;
  }
}
