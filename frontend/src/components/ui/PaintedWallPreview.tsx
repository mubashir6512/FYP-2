import { useState } from "react";
import { Paintbrush } from "lucide-react";

interface PaintedWallPreviewProps {
    colorHex?: string | null;
    imageUrl?: string | null;
    category?: string | null;
    className?: string;
}

export function PaintedWallPreview({ colorHex, imageUrl, category, className = "" }: PaintedWallPreviewProps) {
    const [imageLoaded, setImageLoaded] = useState(false);
    
    // We use pure photorealistic wall textures (zoomed in so there is no sky, grass, or other elements).
    // This solves the problem of mix-blend-multiply coloring the sky, because the ENTIRE frame is just the wall!
    const isExterior = category?.toLowerCase() === "exterior";
    // Commented out the exterior building template:
    // const roomTemplateUrl = isExterior ? "/wall-exterior.png" : "/wall-interior.png";
    const roomTemplateUrl = "/wall-interior.png";

    return (
        <div className={`relative overflow-hidden bg-secondary/50 ${className}`}>
            {/* The base photorealistic wall texture */}
            <img 
                src={roomTemplateUrl}
                alt="Wall Texture"
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                onLoad={() => setImageLoaded(true)}
            />
            
            {/* The color overlay using multiply blend mode. Since the image is ONLY a wall, this perfectly colors the wall texture! */}
            {colorHex && (
                <div 
                    className="absolute inset-0 mix-blend-multiply opacity-90 transition-colors duration-500"
                    style={{ backgroundColor: colorHex }}
                />
            )}

            {/* If the product has its own bucket image, we can show it as a small badge in the corner */}
            {imageUrl && (
                <div className="absolute bottom-3 right-3 w-12 h-12 bg-white rounded-lg shadow-lg p-1 border border-border overflow-hidden">
                    <img src={imageUrl} alt="Product" className="w-full h-full object-cover" />
                </div>
            )}

            {/* Fallback state if no image and no color */}
            {!colorHex && !imageUrl && !imageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <Paintbrush className="w-8 h-8 text-muted-foreground opacity-50" />
                </div>
            )}
        </div>
    );
}
