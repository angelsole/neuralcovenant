# Blog Images Directory

Place your blog post images in the `/static/images/posts/` directory.

## Directory Structure:
```
/static/
  /images/
    /posts/
      - 2025-06-11-hero.webp
      - other-post-images.webp
```

## Image Guidelines:
- Hero images: 1200x630px (optimized for social sharing)
- Section images: 800x450px (16:9 aspect ratio)
- Use WebP format for best performance
- Keep file sizes under 200KB for hero images

## Usage in Posts:
```yaml
---
title: "Your Post Title"
image: "/images/posts/2025-06-11-hero.webp"
imageAlt: "Description for accessibility"
---
```

Note: Images placed in `/static/images/` will be served from `/images/` in your site.