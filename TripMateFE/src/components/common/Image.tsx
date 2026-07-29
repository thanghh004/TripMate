import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { ImageOff, Loader2, ZoomIn, X, ExternalLink } from 'lucide-react';

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
          <div className="absolute inset-0 bg-black/25 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center text-white pointer-events-none">
            <div className="bg-black/60 px-3 py-1.5 rounded-full backdrop-blur-md flex items-center gap-1.5 text-xs font-semibold shadow-lg">
              <ZoomIn size={15} /> Xem ảnh sắc nét
            </div>
          </div>
        )}
      </div>

      {/* Lightbox Preview Modal via React Portal (Tránh bị cắt bởi z-index/overflow) */}
      {isPreviewOpen && src && createPortal(
        <div
          className="fixed inset-0 z-[999999] bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-4 sm:p-8 animate-in fade-in duration-200"
          onClick={() => setIsPreviewOpen(false)}
        >
          {/* Header Bar */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20 text-white">
            <span className="text-xs font-semibold text-white/80 bg-black/40 px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-md truncate max-w-xs sm:max-w-md">
              {alt || 'Hình ảnh xem chi tiết'}
            </span>

            <div className="flex items-center gap-2">
              <a
                href={src}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="p-2 text-white/80 hover:text-white bg-black/40 hover:bg-black/70 rounded-full border border-white/10 transition-colors cursor-pointer"
                title="Mở ảnh tab mới"
              >
                <ExternalLink size={18} />
              </a>

              <button
                type="button"
                onClick={() => setIsPreviewOpen(false)}
                className="p-2 text-white/80 hover:text-white bg-black/40 hover:bg-black/70 rounded-full border border-white/10 transition-colors cursor-pointer ml-1"
                aria-label="Đóng xem ảnh"
                title="Đóng (ESC)"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Large HD Image Display */}
          <div className="relative w-full h-full flex items-center justify-center p-2 sm:p-6 select-none">
            <img
              src={src}
              alt={alt}
              className="max-w-[92vw] max-h-[86vh] w-auto h-auto object-contain rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200 border border-white/10"
              onClick={(e) => e.stopPropagation()}
              style={{ imageRendering: '-webkit-optimize-contrast' }}
            />
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default Image;
