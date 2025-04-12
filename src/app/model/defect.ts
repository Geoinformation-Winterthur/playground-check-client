import { DefectPicture } from "./defect-picture";

/**
 * @author Edgar Butwilowski
 * @copyright Copyright (c) Vermessungsamt Winterthur. All rights reserved.
 */
export class Defect {
    uuid: string = "";
    tid: number = 0;
    playdeviceFid: number = 0;
    priority: number = 0;
    done: boolean = false;
    defectPicsTids: number [] = [];
    defectPicsAfterFixingTids: number[] = [];
    defectDescription: string = "";
    dateCreation?: Date = undefined;
    dateDone?: Date = undefined;
    defectComment: string = "";
    defectsResponsibleBodyId: number = -1;
}