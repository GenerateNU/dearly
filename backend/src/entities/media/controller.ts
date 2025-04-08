import { Context } from "hono";
import { MediaService } from "./service";
import { BadRequestError, handleAppError } from "../../utilities/errors/app-error";
import { parseUUID } from "../../utilities/api/uuid";
import { GroupMediaResponse, UserMediaResponse, Waveform } from "../../types/api/routes/media";
import { Status } from "../../constants/http";
import { processURLValidate } from "../../types/api/internal/media";

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

  /**
   * Retrieves data related to a specific URL from the database.
   *
   * This method extracts a URL from the request body, validates it, and then
   * uses the `MediaService` to fetch corresponding data from the database.
   * The result is returned as a JSON response.
   *
   * @param ctx - The context object containing the request and response information.
   * @returns Promise resolving to the database response wrapped in a JSON format.
   * @throws BadRequestError - If the URL is not provided or is invalid.
   */
  getDBData(ctx: Context): Promise<Waveform>;
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
      return ctx.json(objectKeys, Status.Created);
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
        return ctx.json(objectKeys, Status.Created);
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

  async getDBData(ctx: Context): Promise<Waveform> {
    const getDBImpl = async () => {
      const { url } = ctx.req.query();
      const urlParsed = processURLValidate.parse(url)
      if (!urlParsed) {
        throw new BadRequestError("Invalid Url");
      }
      const response = await this.mediaService.getDBData(urlParsed);
      return ctx.json(response, Status.OK);
    };
    return await handleAppError(getDBImpl)(ctx);
  }
}
