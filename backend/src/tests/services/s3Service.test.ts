import { Hono } from "hono";
import { startTestApp } from "../helpers/test-app";
import { TestBuilder } from "../helpers/test-builder";
import { generateJWTFromID, generateUUID } from "../helpers/test-token";
import { HTTPRequest, Status } from "../../constants/http";
import { jest } from "@jest/globals";
import Mock from "node:test"
import S3Impl from "../../services/s3Service"
import { S3Client } from "@aws-sdk/client-s3";
import { mockClient } from "aws-sdk-client-mock"



const mockedClient: jest.Mock<() => S3Client> = jest.fn()

function testAddObject() {

    const mS3Instance = {
        deleteObject: jest.fn().mockReturnThis() as jest.Mock<(url: string) => void>,
        saveObject: jest.fn().mockReturnThis() as jest.Mock<(file: Blob, tag: string, fileType: "image" | "audio") => Promise<string | null>>,
        promise: jest.fn().mockReturnThis(),
        catch: jest.fn()
    };

    jest.mock('aws-sdk', () => {
        return { S3: jest.fn(() => mS3Instance) };
    });

    describe('should push object', () => {
        it('should upload correctly', async () => {
            const configService = {
                get: jest
                    .fn()
                    .mockReturnValueOnce('accessKeyId')
                    .mockReturnValueOnce('secretAccessKey')
                    .mockReturnValueOnce('us-east')
                    .mockReturnValueOnce('bucket-dev'),
            };
            mS3Instance.promise.mockResolvedValueOnce('fake response');
            const s3Service = new S3Impl(configService);
            const actual = await s3Service.upload('name', 'contentType', Buffer.from('ok'));
            expect(actual).toEqual('fake response');
            expect(mS3Instance.upload).toBeCalledWith({ Bucket: 'bucket-dev', Key: 'key', Body: Buffer.from('ok') });
        });
    });

}


class MockedS3 extends S3Client {
    function put<InputType extends ClientInput, OutputType extends ClientOutput>(command: Command<ClientInput, InputType, ClientOutput, OutputType, SmithyResolvedConfiguration<HandlerOptions>>, options?: HandlerOptions): Promise<OutputType>;
}





