import { Context } from "hono";
import { MediaService } from "./service";
import { BadRequestError, handleAppError } from "../../utilities/errors/app-error";
import { parseUUID } from "../../utilities/api/uuid";
import { GroupMediaResponse, UserMediaResponse } from "../../types/api/routes/media";

/**
 * Interface for handling media upload operations.
 * Provides methods for uploading media files for posts and user profiles.
 */
export interface MediaController {
  /**
   * Uploads media files for a post.
   * @param ctx - The context object containing the request and response information
   * @returns Promise resolving to the GroupMediaResponse object
   */
  uploadPostMedia(ctx: Context): Promise<GroupMediaResponse>;

  /**
   * Uploads media files for a user profile.
   * @param ctx - The context object containing the request and response information
   * @returns Promise resolving to the UserMediaResponse object
   */
  uploadUserMedia(ctx: Context): Promise<UserMediaResponse>;
}

export class MediaControllerImpl implements MediaController {
  private mediaService: MediaService;

  constructor(mediaService: MediaService) {
    this.mediaService = mediaService;
  }

  async uploadPostMedia(ctx: Context): Promise<GroupMediaResponse> {
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

  async uploadUserMedia(ctx: Context): Promise<UserMediaResponse> {
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
}
