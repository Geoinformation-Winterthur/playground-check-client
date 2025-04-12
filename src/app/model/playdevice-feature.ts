/**
 * @author Edgar Butwilowski
 * @copyright Copyright (c) Vermessungsamt Winterthur. All rights reserved.
 */
import { PlaydeviceFeatureProperties } from './playdevice-feature-properties';
import { Geometry } from './geometry';
import { PlaydeviceDetail } from './playdevice-detail';

export class PlaydeviceFeature {

  type: string;
  properties: PlaydeviceFeatureProperties;
  geometry: Geometry = new Geometry();
  playdeviceDetails: PlaydeviceDetail[] = [];
  cardType: string = "";

  constructor() {
    this.type = "Feature";
    this.properties = new PlaydeviceFeatureProperties();
  }

  /**
   * This method tests if this playdevice and its playdevice-
   * details have any inspection criteria ("checks") on them
   * and stores the result in the "hasChecks" attribute of the
   * given playground.
   * 
   * @param playdevice The playdevice object to check for
   */
  public static evaluateHasChecks(playdevice: PlaydeviceFeature) {
    playdevice.properties.hasChecks = false;
    if (playdevice.properties.generalInspectionCriteria.length !== 0
        || playdevice.properties.mainFallProtectionInspectionCriteria.length !== 0
        || playdevice.properties.secondaryFallProtectionInspectionCriteria.length !== 0) {
      playdevice.properties.hasChecks = true;
      return;
    }
    let hasDetailChecks: boolean = false;
    for (let playdeviceDetail of playdevice.playdeviceDetails) {
      hasDetailChecks = PlaydeviceDetail.evaluateHasChecks(playdeviceDetail);
      playdevice.properties.hasChecks = hasDetailChecks;
    }
  }


  /**
   * This method tests if this playdevice and its playdevice-
   * details have any "old" inspection reports (last and before last)
   * on them and stores the result in the "hasOldReports" attribute of the
   * given playdevice.
   * 
   * @param playdevice The playdevice object to check for
   */
  public static evaluateHasOldInspectionReports(playdevice: PlaydeviceFeature) {
    playdevice.properties.hasOldReports = false;
    if ((playdevice.properties.lastInspectionReports.length !== 0) ||
      (playdevice.properties.nextToLastInspectionReports &&
        playdevice.properties.nextToLastInspectionReports.length !== 0)) {
      playdevice.properties.hasOldReports = true;
      return;
    }
    let hasOldReportsOnDetail: boolean = false;
    for (let playdeviceDetail of playdevice.playdeviceDetails) {
      hasOldReportsOnDetail = PlaydeviceDetail.evaluateHasOldInspectionReports(playdeviceDetail);
      if (!playdevice.properties.hasOldReports) {
        playdevice.properties.hasOldReports = hasOldReportsOnDetail;
      }
    }
  }

  /**
   * This method merges the status of all inspections ("checks")
   * to one value "hasOpenChecks" of the given playdevice.
   * 
   * @param playdevice The playdevice object to check for
   */
  public static evaluateChecks(playdevice: PlaydeviceFeature) {
    playdevice.properties.hasOpenChecks = false;

    // check if given playdevice has checks (inspection criteria):
    PlaydeviceFeature.evaluateHasChecks(playdevice);

    let hasDetailOpenChecks: boolean = false;
    for (let playdeviceDetail of playdevice.playdeviceDetails) {
      hasDetailOpenChecks = PlaydeviceDetail.evaluateChecks(playdeviceDetail);
      if (!playdevice.properties.hasOpenChecks) {
        playdevice.properties.hasOpenChecks = hasDetailOpenChecks;
      }
    }

    if (playdevice.properties.hasChecks) {
      for (let inspectionCreterion of playdevice.properties.generalInspectionCriteria) {
        if (!inspectionCreterion.currentInspectionReport.inspectionDone ||
          !inspectionCreterion.currentInspectionReport.maintenanceDone) {
          playdevice.properties.hasOpenChecks = true;
        }
      }

      for (let inspectionCreterion of playdevice.properties.mainFallProtectionInspectionCriteria) {
        if (!inspectionCreterion.currentInspectionReport.inspectionDone ||
          !inspectionCreterion.currentInspectionReport.maintenanceDone) {
          playdevice.properties.hasOpenChecks = true;
        }
      }

      for (let inspectionCreterion of playdevice.properties.secondaryFallProtectionInspectionCriteria) {
        if (!inspectionCreterion.currentInspectionReport.inspectionDone ||
          !inspectionCreterion.currentInspectionReport.maintenanceDone) {
          playdevice.properties.hasOpenChecks = true;
        }
      }

    }


  }

  /**
   * This method merges the status of all defects to one
   * value "hasOpenDefects" of the given playdevice.
   * 
   * @param playdevice The playdevice object to check for
   */
  public static evaluateDefects(playdevice: PlaydeviceFeature) {
    playdevice.properties.hasOpenDefects = false;
    if (playdevice.properties.defects) {
      for (let defect of playdevice.properties.defects) {
        if (!defect.dateDone) {
          playdevice.properties.hasOpenDefects = true;
          return;
        }
      }
    }
  }

  public static evaluateSomeOldDefectsAreDone(playdevice: PlaydeviceFeature) {

    playdevice.properties.someOldDefectsAreDone = false;

    if (playdevice.properties.defects) {
      for (let defect of playdevice.properties.defects) {
        if (defect.dateDone) {
          playdevice.properties.someOldDefectsAreDone = true;
          return;
        }
      }
    }

    let someOldDetailDefectsAreDone: boolean = false;
    for (let playdeviceDetail of playdevice.playdeviceDetails) {
      someOldDetailDefectsAreDone = PlaydeviceDetail.evaluateSomeOldDefectsAreDone(playdeviceDetail);
      if (!playdevice.properties.someOldDefectsAreDone) {
        playdevice.properties.someOldDefectsAreDone = someOldDetailDefectsAreDone;
      }
    }
  }

}