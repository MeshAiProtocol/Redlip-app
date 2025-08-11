<script lang="ts">
  import Icon from "./Icon.svelte";

  const { title, onBack, onQueueClick, onSystemClick, comfyServers = [] } = $props<{
    title: string;
    onBack: () => void;
    onQueueClick: () => void;
    onSystemClick: () => void;
    comfyServers?: { url: string; label?: string }[];
  }>();

  function openUrl(url: string) {
    window.open(url, '_blank');
  }

  function openGallery() {
    window.open('/gallery', '_blank');
  }
</script>

<div class="header">
  <button class="back-button" onclick={onBack}>
    <Icon name="arrowLeft" size={20} />
  </button>
  <h1>{title}</h1>
  <div class="header-buttons">
    <button class="header-button" onclick={onQueueClick}>
      <Icon name="list" size={16} />
      Queue
    </button>
    <button class="header-button" onclick={onSystemClick}>
      <Icon name="settings" size={16} />
      System
    </button>
    <button class="header-button" onclick={openGallery}>
      <Icon name="image" size={16} />
      Gallery
    </button>
    {#if comfyServers && comfyServers.length > 0}
      {#each comfyServers as s, i}
        <button class="header-button" onclick={() => openUrl(s.url)}>
          <Icon name="server" size={16} />
          {i + 1}
        </button>
      {/each}
    {/if}
  </div>
</div>

<style>
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    position: relative;
  }

  .back-button {
    position: absolute;
    left: 0;
    background: #1c1c1e;
    border: 2px solid #3a3a3c;
    border-radius: 50%;
    width: 44px;
    height: 44px;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(20px);
    color: #ffffff;
  }

  .back-button:hover {
    background: #2c2c2e;
    border-color: #007aff;
    transform: scale(1.05);
    box-shadow: 0 8px 32px rgba(0, 122, 255, 0.15);
  }

  .header h1 {
    font-size: 2.5rem;
    font-weight: 700;
    color: #ffffff;
    margin: 0;
    letter-spacing: -0.025em;
    margin-left: 58px;
    flex: 1;
  }

  .header-buttons {
    display: flex;
    gap: 0.75rem;
  }

  .header-button {
    background: #1c1c1e;
    border: 2px solid #3a3a3c;
    border-radius: 12px;
    padding: 0.75rem 1.5rem;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    font-weight: 600;
    color: #ffffff;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    backdrop-filter: blur(20px);
  }

  .header-button:hover {
    background: #2c2c2e;
    border-color: #007aff;
    transform: scale(1.02);
    box-shadow: 0 8px 32px rgba(0, 122, 255, 0.15);
  }
</style> 