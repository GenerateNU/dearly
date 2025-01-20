import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3"
import { getConfigurations } from "../config/config"
import { NotFoundError } from "../utilities/errors/app-error";
import { randomUUIDv7 } from "bun";
import sharp from "sharp"
import * as lame from '@breezystack/lamejs';

interface IS3Operations {
    // group is the uuid of the group this photo is being sent to (used as tagging number) -> make public group id number
    saveObject(file: Blob, group: string, fileType: "image" | "recording"): Promise<string | null>
    deleteObject(url: string): void
}



class S3Impl implements IS3Operations {
    private client;
    private bucketName

    public constructor() {
        const config = getConfigurations();
        const region = config.s3Config.region;
        const secretKey = config.s3Config.secretKey;
        const publicKey = config.s3Config.publicKey;
        this.bucketName = config.s3Config.name;

        this.client = new S3Client({
            region: region,
            credentials: {
                accessKeyId: publicKey,
                secretAccessKey: secretKey
            }
        })
    }

    async saveObject(file: Blob, group: string, fileType: string): Promise<string | null> {
        // to-do: compress blob, and deal with permission
        const objectKey: string = randomUUIDv7()
        await this.client.send(
            new PutObjectCommand({
                Bucket: this.bucketName,
                Key: objectKey,
                Body: "",
                Tagging: `GroupI=${group}`
            })
        )
        const url: string = "https://" + this.bucketName + ".s3.amazonaws.com/" + objectKey;
        return url;
    }

    /**
     * Will compress a given blob so that it takes up less storage and reduces load times
     * NOTE: Use the optional argument: imageQuality if your image needs to have higher/lower quality
     * In general small images can lower qualities but less than 40 is not recomended
     * @param file The blob that will be compressed
     * @param imageQuality The quality of the image [0, 100]
     * @returns A promise of the blob is the newly compressed image
     */
    async compressImage(file: Blob, imageQuality: number = 80): Promise<Blob> {
        const imageBuffer: ArrayBuffer = await file.arrayBuffer()
        const compressedImageArr = await sharp(imageBuffer)
            .jpeg({ quality: imageQuality })
            .toArray()

        return new Blob(compressedImageArr)
    }

    /**
     * Will compress a given blob so that it takes up less storage and reduces load times
     * @param file The audio blob that will be compressed
     * @returns A promise of the blob is the newly compressed audio recording
     */
    async compressAudio(file: Blob, imageQuality: number = 80): Promise<Blob> {
        var compressedAudio= [] // holds the final compressed audio
        const mp3encoder = new lame.Mp3Encoder(1, 44100, 128); 
        const audioBuffer: ArrayBuffer = await file.arrayBuffer()
        const audioBufferInt16 = new Int16Array(audioBuffer, 0, Math.floor(audioBuffer.byteLength / 2));
        var mp3Tmp = mp3encoder.encodeBuffer(audioBufferInt16); 

        compressedAudio.push(mp3Tmp);
        // flush the mp3encoder so that any remaining data is also pushed into the final 
        // compressed audio
        mp3Tmp = mp3encoder.flush()
        compressedAudio.push(mp3Tmp)
        return new Blob(compressedAudio)
    }

  

    async deleteObject(url: string) {
        const indexOfDotCom = url.indexOf(".com/")
        const objectKey: string = url.substring(indexOfDotCom + 5)
        const res = await this.client.send(
            new DeleteObjectCommand({ Bucket: this.bucketName, Key: objectKey }),
        );

        if (res.$metadata.httpStatusCode! > 300) {
            throw new NotFoundError(url)
        }

    }
}