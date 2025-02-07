import { GroupMembers, MemberPosts } from "@/types/group";
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

export const toggleNotification = async (id: string): Promise<void> => {
  const req = async (token: string): Promise<void> => {
    await fetchClient.PATCH("/api/v1/groups/{id}/members/notifications", {
      headers: getHeaders(token),
      params: {
        path: {
          id,
        },
      },
    });
  };
  return authWrapper<void>()(req);
};

export const getMemberPosts = async (
  groupId: string,
  userId: string,
  limit: number,
  page: number,
): Promise<MemberPosts> => {
  const req = async (token: string): Promise<MemberPosts> => {
    const { data } = await fetchClient.GET("/api/v1/groups/{id}/members/{userId}/posts", {
      headers: getHeaders(token),
      params: {
        query: {
          limit,
          page,
        },
        path: {
          id: groupId,
          userId,
        },
      },
    });
    return data!;
  };
  return authWrapper<MemberPosts>()(req);
};
