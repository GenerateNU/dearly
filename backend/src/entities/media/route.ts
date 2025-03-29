import { Hono } from "hono";
import { MediaService } from "../media/service";
import { MediaController, MediaControllerImpl } from "./controller";

export const mediaRoutes = (mediaService: MediaService): Hono => {
  const media = new Hono();

  const mediaController: MediaController = new MediaControllerImpl(mediaService);

  media.post("/groups/:id/media", (ctx) => mediaController.uploadPostMedia(ctx));
  media.post("/users/media", (ctx) => mediaController.uploadUserMedia(ctx));
  media.post("/media/processing", (ctx) => mediaController.getDBData(ctx));

  return media;
};
