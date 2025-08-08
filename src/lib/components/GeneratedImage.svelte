<script lang="ts">
  import Icon from "./Icon.svelte";

  const { generatedImage, onDownload, onGenerateNew } = $props<{
    generatedImage: string;
    onDownload: () => void;
    onGenerateNew: () => void;
  }>();
</script>

<div class="generated-image-section">
  <h3>Generated Image</h3>
  <div class="image-container">
    <img src={generatedImage} alt="Generated image" class="generated-image" />
  </div>
  <div class="image-actions">
    <button class="download-button" on:click={onDownload}>
      <Icon name="download" size={16} />
      Download
    </button>
    <button class="generate-new-button" on:click={onGenerateNew}>
      <Icon name="refreshCw" size={16} />
      Generate New
    </button>
  </div>
</div>

<style>
  .generated-image-section {
    background: #1c1c1e;
    border: 1px solid #3a3a3c;
    border-radius: 16px;
    padding: 1.5rem;
    margin-top: 1rem;
    width: 100%;
    max-width: 500px;
    backdrop-filter: blur(20px);
  }

  .generated-image-section h3 {
    font-size: 1.25rem;
    font-weight: 600;
    color: #ffffff;
    margin: 0 0 1rem 0;
    text-align: center;
  }

  .image-container {
    margin: 1rem 0;
    text-align: center;
  }

  .generated-image {
    max-width: 100%;
    height: auto;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  }

  .image-actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
    flex-wrap: wrap;
    margin-top: 1rem;
  }

  .image-actions .download-button,
  .image-actions .generate-new-button {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .image-actions .download-button {
    background: #30d158;
    color: white;
  }

  .image-actions .download-button:hover {
    background: #28a745;
    transform: translateY(-2px) scale(1.02);
    box-shadow: 0 8px 32px rgba(48, 209, 88, 0.3);
  }

  .image-actions .generate-new-button {
    background: #007aff;
    color: white;
  }

  .image-actions .generate-new-button:hover {
    background: #0056cc;
    transform: translateY(-2px) scale(1.02);
    box-shadow: 0 8px 32px rgba(0, 122, 255, 0.3);
  }
</style> 