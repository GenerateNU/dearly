import fetchClient from "./client";
import { authWrapper, getHeaders } from "@/utilities/auth-token";

export const manualNudge = async (groupId: string, userIDs: string[]): Promise<void> => {
  const req = async (token: string): Promise<void> => {
    await fetchClient.PUT("/api/v1/groups/{id}/nudges/manual", {
      headers: getHeaders(token),
      body: {
        users: userIDs,
      },
      params: {
        path: {
          id: groupId,
        },
      },
    });
  };
  return authWrapper<void>()(req);
};
