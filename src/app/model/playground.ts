/**
 * @author Edgar Butwilowski
 * @copyright Copyright (c) Vermessungsamt Winterthur. All rights reserved.
 */
import { Enumeration } from './enumeration';
import { PlaydeviceFeature } from './playdevice-feature';

export class Playground{
    id: number = 0;
    name: string = "";
    address: string = "";
    dateOfLastInspection?: Date = undefined;
    hasOpenDeviceDefects: boolean = false;
    hasFullyLoaded: boolean = false;

    playdevices: PlaydeviceFeature[] = [];

    defectPriorityOptions: string[] = [];
    inspectionTypeOptions: string[] = [];
    renovationTypeOptions: Enumeration[] = [];
    defectsResponsibleBodyOptions: Enumeration[] = [];
}

