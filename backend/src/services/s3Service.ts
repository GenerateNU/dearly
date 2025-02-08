import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { InternalServerError, NotFoundError } from "../utilities/errors/app-error";
import sharp from "sharp";
import ffmpeg from "fluent-ffmpeg";
import { MediaType } from "../constants/database";
import { Configuration } from "../types/config";
import { v4 as uuidv4 } from "uuid";
import logger from "../utilities/logger";
import { PassThrough, Readable } from "stream";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
ffmpeg.setFfmpegPath(ffmpegInstaller.path);
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
   * @returns A promise of the buffer of the newly compressed image
   */
  async compressImage(file: Blob): Promise<Buffer> {
    const imageBuffer = await file.arrayBuffer();
    return await sharp(Buffer.from(imageBuffer)).jpeg({ quality: 80 }).toBuffer();
  }

  /**
   * Will compress a given blob so that it takes up less storage and reduces load times
   * @param file The audio blob that will be compressed
   * @returns A promise of a buffer of the newly compressed audio recording
   *
   * Number of channels: how many separate audio signals it contains
   * - Mono: Single audio track (same sound in both ears/speakers).
   * - Stereo: Two separate tracks (left & right channels for spatial sound).
   * Bit depth: Number of bits used per sample to represent audio amplitude (volume precision, noise floor).
   * - higher bit depth leads to larger file size
   * Sample rate refers to the number of samples taken per sec to represent a continuous audio signal (how accurately sound is captured).
   * - higher sample rate leads to larger file size
   */
  async compressAudio(file: Blob): Promise<Buffer> {
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    return new Promise((resolve, reject) => {
      const inputStream = Readable.from(fileBuffer);
      const outputStream = new PassThrough();
      const chunks: Buffer[] = [];

      ffmpeg(inputStream)
        .audioFrequency(44100)
        .audioCodec("libmp3lame")
        .audioFilters([
          // boosts the sound around 1000 Hz (mid-range), making it clearer
          "equalizer=f=1000:t=q:w=1:g=10",
          // adjusts the overall loudness of the track to match a specific loudness standard
          "loudnorm=I=-16:LRA=11:TP=-1.5",
          // reduces background noise
          "afftdn",
          // trims silence
          "silenceremove=1:0:-50dB",
          // reduces loud sounds that are too high and makes soft sounds louder
          "acompressor=threshold=-20dB:ratio=4:attack=2:release=100",
          // converts stereo sound (left and right channels) into a single mono sound (one channel)
          "pan=mono|c0=c0+c1",
        ])
        .audioQuality(5)
        .format("mp3")
        .on("error", (err) => reject(err))
        .on("end", () => resolve(Buffer.concat(chunks)))
        .pipe(outputStream);

      outputStream.on("data", (chunk) => chunks.push(chunk));
      outputStream.on("end", () => resolve(Buffer.concat(chunks)));
    });
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
    try {
      await this.client!.send(
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: objectKey,
          Body: compressedFile,
          ContentType: file.type,
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
        ResponseContentDisposition: "inline",
      });
      const request = await getSignedUrl(this.client, command, { expiresIn: waitInSeconds });
      return request;
    } catch (error) {
      logger.error(error);
      throw new InternalServerError("Failed to retrieve signed url");
    }
  }
}
