import {
  DayWithObjectKey,
  DayWithURL,
  ThumbnailResponse,
  ThumbnailResponseWithURL,
} from "./../../types/api/internal/groups";
import { IS3Operations } from "../../services/s3Service";
import { PostWithMedia, PostWithMediaURL } from "../../types/api/internal/posts";
import { SearchedUser, User } from "../../types/api/internal/users";
import { MediaType } from "../../constants/database";
import { Media, MediaResponse, MediaWithURL } from "../../types/api/internal/media";
import { BadRequestError } from "../../utilities/errors/app-error";

export interface MediaService {
  getPostWithMediaUrls(post: PostWithMedia): Promise<PostWithMediaURL>;
  getThumbnailsWithSignedUrls(thumbnails: ThumbnailResponse[]): Promise<ThumbnailResponseWithURL[]>;
  getUsersWithSignedURL(users: SearchedUser[]): Promise<SearchedUser[]>;
  getUserWithSignedURL(user: User): Promise<User>;
  uploadMedia(blobs: Blob[], groupId: string): Promise<MediaResponse[]>;
}

export class MediaServiceImpl {
  private s3Service: IS3Operations;

  constructor(s3Service: IS3Operations) {
    this.s3Service = s3Service;
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
  }: PostWithMedia): Promise<PostWithMediaURL> {
    const mediaWithUrls = await Promise.all(media.map(this.getMediaWithSignedUrl.bind(this)));
    return {
      id,
      groupId,
      userId,
      createdAt,
      caption,
      media: mediaWithUrls,
    };
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

  private async getSignedUrl(key: string): Promise<string> {
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

  async uploadMedia(blobs: Blob[], groupId: string): Promise<MediaResponse[]> {
    const objectKeys: MediaResponse[] = await Promise.all(
      blobs.map(async (blob) => {
        const objectKey = await this.s3Service.saveObject(
          blob,
          groupId,
          this.getMediaType(blob.type),
        );
        return {
          objectKey,
          type: this.getMediaType(blob.type),
        };
      }),
    );
    return objectKeys;
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
}
