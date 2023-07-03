import { UserType } from '@prisma/client';

type LoggedInUser = {
    staffId: string | null;
    clientId: string | null;
    agentId: string | null;
};

class ReferenceChecker {
    private static _instance: ReferenceChecker;
    private referenceList: {
        referenceTable: string;
        method: (referenceId: string, loggedInUser: LoggedInUser) => boolean;
    }[];

    constructor() {
        this.referenceList = [];
    }

    public register(referenceTable: string, method: (referenceId: string, loggedInUser: LoggedInUser) => boolean) {
        // if reference table is already registered, replace the old one
        const index = this.referenceList.findIndex((item) => item.referenceTable === referenceTable);
        if (index !== -1) {
            this.referenceList[index].method = method;
            return;
        }

        this.referenceList.push({
            referenceTable,
            method,
        });
    }

    public check(referenceTable: string, referenceId: string, loggedInUser: LoggedInUser) {
        const reference = this.referenceList.find((item) => item.referenceTable === referenceTable);
        if (!reference) {
            throw new Error(`Reference table ${referenceTable} is not registered`);
        }
        return reference.method(referenceId, loggedInUser);
    }

    public static get Instance() {
        return this._instance || (this._instance = new this());
    }
}

const referenceChecker = ReferenceChecker.Instance;

export default referenceChecker;
