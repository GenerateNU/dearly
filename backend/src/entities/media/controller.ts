import { Context } from "hono";
import { MediaService } from "./service";
import { BadRequestError, handleAppError } from "../../utilities/errors/app-error";
import { parseUUID } from "../../utilities/uuid";
import { GROUP_MEDIA, USER_MEDIA, WAVEFORM } from "../../types/api/routes/media";
import { processURLValidate } from "./validator";

export interface MediaController {
  uploadPostMedia(ctx: Context): Promise<GROUP_MEDIA>;
  uploadUserMedia(ctx: Context): Promise<USER_MEDIA>;
  getDBData(ctx: Context): Promise<WAVEFORM>;
}

export class MediaControllerImpl implements MediaController {
  private mediaService: MediaService;

  constructor(mediaService: MediaService) {
    this.mediaService = mediaService;
  }

  async uploadPostMedia(ctx: Context): Promise<GROUP_MEDIA> {
    const uploadMediaImpl = async () => {
      const groupId = parseUUID(ctx.req.param("id"));
      const userId = ctx.get("userId");
      const body = await ctx.req.parseBody({ all: true });
      const media = body["media"];

      if (!media) {
        throw new BadRequestError("No media found");
      }

      const blobs = this.checkMediaType(media);

      const objectKeys = await this.mediaService.uploadPostMedia(blobs, groupId, userId);
      return ctx.json(objectKeys, 201);
    };
    return await handleAppError(uploadMediaImpl)(ctx);
  }

  async uploadUserMedia(ctx: Context): Promise<USER_MEDIA> {
    const uploadMediaImpl = async () => {
      const userId = ctx.get("userId");
      const body = await ctx.req.parseBody();
      const media = body["media"];

      if (!media) {
        throw new BadRequestError("No media found");
      }

      if (media instanceof File) {
        const objectKeys = await this.mediaService.uploadUserMedia(media, userId);
        return ctx.json(objectKeys, 201);
      }

      throw new BadRequestError("Invalid file type");
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
  async getDBData(ctx: Context): Promise<WAVEFORM> {
    console.log("in controller")
    const getDBImpl = async () => {
      const dataProcessing = processURLValidate.parse(await ctx.req.json());
      const url = dataProcessing["url"]
      if(!url){
        throw new BadRequestError("Invalid Url")
      }
      const response = await this.mediaService.getDBData(url);
      return ctx.json(response, 201);
    };
    return await handleAppError(getDBImpl)(ctx);
  }
}
