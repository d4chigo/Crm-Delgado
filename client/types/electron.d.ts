declare global {
  interface Window {
    electron?: {
      shell?: {
        openExternal?: (url: string) => Promise<boolean> | boolean;
      };
      pdf?: {
        generate?: (html: string) => Promise<string>; // returns base64
      };
      clipboard?: {
        writeText?: (text: string) => Promise<void>;
      };
    };
    electronHelpers?: {
      initExternalLinkHandling?: () => void;
    };
  }
}

export {};
