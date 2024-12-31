# **Backend Practices**

## Table of Contents
- [Working on Controllers and Routes](#working-on-controllers-and-routes)
- [Error Handling](#error-handling)
- [Write Integration Tests with Test Builder](#write-integration-tests-with-test-builder)

## **Working on Controllers and Routes**

### **Types**

We use OpenAPI to generate API types that we expose via the Dearly API. To get started, edit the `openapi.yaml` file found in the root directory. 

After making the necessary changes run: 

```bash 
task generate 
```

You can use the generated api types in `src/types/api`, just create a type alias for better readability. 
```ts 
export type CREATE_USER = TypedResponse<USER_API | API_ERROR>;
export type GET_USER = TypedResponse<USER_API | API_ERROR>;
export type PUT_USER = TypedResponse<USER_API | API_ERROR>;
export type DEL_USER = TypedResponse<
  paths["/api/v1/users/{id}"]["delete"]["responses"]["204"]["content"]["text/plain"] | API_ERROR
>;
```

Finally, reference these API types to strongly type the controllers 
```ts 
export interface UserController {
  createUser(ctx: Context): Promise<CREATE_USER>;
  getUser(ctx: Context): Promise<GET_USER>;
  updateUser(ctx: Context): Promise<PUT_USER>;
  deleteUser(ctx: Context): Promise<DEL_USER>;
}
```
-----

### **Payload Validation**

We can use DrizzleORM for quick and easy payload validation in controller layer using database schema, which automatically throws a **400 Bad Request** error on failure. For example:

```ts
// database user schema
const usersTable = pgTable("users", {
  id: uuid().primaryKey().defaultRandom(),
  firstName: varchar({ length: 255 }).notNull(),
  lastName: varchar({ length: 255 }).notNull(),
});

const createUserValidate = createInsertSchema(usersTable, {
  firstName: (schema) => schema.min(1), 
  lastName: (schema) => schema.min(1)
}).omit({ id: true });
// STRICTLY IGNORE ID if it is in the request body since createInsertSchema makes id field optional

// In a controller
const createUserPayload = createUserValidate.parse(await ctx.req.json());
```
-----

### **Payload Type and Return Type**

DrizzleORM also allows us to easily define payload and return types. We can utilize these types as payload type after parsing request body and return types for service and transaction methods.

```ts
const usersTable = pgTable("users", {
  id: uuid().primaryKey().defaultRandom(),
  firstName: varchar({ length: 255 }).notNull(),
  lastName: varchar({ length: 255 }).notNull(),
});

// Payload type for creating or updating a user
type CreateUserPayload = typeof usersTable.$inferInsert;
type UpdateUserPayload = Partial<typeof usersTable.$inferInsert>;

// Type for retrieving and returning a user
type User = typeof usersTable.$inferSelect;
```
---

## **Error Handling**

> [!NOTE]
> For more implementation details, please see utilities/errors.

### **App Error Handling**

#### **Concept**

- **AppError** handles expected HTTP request errors (e.g., 404, 400, 500, 403, 409).
- **AppError** is an interface that extends Error, and NotFoundError, InternalServerError, BadRequestError, ConflictError, ForbiddenError are classes that implement AppError. We create interface AppError and error classes to ensure consistent error handling.
- **AppError** is thrown in the **service layer** and caught in the **controller layer** to format the output.

> [!NOTE]
> - When writing controllers or tests, please use `Status` and `HTTPRequest` enums in **constants/http.ts** and classes of `AppError` so that we can standardize the handling of HTTP status codes and request methods throughout the application. 
> - We can add more AppError and change enums if necessary. 
> - You will see them being used in error handling and testing below.

#### **Error Classes**

```ts
// NotFoundError (404)
throw new NotFoundError(); // default error.message = "Resource not found";
throw new NotFoundError("User"); // error.message = "User not found";
throw new NotFoundError("Whatever", "Cannot find user"); // second field override - error.message = "Cannot find user";

// InternalServerError (500)
throw new InternalServerError(); // default error.message = "Internal Server Error"
throw new InternalServerError("Server is down!"); // error.message = "Server is down!"

// BadRequestError (400)
throw new BadRequestError(); // default error.message = "Bad Request"
throw new BadRequestError("Invalid ID format"); // error.messag = "Invalid ID format"

// ConflictError (409)
throw new ConflictError(); // default error.message = "Conflict"
throw new ConflictError("Email already exists"); // error.message = "Email already exists"

// ForbiddenError (403)
throw new ForbiddenError(); // default error.message = "Forbidden"
throw new ForbiddenError("You do not have the rights to edit this"); // error.message = "You do not have rights to edit this"
```

#### **Error Properties**

```ts
const error = new NotFoundError();
console.log(error.message); // "Resource not found"
console.log(error.getStatusCode()); // 404
console.log(error.name); // "NotFoundError"
```

#### **Error Handling in Controllers**

We can reuse `handleAppError` in **controllers** to catch the [Service Errors](#service-error-handling) and format output JSON for HTTP errors. For example:

```ts
async createUser(ctx: Context): Promise<CREATE_USER> {
  const createUserImpl = async () => {
    const payload = createUserValidate.parse(await ctx.req.json());
    const user = await this.userService.createUser(payload);
    return ctx.json(user, Status.Created);
  };
  return await handleAppError(createUserImpl)(ctx);
}
```
-----

### **Service Error Handling**

#### **Concept**

- **Service Errors** are errors that are specific to the business logic of the app, it can include database error or external service errors (such as failing to upload a photo to AWS S3).
- These errors are caught in the **service layer** and will be converted into **AppError** for the controller.

#### **Implementation**

We can reuse `handleServiceError` in all services to catch the service errors and convert service errors into AppError. For example:

```ts
async getUser(id: string): Promise<User> {
  const getUserImpl = async () => {
    const user = await this.userTransaction.selectUser(id);
    if (!user) {
      throw new NotFoundError("User");
    }
    return user;
  };
  return handleServiceError(getUserImpl)();
}
```
> [!NOTE]
> Currently **`handleServiceError`** only handles database errors, but if we incorporate external services (e.g. AWS S3), we can modify this to account for more service-related errors.

---

## **Write Integration Tests with Test Builder**

### **Purpose**

Integration tests ensure components work correctly together, validating end-to-end workflows and preventing regressions. But writing integration tests can even take more time than implementation, and very difficult to go back to modify when schema changes.

> [!NOTE]
> If you find any bugs in the test builder, or there are any methods we should have, please reach out so we can improve the test builder!

### **Test Builder Overview**

- Facilitates quick testing and maintains clean test code.
- Easy to write tests before implementation and easy to modify.
- We also have some helper functions that are not part of test builder but can be used when needed.
  - `generateUUID`: generate a valid UUID (can be used for testing NotFoundError)
  - `generateJWTForTesting`: generate a valid JWT for authorization

### **1. Test Setup**

```ts
let app: Hono;
const testBuilder = new TestBuilder(); // create the test builder

beforeEach(async () => {
  // we can use startTestApp to create "fake" app that mirrors our server
  app = await startTestApp();
});
```

### **2. Making HTTP Requests**

Structure of a request:

```ts
interface Request {
  app: Hono; // Instance of test app
  route: string; // API endpoint (e.g., "/api/v1/users")
  type?: HTTPRequest; // HTTP method enum (default: HTTPRequest.GET)
  requestBody?: Record<string, unknown>; // Body for POST/PUT
  queryParams?: Record<string, string>; // Query parameters for GET query endpoint
  headers?: Record<string, string>; // Request headers
  autoAuthorized?: boolean; // Default: true (generates JWT automatically)
}
```

#### **Examples**

1. **Auto-Authorized Request**: don't need to worry about being authorized since autoAuthorized is default to true

   ```ts
   await testBuilder.request({
     app,
     type: HTTPRequest.POST,
     route: "/api/v1/users",
     requestBody: { firstName: "Jane", lastName: "Doe" },
   });
   ```

2. **Manually Providing JWT**: without providing the Authorization headers, the request will return 401 since autoAuthorized is set to false. We can manually authorize through generating a valid JWT using `generateJWTForTesting`.
   ```ts
   await testBuilder.request({
     app,
     type: HTTPRequest.POST,
     route: "/api/v1/users",
     requestBody: { firstName: "Jane", lastName: "Doe" },
     headers: { Authorization: `Bearer ${generateJWTForTesting()}` },
     autoAuthorized: false,
   });
   ```

### **3. Assertions**

Available chaining methods:

```ts
// Assert response status code
assertStatusCode(code: StatusCode)

// Assert a response body's field has the expected value
assertField(fieldName: string, expected: string)

// Assert a response body's field does not match a specific value
assertFieldNotEqual(fieldName: string, value: string)

// Assert the response body matches expected body
assertBody(expectedResponseBody: unknown)

// Assert a field name exists in response body
assertFieldsExists(fieldName: string)

// Assert multiple fields have a certain value
assertFields(fields: Record<string, unknown>)

// Assert response body is an array and has the expected size
assertArraySize(size: number)

// Assert response body has statusText or a field called message in body and match with expected message
assertMessage(msg: string)

// Assert response body has a field called error(s) in response body and match with the expected error
assertError(errors: unknown)

// Debugging
debug() // Logs response body

// Extract ID
getResponseId() // Non-chainable, pulls the 'id' field from the response
```

---

### **Examples** (see /tests/user for more fleshed-out test examples)

> [!NOTE]
> `request` method is async, so we will have to await it and wrap it with parentheses to enable chaining more methods

In the examples, the request body should contain 2 fields: firstName, lastName. Returned response body should contain firstName, lastName, and id.

1. **POST and GET Workflow**

```ts
// Create a new user and get the ID
const responseId = (
  await testBuilder.request({
    app,
    type: HTTPRequest.POST,
    route: "/api/v1/users",
    requestBody: {
      firstName: "Jane",
      lastName: "Doe",
    },
  })
)
  .assertStatusCode(Status.Created)
  .getResponseId();

// assert that request body has the correct id
testBuilder
  .assertBody({
    id: responseId,
    firstName: "Jane",
    lastName: "Doe",
  });

// get the user with id
(
  await testBuilder.request({
    app,
    route: `/api/v1/users/${responseId}`,
  })
)
  .assertBody({
    firstName: "Jane",
    lastName: "Doe",
    id: responseId,
  })
  .assertStatusCode(Status.OK);
```

2. **Validation Error**

```ts
(
  await testBuilder.request({
    app,
    type: HTTPRequest.POST,
    route: "/api/v1/users",
    requestBody: { firstName: "Jane", id: `${generateUUID()}` }, // Missing lastName
  })
)
  .assertStatusCode(Status.BadRequest)
  .assertError([{ 
    path: "lastName", 
    message: "Required" 
  }])
  .assertMessage("Validation failed")
  .debug();
```

Since we are calling `debug`, it will show in the console:

```
Response Body:  {"message":"Validation failed","errors":[{"path":"lastName","message":"Required"}]}
```
