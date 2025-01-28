import { GroupMembers } from "@/types/group";
import fetchClient from "./client";
import { authWrapper, getHeaders } from "@/utilities/auth-token";

export const removeMember = async (groupId: string, userId: string): Promise<void> => {
  const req = async (token: string): Promise<void> => {
    await fetchClient.DELETE("/api/v1/groups/{id}/members/{userId}", {
      headers: getHeaders(token),
      params: {
        path: {
          id: groupId,
          userId,
        },
      },
    });
  };
  return authWrapper<void>()(req);
};

export const getAllMembers = async (
  id: string,
  limit?: number,
  page?: number,
): Promise<GroupMembers> => {
  const req = async (token: string): Promise<GroupMembers> => {
    const { data } = await fetchClient.GET("/api/v1/groups/{id}/members", {
      headers: getHeaders(token),
      params: {
        path: {
          id: id,
        },
        query: {
          limit,
          page,
        },
      },
    });
    return data!;
  };
  return authWrapper<GroupMembers>()(req);
};
