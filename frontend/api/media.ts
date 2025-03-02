import { authWrapper, getHeaders } from "@/utilities/auth-token";
import fetchClient from "./client";
import {
  UploadMediaPayload,
  UploadGroupMediaResponse,
  UploadUserMediaResponse,
} from "@/types/media";
import { API_BASE_URL } from "@/constants/api";

export const uploadPostMedia = async (
  id: string,
  payload: UploadMediaPayload,
): Promise<UploadGroupMediaResponse> => {
  const req = async (token: string): Promise<UploadGroupMediaResponse> => {
    const { data } = await fetchClient.POST("/api/v1/groups/{id}/media", {
      headers: getHeaders(token, "multipart/form-data"),
      body: payload,
      params: {
        path: {
          id,
        },
      },
    });
    return data!;
  };
  return authWrapper<UploadGroupMediaResponse>()(req);
};

export const uploadUserMedia = async (form: FormData): Promise<UploadUserMediaResponse> => {
  try {
    console.log("Form:", form);

    const req = async (token: string): Promise<any> => {
      const response = await fetch(`${API_BASE_URL}/api/v1/users/media`, {
        method: "POST",
        headers: {
          ...getHeaders(token, undefined),
        },
        body: form,
      });

      if (!response.ok) {
        // Throw an error if the response is not OK
        const errorData = await response.json(); // Get the error message if available
        throw new Error(`Failed to upload file: ${errorData.message || "Unknown error"}`);
      }

      const data = await response.json();
      return data;
    };

    return await authWrapper<UploadUserMediaResponse>()(req);
  } catch (error) {
    // Catch any error and log it
    console.error("Error uploading media:", error);
    throw new Error(`Upload failed: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
};
