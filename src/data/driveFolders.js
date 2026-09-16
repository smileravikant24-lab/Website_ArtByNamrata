const imageUrl = (fileId) => `https://lh3.googleusercontent.com/d/${fileId}`;

const driveApiKey = import.meta.env.VITE_GOOGLE_DRIVE_API_KEY;
const parentFolderId = import.meta.env.VITE_GOOGLE_DRIVE_PARENT_FOLDER_ID;

export async function loadFolderImages(category) {
  if (!driveApiKey || !category.folderId) return category.images || [];

  const files = [];
  let pageToken;

  do {
    const params = new URLSearchParams({
      q: `'${category.folderId}' in parents and trashed = false and mimeType contains 'image/'`,
      fields: 'nextPageToken,files(id,name,mimeType,modifiedTime)',
      orderBy: 'name_natural',
      pageSize: '100',
      key: driveApiKey,
    });

    if (pageToken) params.set('pageToken', pageToken);

    const response = await fetch(`https://www.googleapis.com/drive/v3/files?${params}`);
    if (!response.ok) throw new Error(`Drive API returned ${response.status}`);

    const data = await response.json();
    files.push(...(data.files || []));
    pageToken = data.nextPageToken;
  } while (pageToken);

  const driveImages = files.map((file) => ({
    id: file.id,
    title: file.name.replace(/\.[^.]+$/, ''),
    img: imageUrl(file.id),
  }));

  return driveImages.length > 0 ? driveImages : category.images;
}

export async function loadDriveCategoriesAndImages(fallbackCategories = []) {
  if (!driveApiKey) return fallbackCategories;

  let categoriesToLoad = [...fallbackCategories];

  if (parentFolderId) {
    try {
      const folderParams = new URLSearchParams({
        q: `'${parentFolderId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
        fields: 'files(id,name,description)',
        orderBy: 'name_natural',
        pageSize: '100',
        key: driveApiKey,
      });

      const response = await fetch(`https://www.googleapis.com/drive/v3/files?${folderParams}`);
      if (response.ok) {
        const { files = [] } = await response.json();
        if (files.length > 0) {
          categoriesToLoad = files.map((folder) => {
            const cleanTitle = folder.name.trim();
            const cleanId = cleanTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            const existing = fallbackCategories.find(
              (c) => c.folderId === folder.id || c.title.toLowerCase().trim() === cleanTitle.toLowerCase()
            );

            return {
              id: existing?.id || cleanId,
              title: existing?.title || cleanTitle,
              folderId: folder.id,
              description: existing?.description || `${cleanTitle} artworks collection.`,
              folderUrl: `https://drive.google.com/drive/folders/${folder.id}`,
              images: existing?.images || [],
            };
          });
        }
      }
    } catch (err) {
      console.error('Failed to fetch parent drive subfolders:', err);
    }
  }

  const updatedCategories = await Promise.all(
    categoriesToLoad.map(async (category) => {
      try {
        const images = await loadFolderImages(category);
        return { ...category, images };
      } catch (err) {
        console.error(`Failed to load images for category ${category.title}:`, err);
        return category;
      }
    })
  );

  return updatedCategories;
}

