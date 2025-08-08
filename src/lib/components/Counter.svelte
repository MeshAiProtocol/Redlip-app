<script lang="ts">
	// Props with TypeScript
	let { initialValue = 0, step = 1 } = $props<{
		initialValue?: number;
		step?: number;
	}>();
	
	// Reactive state
	let count = $state(initialValue);
	
	// Computed values
	let isEven = $derived(count % 2 === 0);
	let isPositive = $derived(count > 0);
	
	// Functions
	function increment() {
		count += step;
	}
	
	function decrement() {
		count -= step;
	}
	
	function reset() {
		count = initialValue;
	}
</script>

<div class="counter">
	<h3>Counter Component</h3>
	<div class="display">
		<span class="count {isEven ? 'even' : 'odd'} {isPositive ? 'positive' : 'negative'}">
			{count}
		</span>
	</div>
	<div class="controls">
		<button on:click={decrement}>-</button>
		<button on:click={reset}>Reset</button>
		<button on:click={increment}>+</button>
	</div>
	<div class="info">
		<p>Step: {step}</p>
		<p>Status: {isEven ? 'Even' : 'Odd'} | {isPositive ? 'Positive' : 'Negative or Zero'}</p>
	</div>
</div>

<style>
	.counter {
		border: 2px solid #ddd;
		border-radius: 8px;
		padding: 1rem;
		margin: 1rem 0;
		background: white;
	}
	
	.display {
		text-align: center;
		margin: 1rem 0;
	}
	
	.count {
		font-size: 3rem;
		font-weight: bold;
		padding: 0.5rem 1rem;
		border-radius: 8px;
		background: #f0f0f0;
	}
	
	.count.even {
		color: #28a745;
	}
	
	.count.odd {
		color: #dc3545;
	}
	
	.count.positive {
		background: #d4edda;
	}
	
	.count.negative {
		background: #f8d7da;
	}
	
	.controls {
		display: flex;
		gap: 0.5rem;
		justify-content: center;
		margin: 1rem 0;
	}
	
	.controls button {
		padding: 0.5rem 1rem;
		font-size: 1.2rem;
		min-width: 60px;
	}
	
	.info {
		text-align: center;
		font-size: 0.9rem;
		color: #666;
	}
	
	.info p {
		margin: 0.25rem 0;
	}
</style> 