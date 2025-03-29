import { authWrapper, getHeaders } from "@/utilities/auth-token";
import fetchClient from "./client";
import { UploadGroupMediaResponse, UploadUserMediaResponse, Waveform, processMediaPayload } from "@/types/media";

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

export const processMedia = async (payload: processMediaPayload): Promise<Waveform> => {
  console.log("got to processMedia method")
  console.log(payload)
  const req = async (token: string): Promise<Waveform> => {
    console.log("inside")
    const { data } = await fetchClient.POST("/api/v1/media/processing", {
      headers: getHeaders(token),
      body: payload
    });
    console.log("data", data)
    return data!;
  };
  return authWrapper<Waveform>()(req);
};
