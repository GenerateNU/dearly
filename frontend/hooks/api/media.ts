import { UploadGroupMediaResponse, Waveform, processMediaPayload } from "@/types/media";
import { useMutationBase } from "./base";
import { processMedia, uploadPostMedia } from "@/api/media";
import { useQueryClient } from "@tanstack/react-query";
/**
 * Hook to upload group media
 *
 * @returns Mutation object for creating a group
 */
export const useUploadGroupMedia = (id: string) => {
  return useMutationBase<FormData, UploadGroupMediaResponse>(
    (form: FormData) => uploadPostMedia(id, form),
    ["groups", id, "media"],
  );
};

export const useProcessAudio = (id: string) => {
  return useMutationBase<processMediaPayload, Waveform>(
    (payload: processMediaPayload) => processMedia(payload),
    ["media", "processing", id],
  );
};
