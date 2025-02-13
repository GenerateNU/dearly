import { LambdaClient, CreateFunctionCommand, Handler } from "@aws-sdk/client-lambda"; 
import { readFileSync } from "fs";
import Expo, { ExpoPushMessage } from "expo-server-sdk";

export const handler: Handler = async (event) => {
  const notifications: ExpoPushMessage[] = event.notifications;

  // TODO: better error handling + where should we put this lambda?
  try {
    await new Expo().sendPushNotificationsAsync(notifications);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Nudges sent successfully" }),
    };
  } catch {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Failed to send nudges" }),
    };
  }
};

export interface NudgeLambda {
  // TODO: think about I/O type of this & more debugging
  getLambdaArn(): string;
  getLambdaRoleArn(): string;
}

const SEND_NUDGE_LAMBDA_NAME = "sendNudgeNotification"

// Creates one function per object
export class AWSLambda implements NudgeLambda {
  private lambda: LambdaClient;
  private functionName: string;
  private lambdaARN: string;
  private lambdaRoleARN: string;

  constructor() {
    this.lambda = new LambdaClient();
  }

  // TODO: Should create the function/should be initialized prior to passing it to the 
  async createFunction(functionName: string, zipFilePath: string) {
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

    this.lambdaARN = response.FunctionArn

    // TODO: have some response for successfully creating function
    console.log("Lambda created:", response.FunctionArn);
  }

  getLambdaArn(): string {
    return this.lambdaARN
  }
  getLambdaRoleArn(): string {
    return this.lambdaRoleARN
  }
}