# Frontend Practices

## 1. Component Design
| **Principle**                             | **Description**                                                                                                                                                          |
|-------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Variants for similar components       | For components with similar functionality but slight variations (e.g., buttons with different styles), create component variants.                                          |
| Use SVG over images                   | Prefer SVG images for scalability and better performance. They offer crisp quality on all screen sizes and are more flexible for styling (e.g., changing colors).         |
| Use a design system                   | A design system ensures consistent components, layouts, and themes across the app, including reusable UI components, color schemes, typography, and spacing rules.       |
| Avoid deeply nested props             | Avoid passing deeply nested props to child components. If needed, use a **context provider** or state management library to share data, keeping the hierarchy simple.      |
| Avoid hardcoding fixed dimensions     | Avoid hardcoded pixel values or absolute positioning. Use relative units (e.g., percentages, flexbox, grid) to make components more flexible across different screen sizes. |
| Component flexibility                 | Design components to be adaptable to different screen sizes. Don't hardcode padding or margins; let the consumer define spacing as needed.                               |

---

## 2. User Experience (UX)
| **Scenario**                                   | **Best Practices**                                                                                                                                                 |
|------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Data is loading or fails to load           | Show a spinner or skeleton screen during loading, and display an informative error message if the data cannot be fetched.                                         |
| User inputs invalid form data              | Provide real-time validation feedback by highlighting fields with errors, showing helpful error messages, and blocking form submission until fields are valid.     |
| User needs to enter text in a field        | Ensure the keyboard does not obscure input fields or buttons. Adjust the layout dynamically to keep inputs visible.                                               |
| Keyboard stays open after input            | Allow users to dismiss the keyboard by tapping outside input fields or through a “Done” button.                                                                  |
| User clicks a button to submit data        | Disable the button during pending actions like API calls or form submissions to prevent duplicate requests. Show a spinner or disabled state for visual feedback.  |
| Switching between tabs                     | Use smooth animations to guide the user’s attention and create a polished, responsive experience. Avoid abrupt changes.                                           |
| User taps a button or link                 | Ensure all touchable components provide visual feedback (e.g., color change, ripple effect) when interacted with, confirming the action was registered.            |
| App is used on different screen sizes      | Test responsiveness on various devices and screen sizes to ensure layouts adapt gracefully and remain functional.                                                 |

---

## 3. Tanstack Query & Common Use Cases
When creating a component and having it fetch data from backend endpoints to display to users, repeatedly calling endpoints leads to unnecessary network traffic and slow performance. To solve this problem, we use Tanstack Query library to efficiently handle data fetching, caching, synchronization, and error retries.

> [!NOTE]
> Below are some common use cases, but there may be others. For more details, please refer to [official documentation](https://tanstack.com/query/v5/docs/framework/react/overview).

### Common Hooks

| Hooks              | Use Case                                    | Key Features                                                                                                      | Example                                                                                                   |
|--------------------|---------------------------------------------|------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------|
| **useQuery**       | Fetch data with a GET API call             | - Requires `queryKey` (cache key) <br> - Requires `queryFn` (fetch function)                                     | [Code](#usequery-example)                                                                                |
| **useInfiniteQuery** | Fetch data with a paginated GET API call  | - Requires `queryKey` <br> - Requires `queryFn` that supports pagination <br> - Includes `getNextPageParam` for infinite loading | [Code](#useinfinitequery-example)                                                                        |
| **useMutation**    | Mutate data with POST/PUT/DELETE API calls | - Includes `mutationFn` <br> - Supports `onSuccess` and `onError` callbacks <br> - Can invalidate queries for refetching | [Code](#usemutation-example)                                                                             |


### Examples

#### `useQuery` Example

```ts
const useUser = (id: string) => {
  return useQuery({
    queryKey: ["users", id], // should match with API endpoint, in this case /users/:id
    queryFn: getUser(id), // API call
    // other options
  });
};

// Use in components and can conditionally render based on loading, error or success
const { data, isLoading, error } = useUser(id);
```

#### `useInfiniteQuery` Example

```ts
const useUserPosts = (id: string) => {
  return useInfiniteQuery({
    queryKey: ["users", id, "posts"], // API endpoint with route /users/:id/posts
    queryFn: async ({ pageParam = 1 }) => {
      const response = await queryFunction(id, pageParam);
      return response;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage?.length ? allPages.length + 1 : undefined;
    },
  });
};

// Use in components and can conditionally render based on loading, error or success
const { data, isLoading, isLoadingNextPage, error, fetchNextPage, isFetchingNextPage } =
  useUserPosts(id);
```

#### `useMutation` Example

```ts
const useCreatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ title, content }) => createPost({ title, content }), // API call for creating post
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["posts"],
      });
    },
    onError: (error: Error) => {
      console.error("Error creating post:", error.message);
    },
  });
};

// Use in a component
const { mutate, isPending, error } = useCreatePost(); // can disable button while isPending

const handleSubmit = () => {
  mutate({ title, content });
};
```
