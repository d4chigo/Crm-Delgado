declare global {
  interface Window {
    electron?: {
      shell?: {
        openExternal?: (url: string) => Promise<boolean> | boolean;
      };
      pdf?: {
        generate?: (html: string) => Promise<string>; // returns base64
      };
    };
    electronHelpers?: {
      initExternalLinkHandling?: () => void;
    };
  }
}

export {};
