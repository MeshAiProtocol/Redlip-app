<script lang="ts">
	import { goto } from '$app/navigation';
	import Icon from '$lib/components/Icon.svelte';
	import { COMFYUI_SERVER_URL } from '$lib/config';

	const tools = [
		{
			id: 'ai-bump-adder',
			name: 'AI Bump Adder',
			description: 'Add realistic bumps and texture to your images using AI',
			icon: 'zap',
			route: '/ai-bump',
			status: 'active'
		},
		{
			id: 'grainy-film-effect',
			name: 'Grainy Film Effect',
			description: 'Apply vintage film grain effects to your images',
			icon: 'camera',
			route: '/grainy-film',
			status: 'active'
		},
		{
			id: 'upscale-flux',
			name: 'Upscale Flux',
			description: 'Upscale images with advanced AI models and Flux technology',
			icon: 'zoomIn',
			route: '/upscale',
			status: 'active'
		}
	];

	function navigateToTool(route: string) {
		goto(route);
	}

	function openComfyUI() {
		window.open(COMFYUI_SERVER_URL, '_blank');
	}
</script>

<svelte:head>
	<title>AI Tools - SvelteKit 5</title>
	<meta name="description" content="Collection of AI-powered image processing tools" />
</svelte:head>

<div class="container">
	<div class="content">
		<!-- Header -->
		<div class="header">
			<h1>AI Tools</h1>
			<div class="header-buttons">
				<button class="header-button" on:click={() => goto('/queue')}>
					<Icon name="list" size={16} />
					Queue
				</button>
				<button class="header-button" on:click={() => goto('/system')}>
					<Icon name="settings" size={16} />
					System
				</button>
				<button class="header-button" on:click={openComfyUI}>
					<Icon name="server" size={16} />
					Open ComfyUI
				</button>
			</div>
		</div>

		<!-- Tools Grid -->
		<div class="tools-grid">
			{#each tools as tool}
				<div class="tool-card {tool.status === 'coming-soon' ? 'disabled' : ''}" 
					 on:click={() => tool.status === 'active' && navigateToTool(tool.route)}>
					<div class="tool-icon">
						<Icon name={tool.icon} size={32} color={tool.status === 'active' ? '#007aff' : '#8e8e93'} />
					</div>
					<div class="tool-content">
						<h3 class="tool-title">{tool.name}</h3>
						<p class="tool-description">{tool.description}</p>
						{#if tool.status === 'coming-soon'}
							<span class="coming-soon-badge">Coming Soon</span>
						{/if}
					</div>
					{#if tool.status === 'active'}
						<div class="tool-arrow">
							<Icon name="arrowRight" size={16} color="#8e8e93" />
						</div>
					{/if}
				</div>
			{/each}
		</div>

		<!-- Additional Info -->
		<div class="info-section">
			<h2>About AI Tools</h2>
			<p>Explore our collection of AI-powered image processing tools. Each tool is designed to enhance your images with advanced AI technology.</p>
		</div>
	</div>
</div>

<style>
	.container {
		padding: 2rem;
		max-width: 1200px;
		margin: 0 auto;
		background: #000000;
		min-height: 100vh;
	}

	.content {
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
	}

	.header h1 {
		font-size: 2.5rem;
		font-weight: 700;
		color: #ffffff;
		margin: 0;
		letter-spacing: -0.025em;
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

	.tools-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
		gap: 1.5rem;
		margin-top: 1rem;
	}

	.tool-card {
		background: #1c1c1e;
		border: 2px solid #3a3a3c;
		border-radius: 16px;
		padding: 2rem;
		cursor: pointer;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		display: flex;
		align-items: center;
		gap: 1.5rem;
		backdrop-filter: blur(20px);
		position: relative;
	}

	.tool-card:hover:not(.disabled) {
		background: #2c2c2e;
		border-color: #007aff;
		transform: translateY(-4px) scale(1.02);
		box-shadow: 0 12px 40px rgba(0, 122, 255, 0.2);
	}

	.tool-card.disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.tool-card.disabled:hover {
		transform: none;
		box-shadow: none;
		border-color: #3a3a3c;
	}

	.tool-icon {
		flex-shrink: 0;
		width: 64px;
		height: 64px;
		background: rgba(0, 122, 255, 0.1);
		border-radius: 16px;
		display: flex;
		align-items: center;
		justify-content: center;
		border: 1px solid rgba(0, 122, 255, 0.2);
	}

	.tool-card.disabled .tool-icon {
		background: rgba(142, 142, 147, 0.1);
		border-color: rgba(142, 142, 147, 0.2);
	}

	.tool-content {
		flex: 1;
		min-width: 0;
	}

	.tool-title {
		font-size: 1.25rem;
		font-weight: 600;
		color: #ffffff;
		margin: 0 0 0.5rem 0;
	}

	.tool-description {
		font-size: 0.875rem;
		color: #a1a1aa;
		margin: 0;
		line-height: 1.5;
	}

	.coming-soon-badge {
		display: inline-block;
		background: rgba(255, 159, 10, 0.2);
		color: #ff9f0a;
		font-size: 0.75rem;
		font-weight: 600;
		padding: 0.25rem 0.75rem;
		border-radius: 12px;
		margin-top: 0.5rem;
		border: 1px solid rgba(255, 159, 10, 0.3);
	}

	.tool-arrow {
		flex-shrink: 0;
		opacity: 0.5;
		transition: opacity 0.3s ease;
	}

	.tool-card:hover:not(.disabled) .tool-arrow {
		opacity: 1;
	}

	.info-section {
		background: #1c1c1e;
		border: 1px solid #3a3a3c;
		border-radius: 16px;
		padding: 2rem;
		margin-top: 2rem;
		backdrop-filter: blur(20px);
	}

	.info-section h2 {
		font-size: 1.5rem;
		font-weight: 600;
		color: #ffffff;
		margin: 0 0 1rem 0;
	}

	.info-section p {
		font-size: 1rem;
		color: #a1a1aa;
		margin: 0;
		line-height: 1.6;
	}

	@media (max-width: 768px) {
		.container {
			padding: 1rem;
		}

		.header {
			flex-direction: column;
			gap: 1rem;
			align-items: flex-start;
		}

		.header h1 {
			font-size: 2rem;
		}

		.tools-grid {
			grid-template-columns: 1fr;
			gap: 1rem;
		}

		.tool-card {
			padding: 1.5rem;
			flex-direction: column;
			text-align: center;
			gap: 1rem;
		}

		.tool-icon {
			width: 48px;
			height: 48px;
		}

		.tool-title {
			font-size: 1.125rem;
		}
	}
</style> 