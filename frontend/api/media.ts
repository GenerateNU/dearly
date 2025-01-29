import { authWrapper, getHeaders } from "@/utilities/auth-token";
import fetchClient from "./client";
import { UploadMediaPayload, UploadMediaResponse } from "@/types/media";

export const uploadMedia = async (
  id: string,
  payload: UploadMediaPayload,
): Promise<UploadMediaResponse> => {
  const req = async (token: string): Promise<UploadMediaResponse> => {
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
  return authWrapper<UploadMediaResponse>()(req);
};
