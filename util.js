/**
 * Created by Alvin on 2/2/17.
 */

// A bunch of structs to hold bundles of numbers. All numbers floating point.

function Vector2(x,y) {
    this.x = x || 0;
    this.y = y || 0;
}

function Vector3(x,y,z) {
    this.x = x || 0;
    this.y = y || 0;
    this.z = z || 0;
}

var Point2 = Vector2;
var Point3 = Vector3;

function Color3(r,g,b) {
    this.r = r || 0;
    this.g = g || 0;
    this.b = b || 0;
}

var Radiance3 = Color3;
var Power3 = Color3;

// Some (slightly) fancier stuff

function Ray(origin,direction) {
    this.origin = origin || new Point3(); // Point3
    this.direction = direction || new Color3(); // Vector3
}

/* Gamma encoding w/ gamma = 2.2 (sRGB standard curve).
 * scale should multiply radiance to between 0.0 and 1.0.
 */
function ppmGammaEncode(radiance, scale) {
    const gamma = 2.2;
    return Math.round(Math.pow(
        Math.min([1.0, Math.max([0.0, radiance * scale])]),
        1.0 / gamma) * 255);
}
