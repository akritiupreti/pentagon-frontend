import React, { useState, useRef, useEffect, useCallback } from "react";
import { imageStore } from "./ImageStore";

export const CANVASWIDTH = 800;
export const CANVASHEIGHT = 600;

// ─── Per-image saved state ────────────────────────────────────────────────────
interface ImageState {
  data: number[][]; // deep-copied 2D annotation array
  overlaySnapshot: ImageData; // pixel-exact overlay canvas snapshot
}

// ─── Morphological dilation (circular kernel, scanline-optimised) ─────────────
const dilate = (mask: Uint8Array, radius: number): Uint8Array => {
  const result = new Uint8Array(CANVASWIDTH * CANVASHEIGHT);
  const r2 = radius * radius;
  for (let y = 0; y < CANVASHEIGHT; y++) {
    for (let x = 0; x < CANVASWIDTH; x++) {
      if (!mask[y * CANVASWIDTH + x]) continue;
      const yStart = Math.max(0, y - radius);
      const yEnd = Math.min(CANVASHEIGHT - 1, y + radius);
      for (let ny = yStart; ny <= yEnd; ny++) {
        const dy = ny - y;
        const maxDx = Math.floor(Math.sqrt(r2 - dy * dy));
        const xS = Math.max(0, x - maxDx);
        const xE = Math.min(CANVASWIDTH - 1, x + maxDx);
        result.fill(1, ny * CANVASWIDTH + xS, ny * CANVASWIDTH + xE + 1);
      }
    }
  }
  return result;
};

// ─── Generate a grayscale mask PNG blob from a 2D data array ──────────────────
const generateMaskBlob = (data: number[][]): Promise<Blob> =>
  new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    canvas.width = CANVASWIDTH;
    canvas.height = CANVASHEIGHT;
    const ctx = canvas.getContext("2d");
    if (!ctx) return reject(new Error("No 2d context"));

    const imageData = ctx.createImageData(CANVASWIDTH, CANVASHEIGHT);
    const pixels = imageData.data;
    const grayMap = [0, 64, 128, 192, 255];

    for (let y = 0; y < CANVASHEIGHT; y++) {
      for (let x = 0; x < CANVASWIDTH; x++) {
        const gray = grayMap[data[y][x]] ?? 0;
        const i = (y * CANVASWIDTH + x) * 4;
        pixels[i] = gray;
        pixels[i + 1] = gray;
        pixels[i + 2] = gray;
        pixels[i + 3] = 255;
      }
    }

    ctx.putImageData(imageData, 0, 0);
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("toBlob failed"))),
      "image/png",
    );
  });

// ─── Fresh 2D annotation array ────────────────────────────────────────────────
const freshData = () =>
  Array.from({ length: CANVASHEIGHT }, () =>
    new Array<number>(CANVASWIDTH).fill(0),
  );

// ─── App ──────────────────────────────────────────────────────────────────────
const App = () => {
  const imageCanvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const image2DData = useRef<number[][]>(freshData());
  const isMouseDownRef = useRef(false);

  // Stores saved state for every image the user has visited
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

  const categories = [
    { name: "Person", value: 1 },
    { name: "Road", value: 2 },
    { name: "Car", value: 3 },
    { name: "Footpath", value: 4 },
  ];
  const brushSizes = [3, 13, 19];

  // ── Initialise image canvas ─────────────────────────────────────────────
  useEffect(() => {
    const ctx = imageCanvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, CANVASWIDTH, CANVASHEIGHT);
  }, []);

  // ── Overlay helpers ─────────────────────────────────────────────────────
  const applyOverlay = () => {
    const ctx = overlayCanvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.globalCompositeOperation = "source-over";
    ctx.clearRect(0, 0, CANVASWIDTH, CANVASHEIGHT);
    ctx.fillStyle = "rgba(0,0,0,0.8)";
    ctx.fillRect(0, 0, CANVASWIDTH, CANVASHEIGHT);
  };

  // ── Snapshot current canvas state into the annotation map ───────────────
  // Must be called synchronously BEFORE currentIndex state changes.
  const saveCurrentState = (index: number) => {
    if (!hasImage) return;
    const ctx = overlayCanvasRef.current?.getContext("2d");
    if (!ctx) return;
    annotationMap.current.set(index, {
      data: image2DData.current.map((row) => [...row]), // deep copy each row
      overlaySnapshot: ctx.getImageData(0, 0, CANVASWIDTH, CANVASHEIGHT),
    });
  };

  // ── Load a File onto the image canvas, then restore or init state ────────
  const loadFile = useCallback((file: File, index: number) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const imageCtx = imageCanvasRef.current?.getContext("2d");
        if (!imageCtx) return;
        imageCtx.clearRect(0, 0, CANVASWIDTH, CANVASHEIGHT);
        imageCtx.drawImage(img, 0, 0, CANVASWIDTH, CANVASHEIGHT);

        const overlayCtx = overlayCanvasRef.current?.getContext("2d");
        if (!overlayCtx) return;

        const saved = annotationMap.current.get(index);
        if (saved) {
          // ── Restore previously saved annotation ─────────────────────
          image2DData.current = saved.data;
          overlayCtx.putImageData(saved.overlaySnapshot, 0, 0);
        } else {
          // ── First visit: start fresh ─────────────────────────────────
          image2DData.current = freshData();
          applyOverlay();
        }

        setHasImage(true);
        setIsDrawMode(false);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  }, []);

  // ── Reload whenever the index changes ───────────────────────────────────
  useEffect(() => {
    if (totalImages === 0) return;
    loadFile(files[currentIndex], currentIndex);
  }, [currentIndex, totalImages, loadFile]);

  // ── Navigation: save first, then move ───────────────────────────────────
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

  // ── Coordinate helper ───────────────────────────────────────────────────
  const getCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = overlayCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: Math.floor(e.clientX - rect.left),
      y: Math.floor(e.clientY - rect.top),
    };
  };

  // ── Core draw / erase ───────────────────────────────────────────────────
  const revealBrush = (cx: number, cy: number) => {
    const ctx = overlayCanvasRef.current?.getContext("2d");
    if (!ctx) return;
    const half = Math.floor(brushSize / 2);

    for (let dy = -half; dy <= half; dy++) {
      for (let dx = -half; dx <= half; dx++) {
        const px = cx + dx;
        const py = cy + dy;
        if (px < 0 || px >= CANVASWIDTH || py < 0 || py >= CANVASHEIGHT)
          continue;

        if (isEraser) {
          image2DData.current[py][px] = 0;
          ctx.clearRect(px, py, 1, 1);
          ctx.globalCompositeOperation = "source-over";
          ctx.fillStyle = "rgba(0,0,0,0.8)";
          ctx.fillRect(px, py, 1, 1);
        } else {
          image2DData.current[py][px] = selectedCategory;
          ctx.globalCompositeOperation = "destination-out";
          ctx.fillStyle = "rgba(0,0,0,1)";
          ctx.fillRect(px, py, 1, 1);
        }
      }
    }
    ctx.globalCompositeOperation = "source-over";
  };

  // ── Mouse handlers ──────────────────────────────────────────────────────
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawMode || !hasImage || e.button !== 0) return;
    isMouseDownRef.current = true;
    const { x, y } = getCoords(e);
    revealBrush(x, y);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawMode || !hasImage || !isMouseDownRef.current) return;
    const { x, y } = getCoords(e);
    revealBrush(x, y);
  };

  const handleMouseUp = () => {
    isMouseDownRef.current = false;
  };
  const handleMouseLeave = () => {
    isMouseDownRef.current = false;
  };

  // ── Finalize ────────────────────────────────────────────────────────────
  const handleFinalize = () => {
    const ctx = overlayCanvasRef.current?.getContext("2d");
    if (!ctx) return;

    const data = image2DData.current;
    const mask = new Uint8Array(CANVASWIDTH * CANVASHEIGHT);
    let hasAnnotations = false;

    for (let y = 0; y < CANVASHEIGHT; y++) {
      for (let x = 0; x < CANVASWIDTH; x++) {
        if (data[y][x] !== 0) {
          mask[y * CANVASWIDTH + x] = 1;
          hasAnnotations = true;
        }
      }
    }
    if (!hasAnnotations) return;

    const GAP = 3;
    const STROKE_WIDTH = 2;
    const gapDilated = dilate(mask, GAP);
    const strokeDilated = dilate(mask, GAP + STROKE_WIDTH);

    const imageData = ctx.createImageData(CANVASWIDTH, CANVASHEIGHT);
    const pixels = imageData.data;

    for (let i = 0; i < CANVASWIDTH * CANVASHEIGHT; i++) {
      const base = i * 4;
      if (mask[i]) {
        pixels[base + 3] = 0; // transparent hole → reveals image beneath
      } else if (strokeDilated[i] && !gapDilated[i]) {
        pixels[base] = 255;
        pixels[base + 1] = 255;
        pixels[base + 2] = 255;
        pixels[base + 3] = 255;
      } else {
        pixels[base + 3] = 204; // dark overlay elsewhere
      }
    }
    ctx.putImageData(imageData, 0, 0);
  };

  // ── Export current image mask only ───────────────────────────────────────
  const handleExportCurrent = async () => {
    const blob = await generateMaskBlob(image2DData.current);
    const sourceName = files[currentIndex]?.name ?? "annotation";
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${sourceName.replace(/\.[^.]+$/, "")}_mask.png`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportAll = async () => {
    // Flush the current image's state into the map before iterating
    saveCurrentState(currentIndex);

    setIsExporting(true);
    try {
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();

      const timestamp = new Date()
        .toISOString()
        .replace(/:/g, "-")
        .replace(/\..+/, "");
      const folderName = `annotations_${timestamp}`;
      const folder = zip.folder(folderName)!;

      for (let index = 0; index < totalImages; index++) {
        // Use saved state if available, otherwise use a blank (all-zero) data array
        const state = annotationMap.current.get(index);
        const data = state ? state.data : freshData();

        const blob = await generateMaskBlob(data);
        const sourceName = files[index]?.name ?? `image_${index}`;
        folder.file(`${sourceName.replace(/\.[^.]+$/, "")}_mask.png`, blob);
      }

      const zipBlob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${folderName}.zip`;
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

  // ── Count of images that have at least one annotated pixel ───────────────
  // Includes the live (unsaved) current image.
  const annotatedCount = (() => {
    const liveHasAnnotation = image2DData.current.some((row) =>
      row.some((v) => v !== 0),
    );
    const savedCount = [...annotationMap.current.entries()].filter(
      ([idx, state]) =>
        idx !== currentIndex &&
        state.data.some((row) => row.some((v) => v !== 0)),
    ).length;
    return savedCount + (liveHasAnnotation ? 1 : 0);
  })();

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">Image Annotator</h1>

      {/* ── Toolbar ── */}
      <div className="mb-4 flex items-center flex-wrap gap-2">
        {/* CATEGORY */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(Number(e.target.value))}
          className="p-2 border border-gray-300 rounded"
        >
          {categories.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.name}
            </option>
          ))}
        </select>

        {/* BRUSH SIZE */}
        {brushSizes.map((size) => (
          <button
            key={size}
            onClick={() => setBrushSize(size)}
            className={`px-3 py-2 ${
              brushSize === size ? "bg-gray-700 text-white" : "bg-white border"
            }`}
          >
            {size}px
          </button>
        ))}

        {/* DRAW MODE */}
        <button
          onClick={() => setIsDrawMode((p) => !p)}
          disabled={!hasImage}
          className="px-4 py-2 bg-green-500 text-white rounded disabled:opacity-50"
        >
          {isDrawMode ? "Drawing ON" : "Draw"}
        </button>

        {/* ERASER */}
        <button
          onClick={() => setIsEraser((p) => !p)}
          disabled={!hasImage}
          className={`px-4 py-2 rounded disabled:opacity-50 ${
            isEraser ? "bg-yellow-500 text-white" : "bg-white border"
          }`}
        >
          {isEraser ? "Eraser ON" : "Eraser"}
        </button>

        {/* FINALIZE */}
        <button
          onClick={handleFinalize}
          disabled={!hasImage}
          className="px-4 py-2 bg-purple-600 text-white rounded disabled:opacity-50 font-semibold"
        >
          Finalize
        </button>

        {/* EXPORT CURRENT */}
        <button
          onClick={handleExportCurrent}
          disabled={!hasImage}
          className="px-4 py-2 bg-indigo-600 text-white rounded disabled:opacity-50 font-semibold"
        >
          Export Current
        </button>

        <button
          onClick={handleExportAll}
          disabled={isExporting || totalImages === 0}
          className="px-4 py-2 bg-teal-600 text-white rounded disabled:opacity-50 font-semibold"
        >
          {isExporting ? "Zipping…" : `Export All (${totalImages})`}
        </button>
      </div>

      {/* ── Canvas stack ── */}
      <div
        style={{
          position: "relative",
          width: CANVASWIDTH,
          height: CANVASHEIGHT,
        }}
      >
        <canvas
          ref={imageCanvasRef}
          width={CANVASWIDTH}
          height={CANVASHEIGHT}
          className="border rounded-xs"
          style={{ position: "absolute" }}
        />
        <canvas
          ref={overlayCanvasRef}
          width={CANVASWIDTH}
          height={CANVASHEIGHT}
          style={{ position: "absolute" }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          className="cursor-crosshair"
        />
      </div>

      {/* ── Image navigation ── */}
      {totalImages > 0 && (
        <div className="flex items-center gap-4 mt-4">
          <button
            onClick={goPrev}
            disabled={currentIndex === 0}
            className="px-5 py-2 bg-gray-700 text-white rounded disabled:opacity-40"
          >
            ← Prev
          </button>

          <span className="text-sm text-gray-600 font-medium min-w-[160px] text-center">
            {files[currentIndex]?.name ?? ""}
            <br />
            <span className="text-gray-400">
              {currentIndex + 1} / {totalImages}
            </span>
          </span>

          <button
            onClick={goNext}
            disabled={currentIndex === totalImages - 1}
            className="px-5 py-2 bg-gray-700 text-white rounded disabled:opacity-40"
          >
            Next →
          </button>
        </div>
      )}

      {totalImages === 0 && (
        <p className="mt-4 text-gray-500 text-sm">
          No images loaded — please select a folder first.
        </p>
      )}
    </div>
  );
};

export default App;
