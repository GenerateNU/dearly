import { NudgeTransaction } from "./transaction";

export interface NudgeService {
    
}

export class NudgeServiceImpl implements NudgeService {
    private nudgeTransaction: NudgeTransaction;

    constructor(nudgeTransaction: NudgeTransaction) {
        this.nudgeTransaction = nudgeTransaction;
    }

    
}