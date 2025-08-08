<script lang="ts">
  import Icon from "./Icon.svelte";

  const { onImageUpload } = $props<{
    onImageUpload: (image: string, filename: string) => void;
  }>();

  function handleImageUpload(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target?.result as string;
        // Generate a unique filename for the uploaded image
        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substring(2, 8);
        const filename = `${file.name.split(".")[0]}_${timestamp}_${randomId}.${file.name.split(".").pop()}`;
        
        onImageUpload(imageData, filename);
      };
      reader.readAsDataURL(file);
    }
  }
</script>

<div class="upload-card">
  <input type="file" accept="image/*" on:change={handleImageUpload} id="image-upload" class="file-input" />
  <label for="image-upload" class="upload-label">
    <div class="upload-placeholder">
      <div class="upload-icon">
        <Icon name="upload" size={48} color="#8e8e93" />
      </div>
      <div class="upload-text">
        <p class="upload-title">Please Upload</p>
        <p class="upload-subtitle">Your image here</p>
      </div>
    </div>
  </label>
</div>

<style>
  .upload-card {
    background: #1c1c1e;
    border: 2px dashed #3a3a3c;
    border-radius: 16px;
    padding: 2rem;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    min-height: 300px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    max-width: 500px;
    backdrop-filter: blur(20px);
  }

  .upload-card:hover {
    background: #2c2c2e;
    border-color: #007aff;
    transform: scale(1.02);
    box-shadow: 0 8px 32px rgba(0, 122, 255, 0.15);
  }

  .file-input {
    position: absolute;
    opacity: 0;
    pointer-events: none;
  }

  .upload-label {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }

  .upload-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }

  .upload-icon {
    font-size: 2rem;
    color: #8e8e93;
  }

  .upload-title {
    font-size: 1.125rem;
    font-weight: 500;
    color: #ffffff;
    margin: 0;
  }

  .upload-subtitle {
    font-size: 1rem;
    color: #8e8e93;
    margin: 0;
  }

  @media (max-width: 768px) {
    .upload-card {
      min-height: 250px;
    }
  }
</style> 