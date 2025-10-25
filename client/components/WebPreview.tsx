"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink, MousePointer, RefreshCcw } from "lucide-react";

interface WebPreviewProps {
  url: string;
  title: string;
  description?: string;
}

export default function WebPreview({ url, title, description }: WebPreviewProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  const openInBrowser = () => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Eliminamos la función openInElectron ya que solo queremos el botón "Abrir"

  return (
    <Card className="border-2 border-[#FCBA00]/20 hover:border-[#FCBA00]/40 transition-all duration-300 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-[#FCBA00]/5 to-[#FCBA00]/10 border-b border-[#FCBA00]/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-[#FCBA00] p-2 rounded-lg">
              <MousePointer className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-[#303030]">{title}</CardTitle>
              {description && (
                <p className="text-sm text-muted-foreground">{description}</p>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={openInBrowser}
              className="bg-[#FCBA00] text-[#303030] border-[#FCBA00] hover:shadow-lg hover:shadow-[#FCBA00]/30 transition-all duration-200 font-medium"
            >
              <ExternalLink className="w-4 h-4 mr-1" />
              Abrir
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative">
          {/* Loading State */}
          {isLoading && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FCBA00] mx-auto mb-2"></div>
                <p className="text-sm text-muted-foreground">Cargando vista previa...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {hasError && (
            <div className="absolute inset-0 bg-red-50/80 backdrop-blur-sm flex items-center justify-center z-10">
              <div className="text-center">
                <div className="text-red-500 mb-2">
                  <RefreshCcw className="w-8 h-8 mx-auto" />
                </div>
                <p className="text-sm text-red-600 mb-2">Error cargando la vista previa</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsLoading(true);
                    setHasError(false);
                    // Recargar el iframe
                    const iframe = document.getElementById('web-preview') as HTMLIFrameElement;
                    if (iframe) {
                      iframe.src = iframe.src;
                    }
                  }}
                  className="border-red-300 text-red-600 hover:bg-red-50"
                >
                  <RefreshCcw className="w-4 h-4 mr-1" />
                  Reintentar
                </Button>
              </div>
            </div>
          )}

          {/* Web Preview */}
          <div className="relative bg-gray-100 rounded-b-lg overflow-hidden">
            <iframe
              id="web-preview"
              src={url}
              className="w-full h-[400px] border-0"
              onLoad={handleLoad}
              onError={handleError}
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
              loading="lazy"
              title={`Vista previa de ${title}`}
            />
            
            {/* Overlay para mejorar la experiencia */}
            <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white/50 to-transparent pointer-events-none" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
