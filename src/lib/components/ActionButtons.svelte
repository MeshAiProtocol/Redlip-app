<script lang="ts">
  import Icon from "./Icon.svelte";

  const { canGenerate, isSendingWorkflow, isTrackingJob, onGenerate } = $props<{
    canGenerate: boolean;
    isSendingWorkflow: boolean;
    isTrackingJob: boolean;
    onGenerate: () => void;
  }>();
</script>

<div class="button-group">
  <button 
    class="generate-button {canGenerate ? 'active' : 'disabled'} {isSendingWorkflow || isTrackingJob ? 'loading' : ''}" 
    on:click={onGenerate} 
    disabled={!canGenerate || isSendingWorkflow || isTrackingJob}
  >
    {#if isSendingWorkflow}
      <Icon name="loader" size={16} className="loading-spinner" />
      Submitting...
    {:else if isTrackingJob}
      <Icon name="settings" size={16} className="loading-spinner" />
      Processing...
    {:else}
      Process
      <Icon name="arrowRight" size={16} />
    {/if}
  </button>
</div>

<style>
  .button-group {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    justify-content: center;
  }

  .generate-button {
    background: #007aff;
    color: white;
    border: none;
    border-radius: 12px;
    padding: 1rem 2rem;
    font-size: 1.125rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    min-width: 150px;
    backdrop-filter: blur(20px);
  }

  .generate-button:hover:not(.disabled) {
    background: #0056cc;
    transform: translateY(-2px) scale(1.02);
    box-shadow: 0 8px 32px rgba(0, 122, 255, 0.3);
  }

  .generate-button.disabled {
    background: #3a3a3c;
    color: #8e8e93;
    cursor: not-allowed;
    transform: none;
  }

  .generate-button.loading {
    background: #3a3a3c;
    cursor: not-allowed;
    transform: none;
  }

  .loading-spinner {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  @media (max-width: 768px) {
    .button-group {
      flex-direction: column;
      align-items: center;
    }

    .generate-button {
      width: 100%;
      max-width: 300px;
    }
  }
</style> 