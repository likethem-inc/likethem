"use client";

type Props = {
  sizes?: string[];
  colors?: string[];
  selectedSize?: string;
  selectedColor?: string;
  onSizeChange: (size: string) => void;
  onColorChange: (color: string) => void;
  sizeLabel?: string;
  colorLabel?: string;
};

export default function ProductVariantSelector({
  sizes = [],
  colors = [],
  selectedSize,
  selectedColor,
  onSizeChange,
  onColorChange,
  sizeLabel = "Size",
  colorLabel = "Color",
}: Props) {
  const hasSizes = sizes && sizes.length > 0;
  const hasColors = colors && colors.length > 0;

  // Don't render if there are no sizes or colors
  if (!hasSizes && !hasColors) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Size Selector */}
      {hasSizes && (
        <div>
          <label className="text-sm font-medium text-neutral-700 mb-2 block">
            {sizeLabel}
          </label>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => (
              <button
                key={size}
                onClick={() => onSizeChange(size)}
                className={`px-4 py-2 text-sm font-medium border rounded-lg transition-all ${
                  selectedSize === size
                    ? "border-neutral-900 bg-neutral-900 text-white"
                    : "border-neutral-300 bg-white text-neutral-700 hover:border-neutral-900"
                }`}
                aria-pressed={selectedSize === size}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Color Selector */}
      {hasColors && (
        <div>
          <label className="text-sm font-medium text-neutral-700 mb-2 block">
            {colorLabel}
          </label>
          <div className="flex flex-wrap gap-2">
            {colors.map((color) => (
              <button
                key={color}
                onClick={() => onColorChange(color)}
                className={`px-4 py-2 text-sm font-medium border rounded-lg transition-all ${
                  selectedColor === color
                    ? "border-neutral-900 bg-neutral-900 text-white"
                    : "border-neutral-300 bg-white text-neutral-700 hover:border-neutral-900"
                }`}
                aria-pressed={selectedColor === color}
              >
                {color}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
