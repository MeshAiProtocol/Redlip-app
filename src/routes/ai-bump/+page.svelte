<script lang="ts">
  import { goto } from "$app/navigation";
  import { COMFYUI_SERVER_URL } from "$lib/config";
  import Header from "$lib/components/Header.svelte";
  import ImageUpload from "$lib/components/ImageUpload.svelte";
  import PaintingCanvas from "$lib/components/PaintingCanvas.svelte";
  import ActionButtons from "$lib/components/ActionButtons.svelte";
  import JobProgress from "$lib/components/JobProgress.svelte";
  import GeneratedImage from "$lib/components/GeneratedImage.svelte";
  import Toast from "$lib/components/Toast.svelte";
  import Icon from "$lib/components/Icon.svelte";

  // Reactive state
  let uploadedImage = $state<string | null>(null);
  let uploadedImageName = $state<string | null>(null);
  let showToast = $state(false);
  let toastMessage = $state("");
  let toastType = $state<"success" | "warning" | "error">("success");
  let isSendingWorkflow = $state(false);
  let workflowStatus = $state<"idle" | "sending" | "queued" | "executing" | "completed" | "error">("idle");
  let previousWorkflowStatus = $state<"idle" | "sending" | "queued" | "executing" | "completed" | "error">("idle");
  let workflowResult = $state<any>(null);
  let workflowError = $state<string | null>(null);
  let jobId = $state<string | null>(null);
  let jobProgress = $state<any>(null);
  let isTrackingJob = $state(false);
  let generatedImage = $state<string | null>(null);
  let generatedFilename = $state<string | null>(null);
  let maskImage = $state<string | null>(null);
  let showSettings = $state(false);

  // CLIP text encoder settings
  let clipTextPrompt = $state("Extremely tight, fabric pants. clinging tightly to create visible creases and folds due to the fabric's high stretch. The pants feature a pronounced, exaggerated bulge around the crotch area, clearly defined by the tension. naturall lighting with soft, high contrast shadows enhances depth, emphasizing the stretch-induced wrinkles and contours around the crotch and thighs. strong shadows drawing attention to the tight fit and contours.");

  // Computed values
  let canGenerate = $derived(uploadedImage !== null);

  // Functions
  function handleImageUpload(image: string, filename: string) {
    uploadedImage = image;
    uploadedImageName = filename;
  }

  function handleMaskSave(mask: string) {
    maskImage = mask;
    showNotification("Mask saved successfully!", "success");
  }

  function handleRemoveImage() {
    uploadedImage = null;
    maskImage = null;
  }

  function showNotification(message: string, type: "success" | "warning" | "error" = "success") {
    toastMessage = message;
    toastType = type;
    showToast = true;

    setTimeout(() => {
      showToast = false;
    }, 3000);
  }

  async function uploadImageToServer() {
    if (!uploadedImage || !uploadedImageName) {
      throw new Error("No image to upload");
    }

    console.log("Uploading image to server:", uploadedImageName);

    // Convert base64 to blob
    const base64Match = uploadedImage.match(/^data:image\/[^;]+;base64,(.+)$/);
    if (!base64Match) {
      throw new Error("Invalid image format");
    }

    const base64Data = base64Match[1];
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: "image/png" });

    // Create FormData for upload
    const formData = new FormData();
    formData.append("image", blob, uploadedImageName);

    // Upload to server
    const response = await fetch("/api/comfyui", {
      method: "PUT",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Upload failed: ${response.status}`);
    }

    const result = await response.json();
    console.log("Image upload result:", result);
    return result;
  }

  function handleGenerate() {
    if (!uploadedImage) {
      showNotification("Please upload an image", "warning");
      return;
    }

      // Auto-save mask if canvas exists but maskImage is not set
  if (!maskImage) {
    // Try to get the mask from the painting canvas
    const paintingCanvas = document.querySelector('canvas.painting-canvas') as HTMLCanvasElement;
    if (paintingCanvas) {
      // Get original dimensions from the canvas dataset
      const originalWidth = parseInt(paintingCanvas.dataset.originalWidth || "0");
      const originalHeight = parseInt(paintingCanvas.dataset.originalHeight || "0");
      
      if (originalWidth && originalHeight) {
        // Create a binary mask at original image dimensions
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d')!;
        tempCanvas.width = originalWidth;
        tempCanvas.height = originalHeight;
        tempCtx.drawImage(paintingCanvas, 0, 0, originalWidth, originalHeight);
        
        // Convert to binary mask (white pixels become white, everything else becomes black)
        const imageData = tempCtx.getImageData(0, 0, originalWidth, originalHeight);
        const data = imageData.data;
        
        const binaryCanvas = document.createElement('canvas');
        const binaryCtx = binaryCanvas.getContext('2d')!;
        binaryCanvas.width = originalWidth;
        binaryCanvas.height = originalHeight;
        
        const binaryImageData = binaryCtx.createImageData(originalWidth, originalHeight);
        const binaryData = binaryImageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const a = data[i + 3];
          
          // If pixel has any significant white content, make it white
          if (r > 128 || g > 128 || b > 128 || a > 128) {
            binaryData[i] = 255;     // R
            binaryData[i + 1] = 255; // G
            binaryData[i + 2] = 255; // B
            binaryData[i + 3] = 255; // A (opaque)
          } else {
            binaryData[i] = 0;       // R
            binaryData[i + 1] = 0;   // G
            binaryData[i + 2] = 0;   // B
            binaryData[i + 3] = 255; // A (opaque, not transparent)
          }
        }
        
        binaryCtx.putImageData(binaryImageData, 0, 0);
        maskImage = binaryCanvas.toDataURL("image/png", 1.0);
        showNotification("Mask automatically saved", "success");
      } else {
        showNotification("Cannot generate mask: original image dimensions not available", "error");
        return;
      }
    }
  }

    // Do the same ComfyUI processing as "Process with ComfyUI"
    processWithComfyUIAndNavigate();
  }

  async function processWithComfyUIAndNavigate() {
    if (isSendingWorkflow) return;

    isSendingWorkflow = true;
    previousWorkflowStatus = workflowStatus;
    workflowStatus = "sending";
    workflowError = null;
    workflowResult = null;
    jobId = null;
    jobProgress = null;

    try {
      // Check if image is uploaded
      if (!uploadedImage || !uploadedImageName) {
        throw new Error("Please upload an image first");
      }

      // Upload image to ComfyUI server first
      showNotification("Uploading image to server...", "success");
      await uploadImageToServer();

      // Generate random filename for this generation
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 8);
      const filename = `img_${timestamp}_${randomId}`;

      // Store the generated filename for later use
      generatedFilename = filename;

      console.log("Sending workflow request with:", {
        imageName: uploadedImageName,
        hasMask: !!maskImage,
        filename: filename,
        clipTextPrompt: clipTextPrompt,
      });

      // Send workflow with uploaded image name and custom prompt
      const response = await fetch("/api/comfyui", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "upload_and_process",
          imageName: uploadedImageName,
          maskImage: maskImage, // Send the mask image if available
          filename: filename, // Send the generated filename to the server
          clipTextPrompt: clipTextPrompt, // Send the custom prompt
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const result = await response.json();
      console.log("ComfyUI response:", result);

      // Extract job ID from the response
      if (result.data && result.data.prompt_id) {
        jobId = result.data.prompt_id;
        workflowStatus = "executing";
        showNotification("Job submitted successfully! Tracking progress...", "success");

        // Start tracking the job progress
        await trackJobProgress(jobId!);
      } else {
        throw new Error("No job ID received from ComfyUI");
      }
    } catch (error) {
      console.error("Error processing image:", error);
      workflowError = error instanceof Error ? error.message : "Unknown error";
      workflowStatus = "error";
      showNotification(`Error processing image: ${workflowError}`, "error");
    } finally {
      isSendingWorkflow = false;
    }
  }

  async function trackJobProgress(promptId: string, retryCount = 0) {
    isTrackingJob = true;

    // Limit retries to prevent infinite loops
    if (retryCount > 5) {
      isTrackingJob = false;
      workflowStatus = "error";
      workflowError = "Job tracking failed after multiple retries. Please check manually.";
      showNotification("Job tracking failed after multiple retries.", "error");
      return;
    }

    try {
      // Poll the job status every 7 seconds
      const pollInterval = setInterval(async () => {
        try {
          // Get job history through our API endpoint
          const historyResponse = await fetch(`/api/comfyui?action=history&prompt_id=${promptId}`);

          if (historyResponse.ok) {
            const responseData = await historyResponse.json();
            if (responseData.success && responseData.data) {
              const historyData = responseData.data;
              jobProgress = historyData;
              console.log("Job progress update:", historyData);

              // Determine job state based on the response structure
              let newStatus: typeof workflowStatus = "idle";

              if (!historyData || Object.keys(historyData).length === 0) {
                // Empty response - job hasn't started yet
                newStatus = "sending";
              } else if (historyData && Object.keys(historyData).length > 0) {
                // We have a job ID, check if it has outputs
                const jobId = Object.keys(historyData)[0];
                const jobData = historyData[jobId];

                // Check for error status first
                if (jobData && jobData.status && jobData.status.status_str === "error") {
                  newStatus = "error";
                  workflowError = jobData.status.messages?.join(", ") || "Job failed with an error";
                  // Store the full job data for debugging
                  workflowResult = historyData;
                  clearInterval(pollInterval);
                  isTrackingJob = false;
                  showNotification("Job failed with an error", "error");
                } else if (jobData && jobData.outputs && Object.keys(jobData.outputs).length > 0) {
                  // Job completed - has outputs
                  workflowResult = historyData;
                  newStatus = "completed";
                  clearInterval(pollInterval);
                  isTrackingJob = false;

                  // Use our generated filename to construct the image URL
                  if (generatedFilename) {
                    generatedImage = `${COMFYUI_SERVER_URL}/view?filename=${generatedFilename}.jpg&type=output&subfolder=DJ`;
                    console.log("Generated Image URL:", generatedImage);
                  }
                } else if (jobData && jobData.status) {
                  // Job is being processed - has status but no outputs yet
                  newStatus = "executing";
                } else {
                  // Job exists but no status yet - it's in queue
                  newStatus = "queued";
                }
              }

              // Only show notification if status changed
              if (newStatus !== previousWorkflowStatus) {
                previousWorkflowStatus = workflowStatus;
                workflowStatus = newStatus;

                switch (newStatus) {
                  case "sending":
                    showNotification("Job submitted, waiting to start...", "success");
                    break;
                  case "queued":
                    showNotification("Job is in queue...", "success");
                    break;
                  case "executing":
                    showNotification("Job is being processed...", "success");
                    break;
                  case "completed":
                    showNotification("Image processing completed!", "success");
                    break;
                  case "error":
                    showNotification("Job failed with an error", "error");
                    break;
                }
              } else {
                // Update status without notification
                workflowStatus = newStatus;
              }
            } else {
              // Check queue status as fallback
              const queueResponse = await fetch("/api/comfyui?action=queue");
              if (queueResponse.ok) {
                const queueData = await queueResponse.json();
                if (queueData.success && queueData.data) {
                  jobProgress = { queue: queueData.data, status: "executing" };
                }
              }
            }
          }
        } catch (error) {
          console.error("Error tracking job:", error);
          // Continue polling even if there's an error
          // Add some visual feedback for errors
          if (jobProgress && !jobProgress.error) {
            jobProgress.error = error instanceof Error ? error.message : "Unknown error";
          }
        }
      }, 7000);

      // Stop polling after 5 minutes (timeout) and retry
      setTimeout(() => {
        clearInterval(pollInterval);
        if (isTrackingJob) {
          console.log("Job tracking timeout, retrying...");
          showNotification("Job tracking timeout. Retrying...", "warning");
          // Retry the job tracking
          setTimeout(() => {
            if (jobId) {
              trackJobProgress(jobId, retryCount + 1);
            }
          }, 7000); // Wait 7 seconds before retrying
        }
      }, 300000); // 5 minutes
    } catch (error) {
      console.error("Error starting job tracking:", error);
      isTrackingJob = false;
      workflowStatus = "error";
      workflowError = "Failed to start job tracking";
    }
  }

  function handleRetryTracking() {
    if (jobId) {
      trackJobProgress(jobId);
    }
  }

  function handleDownload() {
    if (generatedImage) {
      const link = document.createElement("a");
      link.href = generatedImage;
      link.download = "generated-image.jpg";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  function handleGenerateNew() {
    generatedImage = null;
    generatedFilename = null;
    workflowStatus = "idle";
    uploadedImage = null;
    maskImage = null;
  }

  function handleBack() {
    goto("/");
  }

  function handleQueueClick() {
    goto("/queue");
  }

  function handleSystemClick() {
    goto("/system");
  }

  function toggleSettings() {
    showSettings = !showSettings;
  }
</script>

<svelte:head>
  <title>Image Generation - SvelteKit 5</title>
  <meta name="description" content="Create the best quality content with prompt lists and guides" />
</svelte:head>

<div class="container">
  <div class="content">
    <!-- Header -->
    <Header 
      title="AI Bump Adder"
      onBack={handleBack}
      onQueueClick={handleQueueClick}
      onSystemClick={handleSystemClick}
    />

    <!-- Main Content -->
    <div class="upload-section">
      {#if !uploadedImage}
        <ImageUpload onImageUpload={handleImageUpload} />
      {:else}
        <div class="image-preview">
          <PaintingCanvas 
            uploadedImage={uploadedImage}
            onMaskSave={handleMaskSave}
            onRemoveImage={handleRemoveImage}
          />
          
          <!-- Floating Settings Panel -->
          {#if showSettings}
            <div class="floating-settings">
              <div class="settings-header">
                <div class="header-left">
                  <Icon name="settings" size={16} color="white" />
                  <h3>Effect Settings</h3>
                </div>
                <button class="settings-toggle" on:click={toggleSettings}>
                  <Icon name="chevronUp" size={16} />
                </button>
              </div>
              
              <div class="settings-content">
                <!-- CLIP Text Encoder Settings -->
                <div class="settings-group">
                  <h4 class="group-title">
                    <Icon name="type" size={16} />
                    Positive Prompt
                  </h4>
                  <div class="settings-controls">
                    <div class="control-item">
                      <textarea 
                        id="clip-text-prompt"
                        bind:value={clipTextPrompt}
                        placeholder="Enter your positive prompt here..."
                        class="prompt-textarea"
                        rows="4"
                      ></textarea>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          {:else}
            <button class="floating-toggle-btn" on:click={toggleSettings}>
              <Icon name="settings" size={20} />
            </button>
          {/if}
        </div>
      {/if}

      <!-- Action Buttons -->
      <ActionButtons 
        canGenerate={canGenerate}
        isSendingWorkflow={isSendingWorkflow}
        isTrackingJob={isTrackingJob}
        onGenerate={handleGenerate}
      />

      <!-- Job Progress Display -->
          <JobProgress 
      workflowStatus={workflowStatus}
      jobId={jobId}
      jobProgress={jobProgress}
      workflowError={workflowError}
      workflowResult={workflowResult}
      onRetryTracking={handleRetryTracking}
    />

      <!-- Generated Image Display -->
      {#if generatedImage}
        <GeneratedImage 
          generatedImage={generatedImage}
          onDownload={handleDownload}
          onGenerateNew={handleGenerateNew}
        />
      {/if}
    </div>
  </div>
</div>

<!-- Toast Notification -->
<Toast show={showToast} message={toastMessage} type={toastType} />

<style>
  .container {
    padding: 2rem;
    max-width: 800px;
    margin: 0 auto;
    background: #000000;
  }

  .content {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .upload-section {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    align-items: center;
  }

  .image-preview {
    position: relative;
    max-width: 600px;
    width: 100%;
  }

  .floating-settings {
    position: absolute;
    top: 20px;
    left: 20px;
    background: rgba(28, 28, 30, 0.95);
    border: 2px solid #3a3a3c;
    border-radius: 12px;
    padding: 1rem;
    width: 280px;
    max-height: 70vh;
    overflow-y: auto;
    backdrop-filter: blur(20px);
    z-index: 10;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .floating-settings:hover {
    background: rgba(28, 28, 30, 0.98);
    border-color: #007aff;
    box-shadow: 0 12px 40px rgba(0, 122, 255, 0.2);
  }

  .settings-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
    padding-bottom: 0.75rem;
    border-bottom: 1px solid #3a3a3c;
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .settings-header h3 {
    font-size: 1rem;
    font-weight: 600;
    color: #ffffff;
    margin: 0;
  }

  .settings-toggle {
    background: #2c2c2e;
    border: 1px solid #3a3a3c;
    border-radius: 6px;
    padding: 0.25rem;
    cursor: pointer;
    transition: all 0.3s ease;
    color: #ffffff;
  }

  .settings-toggle:hover {
    background: #3a3a3c;
    border-color: #007aff;
  }

  .floating-toggle-btn {
    position: absolute;
    top: 20px;
    left: 20px;
    background: rgba(28, 28, 30, 0.95);
    border: 2px solid #3a3a3c;
    border-radius: 50%;
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    color: #ffffff;
    backdrop-filter: blur(20px);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  }

  .floating-toggle-btn :global(svg) {
    color: #ffffff;
  }

  .floating-toggle-btn:hover {
    background: rgba(28, 28, 30, 0.98);
    border-color: #007aff;
    transform: scale(1.05);
    box-shadow: 0 12px 40px rgba(0, 122, 255, 0.2);
  }

  .settings-content {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .settings-group {
    background: #2c2c2e;
    border: 1px solid #3a3a3c;
    border-radius: 8px;
    padding: 0.75rem;
  }

  .group-title {
    font-size: 0.875rem;
    font-weight: 600;
    color: #ffffff;
    margin: 0 0 0.5rem 0;
    display: flex;
    align-items: center;
    gap: 0.375rem;
  }

  .settings-controls {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .control-item {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .control-item label {
    font-size: 0.75rem;
    font-weight: 500;
    color: #a1a1aa;
  }

  .prompt-textarea {
	width: calc(100% - 16px);
    min-height: 160px;
    background: #1a1a1a;
    border: 1px solid #333;
    border-radius: 6px;
    padding: 0.5rem;
    color: #ffffff;
    font-size: 0.75rem;
    font-family: inherit;
    resize: vertical;
    outline: none;
    transition: all 0.3s ease;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }

  .prompt-textarea::-webkit-scrollbar {
    display: none;
  }

  .prompt-textarea:focus {
    border-color: #007aff;
    box-shadow: 0 0 0 2px rgba(0, 122, 255, 0.2);
  }

  .prompt-textarea::placeholder {
    color: #666;
  }

  @media (max-width: 768px) {
    .container {
      padding: 1rem;
    }

    .floating-settings {
      position: absolute;
      top: 10px;
      left: 10px;
      right: 10px;
      width: auto;
      max-height: 60vh;
      padding: 0.75rem;
    }

    .floating-toggle-btn {
      width: 44px;
      height: 44px;
    }

    .settings-group {
      padding: 0.5rem;
    }

    .settings-header h3 {
      font-size: 0.875rem;
    }

    .group-title {
      font-size: 0.75rem;
    }

    .control-item label {
      font-size: 0.6875rem;
    }
  }
</style>
