import { Context } from "hono";
import { NudgeService } from "./service";
import { handleAppError } from "../../utilities/errors/app-error";

export interface NudgeController {
    manualNudge(ctx: Context): Promise<Response>;
}

export class NudgeControllerImpl implements NudgeController {
    private nudgeService: NudgeService;

    constructor(nudgeService: NudgeService) {
        this.nudgeService = nudgeService;
    }

    async manualNudge(ctx: Context): Promise<Response> {
        const manualNudgeImpl = async () => {
            return ctx.json({}, 200);
        }
        return await handleAppError(manualNudgeImpl)(ctx);
    }
}
