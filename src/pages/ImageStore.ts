// Shared in-memory store for folder images between routes.
// Lives for the lifetime of the JS bundle (no serialisation needed).

const IMAGE_EXTENSIONS = new Set([
  "jpg",
  "jpeg",
  "png",
  "gif",
  "webp",
  "bmp",
  "tiff",
  "tif",
  "svg",
]);

let _files: File[] = [];

export const imageStore = {
  setFiles(files: FileList | File[]) {
    _files = Array.from(files).filter((f) => {
      const ext = f.name.split(".").pop()?.toLowerCase() ?? "";
      return IMAGE_EXTENSIONS.has(ext);
    });
  },
  getFiles(): File[] {
    return _files;
  },
  count(): number {
    return _files.length;
  },
};
