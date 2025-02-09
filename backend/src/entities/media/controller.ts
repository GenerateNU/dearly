import { Context } from "hono";
import { MediaService } from "./service";
import { BadRequestError, handleAppError } from "../../utilities/errors/app-error";
import { parseUUID } from "../../utilities/uuid";
import { MEDIA } from "../../types/api/routes/media";

export interface MediaController {
  uploadMedia(ctx: Context): Promise<MEDIA>;
}

export class MediaControllerImpl implements MediaController {
  private mediaService: MediaService;

  constructor(mediaService: MediaService) {
    this.mediaService = mediaService;
  }

  async uploadMedia(ctx: Context): Promise<MEDIA> {
    const uploadMediaImpl = async () => {
      const groupId = parseUUID(ctx.req.param("id"));
      const userId = ctx.get("userId");
      const body = await ctx.req.parseBody({ all: true });
      const media = body["media"];

      if (!media) {
        throw new BadRequestError("No media found");
      }

      const blobs = this.checkMediaType(media);

      const objectKeys = await this.mediaService.uploadMedia(blobs, groupId, userId);
      return ctx.json(objectKeys, 201);
    };
    return await handleAppError(uploadMediaImpl)(ctx);
  }

  private checkMediaType(media: unknown): Blob[] {
    let blobs: Blob[] = [];

    if (Array.isArray(media)) {
      blobs = media.map((item) => {
        if (item instanceof File) {
          return item;
        }
        throw new BadRequestError("Invalid file type in array");
      });
    } else if (media instanceof File) {
      blobs = [media];
    } else {
      throw new BadRequestError("Invalid media type");
    }
    return blobs;
  }
}
