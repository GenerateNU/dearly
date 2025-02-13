import { LambdaClient, CreateFunctionCommand } from "@aws-sdk/client-lambda"; 
import { readFileSync } from "fs";
import { InternalServerError } from "../utilities/errors/app-error";

export interface NudgeLambda {
  // TODO: think about I/O type of this & more debugging
  getLambdaArn(): string | null;
  getLambdaRoleArn(): string | null;
}



// Creates one function per object
export class AWSLambda implements NudgeLambda {
  private lambda: LambdaClient;
  // TODO: fix how to deal with initializing these types
  private functionName: string | null = null;
  private lambdaARN: string | null = null;
  private lambdaRoleARN: string | null = null;

  constructor(lambdaClient: LambdaClient) {
    this.lambda = lambdaClient;
  }

  // TODO: Should create the function/should be initialized prior to passing it to the 
  async createSendNudgeFunction(functionName: string, zipFilePath: string) {
    this.functionName = functionName
    const zipFile = readFileSync(zipFilePath); // Read the pre-zipped function
    const command = new CreateFunctionCommand({
      FunctionName: this.functionName,
      Runtime: "nodejs18.x",
      Role: "roleArn", // TODO:
      Handler: "index.handler",
      Code: {
          ZipFile: zipFile, // Passing the ZIP file content
      },
    });

    const response = await this.lambda.send(command);

    const lambdaARN = response.FunctionArn ?? null
    const lambdaRoleARN = response.FunctionArn ?? null

    if(!lambdaARN || !lambdaRoleARN) {
      throw new InternalServerError();
    }

    this.lambdaARN = lambdaARN
    this.lambdaRoleARN = lambdaRoleARN

    // TODO: have some response for successfully creating function
    console.log("Lambda created:", response.FunctionArn);
  }

  getLambdaArn(): string | null {
    return this.lambdaARN
  }
  getLambdaRoleArn(): string | null {
    return this.lambdaRoleARN
  }
}