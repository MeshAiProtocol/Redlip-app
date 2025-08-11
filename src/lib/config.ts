export const POD_ID = 'g3eynxfpne009h';

// Primary server (for grain and bump)
export const COMFYUI_PRIMARY_SERVER_URL = `https://${POD_ID}-111.proxy.runpod.net`;

// Worker servers for upscaler (different GPUs)
export const COMFYUI_BUMP_SERVER_URLS: string[] = [
  `https://${POD_ID}-222.proxy.runpod.net`,
  `https://${POD_ID}-333.proxy.runpod.net`,
  `https://${POD_ID}-444.proxy.runpod.net`
];

// Backward compatibility for existing imports that expect a single server URL
export const COMFYUI_SERVER_URL = COMFYUI_PRIMARY_SERVER_URL;

// Files browser API base (lists generated images)
export const COMFYUI_FILES_BROWSER_URL = `${COMFYUI_PRIMARY_SERVER_URL}/browser/files`;

// Category-specific listing URLs
export const FILES_URL_UPSCALE = `${COMFYUI_FILES_BROWSER_URL}?folder_type=outputs&folder_path=UPSCALE&`;
export const FILES_URL_GRAINY = `${COMFYUI_FILES_BROWSER_URL}?folder_type=outputs&folder_path=GRAINY&`;
export const FILES_URL_BUMP = `${COMFYUI_FILES_BROWSER_URL}?folder_type=outputs&folder_path=BUMP&`;

export type ComfyTask = 'bump' | 'upscale' | 'grain';