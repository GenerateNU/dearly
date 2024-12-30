import { Hono } from "hono";
import { StatusCode } from "hono/utils/http-status";
import { generateJWTForTesting } from "./test-token";
import { getConfigurations } from "../../config/config";
import { expect } from "@jest/globals";
import { HTTPRequest } from "../../constants/http";

interface Request {
  app: Hono;
  route: string;
  type?: HTTPRequest;
  requestBody?: Record<string, unknown>;
  queryParams?: Record<string, string>;
  headers?: Record<string, string>;
  autoAuthorized?: boolean;
}

export class TestBuilder {
  private response: Response | undefined;
  private type: HTTPRequest;
  private body: Record<string, unknown>;

  constructor() {
    this.response = undefined;
    this.type = HTTPRequest.GET;
    this.body = {};
  }

  // Make an async request and store the parsed JSON response
  async request({
    app,
    type = HTTPRequest.GET,
    route,
    requestBody,
    queryParams,
    headers = {},
    autoAuthorized = true,
  }: Request): Promise<TestBuilder> {
    this.type = type;

    // format query
    let requestedRoute = route;
    if (queryParams && Object.keys(queryParams).length > 0) {
      requestedRoute += TestBuilder.formatQuery(queryParams);
    }

    // format headers
    const extraHeaders = this.formatHeaders(autoAuthorized, headers);

    const options: RequestInit = {
      method: type,
      headers: extraHeaders,
      body: requestBody ? JSON.stringify(requestBody) : undefined,
    };

    this.response = await app.request(requestedRoute, options);

    // set body
    try {
      this.body = await this.response.json();
    } catch {
      this.body = {};
    }

    return this;
  }

  // Format headers based on autoAuthorized.
  private formatHeaders(
    autoAuthorized?: boolean,
    headers?: Record<string, string>,
  ): Record<string, string> {
    if (!autoAuthorized) {
      return {
        ...headers,
      };
    } else {
      return {
        Authorization: `Bearer ${generateJWTForTesting(getConfigurations().authorization.jwtSecretKey)}`,
        ...headers,
      };
    }
  }

  // Get the response ID (for non-DELETE requests)
  getResponseId(): string {
    if (this.type === HTTPRequest.DELETE) {
      throw new Error("Cannot retrieve id from DELETE request");
    }
    if (!this.body) {
      throw new Error("Response is not defined.");
    }
    return this.body.id as string;
  }

  // Assert that the status code matches the expected one
  assertStatusCode(code: StatusCode): TestBuilder {
    if (!this.response) {
      throw new Error("Response is not defined.");
    }
    expect(this.response.status).toBe(code);
    return this;
  }

  // Assert that field is not equal to a specific value
  assertFieldNotEqual(fieldName: string, expected: string): TestBuilder {
    if (!this.body) {
      throw new Error("Response is not defined.");
    }
    const actualValue = this.body[fieldName];
    expect(actualValue).not.toEqual(expected);
    return this;
  }

  // Assert a specific field in the response JSON matches the expected value
  assertField(fieldName: string, expected: string): TestBuilder {
    if (!this.body) {
      throw new Error("Response is not defined.");
    }
    const actualValue = this.body[fieldName];
    expect(actualValue).toBe(expected);
    return this;
  }

  // Assert that the entire response body matches the expected structure
  assertBody(expectedResponseBody: unknown): TestBuilder {
    if (!this.body) {
      throw new Error("Body is not defined.");
    }
    expect(this.body).toEqual(expectedResponseBody);
    return this;
  }

  // Assert that the response body is an array of the given size
  assertArraySize(arraySize: number): TestBuilder {
    if (!this.body) {
      throw new Error("Response is not defined.");
    }
    expect(Array.isArray(this.body)).toBe(true);
    expect(this.body.length).toBe(arraySize);
    return this;
  }

  // Assert that the response contains the specified message
  assertMessage(message: string): TestBuilder {
    if (!this.body || !this.response) {
      throw new Error("Response is not defined.");
    }
    const responseMessage = this.body.message || this.response.statusText;
    expect(responseMessage).toBe(message);
    return this;
  }

  assertError(errors: unknown): TestBuilder {
    if (!this.body || !this.response) {
      throw new Error("Response is not defined.");
    }
    const responseMessage = this.body.errors || this.body.error;
    expect(responseMessage).toEqual(errors);
    return this;
  }

  // Assert that a specific field exists in the response JSON
  assertFieldExists(fieldName: string): TestBuilder {
    if (!this.body) {
      throw new Error("Response is not defined.");
    }
    expect(this.body).toHaveProperty(fieldName);
    return this;
  }

  // Assert that multiple fields in the response body match the expected values
  assertFields(expectedFields: Record<string, unknown>): TestBuilder {
    if (!this.body) {
      throw new Error("Response is not defined.");
    }
    Object.entries(expectedFields).forEach(([fieldName, expectedValue]) => {
      expect(this.body![fieldName]).toBe(expectedValue);
    });
    return this;
  }

  // Debug method to log response details
  debug(): TestBuilder {
    if (!this.response) {
      throw new Error("Body is not defined.");
    }
    console.log("Response Body: ", JSON.stringify(this.body));
    return this;
  }

  // Private utility method to format query parameters into a query string
  private static formatQuery(params: Record<string, string>): string {
    return "?" + new URLSearchParams(params).toString();
  }
}
