import { ReactElement } from "react";

interface ResourceViewProps<T> {
  resourceState: Resource<T> | Resource<T>[] | null;
  successComponent: ReactElement | null;
  loadingComponent: ReactElement | null;
  errorComponent?: ReactElement | null;
  hideWhenError?: boolean;
  doNotShowLoadingIfDataAvailable?: boolean;
  showLoadingForDebug?: boolean;
  showErrorForDebug?: boolean;
  visible?: boolean;
}

export interface Resource<T> {
  data: T | null;
  /** null means the resource has never been fetched */
  loading: boolean | null;
  error?: string | null;
}

const ResourceView = ({
  resourceState,
  successComponent,
  loadingComponent,
  errorComponent = null,
  hideWhenError,
  visible,
  doNotShowLoadingIfDataAvailable,
  showLoadingForDebug,
  showErrorForDebug,
}: ResourceViewProps<unknown>): ReactElement | null => {
  if (__DEV__) {
    // always show the loading component for testing
    if (showLoadingForDebug) return loadingComponent;
    // always show the error component for testing
    if (showErrorForDebug) return errorComponent;
  }

  if (visible === false) {
    return null;
  }

  if (Array.isArray(resourceState)) {
    // if any of the resources are loading, show the loading component
    if (!resourceState || resourceState.some((res) => res.loading !== false)) {
      // if there is data inside all resources while any are loading, show loading unless told so
      if (doNotShowLoadingIfDataAvailable) {
        if (resourceState?.some((res) => res.data == null)) return loadingComponent;
      } else return loadingComponent;
    }

    // if there are no errors in any resources, show success component
    if (resourceState?.find((res) => res.error != null) === undefined) return successComponent;
    // caught an error? show the error component if allowed
    else if (resourceState?.some((res) => res.error) && !hideWhenError) return errorComponent;
    else return null;
  } else {
    // show loading component if resource is loading
    if (!resourceState || resourceState?.loading !== false) {
      // if there is data inside this resource while it's loading, show loading unless told so
      if ((doNotShowLoadingIfDataAvailable === true && resourceState?.data != null) === false)
        return loadingComponent;
    }

    // no error? show success component
    if (resourceState?.error == null) return successComponent;
    // an error occurred? show the error component if allowed
    else if (resourceState?.error && !hideWhenError) return errorComponent;
    else return null;
  }
};

export default ResourceView;
