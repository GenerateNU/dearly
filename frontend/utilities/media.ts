export const getPhotoBlobs = async (uris: string[]) => {
  const formData = new FormData();

  uris.forEach((uri) => {
    const isJPG = uri.endsWith(".jpg") || uri.endsWith(".jpeg");
    const fileExtension = isJPG ? ".jpg" : ".png";
    const fileType = isJPG ? "image/jpeg" : "image/png";

    formData.append("media", {
      uri: uri,
      type: fileType,
      name: `profilePhoto${fileExtension}`,
    } as any);
  });

  return formData;
};
