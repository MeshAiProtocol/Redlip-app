<script lang="ts">
  const { show, message, type } = $props<{
    show: boolean;
    message: string;
    type: "success" | "warning" | "error";
  }>();
</script>

{#if show}
  <div class="toast toast-{type}">
    {message}
  </div>
{/if}

<style>
  .toast {
    position: fixed;
    top: 2rem;
    right: 2rem;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    color: white;
    font-weight: 500;
    z-index: 1000;
    animation: slideIn 0.3s ease;
  }

  .toast-success {
    background: #30d158;
  }

  .toast-warning {
    background: #ff9f0a;
  }

  .toast-error {
    background: #ff453a;
  }

  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
</style> 