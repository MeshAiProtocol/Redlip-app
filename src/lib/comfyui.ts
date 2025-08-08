import { COMFYUI_SERVER_URL } from './config';

export interface ComfyUIResponse {
	success?: boolean;
	data?: any;
	error?: string;
	details?: string;
	serverUrl?: string;
}

export async function callComfyUI(
	endpoint: string,
	options: RequestInit = {}
): Promise<ComfyUIResponse> {
	try {
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 minute timeout

		const response = await fetch(`${COMFYUI_SERVER_URL}${endpoint}`, {
			...options,
			signal: controller.signal
		});

		clearTimeout(timeoutId);

		if (!response.ok) {
			const errorText = await response.text();
			return {
				error: `ComfyUI server error: ${response.status}`,
				details: errorText
			};
		}

		const result = await response.json();
		return { success: true, data: result };

	} catch (error) {
		console.error('Error in ComfyUI API call:', error);

		let errorMessage = 'Internal server error';

		if (error instanceof Error) {
			if (error.name === 'AbortError') {
				errorMessage = 'Request timed out. ComfyUI server is taking too long to respond.';
			} else if (error.message.includes('ECONNRESET')) {
				errorMessage = 'Connection reset. ComfyUI server may be down or unreachable.';
			} else if (error.message.includes('fetch failed')) {
				errorMessage = 'Network error. Unable to connect to ComfyUI server.';
			} else if (error.message.includes('ENOTFOUND')) {
				errorMessage = 'DNS resolution failed. ComfyUI server URL is invalid or unreachable.';
			} else {
				errorMessage = error.message;
			}
		}

		return {
			error: errorMessage,
			details: error instanceof Error ? error.message : 'Unknown error',
			serverUrl: COMFYUI_SERVER_URL
		};
	}
}

export async function testComfyUIConnection(): Promise<ComfyUIResponse> {
	console.log('Testing ComfyUI server connection...');
	return callComfyUI('/system_stats');
}

export async function uploadImage(imageData: FormData): Promise<ComfyUIResponse> {
	// Test connection first
	const connectionTest = await testComfyUIConnection();
	if (!connectionTest.success) {
		console.error('ComfyUI server connection test failed:', connectionTest);
		return {
			error: 'Cannot connect to ComfyUI server',
			details: connectionTest.error || 'Server unreachable',
			serverUrl: COMFYUI_SERVER_URL
		};
	}

	console.log('ComfyUI server connection test successful');

	// Add retry logic for upload failures
	const maxRetries = 3;
	let lastError: any = null;

	for (let attempt = 1; attempt <= maxRetries; attempt++) {
		try {
			console.log(`Upload attempt ${attempt}/${maxRetries}`);
			
			const result = await callComfyUI('/upload/image', {
				method: 'POST',
				body: imageData,
				headers: {}, // Let browser set content-type for FormData
			});

			if (result.success) {
				console.log(`Upload successful on attempt ${attempt}`);
				return result;
			}

			lastError = result;
			console.log(`Upload failed on attempt ${attempt}:`, result.error);

			// Wait before retrying (exponential backoff)
			if (attempt < maxRetries) {
				const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
				console.log(`Waiting ${delay}ms before retry...`);
				await new Promise(resolve => setTimeout(resolve, delay));
			}

		} catch (error) {
			lastError = error;
			console.log(`Upload error on attempt ${attempt}:`, error);

			if (attempt < maxRetries) {
				const delay = Math.pow(2, attempt) * 1000;
				console.log(`Waiting ${delay}ms before retry...`);
				await new Promise(resolve => setTimeout(resolve, delay));
			}
		}
	}

	// All retries failed
	console.error('All upload attempts failed');
	return {
		error: 'Upload failed after multiple attempts',
		details: lastError instanceof Error ? lastError.message : 'Unknown error',
		serverUrl: COMFYUI_SERVER_URL
	};
} 