<script lang="ts">
  import Icon from "./Icon.svelte";

  const { uploadedImage, onMaskSave, onRemoveImage } = $props<{
    uploadedImage: string;
    onMaskSave: (maskImage: string) => void;
    onRemoveImage: () => void;
  }>();

  // Painting canvas state
  let canvasRef: HTMLCanvasElement | null = null;
  let ctx: CanvasRenderingContext2D | null = null;
  let isDrawing = $state(false);
  let brushSizePercent = $state(20); // Percentage of image width
  let showBrushPreview = $state(false);

  function initializeCanvas() {
    if (!canvasRef || !uploadedImage) return;

    const img = new Image();
    img.onload = () => {
      // Store original dimensions for mask generation
      const originalWidth = img.width;
      const originalHeight = img.height;

      // Calculate reasonable size for display (max 600px width/height)
      const maxSize = 600;
      let canvasWidth = img.width;
      let canvasHeight = img.height;

      if (img.width > maxSize || img.height > maxSize) {
        if (img.width > img.height) {
          canvasWidth = maxSize;
          canvasHeight = (img.height * maxSize) / img.width;
        } else {
          canvasHeight = maxSize;
          canvasWidth = (img.width * maxSize) / img.height;
        }
      }

      // Set canvas size to calculated size for display
      canvasRef!.width = canvasWidth;
      canvasRef!.height = canvasHeight;

      // Get context and set up drawing
      ctx = canvasRef!.getContext("2d")!;
      ctx.strokeStyle = "rgb(255, 255, 255)"; // Pure white, no alpha
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.lineWidth = (canvasWidth * brushSizePercent) / 100;
      ctx.globalCompositeOperation = "source-over"; // Ensure white pixels are opaque

      // Update the background image to match canvas size
      const backgroundImg = document.querySelector(".background-image") as HTMLImageElement;
      if (backgroundImg) {
        backgroundImg.style.width = canvasWidth + "px";
        backgroundImg.style.height = canvasHeight + "px";
      }

      // Store original dimensions for later mask generation
      canvasRef!.dataset.originalWidth = originalWidth.toString();
      canvasRef!.dataset.originalHeight = originalHeight.toString();
    };
    img.src = uploadedImage;
  }

  function startDrawing(event: MouseEvent) {
    isDrawing = true;
    draw(event);
  }

  function stopDrawing() {
    isDrawing = false;
    ctx?.beginPath();
  }

  function draw(event: MouseEvent) {
    if (!isDrawing || !ctx || !canvasRef) return;

    const rect = canvasRef.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    ctx.strokeStyle = "rgb(255, 255, 255)"; // Pure white, no alpha
    ctx.lineWidth = (canvasRef.width * brushSizePercent) / 100;
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  }

  function clearCanvas() {
    if (!ctx || !canvasRef) return;
    ctx.clearRect(0, 0, canvasRef.width, canvasRef.height);
  }

  function saveMask() {
    if (!canvasRef) return;

    // Use the binary mask generation function
    const maskImage = getBinaryMask();
    if (maskImage) {
      onMaskSave(maskImage);
    }
  }

  function downloadMask() {
    if (!canvasRef) return;

    const maskImage = getBinaryMask();
    if (maskImage) {
      const link = document.createElement("a");
      link.href = maskImage;
      link.download = "mask.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  function createBinaryMask(canvas: HTMLCanvasElement, targetWidth: number, targetHeight: number): string {
    // Create a temporary canvas for the binary mask
    const maskCanvas = document.createElement("canvas");
    const maskCtx = maskCanvas.getContext("2d")!;

    // Set to target dimensions
    maskCanvas.width = targetWidth;
    maskCanvas.height = targetHeight;

    // Scale the painted canvas to target size
    maskCtx.drawImage(canvas, 0, 0, targetWidth, targetHeight);

    // Get image data to process pixels
    const imageData = maskCtx.getImageData(0, 0, targetWidth, targetHeight);
    const data = imageData.data;

    // Create a new canvas for the binary mask
    const binaryCanvas = document.createElement("canvas");
    const binaryCtx = binaryCanvas.getContext("2d")!;
    binaryCanvas.width = targetWidth;
    binaryCanvas.height = targetHeight;

    // Create new image data for binary mask
    const binaryImageData = binaryCtx.createImageData(targetWidth, targetHeight);
    const binaryData = binaryImageData.data;

    // Process each pixel to create binary mask (white for painted areas, black for unpainted)
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];

      // If pixel has any significant white content, make it white (painted area)
      // Otherwise make it black (unpainted area)
      if (r > 128 || g > 128 || b > 128 || a > 128) {
        binaryData[i] = 255; // R - white (painted)
        binaryData[i + 1] = 255; // G - white (painted)
        binaryData[i + 2] = 255; // B - white (painted)
        binaryData[i + 3] = 255; // A - opaque
      } else {
        binaryData[i] = 0; // R - black (unpainted)
        binaryData[i + 1] = 0; // G - black (unpainted)
        binaryData[i + 2] = 0; // B - black (unpainted)
        binaryData[i + 3] = 255; // A - opaque (not transparent)
      }
    }

    // Put the binary data on the canvas
    binaryCtx.putImageData(binaryImageData, 0, 0);

    // Convert to PNG with maximum compression
    return binaryCanvas.toDataURL("image/png", 1.0);
  }

  function getBinaryMask(): string | null {
    if (!canvasRef) return null;

    // Get original dimensions from canvas dataset
    const originalWidth = parseInt(canvasRef.dataset.originalWidth || "0");
    const originalHeight = parseInt(canvasRef.dataset.originalHeight || "0");

    if (originalWidth && originalHeight) {
      // Create binary mask at original image dimensions
      return createBinaryMask(canvasRef, originalWidth, originalHeight);
    } else {
      // If we don't have original dimensions, we can't create a proper mask
      console.error("Original image dimensions not available for mask generation");
      return null;
    }
  }

  // Initialize canvas when component mounts
  $effect(() => {
    if (uploadedImage) {
      setTimeout(() => {
        initializeCanvas();
      }, 100);
    }
  });

  // Expose the getBinaryMask function to parent
  export { getBinaryMask };
  
  // Function to get the current mask as a binary mask
  function getCurrentMask(): string | null {
    return getBinaryMask();
  }
  
  // Expose the getCurrentMask function to parent
  export { getCurrentMask };
</script>

<div class="painting-section">
  <div class="painting-canvas-container">
    <div class="canvas-background">
      <img src={uploadedImage} alt="Background image" class="background-image" />
    </div>
    <canvas 
      bind:this={canvasRef} 
      on:mousedown={startDrawing} 
      on:mousemove={draw} 
      on:mouseup={stopDrawing} 
      on:mouseleave={stopDrawing} 
      class="painting-canvas"
    ></canvas>

    <!-- Brush Size Preview -->
    {#if showBrushPreview && canvasRef}
      {@const brushSize = (canvasRef.width * brushSizePercent) / 100}
      <div class="brush-preview" style="width: {brushSize}px; height: {brushSize}px;">
        <div class="brush-preview-inner"></div>
      </div>
    {/if}

    <!-- Floating Remove Button -->
    <button class="floating-remove-btn" on:click={onRemoveImage}>
      <Icon name="x" size={16} />
    </button>

    <div class="floating-controls {isDrawing ? 'hidden' : ''}">
      <div class="brush-size-control">
        <input 
          type="range" 
          id="brush-size" 
          min="2" 
          max="25" 
          bind:value={brushSizePercent} 
          class="brush-slider" 
          on:input={() => (showBrushPreview = true)} 
          on:blur={() => (showBrushPreview = false)} 
        />
      </div>
      <button class="floating-clear-btn" on:click={clearCanvas}>
        <Icon name="trash2" size={16} />
      </button>
      <!-- <button class="floating-download-btn" on:click={downloadMask}>
        <Icon name="download" size={16} />
      </button> -->
    </div>
  </div>
</div>

<style>
  .painting-section {
    width: 100%;
    max-width: 800px;
  }

  .painting-canvas-container {
    background: #1c1c1e;
    border: 2px solid #3a3a3c;
    border-radius: 12px;
    padding: 1rem;
    overflow: auto;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .canvas-background {
    position: relative;
    z-index: 1;
  }

  .background-image {
    border-radius: 8px;
    display: block;
  }

  .painting-canvas {
    border: 1px solid #3a3a3c;
    mix-blend-mode: difference;
    border-radius: 8px;
    cursor: crosshair;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 2;
    background: transparent;
  }

  .floating-controls {
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    flex-direction: row;
    gap: 15px;
    z-index: 10;
    align-items: center;
  }

  .brush-size-control {
    background: rgba(0, 0, 0, 0.8);
    border-radius: 8px;
    padding: 12px;
    backdrop-filter: blur(10px);
    position: relative;
    overflow: visible;
  }

  .brush-slider {
    width: 160px;
    height: 6px;
    border-radius: 3px;
    background: #1a1a1a;
    outline: none;
    -webkit-appearance: none;
    appearance: none;
    transition: all 0.3s ease;
    position: relative;
    overflow: visible;
    margin: 8px 0;
    border: 1px solid #333;
  }

  .brush-slider::-webkit-slider-track {
    background: transparent;
    border: none;
  }

  .brush-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 4px;
    background: #007aff;
    cursor: pointer;
    border: 2px solid #ffffff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    transition: all 0.2s ease;
  }

  .brush-slider::-webkit-slider-thumb:hover {
    background: #0056cc;
    transform: scale(1.1);
    box-shadow: 0 4px 12px rgba(0, 122, 255, 0.4);
  }

  .brush-slider::-webkit-slider-thumb:active {
    background: #004499;
    transform: scale(0.95);
  }

  .brush-slider::-moz-range-track {
    background: transparent;
    border: none;
    height: 6px;
    border-radius: 3px;
  }

  .brush-slider::-moz-range-thumb {
    width: 20px;
    height: 20px;
    border-radius: 4px;
    background: #007aff;
    cursor: pointer;
    border: 2px solid #ffffff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    transition: all 0.2s ease;
  }

  .brush-slider::-moz-range-thumb:hover {
    background: #0056cc;
    transform: scale(1.1);
    box-shadow: 0 4px 12px rgba(0, 122, 255, 0.4);
  }

  .brush-slider::-moz-range-thumb:active {
    background: #004499;
    transform: scale(0.95);
  }

  .floating-clear-btn {
    background: rgba(255, 69, 58, 0.9);
    color: white;
    border: none;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(10px);
  }

  .floating-clear-btn:hover {
    background: rgba(215, 0, 21, 0.9);
    transform: scale(1.1);
  }

  .floating-download-btn {
    background: rgba(48, 209, 88, 0.9);
    color: white;
    border: none;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(10px);
  }

  .floating-download-btn:hover {
    background: rgba(48, 209, 88, 0.9);
    transform: scale(1.1);
  }

  .floating-remove-btn {
    position: absolute;
    top: 10px;
    right: 10px;
    background: #2f1414;
    color: white;
    border: 2px solid #ffb9b530;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(20px);
    z-index: 15;
  }

  .floating-remove-btn:hover {
    background: #2c2c2e;
    border-color: #d70015;
    transform: scale(1.02);
    box-shadow: 0 8px 32px rgba(255, 69, 58, 0.15);
  }

  .brush-preview {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    border-radius: 50%;
    background: rgba(0, 122, 255, 0.8);
    border: 2px solid rgba(255, 255, 255, 0.9);
    box-shadow: 0 0 0 2px rgba(0, 122, 255, 0.3);
    z-index: 20;
    pointer-events: none;
    animation: brushPreviewPulse 2s ease-in-out infinite;
  }

  .brush-preview-inner {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 70%);
  }

  @keyframes brushPreviewPulse {
    0%,
    100% {
      opacity: 0.8;
      transform: translate(-50%, -50%) scale(1);
    }
    50% {
      opacity: 1;
      transform: translate(-50%, -50%) scale(1.1);
    }
  }

  .floating-controls.hidden {
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.2s ease;
  }

  .floating-controls {
    transition: opacity 0.2s ease;
  }

  /* Handle very large images */
  @media (max-width: 1200px) {
    .painting-canvas-container {
        overflow: hidden;
      max-width: 90vw;
      max-height: 80vh;
    }
  }
</style> 