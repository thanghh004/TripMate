import React, { useState } from 'react';
import { ImageOff, Loader2, ZoomIn, X } from 'lucide-react';

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
  alt?: string;
  className?: string;
  containerClassName?: string;
  fallbackText?: string;
  previewable?: boolean;
}

export const Image: React.FC<ImageProps> = ({
  src,
  alt = 'Hình ảnh',
  className = '',
  containerClassName = '',
  fallbackText = 'Không thể tải ảnh',
  previewable = false,
  ...props
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(!src);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handleLoad = () => {
    setIsLoading(false);
    setIsError(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setIsError(true);
  };

  return (
    <>
      <div
        className={`relative overflow-hidden bg-slate-100/80 ${containerClassName}`}
        onClick={() => {
          if (previewable && !isError && !isLoading && src) {
            setIsPreviewOpen(true);
          }
        }}
      >
        {/* Skeleton Loading State */}
        {isLoading && !isError && src && (
          <div className="absolute inset-0 bg-slate-200 animate-pulse flex items-center justify-center z-10">
            <Loader2 size={20} className="animate-spin text-coral-500/70" />
          </div>
        )}

        {/* Error Fallback */}
        {isError || !src ? (
          <div className="w-full h-full flex flex-col items-center justify-center p-3 text-slate-400 bg-slate-100/90 text-center select-none min-h-[100px]">
            <ImageOff size={22} className="mb-1 text-slate-300" />
            <span className="text-[11px] font-medium leading-tight">{fallbackText}</span>
          </div>
        ) : (
          <img
            src={src}
            alt={alt}
            onLoad={handleLoad}
            onError={handleError}
            loading="lazy"
            decoding="async"
            className={`w-full h-full object-cover transition-all duration-300 ${
              isLoading ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
            } ${previewable ? 'cursor-zoom-in hover:scale-105' : ''} ${className}`}
            style={{
              imageRendering: '-webkit-optimize-contrast',
              ...props.style,
            }}
            {...props}
          />
        )}

        {/* Hover Indicator if Previewable */}
        {previewable && !isLoading && !isError && src && (
          <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center text-white pointer-events-none">
            <div className="bg-black/60 p-2 rounded-full backdrop-blur-xs">
              <ZoomIn size={18} />
            </div>
          </div>
        )}
      </div>

      {/* Lightbox Preview Modal */}
      {isPreviewOpen && src && (
        <div
          className="fixed inset-0 z-[10000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setIsPreviewOpen(false)}
        >
          <button
            type="button"
            onClick={() => setIsPreviewOpen(false)}
            className="absolute top-4 right-4 p-2.5 text-white/80 hover:text-white bg-black/50 hover:bg-black/80 rounded-full transition-colors cursor-pointer"
            aria-label="Đóng xem ảnh"
          >
            <X size={20} />
          </button>
          <img
            src={src}
            alt={alt}
            className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
            style={{ imageRendering: '-webkit-optimize-contrast' }}
          />
        </div>
      )}
    </>
  );
};

export default Image;
