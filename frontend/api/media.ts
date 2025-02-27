import { authWrapper, getHeaders } from "@/utilities/auth-token";
import fetchClient from "./client";
import {
  UploadMediaPayload,
  UploadGroupMediaResponse,
  UploadUserMediaResponse,
} from "@/types/media";

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

export const uploadUserMedia = async (payload: FormData): Promise<UploadUserMediaResponse> => {
  const req = async (token: string): Promise<UploadUserMediaResponse> => {
    const { data } = await fetchClient.POST("/api/v1/users/media", {
      headers: getHeaders(token, "multipart/form-data"),
      // @ts-ignore
      body: payload,
    });
    return data!;
  };
  return authWrapper<UploadUserMediaResponse>()(req);
};
