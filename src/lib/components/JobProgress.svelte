<script lang="ts">
  import Icon from "./Icon.svelte";

  const { workflowStatus, jobId, jobProgress, workflowError, workflowResult, onRetryTracking } = $props<{
    workflowStatus: "idle" | "sending" | "queued" | "executing" | "completed" | "error";
    jobId: string | null;
    jobProgress: any;
    workflowError: string | null;
    workflowResult: any;
    onRetryTracking: () => void;
  }>();
</script>

{#if workflowStatus !== "idle"}
  <div class="job-progress">
    <h3>Processing Status</h3>

    {#if workflowStatus === "sending"}
      <div class="status-item sending">
        <Icon name="upload" size={20} />
        <span>Submitting job to ComfyUI...</span>
      </div>
    {:else if workflowStatus === "queued"}
      <div class="status-item queued">
        <Icon name="clock" size={20} />
        <span>Job is in queue, waiting to start...</span>
        {#if jobId}
          <div class="job-id">Job ID: {jobId}</div>
        {/if}
        {#if jobProgress}
          <div class="progress-details">
            <details>
              <summary>View Progress Details</summary>
              <pre>{JSON.stringify(jobProgress, null, 2)}</pre>
            </details>
          </div>
        {/if}
      </div>
    {:else if workflowStatus === "executing"}
      <div class="status-item executing">
        <Icon name="settings" size={20} />
        <span>Processing image with AI...</span>
        {#if jobId}
          <div class="job-id">Job ID: {jobId}</div>
        {/if}
        {#if jobProgress}
          <div class="progress-details">
            <details>
              <summary>View Progress Details</summary>
              <pre>{JSON.stringify(jobProgress, null, 2)}</pre>
            </details>
          </div>
        {/if}
      </div>
    {:else if workflowStatus === "completed"}
      <div class="status-item completed">
        <Icon name="checkCircle" size={20} />
        <span>Processing completed successfully!</span>
      </div>
    {:else if workflowStatus === "error"}
      <div class="status-item error">
        <Icon name="alertCircle" size={20} />
        <span>Error: {workflowError}</span>
        {#if jobId}
          <button class="retry-button" on:click={onRetryTracking}>
            <Icon name="refreshCw" size={16} />
            Retry Tracking
          </button>
        {/if}
        {#if workflowResult}
          <div class="progress-details">
            <details>
              <summary>View Failed Job Details</summary>
              <div class="error-details">
                <h4>Job Data:</h4>
                <pre>{JSON.stringify(workflowResult, null, 2)}</pre>
              </div>
            </details>
          </div>
        {/if}
      </div>
    {/if}
  </div>
{/if}

<style>
  .job-progress {
    background: #1c1c1e;
    border: 1px solid #3a3a3c;
    border-radius: 16px;
    padding: 1.5rem;
    margin-top: 1rem;
    width: 100%;
    max-width: 500px;
    backdrop-filter: blur(20px);
  }

  .job-progress h3 {
    font-size: 1.25rem;
    font-weight: 600;
    color: #ffffff;
    margin: 0 0 1rem 0;
    text-align: center;
  }

  .status-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem;
    border-radius: 6px;
    margin-bottom: 0.5rem;
    text-align: center;
  }

  .status-item.sending {
    background: rgba(0, 122, 255, 0.1);
    color: #007aff;
    border: 1px solid rgba(0, 122, 255, 0.2);
  }

  .status-item.queued {
    background: rgba(142, 142, 147, 0.1);
    color: #8e8e93;
    border: 1px solid rgba(142, 142, 147, 0.2);
  }

  .status-item.executing {
    background: rgba(255, 159, 10, 0.1);
    color: #ff9f0a;
    border: 1px solid rgba(255, 159, 10, 0.2);
  }

  .status-item.completed {
    background: rgba(48, 209, 88, 0.1);
    color: #30d158;
    border: 1px solid rgba(48, 209, 88, 0.2);
  }

  .status-item.error {
    background: rgba(255, 69, 58, 0.1);
    color: #ff453a;
    border: 1px solid rgba(255, 69, 58, 0.2);
  }

  .retry-button {
    background: #ff453a;
    color: white;
    border: none;
    border-radius: 8px;
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 0.5rem;
  }

  .retry-button:hover {
    background: #d70015;
    transform: translateY(-1px) scale(1.02);
    box-shadow: 0 4px 16px rgba(255, 69, 58, 0.3);
  }

  .job-id {
    font-size: 0.875rem;
    font-family: "SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace;
    background: rgba(255, 255, 255, 0.1);
    padding: 0.25rem 0.5rem;
    border-radius: 6px;
  }

  .progress-details {
    width: 100%;
    margin-top: 0.5rem;
  }

  .progress-details details {
    cursor: pointer;
  }

  .progress-details summary {
    font-weight: 500;
    color: inherit;
    margin-bottom: 0.5rem;
  }

  .progress-details pre {
    background: rgba(255, 255, 255, 0.05);
    padding: 0.75rem;
    border-radius: 8px;
    font-size: 0.75rem;
    overflow-x: auto;
    margin: 0;
    max-height: 200px;
    overflow-y: auto;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .error-details {
    margin-top: 0.5rem;
  }

  .error-details h4 {
    font-size: 0.875rem;
    font-weight: 600;
    color: #ff453a;
    margin: 0 0 0.5rem 0;
  }

  .error-details pre {
    background: rgba(255, 69, 58, 0.1);
    border: 1px solid rgba(255, 69, 58, 0.2);
    max-height: 300px;
  }
</style> 