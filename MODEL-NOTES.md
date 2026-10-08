# PCX model processing

Input supplied by the user: `honda-pcx.zip` → `source/PCXDLXABS.glb`.
All five textures are embedded in the GLB. Separate textures in the source ZIP are not required at runtime.

Original: 14,292,016 bytes; 463,899 triangles.
Optimized: 1,893,296 bytes; 146,420 triangles; 42 meshes.

Tool: glTF Transform CLI 4.5.1.

```sh
gltf-transform optimize PCXDLXABS.glb pcx-mobile.glb --compress meshopt --simplify-ratio 0.25 --simplify-error 0.001 --texture-size 1024 --palette false
```

Rendering: three.js 0.186.1, embedded Meshopt decoder. One WebGL2 context. Room environment generated locally; no HDR/CDN download. Source paint/material colors retained. Transmission is replaced with alpha transparency for lower rendering cost. Source animations are not played. Camera rotation provides the scroll effect.

The SVG poster depicts the previously supplied motorcycle; the 3D viewer displays the newly supplied blue/beige model. These are separate provided assets, not color variants generated from the same source.

Original SHA256: cb2a5f43eeb1921c80a086bf0d5a6b42fb9fd3eb193a1f20cd2cb58bb9a1312c
Optimized SHA256: 345fcf958157a410d44f3db35d7068341505f4da2584cd038574fcb270f1719f
