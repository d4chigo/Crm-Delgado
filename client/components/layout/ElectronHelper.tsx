'use client';

import { useEffect } from "react";

export function ElectronHelper() {
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && (window as any).electronHelpers?.initExternalLinkHandling) {
        ;(window as any).electronHelpers.initExternalLinkHandling()
      }
    } catch (e) {
      // ignore
    }
  }, [])

  return null;
}