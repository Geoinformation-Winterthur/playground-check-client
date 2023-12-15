import { DefectPicture } from "./defect-picture";

/**
 * @author Edgar Butwilowski
 * @copyright Copyright (c) Vermessungsamt Winterthur. All rights reserved.
 */
export class Defect {
    tid: number = 0;
    playdeviceFid: number = 0;
    priority: string = "";
    defectDescription: string = "";
    dateCreation?: Date = undefined;
    done: boolean = false;
    dateDone?: Date = undefined;
    defectComment: string = "";
    defectsResponsibleBodyId: number = -1;
    pictures: DefectPicture[] = [];

    uuid: string = "";
    isNewlyCreated = false;
}