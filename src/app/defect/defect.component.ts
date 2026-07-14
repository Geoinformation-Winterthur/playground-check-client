import { Component, OnInit } from '@angular/core';
import { Defect } from '../model/defect';
import { firstValueFrom, Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { DefectService } from 'src/services/defect.service';
import { UserService } from 'src/services/user.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ErrorMessageEvaluation } from 'src/helper/error-message-evaluation';
import { ImageHelper } from 'src/helper/image-helper';
import { DefectPicture } from '../model/defect-picture';
import { environment } from 'src/environments/environment';
import { FormControl } from '@angular/forms';
import { User } from '../model/user';
import { PlaygroundService } from 'src/services/playgrounds.service';
import { PlaydeviceFeature } from '../model/playdevice-feature';
import { Playground } from '../model/playground';

@Component({
  selector: 'app-defect',
  templateUrl: './defect.component.html',
  styleUrls: ['./defect.component.css']
})
export class DefectComponent implements OnInit {

  defect: Defect = new Defect();

  tid: number = -1;

  playdeviceFid: number = -1;

  environment;

  priorityControl: FormControl = new FormControl();
  responsibleBodyControl: FormControl = new FormControl();
  responsibleUserControl: FormControl = new FormControl();

  assignableUsers: User[] = [];
  infoMailIsGenerating: boolean = false;
  private savedResponsibleUserFid: number = -1;
  private infoMailPlayground: Playground = new Playground();

  userService: UserService;
  private defectService: DefectService;
  private playgroundService: PlaygroundService;

  private snackBar: MatSnackBar;

  private activatedRoute: ActivatedRoute;
  private activatedRouteSubscription: Subscription;

  constructor(defectService: DefectService,
    playgroundService: PlaygroundService,
    userService: UserService,
    snackBar: MatSnackBar,
    activatedRoute: ActivatedRoute) {
    this.defectService = defectService;
    this.playgroundService = playgroundService;
    this.userService = userService;
    this.snackBar = snackBar;
    this.activatedRoute = activatedRoute;
    this.activatedRouteSubscription = new Subscription();
    this.environment = environment;
  }

  ngOnInit(): void {

    this.priorityControl = new FormControl();
    // Änderungen automatisch zurückschreiben
    this.priorityControl.valueChanges.subscribe(value => {
      this.defect.priority = value;
    });

    this.responsibleBodyControl = new FormControl();
    // Änderungen automatisch zurückschreiben
    this.responsibleBodyControl.valueChanges.subscribe(value => {
      this.defect.defectsResponsibleBodyId = value !== null && value !== undefined && value !== "" ? parseInt(value) : -1;
    });

    this.responsibleUserControl = new FormControl();
    this.responsibleUserControl.valueChanges.subscribe(value => {
      this.defect.responsibleUserFid = value !== null && value !== undefined && value !== "" ? parseInt(value) : -1;

      // Bei deaktivierter Auftragsfunktion wird nur die Empfänger:in der Infomail gespeichert.
      // Es darf dadurch kein Auftrag erzeugt oder geöffnet werden.
      if (!this.environment.features.defectAssignments) {
        this.defect.assignmentStatus = "";
        return;
      }

      if (this.defect.responsibleUserFid <= 0) {
        this.defect.assignmentStatus = "";
      } else if (this.defect.assignmentStatus == null || this.defect.assignmentStatus.trim().length === 0) {
        this.defect.assignmentStatus = "zugewiesen";
      }
    });

    this.userService.getAssignableUsers().subscribe({
      next: (users) => {
        this.assignableUsers = users;
      },
      error: () => {
        this.assignableUsers = [];
      }
    });

    this.activatedRouteSubscription = this.activatedRoute.params
      .subscribe(params => {
        this.tid = parseInt(params['tid']);
        this.playdeviceFid = parseInt(params['playdeviceFid']);

        if (this.tid > 0) {
          this.defect = new Defect();
          this.defectService.getDefect(this.tid)
            .subscribe({
              next: (defect) => {
                this.defect = defect;
                this.savedResponsibleUserFid = this.defect.responsibleUserFid;
                // Das Backend liefert die verbindliche Spielgeräte-FID. Die Route dient nur
                // noch als Rückfall für einen noch nicht aktualisierten Service.
                if (!this.defect.playdeviceFid || this.defect.playdeviceFid <= 0) {
                  this.defect.playdeviceFid = this.playdeviceFid;
                } else {
                  this.playdeviceFid = this.defect.playdeviceFid;
                }
                setTimeout(() => {
                  this.priorityControl.setValue("" + this.defect.priority);
                  this.responsibleBodyControl.setValue(this.defect.defectsResponsibleBodyId > 0 ? "" + this.defect.defectsResponsibleBodyId : "");
                  this.responsibleUserControl.setValue(this.defect.responsibleUserFid > 0 ? "" + this.defect.responsibleUserFid : "");
                });
              },
              error: (errorObj) => {
              }
            })
        }
        else {
          this.defect = new Defect();
          this.defect.playdeviceFid = this.playdeviceFid;
          this.defect.dateCreation = new Date();
          setTimeout(() => {
            this.responsibleBodyControl.setValue("");
            this.responsibleUserControl.setValue("");
          });
        }

      });
  }

  createDefect() {
    this.defectService.putDefect(this.defect)
      .subscribe({
        next: (defect) => {
          if (defect != null && defect.errorMessage != null
            && defect.errorMessage.trim().length !== 0) {
            ErrorMessageEvaluation._evaluateErrorMessage(defect);
            this.snackBar.open(defect.errorMessage, "", {
              duration: 4000
            });
          } else {
            this.snackBar.open("Mangel erfolgreich angelegt", "", {
              duration: 4000
            });
            this.defect = defect;
          }
        },
        error: (errorObj) => {
          this.snackBar.open("Unbekannter Fehler, evtl. schlechte Internetverbindung", "", {
            duration: 4000
          });
        }
      });
  }

  updateDefect() {
    this.defectService.postDefect(this.defect)
      .subscribe({
        next: (errorMessage) => {
          if (errorMessage != null && errorMessage.errorMessage != null
            && errorMessage.errorMessage.trim().length !== 0) {
            ErrorMessageEvaluation._evaluateErrorMessage(errorMessage);
            this.snackBar.open(errorMessage.errorMessage, "", {
              duration: 4000
            });
          } else {
            this.savedResponsibleUserFid = this.defect.responsibleUserFid;
            this.snackBar.open("Mangel erfolgreich aktualisiert", "", {
              duration: 4000
            });
          }
        },
        error: (errorObj) => {
          this.snackBar.open("Unbekannter Fehler, evtl. schlechte Internetverbindung", "", {
            duration: 4000
          });
        }
      });
  }

  acceptAssignment() {
    this.defectService.acceptAssignment(this.defect)
      .subscribe({
        next: (errorMessage) => {
          if (errorMessage != null && errorMessage.errorMessage != null
            && errorMessage.errorMessage.trim().length !== 0) {
            ErrorMessageEvaluation._evaluateErrorMessage(errorMessage);
            this.snackBar.open(errorMessage.errorMessage, "", { duration: 4000 });
          } else {
            this.defect.assignmentStatus = "angenommen";
            this.defect.dateAssignmentAccepted = new Date();
            this.defect.dateAssignmentRejected = undefined;
            this.snackBar.open("Auftrag angenommen", "", { duration: 4000 });
          }
        },
        error: () => {
          this.snackBar.open("Auftrag konnte nicht angenommen werden", "", { duration: 4000 });
        }
      });
  }

  rejectAssignment() {
    this.defectService.rejectAssignment(this.defect)
      .subscribe({
        next: (errorMessage) => {
          if (errorMessage != null && errorMessage.errorMessage != null
            && errorMessage.errorMessage.trim().length !== 0) {
            ErrorMessageEvaluation._evaluateErrorMessage(errorMessage);
            this.snackBar.open(errorMessage.errorMessage, "", { duration: 4000 });
          } else {
            this.defect.assignmentStatus = "abgelehnt";
            this.defect.dateAssignmentRejected = new Date();
            this.snackBar.open("Auftrag abgelehnt", "", { duration: 4000 });
          }
        },
        error: () => {
          this.snackBar.open("Auftrag konnte nicht abgelehnt werden", "", { duration: 4000 });
        }
      });
  }

  isAssignmentForCurrentUser(): boolean {
    const localUser = this.userService.getLocalUser();
    if (this.defect == null || this.defect.responsibleUserFid <= 0 || localUser == null) return false;
    if (localUser.fid === this.defect.responsibleUserFid) return true;

    for (let user of this.assignableUsers) {
      if (user.fid === this.defect.responsibleUserFid
        && user.mailAddress != null && localUser.mailAddress != null
        && user.mailAddress.trim().toLowerCase() === localUser.mailAddress.trim().toLowerCase()) {
        return true;
      }
    }
    return false;
  }


  getAssignmentStatusLabel(): string {
    if (this.defect.assignmentStatus === 'angenommen') return 'angenommen';
    if (this.defect.assignmentStatus === 'abgelehnt') return 'abgelehnt';
    return 'zugewiesen';
  }

  getAssignmentStatusClass(): string {
    if (this.defect.assignmentStatus === 'angenommen') return 'status-accepted';
    if (this.defect.assignmentStatus === 'abgelehnt') return 'status-rejected';
    return 'status-assigned';
  }

  getResponsibleUserName(fid: number): string {
    for (let user of this.assignableUsers) {
      if (user.fid === fid) return user.firstName + " " + user.lastName;
    }
    return "";
  }


  isInfoMailAvailable(): boolean {
    const selectedResponsibleUserFid = Number(this.responsibleUserControl.value);
    return selectedResponsibleUserFid > 0
      && selectedResponsibleUserFid === this.savedResponsibleUserFid;
  }

  async generateInfoMail(): Promise<void> {
    const recipientUserFid = parseInt(this.responsibleUserControl.value);
    const recipient = this.assignableUsers.find(user => user.fid === recipientUserFid);

    if (this.defect.tid <= 0 || !recipient || !recipient.mailAddress || recipient.mailAddress.trim().length === 0) {
      this.snackBar.open("Bitte eine zuständige Person mit E-Mail-Adresse auswählen", "", { duration: 4000 });
      return;
    }

    this.infoMailIsGenerating = true;
    try {
      const playdevice = await this.getPlaydevice();
      if (!playdevice) {
        this.snackBar.open("Das zugehörige Spielgerät konnte nicht geladen werden", "", { duration: 4000 });
        return;
      }
      const pictureTids = [...this.defect.defectPicsTids, ...this.defect.defectPicsAfterFixingTids];
      const attachments = await Promise.all(pictureTids.map(async (pictureTid, index) => {
        const picture = await firstValueFrom(this.defectService.getPicture(pictureTid));
        return {
          filename: `Mangel-${this.defect.tid}-Foto-${index + 1}.${this.getFileExtension(picture.type)}`,
          contentType: picture.type || "image/png",
          base64: await this.blobToBase64(picture)
        };
      }));

      const recipientName = `${recipient.firstName} ${recipient.lastName}`.trim();
      const mailFile = this.createEmlFile(recipient.mailAddress.trim(), recipientName, playdevice, attachments);
      const downloadUrl = window.URL.createObjectURL(mailFile);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `Mangel-${this.defect.tid}-Infomail.eml`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);

      const updatedDefect = await firstValueFrom(this.defectService.markInfoMailSent(this.defect.tid));
      this.defect.infoMailSentAt = updatedDefect.infoMailSentAt;
      this.defect.infoMailRecipientName = updatedDefect.infoMailRecipientName;
      this.snackBar.open("Infomail wurde generiert", "", { duration: 4000 });
    } catch (error) {
      this.snackBar.open("Infomail konnte nicht generiert werden", "", { duration: 4000 });
    } finally {
      this.infoMailIsGenerating = false;
    }
  }

  getInfoMailSentLabel(): string {
    if (!this.defect.infoMailSentAt || !this.defect.infoMailRecipientName) return "";
    const sentAt = new Date(this.defect.infoMailSentAt);
    if (isNaN(sentAt.getTime())) return "";
    const formattedDate = sentAt.toLocaleDateString("de-CH", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
    return `generiert an ${this.defect.infoMailRecipientName} am ${formattedDate}`;
  }

  getSelectedResponsibleUserMailAddress(): string {
    const recipientUserFid = parseInt(this.responsibleUserControl.value);
    const recipient = this.assignableUsers.find(user => user.fid === recipientUserFid);
    return recipient?.mailAddress ?? "";
  }

  private async getPlaydevice(): Promise<PlaydeviceFeature | undefined> {
    const playdeviceFid = Number(this.defect.playdeviceFid || this.playdeviceFid);
    if (playdeviceFid <= 0) return undefined;

    const playground = await firstValueFrom(
      this.playgroundService.getPlaygroundByPlaydeviceFid(playdeviceFid)
    );
    const playdevice = (playground?.playdevices ?? []).find(item =>
      Number(item?.properties?.fid) === playdeviceFid
    );

    if (playdevice) {
      this.infoMailPlayground = playground;
    }
    return playdevice;
  }

  private createEmlFile(recipient: string, recipientName: string, playdevice: PlaydeviceFeature,
    attachments: { filename: string, contentType: string, base64: string }[]): Blob {
    const boundary = `----=_Spielplatzkontrolle_${Date.now()}`;
    const playground = this.infoMailPlayground;
    const localUser = this.userService.getLocalUser();
    const senderName = localUser ? `${localUser.firstName} ${localUser.lastName}`.trim() : "";
    const subject = `Mangel ${this.defect.tid}: ${this.defect.defectDescription || "Spielgerät"}`;
    const body = `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
</head>
<body style="font-family: Arial, Helvetica, sans-serif; font-size: 14px; line-height: 1.45; color: #222;">
  <p>Guten Tag ${this.escapeHtml(recipientName)}</p>
  <p><strong>Der folgende Mangel ist pendent:</strong></p>

  <table cellpadding="4" cellspacing="0" style="border-collapse: collapse;">
    <tr><td><strong>Mangelnummer:</strong></td><td>${this.defect.tid}</td></tr>
    <tr><td><strong>Spielplatz:</strong></td><td>${this.escapeHtml(playground.name || "Nicht angegeben")}</td></tr>
    <tr><td><strong>Adresse:</strong></td><td>${this.escapeHtml(playground.address || "Nicht angegeben")}</td></tr>
    <tr><td><strong>Geräteart:</strong></td><td>${this.escapeHtml(playdevice.properties.type?.description || playdevice.properties.type?.name || "Nicht angegeben")}</td></tr>
    <tr><td><strong>Lieferant:</strong></td><td>${this.escapeHtml(playdevice.properties.supplier || "Nicht angegeben")}</td></tr>
    <tr><td><strong>Erstellungsjahr:</strong></td><td>${this.escapeHtml(this.getConstructionYear(playdevice))}</td></tr>
    <tr><td><strong>Bemerkung zum Spielgerät:</strong></td><td>${this.escapeHtml(playdevice.properties.comment || "Keine Bemerkung")}</td></tr>
    <tr><td><strong>Dringlichkeit:</strong></td><td>${this.escapeHtml(this.getPriorityLabel())}</td></tr>
    <tr><td><strong>Zuständigkeit nach Typ:</strong></td><td>${this.escapeHtml(this.getResponsibleBodyLabel())}</td></tr>
    <tr><td><strong>Erstellt am:</strong></td><td>${this.escapeHtml(this.formatDate(this.defect.dateCreation))}</td></tr>
    <tr><td><strong>Status:</strong></td><td>${this.defect.done ? "Erledigt" : "Offen"}</td></tr>
  </table>

  <p><strong>Beschrieb des Mangels:</strong><br>
  ${this.escapeHtml(this.defect.defectDescription || "Keine Beschreibung").replace(/\r?\n/g, "<br>")}</p>

  <p><strong>Bemerkung zur Erledigung:</strong><br>
  ${this.escapeHtml(this.defect.defectComment || "Keine Bemerkung").replace(/\r?\n/g, "<br>")}</p>

  <p>Freundliche Grüsse<br>
  ${this.escapeHtml(senderName)}</p>
</body>
</html>`;

    const headers = [
      `To: ${recipient}`,
      `Subject: =?UTF-8?B?${this.textToBase64(subject)}?=`,
      "MIME-Version: 1.0",
      `Content-Type: multipart/mixed; boundary="${boundary}"`,
      "",
      `--${boundary}`,
      "Content-Type: text/html; charset=UTF-8",
      "Content-Transfer-Encoding: base64",
      "",
      this.wrapBase64(this.textToBase64(body))
    ];

    for (const attachment of attachments) {
      headers.push(
        `--${boundary}`,
        `Content-Type: ${attachment.contentType}; name="${attachment.filename}"`,
        "Content-Transfer-Encoding: base64",
        `Content-Disposition: attachment; filename="${attachment.filename}"`,
        "",
        this.wrapBase64(attachment.base64)
      );
    }
    headers.push(`--${boundary}--`, "");

    return new Blob([headers.join("\r\n")], { type: "message/rfc822" });
  }

  private getPriorityLabel(): string {
    if (this.defect.priority === 1) return "A (sofort)";
    if (this.defect.priority === 2) return "B (mittelfristig)";
    if (this.defect.priority === 3) return "C (im Folgejahr beurteilen)";
    return "Nicht angegeben";
  }

  private getResponsibleBodyLabel(): string {
    if (this.defect.defectsResponsibleBodyId === 1) return "Revier";
    if (this.defect.defectsResponsibleBodyId === 2) return "Spielplatzverantwortlicher";
    if (this.defect.defectsResponsibleBodyId === 3) return "Projektleiter";
    return "Nicht angegeben";
  }

  private getConstructionYear(playdevice: PlaydeviceFeature): string {
    if (!playdevice.properties.constructionDate) return "Nicht angegeben";
    const constructionDate = new Date(playdevice.properties.constructionDate);
    return isNaN(constructionDate.getTime()) ? "Nicht angegeben" : constructionDate.getFullYear().toString();
  }

  private formatDate(date?: Date): string {
    if (!date) return "Nicht angegeben";
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) return "Nicht angegeben";
    return parsedDate.toLocaleDateString("de-CH", { day: "2-digit", month: "2-digit", year: "numeric" });
  }

  private textToBase64(value: string): string {
    const bytes = new TextEncoder().encode(value);
    let binary = "";
    bytes.forEach(byte => binary += String.fromCharCode(byte));
    return btoa(binary);
  }

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string).split(",", 2)[1]);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(blob);
    });
  }

  private wrapBase64(value: string): string {
    return value.match(/.{1,76}/g)?.join("\r\n") ?? "";
  }

  private getFileExtension(contentType: string): string {
    if (contentType === "image/jpeg") return "jpg";
    if (contentType === "image/gif") return "gif";
    if (contentType === "image/webp") return "webp";
    return "png";
  }

  switchDefectStatus(defect: Defect) {
    if (defect.dateDone) {
      defect.dateDone = undefined;
    } else {
      defect.dateDone = new Date();
    }
  }

  uploadPhoto(defectTid: number, afterFixing: boolean, event: Event) {
    let inputElement: HTMLInputElement = event.target as HTMLInputElement;
    let files: FileList = inputElement.files as FileList;
    if (files && files.length > 0) {
      let file = files[0];
      if (file) {
        let fileReader: FileReader = new FileReader();
        fileReader.readAsDataURL(file);
        fileReader.onload = async () => {
          let pictureBase64String: string = fileReader.result as string;
          let pictureBase64Promise: Promise<string> = ImageHelper.downsizeImage(pictureBase64String, 1200, 800);

          let defectPicture: DefectPicture = new DefectPicture();
          defectPicture.afterFixing = afterFixing;

          defectPicture.base64StringPicture = await pictureBase64Promise;

          let pictureBase64ThumbPromise: Promise<string> = ImageHelper.cropImage(defectPicture.base64StringPicture, 1, 1);
          defectPicture.base64StringPictureThumb = await pictureBase64ThumbPromise;

          this.defectService.putPicture(defectTid, defectPicture)
            .subscribe({
              next: (result) => {
                this.snackBar.open("Bild hochgeladen", "", {
                  duration: 4000
                });
                if(afterFixing)
                  this.defect.defectPicsAfterFixingTids.push(result.tid);
                else
                  this.defect.defectPicsTids.push(result.tid);
              },
              error: (errorObj) => {
                this.snackBar.open("Unbekannter Fehler beim Bildhochladen", "", {
                  duration: 4000
                });
              }
            });
        }
      }
    }
  }

}
