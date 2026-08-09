declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Lives in its own module so the tag bootstrap is code-split away from the
 * initial bundle and only fetched once analytics is configured and the browser
 * is idle.
 */
export function loadGtag(measurementId: string, document: Document): void {
  window.dataLayer = window.dataLayer ?? [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer!.push(args);
  };
  window.gtag('js', new Date());
  window.gtag('config', measurementId, { anonymize_ip: true });

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);
}
