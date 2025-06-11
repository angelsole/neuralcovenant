# How to Add Images Inside Posts

## Example 1: Simple Image
```markdown
Here's my text explaining something...

![Three Pillars of AI Design Systems](/images/posts/three-pillars.webp)

And here's more text after the image...
```

## Example 2: Image with Caption
```markdown
Let me show you the component hierarchy:

<figure>
  <img src="/images/posts/component-hierarchy.webp" alt="Component hierarchy diagram" loading="lazy">
  <figcaption>Figure 1: Three-tier component hierarchy for AI optimization</figcaption>
</figure>
```

## Example 3: Side-by-side Images
```markdown
<div style="display: flex; gap: 20px; margin: 20px 0;">
  <img src="/images/posts/before.webp" alt="Before optimization" style="width: 50%;">
  <img src="/images/posts/after.webp" alt="After optimization" style="width: 50%;">
</div>
```

## Where to Place Images:
1. Save all images in: `/static/images/posts/`
2. Reference them as: `/images/posts/filename.webp`
3. Use descriptive filenames: `mcp-integration-diagram.webp` not `img1.webp`

## Image Guidelines:
- Format: WebP preferred (smaller file size)
- Width: 800px max for inline images
- Always include alt text for accessibility
- Use loading="lazy" for performance