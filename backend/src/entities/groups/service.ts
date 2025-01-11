import { GroupTransaction } from "./transaction";
import { CreateGroupPayLoad, Group } from "./validator";

export interface GroupService {
    createGroup(payload: CreateGroupPayLoad): Promise<Group>;
}

export class GroupServiceImpl implements GroupService {
    private groupTransaction: GroupTransaction
    createGroup(payload: CreateGroupPayLoad): Promise<Group> {
        throw new Error("Method not implemented.");
    }
    
    constructor(groupTransaction: GroupTransaction){
        this.groupTransaction = groupTransaction

    }
}