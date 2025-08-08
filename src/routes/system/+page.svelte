<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { COMFYUI_SERVER_URL } from '$lib/config';
	import Icon from '$lib/components/Icon.svelte';
	
	// Type definitions
	interface VramInfo {
		used: number;
		total: number;
	}
	
	interface RamInfo {
		used: number;
		total: number;
	}
	
	interface Device {
		name: string;
		type: string;
		index: number;
		vram_total: number;
		vram_free: number;
		torch_vram_total: number;
		torch_vram_free: number;
	}

	interface SystemInfo {
		os: string;
		ram_total: number;
		ram_free: number;
		comfyui_version: string;
		required_frontend_version: string;
		python_version: string;
		pytorch_version: string;
		embedded_python: boolean;
		argv: string[];
	}

	interface SystemStats {
		system: SystemInfo;
		devices: Device[];
	}
	
	// Reactive state
	let systemStats = $state<SystemStats | null>(null);
	let isLoading = $state(true);
	let error = $state<string | null>(null);
	
	onMount(async () => {
		try {
			const response = await fetch('/api/comfyui?action=system_stats');
			if (response.ok) {
				const data = await response.json();
				systemStats = data.data;
			} else {
				error = 'Failed to load system stats';
			}
		} catch (err) {
			error = 'Error loading system stats';
		} finally {
			isLoading = false;
		}
	});
	
	function goBack() {
		goto('/');
	}

	function openComfyUI() {
		window.open(COMFYUI_SERVER_URL, '_blank');
	}
	
	function formatBytes(bytes: number): string {
		if (bytes === 0) return '0 Bytes';
		const k = 1024;
		const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
	}
</script>

<svelte:head>
	<title>System Stats - SvelteKit 5</title>
	<meta name="description" content="ComfyUI System Information" />
</svelte:head>

<div class="container">
	<div class="content">
		<!-- Header -->
		<div class="header">
			<button class="back-button" on:click={goBack}>← Back</button>
			<h1>System Information</h1>
			<div class="header-buttons">
				<button class="header-button" on:click={openComfyUI}>
					<Icon name="server" size={16} />
					Open ComfyUI
				</button>
			</div>
		</div>
		
		{#if isLoading}
			<div class="loading-section">
				<div class="loading-card">
					<div class="loading-icon">⚙️</div>
					<h2>Loading System Stats...</h2>
					<p>Fetching information from ComfyUI server</p>
				</div>
			</div>
		{:else if error}
			<div class="error-section">
				<div class="error-card">
					<div class="error-icon">❌</div>
					<h2>Error Loading Stats</h2>
					<p>{error}</p>
					<button class="retry-button" on:click={() => window.location.reload()}>
						🔄 Retry
					</button>
				</div>
			</div>
		{:else if systemStats}
			<div class="stats-section">
				<!-- System Information -->
				<div class="stats-card">
					<h2>System Information</h2>
					<div class="stats-grid">
						{#if systemStats.system.python_version}
							<div class="stat-item">
								<span class="stat-label">Python Version</span>
								<span class="stat-value">{systemStats.system.python_version}</span>
							</div>
						{/if}
						{#if systemStats.system.os}
							<div class="stat-item">
								<span class="stat-label">Operating System</span>
								<span class="stat-value">{systemStats.system.os}</span>
							</div>
						{/if}
						{#if systemStats.system.comfyui_version}
							<div class="stat-item">
								<span class="stat-label">ComfyUI Version</span>
								<span class="stat-value">{systemStats.system.comfyui_version}</span>
							</div>
						{/if}
						{#if systemStats.system.pytorch_version}
							<div class="stat-item">
								<span class="stat-label">PyTorch Version</span>
								<span class="stat-value">{systemStats.system.pytorch_version}</span>
							</div>
						{/if}
					</div>
				</div>
				
				<!-- GPU Devices -->
				{#if systemStats.devices && systemStats.devices.length > 0}
					<div class="stats-card">
						<h2>GPU Devices</h2>
						<div class="stats-grid">
							{#each systemStats.devices as device}
								<div class="stat-item">
									<span class="stat-label">{device.name}</span>
									<div class="vram-details">
										<div class="vram-bar">
											<div class="vram-used" style="width: {((device.vram_total - device.vram_free) / device.vram_total * 100)}%"></div>
										</div>
										<span class="vram-text">
											{formatBytes(device.vram_total - device.vram_free)} / {formatBytes(device.vram_total)}
										</span>
									</div>
								</div>
							{/each}
						</div>
					</div>
				{/if}
				
				<!-- RAM Information -->
				{#if systemStats.system.ram_total}
					<div class="stats-card">
						<h2>System Memory</h2>
						<div class="stats-grid">
							<div class="stat-item">
								<span class="stat-label">RAM Usage</span>
								<div class="ram-details">
									<div class="ram-bar">
										<div class="ram-used" style="width: {((systemStats.system.ram_total - systemStats.system.ram_free) / systemStats.system.ram_total * 100)}%"></div>
									</div>
									<span class="ram-text">
										{formatBytes(systemStats.system.ram_total - systemStats.system.ram_free)} / {formatBytes(systemStats.system.ram_total)}
									</span>
								</div>
							</div>
						</div>
					</div>
				{/if}
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
		background: #007aff;
		color: white;
		border: none;
		border-radius: 12px;
		padding: 0.75rem 1.5rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.header-button:hover {
		background: #0056cc;
		transform: translateY(-2px) scale(1.02);
		box-shadow: 0 8px 32px rgba(0, 122, 255, 0.3);
	}
	
	.loading-section,
	.error-section,
	.stats-section {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 400px;
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
	
	.retry-button {
		background: #007aff;
		color: white;
		border: none;
		border-radius: 12px;
		padding: 0.75rem 1.5rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin: 0 auto;
	}
	
	.retry-button:hover {
		background: #0056cc;
		transform: translateY(-2px) scale(1.02);
		box-shadow: 0 8px 32px rgba(0, 122, 255, 0.3);
	}
	
	.stats-section {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}
	
	.stats-card {
		background: #1c1c1e;
		border-radius: 16px;
		padding: 2rem;
		backdrop-filter: blur(20px);
		border: 1px solid #3a3a3c;
	}
	
	.stats-card h2 {
		font-size: 1.25rem;
		font-weight: 600;
		color: #ffffff;
		margin: 0 0 1.5rem 0;
	}
	
	.stats-grid {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
	
	.stat-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem;
		background: rgba(255, 255, 255, 0.05);
		border-radius: 12px;
		border: 1px solid rgba(255, 255, 255, 0.1);
	}
	
	.stat-label {
		font-weight: 500;
		color: #a1a1aa;
	}
	
	.stat-value {
		font-weight: 600;
		color: #ffffff;
		font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
	}
	
	.vram-details,
	.ram-details {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		align-items: flex-end;
	}
	
	.vram-bar,
	.ram-bar {
		width: 120px;
		height: 6px;
		background: #3a3a3c;
		border-radius: 3px;
		overflow: hidden;
	}
	
	.vram-used,
	.ram-used {
		height: 100%;
		background: linear-gradient(90deg, #007aff, #5856d6);
		border-radius: 3px;
		transition: width 0.3s ease;
	}
	
	.vram-text,
	.ram-text {
		font-size: 0.875rem;
		color: #8e8e93;
		font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
	}
	
	@media (max-width: 768px) {
		.container {
			padding: 1rem;
		}
		
		.stats-card {
			padding: 1.5rem;
		}
		
		.stat-item {
			flex-direction: column;
			align-items: flex-start;
			gap: 0.5rem;
		}
		
		.vram-details,
		.ram-details {
			align-items: flex-start;
			width: 100%;
		}
		
		.vram-bar,
		.ram-bar {
			width: 100%;
		}
	}
</style> 