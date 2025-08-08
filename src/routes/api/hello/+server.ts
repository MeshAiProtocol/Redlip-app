import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	const name = url.searchParams.get('name') || 'World';
	
	return json({
		message: `Hello, ${name}!`,
		timestamp: new Date().toISOString(),
		framework: 'SvelteKit 5',
		features: ['TypeScript', 'Vite', 'SSR', 'API Routes']
	});
};

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json();
	
	return json({
		received: body,
		message: 'Data received successfully!',
		timestamp: new Date().toISOString()
	});
}; 