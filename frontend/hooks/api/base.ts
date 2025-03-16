import {
  MutationFunction,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";

/**
 * Custom hook to handle basic queries.
 *
 * @param key - The query key used for caching and tracking.
 * @param queryFn - The function that fetches data (returns a Promise).
 * @param options - Additional configuration options for the query (excluding queryKey).
 * @returns - The result from the useQuery hook.
 */
export const useQueryBase = <T>(
  key: string[],
  queryFn: () => Promise<T>,
  options: Omit<UseQueryOptions<T, Error>, "queryKey"> = {},
) => {
  return useQuery<T, Error>({
    queryKey: key,
    queryFn,
    ...options,
  });
};

/**
 * Custom hook for paginated queries.
 *
 * @param key - The query key used for caching and tracking.
 * @param queryFunction - The query function that fetches paginated data.
 * @param options - Additional options for the query.
 * @param limit - The number of items to fetch per page.
 * @returns The result from the useInfiniteQuery hook.
 */
export const useQueryPagination = <T>(
  key: string[],
  queryFunction: (limit: number, page: number) => Promise<T>,
  options: any = {},
  limit: number = 10,
) => {
  return useInfiniteQuery<T, Error>({
    queryKey: key,
    queryFn: async ({ pageParam = 1 }) => {
      return queryFunction(limit, pageParam as number);
    },
    initialPageParam: 1,
    keepPreviousData: true,
    getNextPageParam: (lastPage, allPages) => {
      return Array.isArray(lastPage) && lastPage.length > 0 ? allPages.length + 1 : undefined;
    },
    ...options,
  });
};

/**
 * Custom hook for paginated queries with id paramter.
 * TODO: should this be combines with upper function for less repeated code?
 *
 * @param key - The query key used for caching and tracking.
 * @param id - the related id queries should be made from
 * @param queryFunction - The query function that fetches paginated data.
 * @param options - Additional options for the query.
 * @param limit - The number of items to fetch per page.
 * @returns The result from the useInfiniteQuery hook.

 */
export const useQueryPaginationWithID = <T>(
  key: string[],
  id: string,
  queryFunction: (id: string, limit: number, page: number) => Promise<T>,
  options: any = {},
  limit: number = 10,
) => {
  return useInfiniteQuery<T, Error>({
    queryKey: key,
    queryFn: async ({ pageParam = 1 }) => {
      return queryFunction(id, limit, pageParam as number);
    },
    initialPageParam: 1,
    keepPreviousData: true,
    getNextPageParam: (lastPage, allPages) => {
      return Array.isArray(lastPage) && lastPage.length > 0 ? allPages.length + 1 : undefined;
    },
    ...options,
  });
};

interface ToggleBaseOptions<T, P> {
  initialState: boolean;
  data: T | undefined;
  checkIsActive: (data: T) => boolean;
  mutation: {
    mutateAsync: (params: P) => Promise<any>;
    isPending?: boolean;
  };
  mutationParams: P;
}

/**
 * Custom hook to handle toggle functionality with mutation support.
 *
 * @param initialState - The initial state of the toggle (active/inactive).
 * @param data - The data used to determine the state of the toggle (e.g., check if active).
 * @param checkIsActive - A function to check if the data represents an active state.
 * @param mutation - The mutation object used for the toggle operation (e.g., to enable/disable).
 * @param mutationParams - The parameters passed to the mutation function.
 * @returns - State of the toggle, handleToggle function, and the pending status of the mutation.
 */
export const useToggleBase = <T, P>({
  initialState,
  data,
  checkIsActive,
  mutation,
  mutationParams,
}: ToggleBaseOptions<T, P>) => {
  const [isActive, setIsActive] = useState(initialState);

  useEffect(() => {
    if (data) {
      const isCurrentlyActive = checkIsActive(data);
      setIsActive(isCurrentlyActive);
    }
  }, [data, checkIsActive]);

  const handleToggle = useCallback(async () => {
    setIsActive((prev) => !prev);

    try {
      await mutation.mutateAsync(mutationParams);
    } catch {
      setIsActive((prev) => !prev);
    }
  }, [mutation, mutationParams]);

  // Return the necessary state, handler, and mutation status
  return {
    isActive,
    handleToggle,
    isPending: mutation.isPending,
  };
};

/**
 * Custom hook to wrap the `useMutation` hook from React Query, allowing for a mutation with success and error handling.
 *
 * This hook abstracts the usage of `useMutation` and includes query invalidation upon a successful mutation.
 *
 * @template I - The type of variables that will be passed to the mutation function (e.g., input data).
 * @template O - The type of the result that the mutation function will return (e.g., API response).
 *
 * @param mutationFn - The mutation function that will be called when the mutation is triggered.
 *                      This function should return a Promise with the result of the mutation (e.g., an API call).
 * @param key - The query key(s) to invalidate once the mutation is successful.
 * @param onSuccess - (Optional) A callback function that is called when the mutation succeeds.
 *                    It receives the data returned by the mutation function as an argument.
 * @param onError - (Optional) A callback function that is called when the mutation fails.
 *                  It receives the error as an argument.
 *
 * @returns A mutation object that contains:
 *   - `mutate`: A function that triggers the mutation.
 *   - `isLoading`: A boolean indicating if the mutation is in progress.
 *   - `isError`: A boolean indicating if the mutation has failed.
 *   - `data`: The data returned by the mutation function, if the mutation was successful.
 *   - `error`: The error object if the mutation failed.
 */
export const useMutationBase = <I, O>(
  mutationFn: MutationFunction<O, I>,
  key: string[],
  onSuccess?: (data: O) => void,
  onError?: (error: unknown) => void,
) => {
  const queryClient = useQueryClient();

  return useMutation<O, Error, I>({
    mutationFn,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: key });
      if (onSuccess) {
        onSuccess(data);
      }
    },
    onError: (error) => {
      if (onError) {
        onError(error);
      }
    },
  });
};
