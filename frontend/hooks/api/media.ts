import { UploadGroupMediaResponse, Waveform, processMediaPayload } from "@/types/media";
import { useMutationBase } from "./base";
import { processMedia, uploadPostMedia } from "@/api/media";
/**
 * Hook to upload group media
 *
 * @returns Mutation object for creating a group
 */
export const useUploadGroupMedia = (id: string) => {
  return useMutationBase<FormData, UploadGroupMediaResponse>(
    (form) => uploadPostMedia(id, form),
    ["groups", id, "media"],
  );
};


export const useProcessAudio = () => {
  return useMutationBase<processMediaPayload, Waveform>(
    (payload) => processMedia(payload),
    ["media", "processing"],
  );
}
