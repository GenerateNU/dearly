import {
  DayWithObjectKey,
  DayWithURL,
  ThumbnailResponse,
  ThumbnailResponseWithURL,
} from "./../../types/api/internal/groups";
import { S3Service } from "../../services/s3Service";
import { PostWithMedia, PostWithMediaURL } from "../../types/api/internal/posts";
import { SearchedUser, User } from "../../types/api/internal/users";
import { MediaType, Tag } from "../../constants/database";
import { Media, MediaResponse, MediaWithURL, WaveForm } from "../../types/api/internal/media";
import {
  BadRequestError,
  ForbiddenError,
  InternalServerError,
  NotFoundError,
} from "../../utilities/errors/app-error";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { groupsTable, membersTable } from "../schema";
import { eq, and } from "drizzle-orm";
import ffmpeg, { FfprobeData } from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";
import ffprobePath from "ffprobe-static";

ffmpeg.setFfmpegPath(ffmpegPath!);
ffmpeg.setFfprobePath(ffprobePath.path);

/**
 * Interface for the Media Service, which provides methods for interacting with media-related operations.
 * This includes retrieving media with signed URLs, uploading media, and checking user permissions.
 */
export interface MediaService {
  /**
   * Retrieves a post with its associated media URLs.
   *
   * @param post - The post object containing media object key.
   * @returns A promise that resolves to a `PostWithMediaURL` object, which contains the post data and media URLs.
   */
  getPostWithMediaUrls(post: PostWithMedia): Promise<PostWithMediaURL>;

  /**
   * Retrieves a list of thumbnails with signed URLs for each thumbnail.
   *
   * @param thumbnails - A list of `ThumbnailResponse` objects with object keys to retrieve signed URLs for.
   * @returns A promise that resolves to a list of `ThumbnailResponseWithURL` objects, each containing the thumbnail data and URL.
   */
  getThumbnailsWithSignedUrls(thumbnails: ThumbnailResponse[]): Promise<ThumbnailResponseWithURL[]>;

  /**
   * Retrieves a list of users, each with a signed URL for their profile photo (if available).
   *
   * @param users - A list of `SearchedUser` objects to retrieve profile photo URLs for.
   * @returns A promise that resolves to a list of `SearchedUser` objects with signed profile photo URLs.
   */
  getUsersWithSignedURL(users: SearchedUser[]): Promise<SearchedUser[]>;

  /**
   * Retrieves a single user with their signed profile photo URL (if available).
   *
   * @param user - The `User` object to retrieve the profile photo URL for.
   * @returns A promise that resolves to a `User` object with a signed profile photo URL.
   */
  getUserWithSignedURL(user: User): Promise<User>;

  /**
   * Uploads media (such as images, videos, or audio) to the S3 service and associates them with a group.
   *
   * @param blobs - A list of `Blob` objects representing the media to upload.
   * @param groupId - The ID of the group the media is being uploaded to.
   * @param userId - The ID of the user uploading the media.
   * @returns A promise that resolves to a list of `MediaResponse` objects, each containing the media object key and type.
   */
  uploadPostMedia(blobs: Blob[], groupId: string, userId: string): Promise<MediaResponse[]>;

  /**
   * Uploads user media (only one media at a time)
   *
   * @param blobs - A list of `Blob` objects representing the media to upload.
   * @param groupId - The ID of the group the media is being uploaded to.
   * @param userId - The ID of the user uploading the media.
   * @returns A promise that resolves to a list of `MediaResponse` objects, each containing the media object key and type.
   */
  uploadUserMedia(blobs: Blob, userId: string): Promise<MediaResponse>;

  /**
   * Get pre-signed url of a medium given its object key
   *
   * @param key unique object key associated with media
   */
  getSignedUrl(key: string): Promise<string>;

  /**
   * Gets the db data of the given url
   * @param groupID
   * @param media
   */
  getDBData(media: string): Promise<WaveForm>;
}

export class MediaServiceImpl {
  private s3Service: S3Service;
  private db: PostgresJsDatabase;

  constructor(db: PostgresJsDatabase, s3Service: S3Service) {
    this.s3Service = s3Service;
    this.db = db;
  }

  async getThumbnailWithSignedUrl({ day, objectKey }: DayWithObjectKey): Promise<DayWithURL> {
    const signedUrl = await this.getSignedUrl(objectKey);
    return {
      day,
      url: signedUrl,
    };
  }

  async getUserWithSignedURL(user: User): Promise<User> {
    let profilePhotoUrl = null;

    if (user.profilePhoto) {
      profilePhotoUrl = await this.s3Service.getObjectURL(user.profilePhoto);
    }
    return {
      ...user,
      profilePhoto: profilePhotoUrl,
    };
  }

  async getUsersWithSignedURL(users: SearchedUser[]): Promise<SearchedUser[]> {
    const usersWithSignedUrls = await Promise.all(
      users.map(async (user) => {
        let profilePhotoUrl = null;
        if (user.profilePhoto) {
          profilePhotoUrl = await this.s3Service.getObjectURL(user.profilePhoto);
        }
        return {
          ...user,
          profilePhoto: profilePhotoUrl,
        };
      }),
    );
    return usersWithSignedUrls;
  }

  async getPostWithMediaUrls({
    id,
    groupId,
    userId,
    createdAt,
    caption,
    media,
    location,
    comments,
    likes,
    isLiked,
    profilePhoto,
    username,
    name,
  }: PostWithMedia): Promise<PostWithMediaURL> {
    const mediaWithUrls = await Promise.all(media.map(this.getMediaWithSignedUrl.bind(this)));
    const profilePhotoUrl = profilePhoto ? await this.getSignedUrl(profilePhoto) : null;
    const result = {
      id,
      groupId,
      location,
      userId,
      comments,
      name,
      username,
      likes,
      isLiked,
      createdAt,
      caption,
      profilePhoto: profilePhotoUrl,
      media: mediaWithUrls,
    };
    return result;
  }

  private async getMediaWithSignedUrl({
    id,
    objectKey,
    postId,
    type,
  }: Media): Promise<MediaWithURL> {
    const signedUrl = await this.getSignedUrl(objectKey);
    return {
      id,
      postId,
      type,
      url: signedUrl,
    };
  }

  async getSignedUrl(key: string): Promise<string> {
    return this.s3Service.getObjectURL(key);
  }

  async getThumbnailsWithSignedUrls(
    thumbnails: ThumbnailResponse[],
  ): Promise<ThumbnailResponseWithURL[]> {
    const thumbnailsWithUrls = await Promise.all(
      thumbnails.map(async (thumbnailResponse) => {
        const dataWithUrls = await this.getThumbnailWithSignedUrls(thumbnailResponse.data);
        return {
          month: thumbnailResponse.month,
          year: thumbnailResponse.year,
          data: dataWithUrls,
        };
      }),
    );
    return thumbnailsWithUrls;
  }

  async checkPermissions(groupId: string, userId: string): Promise<void> {
    const [result] = await this.db
      .select({
        groupExists: groupsTable.id,
        isMember: membersTable.userId,
      })
      .from(groupsTable)
      .leftJoin(
        membersTable,
        and(eq(groupsTable.id, membersTable.groupId), eq(membersTable.userId, userId)),
      )
      .where(eq(groupsTable.id, groupId))
      .limit(1);

    if (!result) {
      throw new NotFoundError("Group");
    }

    if (!result.isMember) {
      throw new ForbiddenError("User not a member of this group");
    }
  }

  async uploadPostMedia(blobs: Blob[], groupId: string, userId: string): Promise<MediaResponse[]> {
    await this.checkPermissions(groupId, userId);
    const objectKeys: MediaResponse[] = await Promise.all(
      blobs.map(async (blob) => this.uploadMedia(blob, groupId, Tag.GROUP)),
    );
    return objectKeys;
  }

  async uploadUserMedia(blob: Blob, userId: string): Promise<MediaResponse> {
    return this.uploadMedia(blob, userId, Tag.USER);
  }

  private async uploadMedia(blob: Blob, id: string, tag: Tag): Promise<MediaResponse> {
    const objectTag = this.getObjectTag(tag, id);
    const objectKey = await this.s3Service.saveObject(
      blob,
      objectTag,
      this.getMediaType(blob.type),
    );
    return {
      objectKey,
      type: this.getMediaType(blob.type),
    };
  }

  private getObjectTag(tag: Tag, id: string): string {
    return `${tag}=${id}`;
  }

  private getMediaType = (mimeType: string): MediaType => {
    switch (true) {
      case mimeType.startsWith("image/"):
        return MediaType.PHOTO;
      case mimeType.startsWith("video/"):
        return MediaType.VIDEO;
      case mimeType.startsWith("audio/"):
        return MediaType.AUDIO;
      default:
        throw new BadRequestError("Invalid media type");
    }
  };

  private async getThumbnailWithSignedUrls(thumbnails: DayWithObjectKey[]): Promise<DayWithURL[]> {
    return Promise.all(
      thumbnails.map(async (dayWithObjectKey) => {
        const signedUrl = await this.s3Service.getObjectURL(dayWithObjectKey.objectKey);
        return {
          day: dayWithObjectKey.day,
          url: signedUrl,
        };
      }),
    );
  }

  getDBData(media: string, numSegments = 40): Promise<WaveForm> {
    return new Promise((resolve, reject) => {
      let length = 0;
      ffmpeg.ffprobe(media, (err: Error, metadata: FfprobeData) => {
        if (err) {
          return reject(new InternalServerError("Failed to Process Audio"));
        }

        if (!metadata || !metadata.format || !metadata.format.duration) {
          return reject(new InternalServerError("Invalid audio metadata"));
        }

        length = metadata.format.duration;
        const segmentDuration = length / numSegments;
        const dbData: number[] = new Array(numSegments).fill(0);
        let completedSegments = 0;

        for (let i = 0; i < numSegments; i++) {
          const timestamp = i * segmentDuration;
          ffmpeg(media)
            .setStartTime(timestamp)
            .setDuration(segmentDuration)
            .audioFilters("volumedetect")
            .format("null")
            .output("/dev/null")
            .on("error", () => {
              reject(new InternalServerError("processing audio has failed"));
            })
            .on("stderr", (stderrLine: string) => {
              if (stderrLine.includes("mean_volume:")) {
                const match = stderrLine.match(/mean_volume: ([-\d.]+) dB/);
                if (match && match[1]) {
                  dbData[i] = parseFloat(match[1]);
                }
              }
            })
            .on("end", () => {
              completedSegments++;
              if (completedSegments === numSegments) {
                length = Math.ceil(length)
                resolve({
                  length: length,
                  data: dbData,
                });
              }
            })
            .run();
        }
      });
    });
  }
}
