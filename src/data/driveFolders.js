const imageUrl = (fileId) => `https://lh3.googleusercontent.com/d/${fileId}`;

const driveApiKey = import.meta.env.VITE_GOOGLE_DRIVE_API_KEY;

export async function loadFolderImages(category) {
  if (!driveApiKey) return category.images;

  const params = new URLSearchParams({
    q: `'${category.folderId}' in parents and trashed = false and mimeType contains 'image/'`,
    fields: 'files(id,name,mimeType,modifiedTime)',
    orderBy: 'name_natural',
    pageSize: '100',
    key: driveApiKey,
  });

  const response = await fetch(`https://www.googleapis.com/drive/v3/files?${params}`);
  if (!response.ok) throw new Error(`Drive API returned ${response.status}`);

  const { files = [] } = await response.json();
  return files.map((file) => ({
    id: file.id,
    title: file.name.replace(/\.[^.]+$/, ''),
    img: imageUrl(file.id),
  }));
}
