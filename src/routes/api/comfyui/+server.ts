import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { COMFYUI_SERVER_URL, COMFYUI_PRIMARY_SERVER_URL, COMFYUI_BUMP_SERVER_URLS } from '$lib/config';
import { callComfyUI, uploadImage } from '$lib/comfyui';
import { bumpWorkflow, updateBumpWorkflowWithImage, grainWorkflow, updateGrainWorkflowWithImage, upscaleWorkflow, updateUpscaleWorkflowWithImage } from '$lib/workflows';

async function fetchQueueSize(serverUrl: string): Promise<number> {
    try {
        const res = await callComfyUI('/queue', { method: 'GET' }, serverUrl);
        if (!res.success || !res.data) return Number.POSITIVE_INFINITY;
        const running = Array.isArray(res.data.queue_running) ? res.data.queue_running.length : 0;
        const pending = Array.isArray(res.data.queue_pending) ? res.data.queue_pending.length : 0;
        return running + pending;
    } catch {
        return Number.POSITIVE_INFINITY;
    }
}

async function pickBestBumpServer(): Promise<string> {
    const results = await Promise.all(
        COMFYUI_BUMP_SERVER_URLS.map(async (url) => ({ url, size: await fetchQueueSize(url) }))
    );
    const online = results.filter(r => Number.isFinite(r.size));
    const best = (online.length ? online : results).sort((a, b) => a.size - b.size)[0];
    return best.url;
}

async function fetchServerQueue(serverUrl: string) {
    const res = await callComfyUI('/queue', { method: 'GET' }, serverUrl);
    return { serverUrl, ...res };
}

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
        const explicitServer: string | undefined = body.serverUrl;
		
		// Check if this is an image upload request for bump workflow
        if (body.action === 'upload_and_process') {
			const { imageName, maskImage, filename, clipTextPrompt } = body;
            // route bump adder to primary server unless explicitly provided
            const targetServer = explicitServer || COMFYUI_PRIMARY_SERVER_URL;
			
			console.log('Processing upload_and_process request:', { imageName, hasMask: !!maskImage, filename, hasCustomPrompt: !!clipTextPrompt });
			
			// Update workflow with the uploaded image name
			const updatedWorkflow = updateBumpWorkflowWithImage(bumpWorkflow, imageName);
			
			// If custom prompt is provided, update the CLIP text encoder node
			if (clipTextPrompt && updatedWorkflow["6"]) {
				updatedWorkflow["6"].inputs.text = clipTextPrompt;
				console.log('Updated CLIP text encoder (node 6) with custom prompt:', clipTextPrompt);
			}
			
			// If mask image is provided, update the mask node
			if (maskImage) {
				const maskBase64Match = maskImage.match(/^data:image\/[^;]+;base64,(.+)$/);
				if (maskBase64Match && updatedWorkflow["54"]) {
					updatedWorkflow["54"].inputs.base64_data = maskBase64Match[1];
				}
			}
			
			// Use the filename passed from frontend, or generate one if not provided
			const finalFilename = filename || `img_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
			
			// Update the save node to use the filename
			if (updatedWorkflow["59"]) {
				updatedWorkflow["59"].inputs.filename_prefix = finalFilename;
				console.log('Updated save node filename_prefix to:', finalFilename);
			}
			
			console.log('Sending workflow to ComfyUI with image:', imageName);
			console.log('Updated workflow node 62:', updatedWorkflow["62"]);
			console.log('Updated workflow node 59 (save):', updatedWorkflow["59"]);
			
			// Send the updated workflow to ComfyUI in the correct format
            const comfyResponse = await callComfyUI('/prompt', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					prompt: updatedWorkflow
				}),
            }, targetServer);
			
			console.log('ComfyUI response:', comfyResponse);
            return json({ ...comfyResponse, serverUrl: targetServer });
		}
		
		// Check if this is an image upload request for grain workflow
        if (body.action === 'upload_and_process_grain') {
			const { imageName, filename, settings } = body;
            const targetServer = explicitServer || COMFYUI_PRIMARY_SERVER_URL;
			
			console.log('Processing upload_and_process_grain request:', { imageName, filename, settings });
			
			// Update workflow with the uploaded image name
			const updatedWorkflow = updateGrainWorkflowWithImage(grainWorkflow, imageName);
			
			// Update workflow with user settings if provided
			if (settings) {
				console.log('Received settings from frontend:', settings);
				
				// Update Motion Blur settings (node 783)
				if (updatedWorkflow["783"]) {
					const originalAngle = updatedWorkflow["783"].inputs.angle;
					const originalBlur = updatedWorkflow["783"].inputs.blur;
					
					updatedWorkflow["783"].inputs.angle = settings.motionBlurAngle || 12;
					updatedWorkflow["783"].inputs.blur = settings.motionBlurBlur || 1;
					
					console.log('Updated Motion Blur node 783:', {
						original: { angle: originalAngle, blur: originalBlur },
						updated: { angle: updatedWorkflow["783"].inputs.angle, blur: updatedWorkflow["783"].inputs.blur }
					});
				} else {
					console.log('Warning: Motion Blur node 783 not found in workflow');
				}
				
				// Update Film Grain settings (node 785)
				if (updatedWorkflow["785"]) {
					const originalScale = updatedWorkflow["785"].inputs.scale;
					const originalStrength = updatedWorkflow["785"].inputs.strength;
					const originalSaturation = updatedWorkflow["785"].inputs.saturation;
					const originalToe = updatedWorkflow["785"].inputs.toe;
					
					updatedWorkflow["785"].inputs.scale = settings.grainScale || 0.4;
					updatedWorkflow["785"].inputs.strength = settings.grainStrength || 0.33;
					updatedWorkflow["785"].inputs.saturation = settings.grainSaturation || 0.5;
					updatedWorkflow["785"].inputs.toe = settings.grainToe || 0;
					
					console.log('Updated Film Grain node 785:', {
						original: { scale: originalScale, strength: originalStrength, saturation: originalSaturation, toe: originalToe },
						updated: { 
							scale: updatedWorkflow["785"].inputs.scale, 
							strength: updatedWorkflow["785"].inputs.strength, 
							saturation: updatedWorkflow["785"].inputs.saturation, 
							toe: updatedWorkflow["785"].inputs.toe 
						}
					});
				} else {
					console.log('Warning: Film Grain node 785 not found in workflow');
				}
				
				console.log('Final workflow nodes with settings applied:');
				console.log('Node 783 (Motion Blur):', updatedWorkflow["783"]);
				console.log('Node 785 (Film Grain):', updatedWorkflow["785"]);
			} else {
				console.log('No settings provided, using default values');
			}
			
			// Use the filename passed from frontend, or generate one if not provided
			const finalFilename = filename || `img_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
			
			// Update the save node to use the filename
			if (updatedWorkflow["789"]) {
				updatedWorkflow["789"].inputs.filename_prefix = finalFilename;
				console.log('Updated grain save node filename_prefix to:', finalFilename);
			}
			
			console.log('Sending grain workflow to ComfyUI with image:', imageName);
			console.log('Updated grain workflow node 788:', updatedWorkflow["788"]);
			console.log('Updated grain workflow node 789 (save):', updatedWorkflow["789"]);
			
			// Send the updated workflow to ComfyUI in the correct format
            const comfyResponse = await callComfyUI('/prompt', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					prompt: updatedWorkflow
				}),
            }, targetServer);
			
			console.log('ComfyUI response:', comfyResponse);
            return json({ ...comfyResponse, serverUrl: targetServer });
		}
		
		// Check if this is an image upload request for upscale workflow
        if (body.action === 'upload_and_process_upscale') {
			const { imageName, filename, settings } = body;
            // choose best worker among 222/333/444 for upscaler unless explicitly provided
            const targetServer = explicitServer || (await pickBestBumpServer());
			
			console.log('Processing upload_and_process_upscale request:', { imageName, filename, settings });
			
			// Update workflow with the uploaded image name and settings
			const updatedWorkflow = updateUpscaleWorkflowWithImage(upscaleWorkflow, imageName, settings);
			
			// Log the settings being applied
			if (settings) {
				console.log('Received upscale settings from frontend:', settings);
				console.log('Applied creativity (denoise):', settings.creativity);
				console.log('Applied guidance (cfg):', settings.guidance);
			} else {
				console.log('No upscale settings provided, using default values');
			}
			
			// Use the filename passed from frontend, or generate one if not provided
			const finalFilename = filename || `img_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
			
			// Update the save node to use the filename
			if (updatedWorkflow["741"]) {
				updatedWorkflow["741"].inputs.filename_prefix = finalFilename;
				console.log('Updated upscale save node filename_prefix to:', finalFilename);
			}
			
			console.log('Sending upscale workflow to ComfyUI with image:', imageName);
			console.log('Updated upscale workflow node 739:', updatedWorkflow["739"]);
			console.log('Updated upscale workflow node 741 (save):', updatedWorkflow["741"]);
			
			// Send the updated workflow to ComfyUI in the correct format
            const comfyResponse = await callComfyUI('/prompt', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					prompt: updatedWorkflow
				}),
            }, targetServer);
			
			console.log('ComfyUI response:', comfyResponse);
            return json({ ...comfyResponse, serverUrl: targetServer });
		}
		
		// Regular workflow processing
        const comfyResponse = await callComfyUI('/prompt', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(body),
        }, explicitServer);
		
		return json(comfyResponse);
		
	} catch (error) {
		console.error('Error in ComfyUI API:', error);
		
		let errorMessage = 'Internal server error';
		let statusCode = 500;
		
		if (error instanceof Error) {
			if (error.name === 'AbortError') {
				errorMessage = 'Request timed out. ComfyUI server is taking too long to respond.';
				statusCode = 408;
			} else if (error.message.includes('ECONNRESET')) {
				errorMessage = 'Connection reset. ComfyUI server may be down or unreachable.';
				statusCode = 503;
			} else if (error.message.includes('fetch failed')) {
				errorMessage = 'Network error. Unable to connect to ComfyUI server.';
				statusCode = 503;
			} else if (error.message.includes('ENOTFOUND')) {
				errorMessage = 'DNS resolution failed. ComfyUI server URL is invalid or unreachable.';
				statusCode = 503;
			} else {
				errorMessage = error.message;
			}
		}
		
		return json(
			{ 
				error: errorMessage,
				details: error instanceof Error ? error.message : 'Unknown error',
				serverUrl: COMFYUI_SERVER_URL
			}, 
			{ status: statusCode }
		);
	}
};

// New endpoint for file uploads
export const PUT: RequestHandler = async ({ request }) => {
	try {
		console.log('Starting file upload to ComfyUI...');
		
		const formData = await request.formData();
		const file = formData.get('image') as File;
        const serverOverride = formData.get('serverUrl') as string | null;
		
		if (!file) {
			return json({ error: 'No file provided' }, { status: 400 });
		}
		
		console.log('File received:', {
			name: file.name,
			size: file.size,
			type: file.type
		});
		
		// Create FormData for ComfyUI upload
		const comfyFormData = new FormData();
		comfyFormData.append('image', file);
		
		console.log('Uploading to ComfyUI server...');
        const uploadResult = await uploadImage(comfyFormData, serverOverride ?? undefined);
		
		if (!uploadResult.success) {
			console.error('Upload failed:', uploadResult);
			return json(uploadResult, { status: 500 });
		}
		
		console.log('Upload successful:', uploadResult);
        return json({ success: true, data: uploadResult.data, serverUrl: serverOverride });
		
	} catch (error) {
		console.error('Error in ComfyUI upload API:', error);
		
		let errorMessage = 'Internal server error';
		let statusCode = 500;
		
		if (error instanceof Error) {
			if (error.name === 'AbortError') {
				errorMessage = 'Upload timed out. ComfyUI server is taking too long to respond.';
				statusCode = 408;
			} else if (error.message.includes('ECONNRESET')) {
				errorMessage = 'Connection reset. ComfyUI server may be down or unreachable.';
				statusCode = 503;
			} else if (error.message.includes('fetch failed')) {
				errorMessage = 'Network error. Unable to connect to ComfyUI server.';
				statusCode = 503;
			} else if (error.message.includes('ENOTFOUND')) {
				errorMessage = 'DNS resolution failed. ComfyUI server URL is invalid or unreachable.';
				statusCode = 503;
			} else {
				errorMessage = error.message;
			}
		}
		
		return json(
			{ 
				error: errorMessage,
				details: error instanceof Error ? error.message : 'Unknown error',
				serverUrl: COMFYUI_SERVER_URL
			}, 
			{ status: statusCode }
		);
	}
};

export const GET: RequestHandler = async ({ url }) => {
	try {
		const promptId = url.searchParams.get('prompt_id');
		const action = url.searchParams.get('action');
        const serverOverride = url.searchParams.get('serverUrl') || undefined;
		
		if (!action) {
			return json({ error: 'Action parameter required' }, { status: 400 });
		}
		
        let comfyUrl = '';
		
		switch (action) {
			case 'history':
				if (!promptId) {
					return json({ error: 'prompt_id required for history action' }, { status: 400 });
				}
                comfyUrl = `${(serverOverride ?? COMFYUI_SERVER_URL)}/history/${promptId}`;
				break;
			case 'queue':
                comfyUrl = `${(serverOverride ?? COMFYUI_SERVER_URL)}/queue`;
				break;
			case 'system_stats':
                comfyUrl = `${(serverOverride ?? COMFYUI_SERVER_URL)}/system_stats`;
				break;
			case 'upload_image':
                comfyUrl = `${(serverOverride ?? COMFYUI_SERVER_URL)}/upload/image`;
				break;
			case 'test_connection':
                comfyUrl = `${(serverOverride ?? COMFYUI_SERVER_URL)}/system_stats`;
				break;
			case 'upload_mask':
                comfyUrl = `${(serverOverride ?? COMFYUI_SERVER_URL)}/upload/mask`;
				break;
            case 'best_bump_server': {
                const best = await pickBestBumpServer();
                return json({ success: true, data: { serverUrl: best } });
            }
            case 'best_upscale_server': {
                const best = await pickBestBumpServer();
                return json({ success: true, data: { serverUrl: best } });
            }
            case 'all_queues': {
                const servers = [COMFYUI_PRIMARY_SERVER_URL, ...COMFYUI_BUMP_SERVER_URLS];
                const results = await Promise.all(servers.map(fetchServerQueue));
                return json({ success: true, data: results });
            }
			default:
				return json({ error: 'Invalid action' }, { status: 400 });
		}
		
        const base = serverOverride ?? COMFYUI_SERVER_URL;
        const comfyResponse = await callComfyUI(comfyUrl.replace(base, ''), {
			method: 'GET',
			headers: { 'Content-Type': 'application/json' },
        }, serverOverride);
		
		return json(comfyResponse);
		
	} catch (error) {
		console.error('Error in ComfyUI GET API:', error);
		
		let errorMessage = 'Internal server error';
		let statusCode = 500;
		
		if (error instanceof Error) {
			if (error.name === 'AbortError') {
				errorMessage = 'Request timed out. ComfyUI server is taking too long to respond.';
				statusCode = 408;
			} else if (error.message.includes('ECONNRESET')) {
				errorMessage = 'Connection reset. ComfyUI server may be down or unreachable.';
				statusCode = 503;
			} else if (error.message.includes('fetch failed')) {
				errorMessage = 'Network error. Unable to connect to ComfyUI server.';
				statusCode = 503;
			} else if (error.message.includes('ENOTFOUND')) {
				errorMessage = 'DNS resolution failed. ComfyUI server URL is invalid or unreachable.';
				statusCode = 503;
			} else {
				errorMessage = error.message;
			}
		}
		
		return json(
			{ 
				error: errorMessage,
				details: error instanceof Error ? error.message : 'Unknown error',
				serverUrl: COMFYUI_SERVER_URL
			}, 
			{ status: statusCode }
		);
	}
}; 