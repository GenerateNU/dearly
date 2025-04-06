import fetchClient from "./client";
import { authWrapper, getHeaders } from "@/utilities/auth-token";
import {
  CreateGroupPayload,
  Group,
  GroupCalendar,
  GroupPostFeed,
  UpdateGroupPayload,
} from "@/types/group";

export const createGroup = async (payload: CreateGroupPayload): Promise<Group> => {
  const req = async (token: string): Promise<Group> => {
    const { data } = await fetchClient.POST("/api/v1/groups", {
      headers: getHeaders(token),
      body: payload,
    });
    return data!;
  };
  return authWrapper<Group>()(req);
};

export const getGroup = async (id: string): Promise<Group> => {
  const req = async (token: string): Promise<Group> => {
    const { data } = await fetchClient.GET("/api/v1/groups/{id}", {
      headers: getHeaders(token),
      params: {
        path: {
          id: id,
        },
      },
    });
    return data!;
  };
  return authWrapper<Group>()(req);
};

export const updateGroup = async (id: string, payload: UpdateGroupPayload): Promise<Group> => {
  const req = async (token: string): Promise<Group> => {
    const { data } = await fetchClient.PATCH("/api/v1/groups/{id}", {
      headers: getHeaders(token),
      body: payload,
      params: {
        path: {
          id,
        },
      },
    });
    return data!;
  };
  return authWrapper<Group>()(req);
};

export const deleteGroup = async (id: string): Promise<void> => {
  const req = async (token: string): Promise<void> => {
    await fetchClient.DELETE("/api/v1/groups/{id}", {
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

export const getGroupCalendar = async (
  id: string,
  pivot?: string,
  range?: number,
  direction: "before" | "after" | "both" = "before",
): Promise<GroupCalendar> => {
  const req = async (token: string): Promise<GroupCalendar> => {
    const tmzOffset = new Date().getTimezoneOffset()
    const { data } = await fetchClient.GET("/api/v1/groups/{id}/calendar", {
      headers: getHeaders(token),
      params: {
        path: {
          id,
        },
        query: {
          pivot,
          range,
          direction,
          tmzOffset
        },
      },
    });
    return data!;
  };
  return authWrapper<GroupCalendar>()(req);
};

export const getGroupFeed = async (
  id: string,
  limit?: number,
  page?: number,
  date?: string,
): Promise<GroupPostFeed> => {
  const req = async (token: string): Promise<GroupPostFeed> => {
    const { data } = await fetchClient.GET("/api/v1/groups/{id}/feed", {
      headers: getHeaders(token),
      params: {
        path: {
          id,
        },
        query: {
          limit,
          page,
          date,
        },
      },
    });
    return data!;
  };
  return authWrapper<GroupPostFeed>()(req);
};
