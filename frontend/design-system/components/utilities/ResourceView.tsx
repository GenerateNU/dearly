import { ReactElement } from "react";

export interface Resource<T> {
  data: T | null;
  /** null means the resource has never been fetched */
  loading: boolean | null;
  error?: string | null;
}

interface ResourceViewProps<T> {
  resourceState: Resource<T> | Resource<T>[] | null;
  successComponent: ReactElement | null;
  loadingComponent: ReactElement | null;
  errorComponent?: ReactElement | null;
  emptyStateComponent?: ReactElement | null;
  hideWhenError?: boolean;
  doNotShowLoadingIfDataAvailable?: boolean;
  showLoadingForDebug?: boolean;
  showErrorForDebug?: boolean;
  visible?: boolean;
}

/**
 * A component that handles different states of resource loading
 * and renders appropriate components based on those states.
 */
const ResourceView = ({
  resourceState,
  successComponent,
  loadingComponent,
  errorComponent = null,
  emptyStateComponent = null,
  hideWhenError = false,
  visible = true,
  doNotShowLoadingIfDataAvailable = false,
  showLoadingForDebug = false,
  showErrorForDebug = false,
}: ResourceViewProps<unknown>): ReactElement | null => {
  // early returns for special cases
  if (__DEV__) {
    if (showLoadingForDebug) return loadingComponent;
    if (showErrorForDebug) return errorComponent;
  }

  if (visible === false) return null;
  if (!resourceState) return emptyStateComponent;

  // helper functions
  const hasData = (resource: Resource<unknown>): boolean => resource.data != null;
  const hasError = (resource: Resource<unknown>): boolean => resource.error != null;
  const isLoading = (resource: Resource<unknown>): boolean => resource.loading !== false;

  const flattenData = (resources: Resource<unknown> | Resource<unknown>[]): unknown[] => {
    if (Array.isArray(resources)) {
      return resources.flatMap((resource) => resource.data || []);
    }
    return resources.data ? [resources.data] : [];
  };

  // separated handling for multiple resources
  const handleMultipleResources = (resources: Resource<unknown>[]): ReactElement | null => {
    const anyLoading = resources.some(isLoading);
    const anyError = resources.some(hasError);
    const someDataMissing = resources.some((res) => !hasData(res));
    const flattenedData = flattenData(resources);

    // handle loading state
    if (anyLoading) {
      if (doNotShowLoadingIfDataAvailable && someDataMissing) {
        return loadingComponent;
      } else if (!doNotShowLoadingIfDataAvailable) {
        return loadingComponent;
      }
    }

    // handle empty state
    if (flattenedData.length === 0) {
      return emptyStateComponent;
    }

    // handle error state
    if (anyError) {
      return hideWhenError ? null : errorComponent;
    }

    // success state
    return successComponent;
  };

  // separated handling for single resource
  const handleSingleResource = (resource: Resource<unknown>): ReactElement | null => {
    const isResourceLoading = isLoading(resource);
    const hasResourceData = hasData(resource);
    const hasResourceError = hasError(resource);
    const flattenedData = flattenData([resource]);

    // handle loading state
    if (isResourceLoading) {
      const shouldShowLoading = !doNotShowLoadingIfDataAvailable || !hasResourceData;
      if (shouldShowLoading) {
        return loadingComponent;
      }
    }

    // handle empty state
    if (flattenedData.length === 0) {
      return emptyStateComponent;
    }

    // handle error state
    if (hasResourceError) {
      return hideWhenError ? null : errorComponent;
    }

    // success state
    return successComponent;
  };

  return Array.isArray(resourceState)
    ? handleMultipleResources(resourceState)
    : handleSingleResource(resourceState);
};

export default ResourceView;
