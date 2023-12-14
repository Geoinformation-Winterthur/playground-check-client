/**
 * @author Edgar Butwilowski
 * @copyright Copyright (c) Vermessungsamt Winterthur. All rights reserved.
 */
 import { Defect } from './defect';

export class InspectionReport {
    tid: number = 0;
    inspectionType: string = "";
    dateOfService?: Date = undefined;
    inspector: string = "";
    inspectionText: string = "";
    inspectionDone: boolean = false;
    inspectionComment: string = "";
    maintenanceText: string = "";
    maintenanceDone: boolean = false;
    maintenanceComment: string = "";
    fallProtectionType:string = "";

    playdeviceFid: number = 0;
    playdeviceDetailFid: number = 0;
    playdeviceDateOfService?: Date = undefined;
}