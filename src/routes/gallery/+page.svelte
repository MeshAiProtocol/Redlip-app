<script lang="ts">
  import Header from '$lib/components/Header.svelte';
  import Icon from '$lib/components/Icon.svelte';
  import { goto } from '$app/navigation';
  import { COMFYUI_PRIMARY_SERVER_URL } from '$lib/config';

  let { data } = $props<{
    data: {
      upscale: Array<{ name: string; bytes: number; created_at: number; folder_path?: string }>;
      grainy: Array<{ name: string; bytes: number; created_at: number; folder_path?: string }>;
      bump: Array<{ name: string; bytes: number; created_at: number; folder_path?: string }>;
    };
  }>();

  // Category filter state - all enabled by default
  let enabledCategories = $state({
    upscale: true,
    grainy: true,
    bump: true
  });

  type ImageWithCategory = {
    name: string;
    bytes: number;
    created_at: number;
    folder_path?: string;
    category: 'UPSCALE' | 'GRAINY' | 'BUMP';
  };

  // Combine all images and sort by name
  let allImages = $derived(([
    ...data.upscale.map((img: any) => ({ ...img, category: 'UPSCALE' as const })),
    ...data.grainy.map((img: any) => ({ ...img, category: 'GRAINY' as const })),
    ...data.bump.map((img: any) => ({ ...img, category: 'BUMP' as const }))
  ] as ImageWithCategory[]).sort((a, b) => a.name.localeCompare(b.name)));

  // Filter images based on enabled categories
  let filteredImages = $derived(allImages.filter((img) => {
    const key = img.category.toLowerCase() as keyof typeof enabledCategories;
    return enabledCategories[key];
  }));

  // Sort filtered by newest first
  let newestFirst = $derived(filteredImages.slice().sort((a, b) => (b.created_at ?? 0) - (a.created_at ?? 0)));

  // Pagination: show newest 12 and load more by 12
  let visibleCount = $state(12);
  let visibleImages = $derived(newestFirst.slice(0, visibleCount));

  function handleBack() { goto('/'); }
  function handleQueueClick() { goto('/queue'); }
  function handleSystemClick() { goto('/system'); }

  function toggleCategory(category: keyof typeof enabledCategories) {
    enabledCategories[category] = !enabledCategories[category];
    visibleCount = 12; // reset on filter change
  }

  function loadMore() {
    visibleCount = Math.min(filteredImages.length, visibleCount + 12);
  }

  function formatBytes(bytes: number): string {
    if (!bytes && bytes !== 0) return '';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  }

  function formatDate(ts: number): string {
    try {
      return new Date(ts * 1000).toLocaleString();
    } catch {
      return '';
    }
  }

  function getImageUrl(folderPath: string, fileName: string): string {
    return `${COMFYUI_PRIMARY_SERVER_URL}/browser/s/outputs/${folderPath}/${fileName}`;
  }

  function handleImageError(event: Event) {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.style.display = 'none';
    }
  }
</script>

<div class="container">
  <div class="content">
    <Header 
      title="Gallery"
      onBack={handleBack}
      onQueueClick={handleQueueClick}
      onSystemClick={handleSystemClick}
    />

    <!-- Category Filter Chips -->
    <div class="category-filters">
      <button 
        class="chip {enabledCategories.upscale ? 'active' : ''}"
        type="button"
        onclick={() => toggleCategory('upscale')}
        aria-pressed={enabledCategories.upscale}
      >
        {#if enabledCategories.upscale}
          <Icon name="check" size={16} color="#ffffff" />
        {/if}
        <span>Upscale</span>
      </button>
      <button 
        class="chip {enabledCategories.grainy ? 'active' : ''}"
        type="button"
        onclick={() => toggleCategory('grainy')}
        aria-pressed={enabledCategories.grainy}
      >
        {#if enabledCategories.grainy}
          <Icon name="check" size={16} color="#ffffff" />
        {/if}
        <span>Grainy</span>
      </button>
      <button 
        class="chip {enabledCategories.bump ? 'active' : ''}"
        type="button"
        onclick={() => toggleCategory('bump')}
        aria-pressed={enabledCategories.bump}
      >
        {#if enabledCategories.bump}
          <Icon name="check" size={16} color="#ffffff" />
        {/if}
        <span>Bump</span>
      </button>
    </div>

    <!-- Unified Images Grid -->
    <section class="images-section">
      <h2>All Images ({filteredImages.length})</h2>
      {#if filteredImages.length === 0}
        <p class="empty">No images to display. Try enabling some categories above.</p>
      {:else}
        <ul class="file-list">
          {#each visibleImages as f}
            <li class="file-item">
              <div class="image-preview">
                <img 
                  src={getImageUrl(f.category, f.name)} 
                  alt={f.name}
                  loading="lazy"
                  onerror={handleImageError}
                />
              </div>
              <div class="file-info">
                <!-- <div class="name">{f.name}</div> -->
                <div class="meta">
                  <span class="category-badge {f.category === 'UPSCALE' ? 'badge-upscale' : f.category === 'GRAINY' ? 'badge-grainy' : 'badge-bump'}">{f.category}</span>
                  <span>•</span>
                  <span>{formatBytes(f.bytes)}</span>
                  <span>•</span>
                  <span>{formatDate(f.created_at)}</span>
                </div>
              </div>
            </li>
          {/each}
        </ul>

        {#if visibleCount < filteredImages.length}
          <div class="load-more-wrap">
            <button class="load-more" type="button" onclick={loadMore}>
              Load more
            </button>
          </div>
        {/if}
      {/if}
    </section>
  </div>
  
</div>

<style>
  .container { width:100%; padding: 2rem; max-width: 1200px; margin: 0; background: #000; min-height: 100vh; }
  .content { display: flex; flex-direction: column; gap: 1.25rem; }

  .category-filters { display: flex; gap: 0.75rem; flex-wrap: wrap; }
  .chip {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    background: #1c1c1e;
    border: 2px solid #3a3a3c;
    border-radius: 12px;
    padding: 0.5rem 1rem;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    font-weight: 600;
    color: #ffffff;
    backdrop-filter: blur(20px);
  }
  .chip:hover {
    background: #2c2c2e;
    border-color: #ffffff;
    transform: scale(1.02);
    box-shadow: 0 8px 32px rgba(0, 122, 255, 0.15);
  }
  .chip.active {
    border-color: #9f9f9f;
    color: #ffffff;
  }

  .images-section { background: #1c1c1e; border: 1px solid #3a3a3c; border-radius: 16px; padding: 1rem 1.25rem; }
  h2 { margin: 0 0 0.75rem 0; color: #fff; font-size: 1.25rem; }
  .empty { color: #a1a1aa; margin: 0; }

  .file-list { list-style: none; padding: 0; margin: 0; display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 0.75rem; }
  .file-item { background: #111214; border: 1px solid #2a2a2d; border-radius: 12px; padding: 0.75rem; display: flex; flex-direction: column; gap: 0.75rem; }
  .image-preview { width: 100%; height: 200px; border-radius: 8px; overflow: hidden; background: #0a0a0a; display: flex; align-items: center; justify-content: center; }
  .image-preview img { width: 100%; height: 100%; object-fit: cover; border-radius: 8px; }
  .file-info { display: flex; flex-direction: column; gap: 0.25rem; }
  .name { color: #fff; font-weight: 600; overflow: hidden; text-overflow: ellipsis; }
  .meta { color: #a1a1aa; font-size: 0.85rem; display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap; }
  .category-badge { 
    background: rgba(255, 255, 255, 0.12); 
    color: #ffffff; 
    padding: 0.25rem 0.5rem; 
    border-radius: 8px; 
    font-size: 0.75rem; 
    font-weight: 600; 
  }
  .badge-upscale { background: rgba(34, 67, 197, 0.18); color: #86b3ef; border: 1px solid rgba(34, 78, 197, 0.35); }
  .badge-grainy { background: rgba(234, 144, 8, 0.18); color: #fde68a; border: 1px solid rgba(234, 159, 8, 0.35); }
  .badge-bump { background: rgba(168, 85, 247, 0.18); color: #d8b4fe; border: 1px solid rgba(168, 85, 247, 0.35); }
  .load-more-wrap { display: flex; justify-content: center; margin-top: 1rem; }
  .load-more {
    background: #1c1c1e;
    border: 2px solid #3a3a3c;
    border-radius: 12px;
    padding: 0.75rem 1.25rem;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    font-weight: 600;
    color: #ffffff;
    backdrop-filter: blur(20px);
  }
  .load-more:hover {
    background: #2c2c2e;
    border-color: #ffffff;
    transform: scale(1.02);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  }

  @media (max-width: 768px) {
    .container { padding: 1rem; }
    .file-list { grid-template-columns: 1fr; }
    .image-preview { height: 150px; }
  }
</style>


