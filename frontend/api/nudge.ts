import { ConfigNudgeSchedulePayload, NudgeSchedule } from "@/types/nudge";
import fetchClient from "./client";
import { authWrapper, getHeaders } from "@/utilities/auth-token";

export const manualNudge = async (groupId: string, userIDs: string[]): Promise<void> => {
  const req = async (token: string): Promise<void> => {
    await fetchClient.POST("/api/v1/groups/{id}/nudges/manual", {
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

export const configAutoNudgeSchedule = async (
  groupId: string,
  payload: ConfigNudgeSchedulePayload,
): Promise<void> => {
  const req = async (token: string): Promise<void> => {
    await fetchClient.PUT("/api/v1/groups/{id}/nudges/auto", {
      headers: getHeaders(token),
      params: {
        path: {
          id: groupId,
        },
      },
      body: payload,
    });
  };
  return authWrapper<void>()(req);
};

export const disableNudge = async (groupId: string): Promise<void> => {
  const req = async (token: string): Promise<void> => {
    await fetchClient.PUT("/api/v1/groups/{id}/nudges/auto/off", {
      headers: getHeaders(token),
      params: {
        path: {
          id: groupId,
        },
      },
    });
  };
  return authWrapper<void>()(req);
};

export const getAutoNudgeSchedule = async (groupId: string): Promise<NudgeSchedule> => {
  const req = async (token: string): Promise<NudgeSchedule> => {
    const { data } = await fetchClient.GET("/api/v1/groups/{id}/nudges/auto", {
      headers: getHeaders(token),
      params: {
        path: {
          id: groupId,
        },
      },
    });
    return data!;
  };
  return authWrapper<NudgeSchedule>()(req);
};
