import { authWrapper, getHeaders } from "@/utilities/auth-token";
import fetchClient from "./client";
import { UploadGroupMediaResponse, UploadUserMediaResponse } from "@/types/media";

export const uploadPostMedia = async (
  id: string,
  payload: FormData,
): Promise<UploadGroupMediaResponse> => {
  const req = async (token: string): Promise<UploadGroupMediaResponse> => {
    const { data } = await fetchClient.POST("/api/v1/groups/{id}/media", {
      headers: getHeaders(token, undefined),
      body: payload as FormData & { media: string },
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

export const uploadUserMedia = async (payload: FormData): Promise<UploadUserMediaResponse> => {
  const req = async (token: string): Promise<UploadUserMediaResponse> => {
    const { data } = await fetchClient.POST("/api/v1/users/media", {
      headers: getHeaders(token, undefined),
      body: payload as FormData & { media: string },
    });
    return data!;
  };
  return authWrapper<UploadUserMediaResponse>()(req);
};
