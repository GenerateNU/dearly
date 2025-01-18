import { DeleteObjectCommand, PutObjectCommand, S3Client} from "@aws-sdk/client-s3"
import { getConfigurations } from "../config/config"
import { AppError, NotFoundError } from "../utilities/errors/app-error";
import { randomUUIDv7 } from "bun";
import { c } from "openapi-typescript";

interface IS3Operations {
    // group is the uuid of the group this photo is being sent to (used as tagging number) -> make public group id number
    saveObject(file: Blob, group: string): Promise<string | null> 
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


    async saveObject(file:Blob, group: string): Promise<string | null> {
        // to-do: compress blob, and deal with permission
        const objectKey:string = randomUUIDv7()
        await this.client.send(
            new PutObjectCommand({
                Bucket: this.bucketName,
                Key: objectKey,
                Body: "",
                Tagging:`GroupI=${group}`
            })
        )
        const url:string = "https://" + this.bucketName + ".s3.amazonaws.com/" + objectKey;
        return url;
    }   

    async deleteObject(url: string) {
        const indexOfDotCom = url.indexOf(".com/")
        const objectKey: string = url.substring(indexOfDotCom + 5)
        const res = await this.client.send(
            new DeleteObjectCommand({ Bucket: this.bucketName, Key: objectKey }),
        );

        if(res.$metadata.httpStatusCode! > 300){
            throw new NotFoundError(url)
        }

    }   
}