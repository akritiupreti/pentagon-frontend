import UPNG from "upng-js";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import { ImageState, ViewTransform } from "@/lib/types";
import { imageStore } from "./ImageStore";
import {
  GSTYLE,
  pillPanel,
  brushSizes,
  categories,
  CURSOR_PEN,
  CURSOR_ERASER,
  CURSOR_DEFAULT,
} from "@/constants";
import {
  Draw,
  Eraser,
  ZoomIn,
  ZoomOut,
  Finalize,
  ExportAll,
  NoImagesInfo,
  ExportCurrent,
} from "@/svgs";

// ─── Morphological dilation ───────────────────────────────────────────────────
const dilate = (
  mask: Uint8Array,
  radius: number,
  W: number,
  H: number,
): Uint8Array => {
  const result = new Uint8Array(W * H);
  const r2 = radius * radius;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (!mask[y * W + x]) continue;
      const yStart = Math.max(0, y - radius);
      const yEnd = Math.min(H - 1, y + radius);
      for (let ny = yStart; ny <= yEnd; ny++) {
        const dy = ny - y;
        const maxDx = Math.floor(Math.sqrt(r2 - dy * dy));
        const xS = Math.max(0, x - maxDx);
        const xE = Math.min(W - 1, x + maxDx);
        result.fill(1, ny * W + xS, ny * W + xE + 1);
      }
    }
  }
  return result;
};

// ─── Generate TRUE 1-channel grayscale PNG ───────────────────────────
export const generateMaskBlob = (
  data: number[][],
  imgW: number,
  imgH: number,
): Promise<Blob> =>
  new Promise((resolve, reject) => {
    try {
      // Create 1D grayscale buffer
      const gray = new Uint8Array(imgW * imgH);

      let idx = 0;

      for (let y = 0; y < imgH; y++) {
        const row = data[y];

        for (let x = 0; x < imgW; x++) {
          // Clamp value to 0–255
          let g = row[x] ?? 0;

          if (g < 0) g = 0;
          if (g > 255) g = 255;

          gray[idx++] = g;
        }
      }

      console.log(gray);

      // Encode TRUE grayscale PNG (1-channel)
      const pngBuffer = UPNG.encode(
        [gray.buffer],
        imgW,
        imgH,
        0, // ← IMPORTANT: 0 = grayscale mode
      );

      const blob = new Blob([pngBuffer], { type: "image/png" });

      resolve(blob);
    } catch (err) {
      reject(err);
    }
  });

// ─── Fresh 2D annotation array (image native size) ───────────────────────────
const freshData = (W: number, H: number): number[][] =>
  Array.from({ length: H }, () => new Array<number>(W).fill(0));

// ─── Fit-to-screen transform for an image ────────────────────────────────────
const fitTransform = (
  imgW: number,
  imgH: number,
  vpW: number,
  vpH: number,
): ViewTransform => {
  const zoom = Math.min(vpW / imgW, vpH / imgH, 1); // never upscale beyond 100%
  const panX = (vpW - imgW * zoom) / 2;
  const panY = (vpH - imgH * zoom) / 2;
  return { zoom, panX, panY };
};

// ─── App ──────────────────────────────────────────────────────────────────────
const App = () => {
  const navigate = useNavigate();
  const [vpW, setVpW] = useState(window.innerWidth);
  const [vpH, setVpH] = useState(window.innerHeight);

  useEffect(() => {
    const onResize = () => {
      setVpW(window.innerWidth);
      setVpH(window.innerHeight);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // ── Canvas refs ─────────────────────────────────────────────────────────────
  const bgCanvasRef = useRef<HTMLCanvasElement>(null); // checkerboard bg
  const imageCanvasRef = useRef<HTMLCanvasElement>(null); // image layer
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null); // annotation overlay

  // ── Image-native state ──────────────────────────────────────────────────────
  const image2DData = useRef<number[][]>(freshData(1, 1)); // in IMAGE pixels
  const currentImgRef = useRef<HTMLImageElement | null>(null);
  const imgNativeW = useRef(0);
  const imgNativeH = useRef(0);

  // ── View transform ──────────────────────────────────────────────────────────
  const [view, setView] = useState<ViewTransform>({
    zoom: 1,
    panX: 0,
    panY: 0,
  });
  const viewRef = useRef(view);
  useEffect(() => {
    viewRef.current = view;
  }, [view]);

  // ── Pan state ───────────────────────────────────────────────────────────────
  const isPanningRef = useRef(false);
  const panStartRef = useRef({ x: 0, y: 0, panX: 0, panY: 0 });

  // ── Other state ─────────────────────────────────────────────────────────────
  const isMouseDownRef = useRef(false);
  const annotationMap = useRef<Map<number, ImageState>>(new Map());

  const [selectedCategory, setSelectedCategory] = useState(1);
  const [isDrawMode, setIsDrawMode] = useState(false);
  const [brushSize, setBrushSize] = useState(3);
  const [hasImage, setHasImage] = useState(false);
  const [isEraser, setIsEraser] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const files = imageStore.getFiles();
  const totalImages = files.length;
  const [currentIndex, setCurrentIndex] = useState(0);

  // Inject CSS on mount, remove on unmount
  useEffect(() => {
    const id = "g-annotator-styles";
    let tag = document.getElementById(id) as HTMLStyleElement | null;
    if (!tag) {
      tag = document.createElement("style");
      tag.id = id;
      tag.textContent = GSTYLE;
      document.head.appendChild(tag);
    }
    return () => { tag?.remove(); };
  }, []);

  // ── Checkerboard background ─────────────────────────────────────────────────
  useEffect(() => {
    const ctx = bgCanvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, vpW, vpH);
    ctx.fillStyle = "#1e1e2e";
    ctx.fillRect(0, 0, vpW, vpH);
    // subtle grid dots
    ctx.fillStyle = "rgba(255,255,255,0.03)";
    const step = 32;
    for (let y = 0; y < vpH; y += step)
      for (let x = 0; x < vpW; x += step) ctx.fillRect(x, y, 2, 2);
  }, [vpW, vpH]);

  // ── Redraw image + overlay whenever view changes ────────────────────────────
  const redrawAll = useCallback(() => {
    const img = currentImgRef.current;
    const { zoom, panX, panY } = viewRef.current;
    const iW = imgNativeW.current;
    const iH = imgNativeH.current;

    // Image layer
    const imgCtx = imageCanvasRef.current?.getContext("2d");
    if (imgCtx) {
      imgCtx.clearRect(0, 0, vpW, vpH);
      if (img && iW > 0 && iH > 0) {
        // checkerboard pattern behind image (for transparent PNGs)
        const sqSize = 12;
        for (let row = 0; row < Math.ceil((iH * zoom) / sqSize); row++) {
          for (let col = 0; col < Math.ceil((iW * zoom) / sqSize); col++) {
            imgCtx.fillStyle = (row + col) % 2 === 0 ? "#d0d0d0" : "#a8a8a8";
            imgCtx.fillRect(
              panX + col * sqSize,
              panY + row * sqSize,
              Math.min(sqSize, iW * zoom - col * sqSize),
              Math.min(sqSize, iH * zoom - row * sqSize),
            );
          }
        }
        imgCtx.drawImage(img, panX, panY, iW * zoom, iH * zoom);
      }
    }

    // Overlay layer — redraw from image2DData
    const ovCtx = overlayCanvasRef.current?.getContext("2d");
    if (ovCtx && iW > 0 && iH > 0) {
      ovCtx.clearRect(0, 0, vpW, vpH);

      // Dark vignette outside image rect
      ovCtx.fillStyle = "rgba(0,0,0,0.72)";
      ovCtx.fillRect(0, 0, vpW, vpH);
      ovCtx.clearRect(panX, panY, iW * zoom, iH * zoom);
      ovCtx.fillStyle = "rgba(0,0,0,0.72)";
      ovCtx.fillRect(0, 0, vpW, vpH);
      // Re-draw the hole
      ovCtx.globalCompositeOperation = "destination-out";
      ovCtx.fillStyle = "rgba(0,0,0,1)";
      ovCtx.fillRect(panX, panY, iW * zoom, iH * zoom);
      ovCtx.globalCompositeOperation = "source-over";

      // Render annotations: each annotated native pixel → scaled rect on canvas
      const data = image2DData.current;
      // Use an offscreen canvas at native resolution for efficiency
      const offscreen = document.createElement("canvas");
      offscreen.width = iW;
      offscreen.height = iH;
      const offCtx = offscreen.getContext("2d")!;
      const imgData = offCtx.createImageData(iW, iH);
      const px = imgData.data;
      for (let y = 0; y < iH; y++) {
        for (let x = 0; x < iW; x++) {
          const idx = (y * iW + x) * 4;
          if (data[y]?.[x]) {
            px[idx + 3] = 0; // transparent = annotated (reveals image below)
          } else {
            px[idx + 3] = 0; // also transparent — overlay darkness comes from the rect above
          }
        }
      }
      // Actually: render annotated pixels as fully transparent holes in a dark rect
      // We achieve this with a separate small offscreen that we draw scaled
      const holeCanvas = document.createElement("canvas");
      holeCanvas.width = iW;
      holeCanvas.height = iH;
      const holeCtx = holeCanvas.getContext("2d")!;
      holeCtx.fillStyle = "rgba(0,0,0,0.72)";
      holeCtx.fillRect(0, 0, iW, iH);
      holeCtx.globalCompositeOperation = "destination-out";
      for (let y = 0; y < iH; y++) {
        for (let x = 0; x < iW; x++) {
          if (data[y]?.[x]) {
            holeCtx.fillStyle = "rgba(0,0,0,1)";
            holeCtx.fillRect(x, y, 1, 1);
          }
        }
      }
      // Overlay: first cover everything dark, then clear image area, then draw hole mask scaled
      ovCtx.clearRect(0, 0, vpW, vpH);
      ovCtx.fillStyle = "rgba(0,0,0,0.72)";
      ovCtx.fillRect(0, 0, vpW, vpH);
      // cut hole for image area
      ovCtx.globalCompositeOperation = "destination-out";
      ovCtx.fillStyle = "rgba(0,0,0,1)";
      ovCtx.fillRect(panX, panY, iW * zoom, iH * zoom);
      ovCtx.globalCompositeOperation = "source-over";
      // draw the hole mask (annotations visible, rest dark) scaled into image area
      ovCtx.drawImage(holeCanvas, panX, panY, iW * zoom, iH * zoom);
    }
  }, [vpW, vpH]);

  useEffect(() => {
    redrawAll();
  }, [view, redrawAll]);

  // ── Canvas → image-native coordinate mapping ────────────────────────────────
  const canvasToImage = (cx: number, cy: number) => {
    const { zoom, panX, panY } = viewRef.current;
    return {
      ix: Math.floor((cx - panX) / zoom),
      iy: Math.floor((cy - panY) / zoom),
    };
  };

  // ── Apply overlay after annotation change ───────────────────────────────────
  // (just calls redrawAll — no per-pixel canvas writes needed)

  // ── Save/restore per-image state ────────────────────────────────────────────
  const saveCurrentState = (index: number) => {
    if (!hasImage) return;
    annotationMap.current.set(index, {
      data: image2DData.current.map((row) => [...row]),
      imgW: imgNativeW.current,
      imgH: imgNativeH.current,
      zoom: viewRef.current.zoom,
      panX: viewRef.current.panX,
      panY: viewRef.current.panY,
    });
  };

  // ── Load image ──────────────────────────────────────────────────────────────
  const loadFile = useCallback(
    (file: File, index: number) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          imgNativeW.current = img.naturalWidth;
          imgNativeH.current = img.naturalHeight;
          currentImgRef.current = img;

          const saved = annotationMap.current.get(index);
          if (saved) {
            image2DData.current = saved.data;
            const v = { zoom: saved.zoom, panX: saved.panX, panY: saved.panY };
            viewRef.current = v;
            setView(v);
          } else {
            image2DData.current = freshData(
              img.naturalWidth,
              img.naturalHeight,
            );
            const v = fitTransform(
              img.naturalWidth,
              img.naturalHeight,
              vpW,
              vpH,
            );
            viewRef.current = v;
            setView(v);
          }

          setHasImage(true);
          setIsDrawMode(false);
          // redrawAll will fire from the view state change
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    },
    [vpW, vpH],
  );

  useEffect(() => {
    if (totalImages === 0) return;
    loadFile(files[currentIndex], currentIndex);
  }, [currentIndex, totalImages, loadFile]);

  // Redraw when image loads (view hasn't changed but img did)
  useEffect(() => {
    if (hasImage) redrawAll();
  }, [hasImage, redrawAll]);

  // ── Navigation ──────────────────────────────────────────────────────────────
  const goNext = () => {
    if (currentIndex >= totalImages - 1) return;
    saveCurrentState(currentIndex);
    setCurrentIndex((i) => i + 1);
  };
  const goPrev = () => {
    if (currentIndex <= 0) return;
    saveCurrentState(currentIndex);
    setCurrentIndex((i) => i - 1);
  };

  // ── Zoom helpers ────────────────────────────────────────────────────────────
  const ZOOM_STEP = 0.15;
  const ZOOM_MIN = 0.05;
  const ZOOM_MAX = 10;

  const zoomAround = useCallback((delta: number, cx: number, cy: number) => {
    setView((prev) => {
      const newZoom = Math.min(
        ZOOM_MAX,
        Math.max(ZOOM_MIN, prev.zoom * (1 + delta)),
      );
      const scale = newZoom / prev.zoom;
      return {
        zoom: newZoom,
        panX: cx - scale * (cx - prev.panX),
        panY: cy - scale * (cy - prev.panY),
      };
    });
  }, []);

  const zoomIn = () => zoomAround(ZOOM_STEP, vpW / 2, vpH / 2);
  const zoomOut = () => zoomAround(-ZOOM_STEP, vpW / 2, vpH / 2);
  const zoomReset = () => {
    if (!hasImage) return;
    const v = fitTransform(imgNativeW.current, imgNativeH.current, vpW, vpH);
    setView(v);
  };

  // ── Mouse wheel zoom ────────────────────────────────────────────────────────
  useEffect(() => {
    const el = overlayCanvasRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;
      const delta = e.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP;
      zoomAround(delta, cx, cy);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [zoomAround]);

  // ── Drawing ─────────────────────────────────────────────────────────────────
  const revealBrush = (cx: number, cy: number) => {
    const { ix, iy } = canvasToImage(cx, cy);
    const iW = imgNativeW.current;
    const iH = imgNativeH.current;
    // brushSize is in image-native pixels
    const half = Math.floor(brushSize / 2);
    let changed = false;
    for (let dy = -half; dy <= half; dy++) {
      for (let dx = -half; dx <= half; dx++) {
        const px = ix + dx;
        const py = iy + dy;
        if (px < 0 || px >= iW || py < 0 || py >= iH) continue;
        if (isEraser) {
          image2DData.current[py][px] = 0;
        } else {
          image2DData.current[py][px] = selectedCategory;
        }
        changed = true;
      }
    }
    if (changed) redrawAll();
  };

  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = overlayCanvasRef.current!.getBoundingClientRect();
    return { cx: e.clientX - rect.left, cy: e.clientY - rect.top };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      // Middle-click or Alt+click → pan
      isPanningRef.current = true;
      panStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        panX: viewRef.current.panX,
        panY: viewRef.current.panY,
      };
      e.preventDefault();
      return;
    }
    if (!isDrawMode || !hasImage || e.button !== 0) return;
    isMouseDownRef.current = true;
    const { cx, cy } = getCanvasCoords(e);
    revealBrush(cx, cy);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isPanningRef.current) {
      const dx = e.clientX - panStartRef.current.x;
      const dy = e.clientY - panStartRef.current.y;
      setView((prev) => ({
        ...prev,
        panX: panStartRef.current.panX + dx,
        panY: panStartRef.current.panY + dy,
      }));
      return;
    }
    if (!isDrawMode || !hasImage || !isMouseDownRef.current) return;
    const { cx, cy } = getCanvasCoords(e);
    revealBrush(cx, cy);
  };

  const handleMouseUp = () => {
    isMouseDownRef.current = false;
    isPanningRef.current = false;
  };
  const handleMouseLeave = () => {
    isMouseDownRef.current = false;
    isPanningRef.current = false;
  };

  // ── Finalize ────────────────────────────────────────────────────────────────
  const handleFinalize = () => {
    const iW = imgNativeW.current;
    const iH = imgNativeH.current;
    const data = image2DData.current;
    const mask = new Uint8Array(iW * iH);
    let hasAnnotations = false;

    for (let y = 0; y < iH; y++) {
      for (let x = 0; x < iW; x++) {
        if (data[y]?.[x]) {
          mask[y * iW + x] = 1;
          hasAnnotations = true;
        }
      }
    }
    if (!hasAnnotations) return;

    const GAP = 3,
      STROKE = 2;
    const gapD = dilate(mask, GAP, iW, iH);
    const strokeD = dilate(mask, GAP + STROKE, iW, iH);

    // Build finalized overlay offscreen
    const offscreen = document.createElement("canvas");
    offscreen.width = iW;
    offscreen.height = iH;
    const offCtx = offscreen.getContext("2d")!;
    const imgData = offCtx.createImageData(iW, iH);
    const px = imgData.data;

    for (let i = 0; i < iW * iH; i++) {
      const b = i * 4;
      if (mask[i]) {
        px[b + 3] = 0;
      } else if (strokeD[i] && !gapD[i]) {
        px[b] = px[b + 1] = px[b + 2] = 255;
        px[b + 3] = 255;
      } else {
        px[b + 3] = 204;
      }
    }
    offCtx.putImageData(imgData, 0, 0);

    // Draw it scaled into the overlay canvas
    const { zoom, panX, panY } = viewRef.current;
    const ovCtx = overlayCanvasRef.current?.getContext("2d");
    if (!ovCtx) return;
    ovCtx.clearRect(0, 0, vpW, vpH);
    // background darkness
    ovCtx.fillStyle = "rgba(0,0,0,0.8)";
    ovCtx.fillRect(0, 0, vpW, vpH);
    ovCtx.globalCompositeOperation = "destination-out";
    ovCtx.fillStyle = "rgba(0,0,0,1)";
    ovCtx.fillRect(panX, panY, iW * zoom, iH * zoom);
    ovCtx.globalCompositeOperation = "source-over";
    ovCtx.drawImage(offscreen, panX, panY, iW * zoom, iH * zoom);
  };

  // ── Export at native image resolution ───────────────────────────────────────
  const handleExportCurrent = async () => {
    const blob = await generateMaskBlob(
      image2DData.current,
      imgNativeW.current,
      imgNativeH.current,
    );
    const sourceName = files[currentIndex]?.name ?? "annotation";
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${sourceName.replace(/\.[^.]+$/, "")}_mask.png`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportAll = async () => {
    saveCurrentState(currentIndex);
    setIsExporting(true);
    try {
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();
      const ts = new Date()
        .toISOString()
        .replace(/:/g, "-")
        .replace(/\..+/, "");
      const folder = zip.folder(`annotations_${ts}`)!;

      for (let index = 0; index < totalImages; index++) {
        const state = annotationMap.current.get(index);
        // Only export if we have real dimensions
        if (!state) continue;
        const blob = await generateMaskBlob(state.data, state.imgW, state.imgH);
        const name = files[index]?.name ?? `image_${index}`;
        folder.file(`${name.replace(/\.[^.]+$/, "")}_mask.png`, blob);
      }

      const zipBlob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `annotations_${ts}.zip`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export failed:", err);
      alert(
        "Export failed. Make sure jszip is installed:\n  npm install jszip",
      );
    } finally {
      setIsExporting(false);
    }
  };

  // ── Annotated count ─────────────────────────────────────────────────────────
  const annotatedCount = (() => {
    const liveHas = image2DData.current.some((row) => row.some((v) => v !== 0));
    const saved = [...annotationMap.current.entries()].filter(
      ([idx, state]) =>
        idx !== currentIndex && state.data.some((r) => r.some((v) => v !== 0)),
    ).length;
    return saved + (liveHas ? 1 : 0);
  })();

  const canvasCursor = isDrawMode
    ? isEraser
      ? CURSOR_ERASER
      : CURSOR_PEN
    : CURSOR_DEFAULT;

  const zoomPct = Math.round(view.zoom * 100);

  return (
    <div style={{ position: "fixed", inset: 0, overflow: "hidden" }}>
      {/* ── Background canvas ── */}
      <canvas
        ref={bgCanvasRef}
        width={vpW}
        height={vpH}
        style={{ position: "absolute", inset: 0, display: "block" }}
      />

      {/* ── Image canvas ── */}
      <canvas
        ref={imageCanvasRef}
        width={vpW}
        height={vpH}
        style={{ position: "absolute", inset: 0, display: "block" }}
      />

      {/* ── Overlay / interaction canvas ── */}
      <canvas
        ref={overlayCanvasRef}
        width={vpW}
        height={vpH}
        style={{
          position: "absolute",
          inset: 0,
          display: "block",
          cursor: canvasCursor,
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      />

      {/* ── Back button ── */}
      <button
        onClick={() => navigate("/setup")}
        className="g-btn g-btn-nav"
        style={{ position: "absolute", top: 16, left: 16, zIndex: 10 }}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
          <path d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
        </svg>
        Back
      </button>

      {/* ── Toolbar ── */}
      <div style={{ ...pillPanel, top: 16 }}>
        {/* Category */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(Number(e.target.value))}
          className="g-select"
          style={{ minWidth: 108 }}
        >
          {categories.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.name}
            </option>
          ))}
        </select>

        {/* Brush size */}
        <select
          value={brushSize}
          onChange={(e) => setBrushSize(Number(e.target.value))}
          className="g-select"
          style={{ minWidth: 108 }}
        >
          {brushSizes.map((size) => (
            <option key={size} value={size}>
              Brush {size}px
            </option>
          ))}
        </select>

        <div
          style={{
            width: 1,
            height: 24,
            background: "#dadce0",
            margin: "0 2px",
          }}
        />

        {/* Draw */}
        <button
          onClick={() => setIsDrawMode((p) => !p)}
          disabled={!hasImage}
          className={`g-btn ${isDrawMode ? "g-btn-filled g-btn-active-border" : "g-btn-outlined"}`}
        >
          {Draw()}
          Draw
        </button>

        {/* Eraser */}
        <button
          onClick={() => setIsEraser((p) => !p)}
          disabled={!hasImage}
          className={`g-btn ${isEraser ? "g-btn-yellow g-btn-active-border" : "g-btn-outlined"}`}
        >
          {Eraser()}
          Eraser
        </button>

        {/* Finalize */}
        <button
          onClick={handleFinalize}
          disabled={!hasImage}
          className="g-btn g-btn-purple"
        >
          {Finalize()}
          Finalize
        </button>

        <div
          style={{
            width: 1,
            height: 24,
            background: "#dadce0",
            margin: "0 2px",
          }}
        />

        <div
          style={{
            width: 1,
            height: 24,
            background: "#dadce0",
            margin: "0 2px",
          }}
        />

        {/* Export Current */}
        <button
          onClick={handleExportCurrent}
          disabled={!hasImage}
          className="g-btn g-btn-indigo"
        >
          {ExportCurrent()}
          Export Current
        </button>

        {/* Export All */}
        <button
          onClick={handleExportAll}
          disabled={isExporting || totalImages === 0}
          className="g-btn g-btn-teal"
        >
          {ExportAll()}
          {isExporting ? "Zipping…" : `Export All (${totalImages})`}
        </button>
      </div>

      {/* ── Navigation ── */}
      {totalImages > 0 && (
        <div style={{ ...pillPanel, padding: "6px 14px", bottom: 20, minWidth: 400, maxWidth: 540, width: "100%", justifyContent: "space-between" }}>
          <button
            onClick={goPrev}
            disabled={currentIndex === 0}
            className="g-btn g-btn-nav"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
            </svg>
            Prev
          </button>

          <span
            style={{
              fontSize: 13,
              color: "#3c4043",
              fontFamily: "'Google Sans','Roboto',sans-serif",
              display: "flex",
              alignItems: "center",
              gap: 6,
              whiteSpace: "nowrap",
            }}
          >
            <span style={{ fontWeight: 500, color: "#202124", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis" }}>
              {files[currentIndex]?.name ?? ""}
            </span>
            <span style={{ color: "#5f6368" }}>
              ({currentIndex + 1}/{totalImages})
            </span>
            {annotatedCount > 0 && (
              <span
                style={{
                  background: "#e8f0fe",
                  color: "#1a73e8",
                  borderRadius: 10,
                  padding: "1px 8px",
                  fontSize: 11,
                  fontWeight: 500,
                }}
              >
                {annotatedCount} annotated
              </span>
            )}
          </span>

          <button
            onClick={goNext}
            disabled={currentIndex === totalImages - 1}
            className="g-btn g-btn-nav"
          >
            Next
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10 6 8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
            </svg>
          </button>
        </div>
      )}

      {/* ── No images notice ── */}
      {totalImages === 0 && (
        <div style={{ ...pillPanel, bottom: 20 }}>
          <p
            style={{
              margin: 0,
              fontSize: 13,
              color: "#5f6368",
              fontFamily: "'Google Sans','Roboto',sans-serif",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            {NoImagesInfo()}
            No images loaded — please select a folder first.
          </p>
        </div>
      )}

      {/* Zoom controls */}
      <div
        style={{
          ...pillPanel,
          left: 16,
          transform: "none",
          gap: "4px",
          padding: "6px 14px",
          bottom: 20,
        }}
      >
        <button
          onClick={zoomOut}
          disabled={!hasImage}
          className="g-btn g-btn-outlined"
          style={{ padding: "0 16px", height: 36 }}
        >
          {ZoomOut()}
        </button>

        <span className="zoom-badge">{zoomPct}%</span>

        <button
          onClick={zoomIn}
          disabled={!hasImage}
          className="g-btn g-btn-outlined"
          style={{ padding: "0 16px", height: 36 }}
        >
          {ZoomIn()}
        </button>

        <button
          onClick={zoomReset}
          disabled={!hasImage}
          className="g-btn g-btn-outlined"
          style={{ fontSize: 11, height: 36 }}
        >
          Fit
        </button>
      </div>
    </div>
  );
};

export default App;
