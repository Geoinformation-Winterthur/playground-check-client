/**
 * @author Edgar Butwilowski
 * @copyright Copyright (c) Vermessungsamt Winterthur. All rights reserved.
 */
export class User {
    lastName: string = "";
    firstName: string = "";
    initials: string = "";
    mailAddress: string = "";
    passPhrase: string = "";
    active: boolean = false;
    role: string = "";
    errorMessage: string = "";
    isNew: boolean = false;
}
