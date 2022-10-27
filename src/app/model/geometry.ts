/**
 * @author Edgar Butwilowski
 * @copyright Copyright (c) Vermessungsamt Winterthur. All rights reserved.
 */
export class Geometry {

    type: string = "Point";
    coordinates: number[] = [];

    constructor(type?: GeometryType, coordinates?: number[])
    {
        if(type == GeometryType.Point) {
            this.type = "Point";
        }
        if(coordinates) {
            this.coordinates = coordinates;
        }
    }

}

export enum GeometryType {
    Point
}