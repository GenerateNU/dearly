import { DeleteObjectCommand, PutObjectCommand, S3Client} from "@aws-sdk/client-s3"
import { getConfigurations } from "../config/config"
import { AppError } from "../utilities/errors/app-error";

interface IS3Operations {
    saveObject(file: Blob): Promise<string | null> 
    deleteObject(url: string): Promise<AppError | null>
}


class S3Impl implements IS3Operations {
    private client;
    private bucketName

    public constructor() {
        const config = getConfigurations();
        const region = config.s3Config.bucketRegion;
        const secretKey = config.s3Config.seceretKey;
        const publicKey = config.s3Config.publicKey;
        this.bucketName = config.s3Config.bucketName;

        this.client = new S3Client({
            region: region,
            credentials: {
                accessKeyId: publicKey,
                secretAccessKey: secretKey
            }
        })
    }

    async saveObject(file:Blob): Promise<string | null> {

        return "";
    }   


    async deleteObject(url: string): Promise<AppError | null> {

        return null;
    }   
}