# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Google Drive Images

The gallery is configured section-wise in `src/data/imageConfig.js` with five Drive categories: Acrylic, Calligraphy, Oil Pastel, Project Work, and Sketch. Clicking an image opens a category-only lightbox with previous/next navigation.

Each image uses its Google Drive file ID and renders through Google's public image endpoint. Keep each file's General access set to **Anyone with the link** with **Viewer** access.

To automatically discover new images added to those Drive folders, create a Google API key with the **Google Drive API** enabled and place it in a local `.env` file:

```env
VITE_GOOGLE_DRIVE_API_KEY=your_key_here
```

The app then reads image files from each configured folder, sorts them naturally by filename, and arranges the category grid automatically. Without the key, the checked-in public image list remains available as a fallback. Never commit the `.env` file.

## Contact Messages in Google Sheets

The Contact form does not open an email client. Deploy `google-apps-script/Code.gs` as a Google Apps Script Web App connected to the destination Sheet, set access to **Anyone**, and put its `/exec` URL in `.env`:

```env
VITE_CONTACT_SHEET_ENDPOINT=https://script.google.com/macros/s/your-deployment-id/exec
```

The form stores the submission time, name, message, and page URL in the `Messages` sheet. Instagram messaging still requires the visitor to be logged in to Instagram.
