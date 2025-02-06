import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { InternalServerError, NotFoundError } from "../utilities/errors/app-error";
import sharp from "sharp";
import * as lame from "@breezystack/lamejs";
import { MediaType } from "../constants/database";
import { Configuration } from "../types/config";
import { v4 as uuidv4 } from "uuid";
import logger from "../utilities/logger";

export interface IS3Operations {
  // group is the uuid of the group this photo is being sent to (used as tagging number) -> make public group id number

  /**
   * Will save a blob to s3 with some image type and and tag.
   * @param file the file that will be saved to S3
   * @param tag the tag that will be associated with the file
   * @param fileType The type of the blob sent to the endpoint
   * @returns Will return the object key of the object in S3
   */
  saveObject(file: Blob, tag: string, fileType: MediaType): Promise<string>;

  /**
   * Will delete an object from S3 with the given S3 URL.
   * @param objectID The object key of the object that will be deleted
   * @throws NotFoundError: if the object was not able to be deleted
   * @returns returns true is the object was able to be deleted, and false otherwise
   */
  deleteObject(objectID: string): Promise<boolean>;

  /**
   * Will retrive the presigned URL of the given object associated with the given object ID
   * @param objectKey The key of the object in the S3 bucket
   */
  getObjectURL(objectKey: string): Promise<string>;
}

export class S3Impl implements IS3Operations {
  private client;
  private bucketName;

  public constructor(config: Configuration["s3Config"], client?: S3Client) {
    const region = config.region;
    const secretKey = config.secretKey;
    const publicKey = config.publicKey;
    this.bucketName = config.name;

    if (!client) {
      this.client = new S3Client({
        region: region,
        credentials: {
          accessKeyId: publicKey,
          secretAccessKey: secretKey,
        },
      });
    } else {
      this.client = client;
    }
  }

  /**
   * Will compress a given blob so that it takes up less storage and reduces load times
   * NOTE: Use the optional argument: imageQuality if your image needs to have higher/lower quality
   * In general small images can lower qualities but less than 40 is not recomended
   * @param file The blob that will be compressed
   * @param imageQuality The quality of the image [0, 100]
   * @returns A promise of the blob of the newly compressed image
   */
  async compressImage(file: Blob): Promise<Blob> {
    const imageBuffer = await file.arrayBuffer();
    const compressedImage = await sharp(imageBuffer).jpeg({ quality: 80 }).toBuffer();
    return new Blob([compressedImage]);
  }

  /**
   * Will compress a given blob so that it takes up less storage and reduces load times
   * @param file The audio blob that will be compressed
   * @returns A promise of a blob of the newly compressed audio recording
   */
  async compressAudio(file: Blob): Promise<Blob> {
    const compressedAudio = []; // holds the final compressed audio
    const mp3encoder = new lame.Mp3Encoder(1, 44100, 128);
    const audioBuffer: ArrayBuffer = await file.arrayBuffer();
    const audioBufferInt16 = new Int16Array(audioBuffer, 0, Math.floor(audioBuffer.byteLength / 2));
    let mp3Tmp = mp3encoder.encodeBuffer(audioBufferInt16);

    compressedAudio.push(mp3Tmp);
    // flush the mp3encoder so that any remaining data is also pushed into the final
    // compressed audio
    mp3Tmp = mp3encoder.flush();
    compressedAudio.push(mp3Tmp);
    return new Blob(compressedAudio);
  }

  /**
   * Will save a blob to s3 with some image type and and tag.
   * @param file the file that will be saved to S3
   * @param tag the tag that will be associated with the file
   * @param fileType The type of the blob sent to the endpoint
   * @returns Will return the S3 object key
   */
  async saveObject(file: Blob, tag: string, fileType: MediaType): Promise<string> {
    const objectKey: string = uuidv4();
    const compressedFile =
      fileType == MediaType.PHOTO ? await this.compressImage(file) : await this.compressAudio(file);
    const fileBuffer = await this.blobToBuffer(compressedFile);
    try {
      await this.client!.send(
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: objectKey,
          Body: fileBuffer,
          Tagging: `GroupID=${tag}`,
        }),
      );
      return objectKey;
    } catch (error) {
      logger.error(error);
      throw new InternalServerError("Unable to upload media to S3");
    }
  }

  private async blobToBuffer(blob: Blob): Promise<Buffer> {
    const arrayBuffer = await blob.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  /**
   * Will delete an object from S3 with the given S3 objectKey.
   * @param url The URL of the object that will be deleted
   * @throws NotFoundError: if the object was not able to be deleted
   */
  async deleteObject(url: string): Promise<boolean> {
    const indexOfDotCom = url.indexOf(".com/");
    const objectKey: string = url.substring(indexOfDotCom + 5);

    try {
      const res = await this.client!.send(
        new DeleteObjectCommand({ Bucket: this.bucketName, Key: objectKey }),
      );
      if (res.$metadata.httpStatusCode! > 300) {
        throw new NotFoundError(url);
      }
      return true;
    } catch (error) {
      logger.error(error);
      throw new InternalServerError("Unable to delete media from S3");
    }
  }

  /**
   * Will retrive the presigned URL of the given object associated with the given object ID
   * @param objectKey The key of the object in the S3 bucket
   */
  async getObjectURL(objectKey: string): Promise<string> {
    try {
      const waitInSeconds = 60 * 60 * 24;
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: objectKey,
      });
      const request = await getSignedUrl(this.client, command, { expiresIn: waitInSeconds });
      return request;
    } catch (error) {
      logger.error(error);
      throw new InternalServerError("Failed to retrieve signed url");
    }
  }
}
