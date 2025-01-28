import { InvitationToken } from "@/types/group";
import fetchClient from "./client";
import { authWrapper, getHeaders } from "@/utilities/auth-token";

export const getInviteToken = async (groupId: string): Promise<InvitationToken> => {
  const req = async (token: string): Promise<InvitationToken> => {
    const { data } = await fetchClient.GET("/api/v1/groups/{groupId}/invites", {
      headers: getHeaders(token),
      params: {
        path: {
          groupId,
        },
      },
    });
    return data!;
  };
  return authWrapper<InvitationToken>()(req);
};

export const verifyInviteToken = async (invitationToken: string): Promise<void> => {
  const req = async (token: string): Promise<void> => {
    await fetchClient.PUT("/api/v1/groups/{token}/verify", {
      headers: getHeaders(token),
      params: {
        path: {
          token: invitationToken,
        },
      },
    });
  };
  return authWrapper<void>()(req);
};
