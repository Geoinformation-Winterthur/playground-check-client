/**
 * @author Edgar Butwilowski
 * @copyright Copyright (c) Vermessungsamt Winterthur. All rights reserved.
 */
import { InspectionCriterion } from "./inspection-criterion";
import { InspectionReport } from "./inspection-report";
import { PlaydeviceFeatureProperties } from "./playdevice-feature-properties";

export class PlaydeviceDetail {

        properties: PlaydeviceFeatureProperties = new PlaydeviceFeatureProperties();

        public static evaluateHasChecks(playdeviceDetail: PlaydeviceDetail): boolean {
                playdeviceDetail.properties.hasChecks = false;
                if (playdeviceDetail.properties.generalInspectionCriteria.length !== 0
                    || playdeviceDetail.properties.mainFallProtectionInspectionCriteria.length !== 0
                    || playdeviceDetail.properties.secondaryFallProtectionInspectionCriteria.length !== 0) {
                        playdeviceDetail.properties.hasChecks = true;
                }
                return playdeviceDetail.properties.hasChecks;
        }

        /**
         * This method tests if this playdevice detail has any "old" inspection
         * reports (last and before last) on it and stores the result in the
         * "hasOldReports" attribute of the given playdevice detail.
         *
         * @param playdeviceDetail The playdevice detail object to check for
         * @returns
         */
        public static evaluateHasOldInspectionReports(playdeviceDetail: PlaydeviceDetail) {
                playdeviceDetail.properties.hasOldReports = false;
                if ((playdeviceDetail.properties.lastInspectionReports &&
                        playdeviceDetail.properties.lastInspectionReports.length !== 0) ||
                        (playdeviceDetail.properties.nextToLastInspectionReports &&
                                playdeviceDetail.properties.nextToLastInspectionReports.length !== 0)) {
                        playdeviceDetail.properties.hasOldReports = true;
                }
                return playdeviceDetail.properties.hasOldReports;
        }

        public static evaluateChecks(playdeviceDetail: PlaydeviceDetail): boolean {
                playdeviceDetail.properties.hasOpenChecks = false;
                for (let inspectionCreterion of playdeviceDetail.properties.generalInspectionCriteria) {
                        if (inspectionCreterion.currentInspectionReport !== null) {
                                if (!inspectionCreterion.currentInspectionReport.inspectionDone ||
                                        !inspectionCreterion.currentInspectionReport.maintenanceDone) {
                                        playdeviceDetail.properties.hasOpenChecks = true;
                                        return true;
                                }
                        }
                }
                for (let inspectionCreterion of playdeviceDetail.properties.mainFallProtectionInspectionCriteria) {
                        if (inspectionCreterion.currentInspectionReport !== null) {
                                if (!inspectionCreterion.currentInspectionReport.inspectionDone ||
                                        !inspectionCreterion.currentInspectionReport.maintenanceDone) {
                                        playdeviceDetail.properties.hasOpenChecks = true;
                                        return true;
                                }
                        }
                }
                for (let inspectionCreterion of playdeviceDetail.properties.secondaryFallProtectionInspectionCriteria) {
                        if (inspectionCreterion.currentInspectionReport !== null) {
                                if (!inspectionCreterion.currentInspectionReport.inspectionDone ||
                                        !inspectionCreterion.currentInspectionReport.maintenanceDone) {
                                        playdeviceDetail.properties.hasOpenChecks = true;
                                        return true;
                                }
                        }
                }
                return false;
        }

        public static evaluateSomeOldDefectsAreDone(playdeviceDetail: PlaydeviceDetail): boolean {

                playdeviceDetail.properties.someOldDefectsAreDone = false;

                if (playdeviceDetail.properties.defects) {
                        for (let defect of playdeviceDetail.properties.defects) {
                                if (defect.dateDone) {
                                        playdeviceDetail.properties.someOldDefectsAreDone = true;
                                        return true;
                                }
                        }
                }
                return false;

        }
}