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
    // First, decode the audio file to get raw PCM data
    const audioContext = new (window.AudioContext)();
    
    // Read the file as an ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    
    // Decode the audio data
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    
    // Get the raw PCM data from the audio buffer
    const channelData = audioBuffer.getChannelData(0); // Get first channel
    
    // Convert Float32Array to Int16Array (required format for MP3 encoding)
    const samples = new Int16Array(channelData.length);
    for (let i = 0; i < channelData.length; i++) {
        // Convert float to int16
        const s = Math.max(-1, Math.min(1, channelData[i]!));
        samples[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    
    // Get the sample rate, default to 44100 if undefined
    const sampleRate = audioBuffer.sampleRate || 44100;
    
    // Initialize the MP3 encoder with the correct sample rate
    const mp3encoder = new lame.Mp3Encoder(1, sampleRate, 128);
    
    const compressedAudio = [];
    
    // Encode the buffer in chunks to avoid memory issues
    const chunkSize = 1152; // Must be a multiple of 576 for MP3 encoding
    for (let i = 0; i < samples.length; i += chunkSize) {
        const chunk = samples.slice(i, i + chunkSize);
        const mp3Chunk = mp3encoder.encodeBuffer(chunk);
        if (mp3Chunk && mp3Chunk.length > 0) {
            compressedAudio.push(mp3Chunk);
        }
    }
    
    // Flush the encoder and add any remaining data
    const finalChunk = mp3encoder.flush();
    if (finalChunk && finalChunk.length > 0) {
        compressedAudio.push(finalChunk);
    }
    
    // Create and return the final Blob
    return new Blob(compressedAudio, { type: 'audio/mp3' });
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
        ResponseContentDisposition: 'inline',
      });
      const request = await getSignedUrl(this.client, command, { expiresIn: waitInSeconds });
      return request;
    } catch (error) {
      logger.error(error);
      throw new InternalServerError("Failed to retrieve signed url");
    }
  }
}
