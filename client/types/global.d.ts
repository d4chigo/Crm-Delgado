interface Window {
  electron: {
    shell: {
      openExternal: (url: string) => void;
    };
  };
}
