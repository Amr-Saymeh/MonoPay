import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import { Platform } from "react-native";

type UploadImageOptions = {
  uri: string;
  folder: string;
  fileName: string;
};

function getCloudName() {
  return process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
}

function getUploadPreset() {
  return process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
}

export async function uploadImageToCloudinary({
  uri,
  folder,
  fileName,
}: UploadImageOptions) {
  const cloudName = "dv260gair";
  const uploadPreset = "rn_unsigned_preset";

  if (!cloudName || !uploadPreset) {
    throw new Error(
      "Missing Cloudinary config. Set EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME and EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET.",
    );
  }

  const body = new FormData();
  const normalized = await manipulateAsync(
    uri,
    [],
    Platform.OS === "web"
      ? {
          compress: 0.8,
          format: SaveFormat.JPEG,
          base64: true,
        }
      : {
          compress: 0.8,
          format: SaveFormat.JPEG,
        },
  );

  if (Platform.OS === "web") {
    const base64 = (normalized as { base64?: string }).base64;
    if (!base64) throw new Error("Failed to prepare image.");
    body.append("file", `data:image/jpeg;base64,${base64}` as any);
  } else {
    body.append("file", {
      uri: normalized.uri,
      name: `${fileName}.jpg`,
      type: "image/jpeg",
    } as any);
  }
  body.append("upload_preset", uploadPreset);
  body.append("folder", folder);
  body.append("public_id", fileName);

  const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
  const res = await fetch(endpoint, {
    method: "POST",
    body,
  });

  if (!res.ok) {
    const contentType = res.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      const json = (await res.json().catch(() => null)) as {
        error?: { message?: string };
      } | null;
      const msg = json?.error?.message;
      throw new Error(msg || "Upload failed");
    }

    const txt = await res.text().catch(() => "");
    throw new Error(txt || "Upload failed");
  }

  const json = (await res.json()) as { secure_url?: string; url?: string };
  const url = json.secure_url ?? json.url;
  if (!url) throw new Error("Upload did not return a URL");
  return url;
}
