<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { COMFYUI_SERVER_URL } from '$lib/config';
	import Icon from '$lib/components/Icon.svelte';
	
	// Type definitions
	interface QueueItem {
		prompt_id: string;
		number: number;
		status?: any;
	}
	
	interface QueueData {
		queue_running: QueueItem[];
		queue_pending: QueueItem[];
	}
	
	// Reactive state
	let queueData = $state<QueueData | null>(null);
	let isLoading = $state(true);
	let error = $state<string | null>(null);
	let autoRefresh = $state(true);
	let retryCount = $state(0);
	let lastRefreshTime = $state<Date | null>(null);
	let isTestingConnection = $state(false);
	let connectionTestResult = $state<string | null>(null);
	
	onMount(() => {
		loadQueueData();
		
		// Auto-refresh every 5 seconds if enabled
		const interval = setInterval(() => {
			if (autoRefresh) {
				loadQueueData();
			}
		}, 5000);
		
		return () => clearInterval(interval);
	});
	
	function openComfyUI() {
		window.open(COMFYUI_SERVER_URL, '_blank');
	}
	
	async function loadQueueData() {
		try {
			isLoading = true;
			error = null;
			
			const controller = new AbortController();
			const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
			
			const response = await fetch('/api/comfyui?action=queue', {
				signal: controller.signal
			});
			
			clearTimeout(timeoutId);
			
			if (response.ok) {
				const data = await response.json();
				queueData = data.data;
				retryCount = 0;
				lastRefreshTime = new Date();
			} else {
				const errorData = await response.json().catch(() => ({}));
				error = `Server error: ${response.status} - ${errorData.error || 'Unknown error'}`;
			}
		} catch (err) {
			retryCount++;
			if (err instanceof Error) {
				if (err.name === 'AbortError') {
					error = 'Request timed out. The ComfyUI server is taking too long to respond.';
				} else if (err.message.includes('ECONNRESET')) {
					error = 'Connection reset. The ComfyUI server may be down or unreachable.';
				} else if (err.message.includes('fetch failed')) {
					error = 'Network error. Unable to connect to ComfyUI server.';
				} else {
					error = `Connection error: ${err.message}`;
				}
			} else {
				error = 'Unknown error occurred while connecting to ComfyUI server.';
			}
		} finally {
			isLoading = false;
		}
	}
	
	async function testConnection() {
		try {
			isTestingConnection = true;
			connectionTestResult = null;
			
			const controller = new AbortController();
			const timeoutId = setTimeout(() => controller.abort(), 10000);
			
			const response = await fetch('/api/comfyui?action=test_connection', {
				signal: controller.signal
			});
			
			clearTimeout(timeoutId);
			
			if (response.ok) {
				connectionTestResult = 'success:✅ Connection successful! ComfyUI server is reachable.';
			} else {
				const errorData = await response.json().catch(() => ({}));
				connectionTestResult = `error:❌ Connection failed: ${response.status} - ${errorData.error || 'Unknown error'}`;
			}
		} catch (err) {
			if (err instanceof Error) {
				if (err.name === 'AbortError') {
					connectionTestResult = 'warning:⏰ Connection timed out. Server is not responding.';
				} else if (err.message.includes('ECONNRESET')) {
					connectionTestResult = 'error:🔌 Connection reset. Server may be down.';
				} else if (err.message.includes('fetch failed')) {
					connectionTestResult = 'warning:🌐 Network error. Unable to reach server.';
				} else {
					connectionTestResult = `error:❌ Connection error: ${err.message}`;
				}
			} else {
				connectionTestResult = 'error:❌ Unknown connection error.';
			}
		} finally {
			isTestingConnection = false;
		}
	}
	
	function goBack() {
		goto('/');
	}
	
	function toggleAutoRefresh() {
		autoRefresh = !autoRefresh;
	}
	
	function refreshNow() {
		loadQueueData();
	}
	
	function getTimeAgo(date: Date): string {
		const now = new Date();
		const diffMs = now.getTime() - date.getTime();
		const diffSeconds = Math.floor(diffMs / 1000);
		const diffMinutes = Math.floor(diffSeconds / 60);
		
		if (diffMinutes < 1) {
			return 'Just now';
		} else if (diffMinutes === 1) {
			return '1 minute ago';
		} else if (diffMinutes < 60) {
			return `${diffMinutes} minutes ago`;
		} else {
			const diffHours = Math.floor(diffMinutes / 60);
			return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
		}
	}
</script>

<svelte:head>
	<title>Queue Management - SvelteKit 5</title>
	<meta name="description" content="ComfyUI Queue Status" />
</svelte:head>

<div class="container">
	<div class="content">
		<!-- Header -->
		<div class="header">
			<button class="back-button" on:click={goBack}>← Back</button>
			<h1>Queue Management</h1>
			<div class="header-buttons">
				<button class="header-button" on:click={openComfyUI}>
					<Icon name="server" size={16} />
					Open ComfyUI
				</button>
			</div>
		</div>
		
		<!-- Status Bar -->
		{#if lastRefreshTime}
			<div class="status-bar">
				<span class="status-text">
					Last updated: {getTimeAgo(lastRefreshTime)}
				</span>
				{#if retryCount > 0}
					<span class="retry-count">
						Retry attempts: {retryCount}
					</span>
				{/if}
			</div>
		{/if}
		
		<!-- Controls -->
		<div class="controls">
			<button class="refresh-button" on:click={refreshNow} disabled={isLoading}>
				{isLoading ? '⏳' : '🔄'} Refresh
			</button>
			<button class="auto-refresh-button {autoRefresh ? 'active' : ''}" on:click={toggleAutoRefresh}>
				{autoRefresh ? '⏸️' : '▶️'} Auto-refresh
			</button>
			<button class="test-connection-button" on:click={testConnection} disabled={isTestingConnection}>
				{isTestingConnection ? '⏳' : '🔍'} Test Connection
			</button>
		</div>
		
		<!-- Connection Test Result -->
		{#if connectionTestResult}
			<div class="connection-test-result">
				<p class="connection-result-{connectionTestResult.split(':')[0]}">
					{connectionTestResult.split(':').slice(1).join(':')}
				</p>
			</div>
		{/if}
		
		{#if isLoading}
			<div class="loading-section">
				<div class="loading-card">
					<div class="loading-icon">⏳</div>
					<h2>Loading Queue...</h2>
					<p>Fetching current queue status</p>
					{#if retryCount > 0}
						<p class="retry-info">Attempt {retryCount}</p>
					{/if}
				</div>
			</div>
		{:else if error}
			<div class="error-section">
				<div class="error-card">
					<div class="error-icon">❌</div>
					<h2>Connection Error</h2>
					<p>{error}</p>
					<div class="error-actions">
						<button class="retry-button" on:click={loadQueueData}>
							🔄 Retry Connection
						</button>
						<button class="secondary-button" on:click={() => window.location.reload()}>
							🔄 Reload Page
						</button>
					</div>
					<div class="troubleshooting">
						<h3>Troubleshooting Tips:</h3>
						<ul>
							<li>Check if ComfyUI server is running</li>
							<li>Verify network connectivity</li>
							<li>Try refreshing the page</li>
							<li>Check server logs for errors</li>
						</ul>
					</div>
				</div>
			</div>
		{:else if queueData}
			<div class="queue-section">
				<!-- Currently Running -->
				<div class="queue-card">
					<h2>Currently Running</h2>
					{#if queueData.queue_running && queueData.queue_running.length > 0}
						<div class="queue-items">
							{#each queueData.queue_running as item}
								<div class="queue-item running">
									<div class="item-header">
										<span class="item-number">#{item.number}</span>
										<span class="item-id">{item.prompt_id}</span>
									</div>
									<div class="item-status">
										<span class="status-icon">⚙️</span>
										<span>Processing...</span>
									</div>
								</div>
							{/each}
						</div>
					{:else}
						<div class="empty-state">
							<p>No jobs currently running</p>
						</div>
					{/if}
				</div>
				
				<!-- Pending Queue -->
				<div class="queue-card">
					<h2>Pending Jobs</h2>
					{#if queueData.queue_pending && queueData.queue_pending.length > 0}
						<div class="queue-items">
							{#each queueData.queue_pending as item}
								<div class="queue-item pending">
									<div class="item-header">
										<span class="item-number">#{item.number}</span>
										<span class="item-id">{item.prompt_id}</span>
									</div>
									<div class="item-status">
										<span class="status-icon">⏳</span>
										<span>Waiting...</span>
									</div>
								</div>
							{/each}
						</div>
					{:else}
						<div class="empty-state">
							<p>No jobs in queue</p>
						</div>
					{/if}
				</div>
				
				<!-- Summary -->
				<div class="summary-card">
					<h2>Queue Summary</h2>
					<div class="summary-grid">
						<div class="summary-item">
							<span class="summary-label">Running</span>
							<span class="summary-value">{queueData.queue_running?.length || 0}</span>
						</div>
						<div class="summary-item">
							<span class="summary-label">Pending</span>
							<span class="summary-value">{queueData.queue_pending?.length || 0}</span>
						</div>
						<div class="summary-item">
							<span class="summary-label">Total</span>
							<span class="summary-value">{(queueData.queue_running?.length || 0) + (queueData.queue_pending?.length || 0)}</span>
						</div>
					</div>
				</div>
			</div>
		{/if}
	</div>
</div>

<style>
	.container {
		padding: 2rem;
		max-width: 800px;
		margin: 0 auto;
		min-height: 100vh;
		background: #000000;
	}
	
	.content {
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}
	
	.header {
		display: flex;
		align-items: center;
		gap: 1rem;
	}
	
	.back-button {
		background: none;
		border: 2px solid #3a3a3c;
		border-radius: 12px;
		padding: 0.5rem 1rem;
		cursor: pointer;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		font-weight: 500;
		color: #ffffff;
	}
	
	.back-button:hover {
		background: #1c1c1e;
		border-color: #007aff;
		transform: scale(1.02);
	}
	
	.header h1 {
		font-size: 2rem;
		font-weight: 700;
		color: #ffffff;
		margin: 0;
		letter-spacing: -0.025em;
	}
	
	.header-buttons {
		display: flex;
		gap: 1rem;
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
	
	.status-bar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.75rem 1rem;
		background: rgba(255, 255, 255, 0.05);
		border-radius: 12px;
		border: 1px solid rgba(255, 255, 255, 0.1);
		font-size: 0.875rem;
	}
	
	.status-text {
		color: #a1a1aa;
	}
	
	.retry-count {
		color: #ff9500;
		font-weight: 500;
	}
	
	.controls {
		display: flex;
		gap: 1rem;
		justify-content: center;
	}
	
	.refresh-button,
	.auto-refresh-button {
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
	
	.refresh-button:hover:not(:disabled),
	.auto-refresh-button:hover {
		background: #2c2c2e;
		border-color: #007aff;
		transform: scale(1.02);
		box-shadow: 0 8px 32px rgba(0, 122, 255, 0.15);
	}
	
	.refresh-button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
	
	.auto-refresh-button.active {
		background: #007aff;
		border-color: #007aff;
	}
	
	.test-connection-button {
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
	
	.test-connection-button:hover:not(:disabled) {
		background: #2c2c2e;
		border-color: #007aff;
		transform: scale(1.02);
		box-shadow: 0 8px 32px rgba(0, 122, 255, 0.15);
	}
	
	.test-connection-button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
	
	.connection-test-result {
		background: #1c1c1e;
		border-radius: 12px;
		padding: 1rem 1.5rem;
		border: 1px solid rgba(255, 255, 255, 0.1);
		backdrop-filter: blur(20px);
		text-align: center;
		font-size: 0.875rem;
		color: #a1a1aa;
		margin-top: 1rem;
	}
	
	.connection-test-result p {
		margin: 0;
		font-weight: 500;
	}
	
	.connection-result-success {
		color: #30d158;
	}
	
	.connection-result-error {
		color: #ff453a;
	}
	
	.connection-result-warning {
		color: #ff9500;
	}
	
	.loading-section,
	.error-section,
	.queue-section {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}
	
	.loading-card,
	.error-card {
		background: #1c1c1e;
		border-radius: 20px;
		padding: 3rem;
		text-align: center;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
		max-width: 500px;
		width: 100%;
		backdrop-filter: blur(20px);
		border: 1px solid #3a3a3c;
	}
	
	.loading-icon,
	.error-icon {
		font-size: 4rem;
		margin-bottom: 1rem;
	}
	
	.loading-card h2,
	.error-card h2 {
		font-size: 1.5rem;
		font-weight: 600;
		color: #ffffff;
		margin: 0 0 0.5rem 0;
	}
	
	.loading-card p,
	.error-card p {
		color: #a1a1aa;
		margin: 0 0 2rem 0;
	}
	
	.retry-info {
		color: #ff9500 !important;
		font-weight: 500;
	}
	
	.error-actions {
		display: flex;
		gap: 1rem;
		justify-content: center;
		margin-bottom: 2rem;
	}
	
	.retry-button,
	.secondary-button {
		border-radius: 12px;
		padding: 0.75rem 1.5rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
	
	.retry-button {
		background: #007aff;
		color: white;
		border: none;
	}
	
	.retry-button:hover {
		background: #0056cc;
		transform: translateY(-2px) scale(1.02);
		box-shadow: 0 8px 32px rgba(0, 122, 255, 0.3);
	}
	
	.secondary-button {
		background: none;
		color: #ffffff;
		border: 2px solid #3a3a3c;
	}
	
	.secondary-button:hover {
		background: #1c1c1e;
		border-color: #007aff;
		transform: scale(1.02);
	}
	
	.troubleshooting {
		text-align: left;
		margin-top: 2rem;
		padding-top: 2rem;
		border-top: 1px solid rgba(255, 255, 255, 0.1);
	}
	
	.troubleshooting h3 {
		color: #ffffff;
		font-size: 1rem;
		font-weight: 600;
		margin: 0 0 1rem 0;
	}
	
	.troubleshooting ul {
		color: #a1a1aa;
		font-size: 0.875rem;
		margin: 0;
		padding-left: 1.5rem;
	}
	
	.troubleshooting li {
		margin-bottom: 0.5rem;
	}
	
	.queue-card,
	.summary-card {
		background: #1c1c1e;
		border-radius: 16px;
		padding: 2rem;
		backdrop-filter: blur(20px);
		border: 1px solid #3a3a3c;
	}
	
	.queue-card h2,
	.summary-card h2 {
		font-size: 1.25rem;
		font-weight: 600;
		color: #ffffff;
		margin: 0 0 1.5rem 0;
	}
	
	.queue-items {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
	
	.queue-item {
		padding: 1rem;
		border-radius: 12px;
		border: 1px solid rgba(255, 255, 255, 0.1);
		background: rgba(255, 255, 255, 0.05);
	}
	
	.queue-item.running {
		border-color: rgba(0, 122, 255, 0.3);
		background: rgba(0, 122, 255, 0.1);
	}
	
	.queue-item.pending {
		border-color: rgba(255, 159, 10, 0.3);
		background: rgba(255, 159, 10, 0.1);
	}
	
	.item-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.5rem;
	}
	
	.item-number {
		font-weight: 600;
		color: #007aff;
		font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
	}
	
	.item-id {
		font-size: 0.875rem;
		color: #8e8e93;
		font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
	}
	
	.item-status {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		color: #a1a1aa;
		font-size: 0.875rem;
	}
	
	.status-icon {
		font-size: 1rem;
	}
	
	.empty-state {
		text-align: center;
		padding: 2rem;
		color: #8e8e93;
	}
	
	.summary-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
		gap: 1rem;
	}
	
	.summary-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 1rem;
		background: rgba(255, 255, 255, 0.05);
		border-radius: 12px;
		border: 1px solid rgba(255, 255, 255, 0.1);
	}
	
	.summary-label {
		font-size: 0.875rem;
		color: #a1a1aa;
		margin-bottom: 0.5rem;
	}
	
	.summary-value {
		font-size: 1.5rem;
		font-weight: 700;
		color: #ffffff;
	}
	
	@media (max-width: 768px) {
		.container {
			padding: 1rem;
		}
		
		.controls {
			flex-direction: column;
			align-items: center;
			gap: 0.75rem;
		}
		
		.error-actions {
			flex-direction: column;
			align-items: center;
		}
		
		.queue-card,
		.summary-card {
			padding: 1.5rem;
		}
		
		.item-header {
			flex-direction: column;
			align-items: flex-start;
			gap: 0.5rem;
		}
		
		.summary-grid {
			grid-template-columns: 1fr;
		}
		
		.connection-test-result {
			margin-top: 0.75rem;
			padding: 0.75rem 1rem;
		}
	}
</style> 