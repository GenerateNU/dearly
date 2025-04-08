import { UploadGroupMediaResponse, Waveform, processMediaPayload } from "@/types/media";
import { useMutationBase, useQueryBase } from "./base";
import { processMedia, uploadPostMedia } from "@/api/media";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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

export const useProcessAudio = (id: string, url: string) => {
  return useQuery({
    queryKey: ["media", "processing", id],
    queryFn: () => processMedia(url)
  })
};
