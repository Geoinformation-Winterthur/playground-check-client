/**
 * @author Edgar Butwilowski
 * @copyright Copyright (c) Vermessungsamt Winterthur. All rights reserved.
 */
import { InspectionCriterion } from './inspection-criterion';
import { InspectionReport } from './inspection-report';
import { Defect } from './defect';

export class PlaydeviceFeatureProperties {
    fid: number = 0;
    supplier: string = "";
    material: string = "";
    lebensdauer: number = 0;
    comment: string = "";
    type: PlaydeviceFeaturePropertiesType = new PlaydeviceFeaturePropertiesType();
    dateOfService?: Date = undefined;

    generalInspectionCriteria: InspectionCriterion[] = [];
    mainFallProtectionInspectionCriteria: InspectionCriterion[] = [];
    secondaryFallProtectionInspectionCriteria: InspectionCriterion[] = [];
    recommendedYearOfRenovation?: number;
    commentRecommendedYearOfRenovation: string = "";
    notToBeChecked: boolean = false;
    cannotBeChecked: boolean = false;
    cannotBeCheckedReason: string = "";

    defects: Defect[] = [];  // "known/old" defects from web service
    lastInspectionReports: InspectionReport[] = [];
    nextToLastInspectionReports: InspectionReport[] = [];

    pictureBase64String: string = "";
    mapImageBase64String: string = "";

    // only local:
    hasChecks: boolean = false;
    hasOldReports: boolean = false;
    hasOpenChecks: boolean = false;
    hasOpenDefects: boolean = false;
    someOldDefectsAreDone: boolean = false;

}

export class PlaydeviceFeaturePropertiesType
{
    name: string = "";
    description: string = "";
    standard: string = "";
}