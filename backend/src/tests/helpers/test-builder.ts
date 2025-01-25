import { Hono } from "hono";
import { StatusCode } from "hono/utils/http-status";
import { expect } from "@jest/globals";
import { HTTPRequest } from "../../constants/http";
import { generateJWTFromID, generateUUID } from "./test-token";

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
  private body: Record<string, unknown> | undefined;
  private text: string | undefined;

  constructor() {
    this.response = undefined;
    this.type = HTTPRequest.GET;
    this.body = {};
  }

  /**
   * Make a HTTP request and store the response
   */
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
    const requestedRoute = this.buildRoute(route, queryParams);
    const extraHeaders = this.buildHeaders(autoAuthorized, headers);

    const options: RequestInit = {
      method: type,
      headers: extraHeaders,
      body: requestBody ? JSON.stringify(requestBody) : undefined,
    };

    this.response = await app.request(requestedRoute, options);
    await this.parseResponse();

    return this;
  }

  /**
   * Parse the response into JSON and text formats, if possible.
   */
  private async parseResponse(): Promise<void> {
    if (!this.response) return;

    try {
      this.body = await this.response.json();
    } catch {
      this.body = undefined;
    }

    try {
      this.text = await this.response.text();
    } catch {
      this.text = undefined;
    }
  }

  /**
   * Build the full route with query parameters.
   */
  private buildRoute(route: string, queryParams?: Record<string, string>): string {
    if (!queryParams || Object.keys(queryParams).length === 0) return route;
    const query = new URLSearchParams(queryParams).toString();
    return `${route}?${query}`;
  }

  /**
   * Build request headers, including optional auto-authorization.
   */
  private buildHeaders(autoAuthorized: boolean, headers: Record<string, string>): Headers {
    const resultHeaders = new Headers(headers);

    if (autoAuthorized) {
      const token = generateJWTFromID(generateUUID());
      resultHeaders.set("Authorization", `Bearer ${token}`);
    }

    resultHeaders.set("Content-Type", "application/json");
    return resultHeaders;
  }

  /**
   * Get the response ID (for non-DELETE requests)
   */
  getResponseId(): string {
    if (this.type === HTTPRequest.DELETE) {
      throw new Error("Cannot retrieve id from DELETE request");
    }
    if (!this.body) {
      throw new Error("Response is not defined.");
    }
    return this.body.id as string;
  }

  /**
   * Assert that the status code matches the expected one
   */
  assertStatusCode(code: StatusCode): TestBuilder {
    if (!this.response) {
      throw new Error("Response is not defined.");
    }
    expect(this.response.status).toBe(code);
    return this;
  }

  /**
   * Assert that return text matches expected text
   */
  assertResponseText(message: string): TestBuilder {
    if (!this.text) {
      throw new Error("Text is not defined");
    }
    expect(this.text).toBe(message);
    return this;
  }

  /**
   * Assert that field is not equal to a specific value
   */
  assertFieldNotEqual(fieldName: string, expected: unknown): TestBuilder {
    if (!this.body) {
      throw new Error("Response is not defined.");
    }
    const actualValue = this.body[fieldName];
    if (Array.isArray(expected) && Array.isArray(actualValue)) {
      // Handle array comparison (exact match)
      expect(actualValue).not.toEqual(expect.arrayContaining(expected));
      expect(expected).not.toEqual(expect.arrayContaining(actualValue));
    } else {
      // For non-array types, use deep equality check
      expect(actualValue).not.toEqual(expected);
    }
    return this;
  }

  /**
   * Assert a specific field in the response JSON matches the expected value
   */
  assertField(fieldName: string, expected: unknown): TestBuilder {
    if (!this.body) {
      throw new Error("Response is not defined.");
    }
    const actualValue = this.body[fieldName];
    if (Array.isArray(expected) && Array.isArray(actualValue)) {
      // Handle array comparison (exact match)
      expect(actualValue).toEqual(expect.arrayContaining(expected));
      expect(expected).toEqual(expect.arrayContaining(actualValue));
    } else {
      // For non-array types, use deep equality check
      expect(actualValue).toEqual(expected);
    }
    return this;
  }

  /**
   * Assert that the entire response body matches the expected structure
   */
  assertBody(expectedResponseBody: unknown): TestBuilder {
    if (!this.body) {
      throw new Error("Body is not defined.");
    }
    expect(this.body).toEqual(expectedResponseBody);
    return this;
  }

  /**
   * Assert that the response body is an array of the given size
   */
  assertArraySize(arraySize: number): TestBuilder {
    if (!this.body) {
      throw new Error("Response is not defined.");
    }
    expect(Array.isArray(this.body)).toBe(true);
    expect(this.body.length).toBe(arraySize);
    return this;
  }

  /**
   * Assert that the response contains the specified message field and match with expected message
   */
  assertMessage(message: string): TestBuilder {
    if (!this.body || !this.response) {
      throw new Error("Response is not defined.");
    }
    const responseMessage = this.body.message || this.response.statusText;
    expect(responseMessage).toBe(message);
    return this;
  }

  /**
   * Assert that the response contains error(s) field and matches with expected error(s)
   */
  assertError(errors: unknown): TestBuilder {
    if (!this.body || !this.response) {
      throw new Error("Response is not defined.");
    }
    const responseMessage = this.body.errors || this.body.error;
    expect(responseMessage).toEqual(errors);
    return this;
  }

  /**
   * Assert that a specific field exists in the response JSON
   */
  assertFieldExists(fieldName: string): TestBuilder {
    if (!this.body) {
      throw new Error("Response is not defined.");
    }
    expect(this.body).toHaveProperty(fieldName);
    return this;
  }

  /**
   * Assert that multiple fields in the response body match the expected values
   */
  assertFields(expectedFields: Record<string, unknown>): TestBuilder {
    if (!this.body) {
      throw new Error("Response is not defined.");
    }
    Object.entries(expectedFields).forEach(([fieldName, expectedValue]) => {
      expect(this.body![fieldName]).toBe(expectedValue);
    });
    return this;
  }

  /**
   * Debug method to log response details
   */
  debug(): TestBuilder {
    if (!this.body) {
      throw new Error("Body is not defined.");
    }
    console.log("Response Body: ", JSON.stringify(this.body));
    return this;
  }
}
