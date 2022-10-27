import { InspectionReport } from "./inspection-report";

/**
 * @author Edgar Butwilowski
 * @copyright Copyright (c) Vermessungsamt Winterthur. All rights reserved.
 */
export class InspectionCriterion {
    realm: string = ""; // bereich
    designation: string = ""; // bezeichnung
    check: string = ""; // pruefung
    checkShortText: string = ""; // pruefung_kurztext
    maintenance: string = ""; // wartung
    beforeOpening: boolean = false; // vor_eroeffnung
    weekly: boolean = false; // woechentlich
    monthly: boolean = false; // monatlich
    yearly: boolean = false; // jaehrlich
    inspectionType: string = ""; // inspektionsart

    currentInspectionReport: InspectionReport;

    constructor(){
        this.currentInspectionReport = new InspectionReport();
    }

}