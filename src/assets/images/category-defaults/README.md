# Category Default Images

This directory contains category-specific default images used as fallbacks when event featured images are unavailable.

## Image Specifications

- **Format**: WebP
- **Dimensions**: 1280x720 (16:9 ratio)
- **File size**: <100KB per image
- **Quality**: 80-85%

## Required Images

1. `marathon.webp` - For marathon events (blue theme)
2. `festival.webp` - For festival events (purple theme)
3. `encuentro.webp` - For encuentro events (pink theme)
4. `workshop.webp` - For workshop events (green theme)

## TODO

Replace these placeholder images with actual professional images before production deployment.

For now, these are placeholder images. To add actual images:

```bash
# Example using ImageMagick/cwebp
convert source-marathon.jpg -resize 1280x720 -quality 85 marathon.webp
convert source-festival.jpg -resize 1280x720 -quality 85 festival.webp
convert source-encuentro.jpg -resize 1280x720 -quality 85 encuentro.webp
convert source-workshop.jpg -resize 1280x720 -quality 85 workshop.webp
```
