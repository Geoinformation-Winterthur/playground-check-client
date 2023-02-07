/**
 * @author Edgar Butwilowski
 * @copyright Copyright (c) Vermessungsamt Winterthur. All rights reserved.
 */
import { PlaydeviceFeature } from './playdevice-feature';

export class Playground{
    id: number = 0;
    name: string = "";
    address: string = "";
    playdevices: PlaydeviceFeature[] = [];
    hasFullyLoaded: boolean = false;

    dateOfLastInspection?: Date = undefined;

    selectedInspectionType: string = "";
    defectPriorityOptions: string[] = [];
    inspectionTypeOptions: string[] = [];
}

