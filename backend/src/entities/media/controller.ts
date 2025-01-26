import { Context } from "hono";
import { MediaService } from "./service";
import { BadRequestError, handleAppError } from "../../utilities/errors/app-error";

export interface MediaController {
  uploadMedia(ctx: Context): Promise<Response>;
}

export class MediaControllerImpl implements MediaController {
  private mediaService: MediaService;

  constructor(mediaService: MediaService) {
    this.mediaService = mediaService;
  }

  async uploadMedia(ctx: Context): Promise<Response> {
    const uploadMediaImpl = async () => {
      const body = await ctx.req.parseBody({ all: true });
      const media = body["media"];

      if (!media) {
        throw new BadRequestError("No media found");
      }

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

      const objectKeys = await this.mediaService.uploadMedia(blobs);
      return ctx.json(objectKeys, 201);
    };
    return await handleAppError(uploadMediaImpl)(ctx);
  }
}
