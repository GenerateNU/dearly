import {
  DayWithObjectKey,
  DayWithURL,
  ThumbnailResponse,
  ThumbnailResponseWithURL,
} from "./../../types/api/internal/groups";
import { IS3Operations } from "../../services/s3Service";
import {
  Media,
  MediaWithURL,
  PostWithMedia,
  PostWithMediaURL,
} from "../../types/api/internal/posts";
import { SearchedUser, User } from "../../types/api/internal/users";
import { MediaType } from "../../constants/database";

export interface MediaService {
  getPostWithMediaUrls(post: PostWithMedia): Promise<PostWithMediaURL>;
  getThumbnailsWithSignedUrls(thumbnails: ThumbnailResponse[]): Promise<ThumbnailResponseWithURL[]>;
  getUsersWithSignedURL(users: SearchedUser[]): Promise<SearchedUser[]>;
  getUserWithSignedURL(user: User): Promise<User>;
  uploadMedia(media: Blob[]): Promise<string[]>;
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

  async uploadMedia(blobs: Blob[]): Promise<string[]> {
    return [];
  }

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
