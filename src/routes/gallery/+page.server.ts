import { COMFYUI_FILES_BROWSER_URL, FILES_URL_BUMP, FILES_URL_GRAINY, FILES_URL_UPSCALE, COMFYUI_BUMP_SERVER_URLS, COMFYUI_PRIMARY_SERVER_URL } from '$lib/config';

type FileEntry = {
  type: 'file' | 'folder';
  name: string;
  bytes: number;
  created_at: number;
  folder_path?: string;
  notes?: string;
};

type FilesResponse = { files: FileEntry[] };

async function fetchCategory(fetchFn: typeof fetch, url: string): Promise<FileEntry[]> {
  const res = await fetchFn(url, { headers: { accept: 'application/json' } });
  if (!res.ok) return [];
  const data = (await res.json()) as FilesResponse;
  return Array.isArray(data?.files) ? data.files : [];
}

export const load = async ({ fetch }) => {
  // Build absolute URLs
  const grainyUrl = FILES_URL_GRAINY ?? `${COMFYUI_FILES_BROWSER_URL}?folder_type=outputs&folder_path=GRAINY&`;
  const bumpUrl = FILES_URL_BUMP ?? `${COMFYUI_FILES_BROWSER_URL}?folder_type=outputs&folder_path=BUMP&`;

  // Fetch upscale files from all worker servers (222/333/444)
  const upscaleUrls = COMFYUI_BUMP_SERVER_URLS.map((server) => `${server}/browser/files?folder_type=outputs&folder_path=UPSCALE&`);
  const upscaleLists = await Promise.all(upscaleUrls.map((u) => fetchCategory(fetch, u)));
  const upscale = upscaleLists.flat();

  // Grain and bump are produced on the primary server
  const [grainy, bump] = await Promise.all([
    fetchCategory(fetch, grainyUrl),
    fetchCategory(fetch, bumpUrl)
  ]);

  const sortByCreatedDesc = (a: FileEntry, b: FileEntry) => (b.created_at ?? 0) - (a.created_at ?? 0);

  return {
    upscale: upscale.sort(sortByCreatedDesc),
    grainy: grainy.sort(sortByCreatedDesc),
    bump: bump.sort(sortByCreatedDesc)
  };
};


