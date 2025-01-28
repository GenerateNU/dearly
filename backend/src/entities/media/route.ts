import { Hono } from "hono";
import { MediaService } from "../media/service";
import { MediaController, MediaControllerImpl } from "./controller";

export const mediaRoutes = (mediaService: MediaService): Hono => {
  const media = new Hono();

  const mediaController: MediaController = new MediaControllerImpl(mediaService);

  media.post("/", (ctx) => mediaController.uploadMedia(ctx));

  return media;
};
