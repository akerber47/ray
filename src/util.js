/**
 * Created by Alvin on 2/2/17.
 */

// A bunch of structs to hold bundles of numbers. All numbers floating point.

function Vector2(x,y) {
    this.x = x;
    this.y = y;
}

function Vector3(x,y,z) {
    if (typeof x != 'number' || typeof y != 'number' || typeof z != 'number') {
        throw new TypeError("Expected scalar components, received: " +
            x.toString() + ", " + y.toString() + ", " + z.toString());
    }
    this.x = x;
    this.y = y;
    this.z = z;
}

var Point2 = Vector2;
var Point3 = Vector3;

/* My very own terrible vector library.
 * 4 primary functions:
 */

function v3add() {
    var x = 0;
    var y = 0;
    var z = 0;
    for (var i = 0; i < arguments.length; i++) {
        if (!(arguments[i] instanceof Vector3)) {
            throw new TypeError("Expected vector arguments, received arguments[" + i + "]: " + arguments[i].toString());
        }
        x += arguments[i].x;
        y += arguments[i].y;
        z += arguments[i].z;
    }
    return new Vector3(x, y, z);
}

function v3scale(k,v) {
    if (!(typeof k == 'number' && v instanceof Vector3)) {
        throw new TypeError("Expected scalar and vector, received: " + k.toString() + ", " + v.toString());
    }
    return new Vector3(k*v.x, k*v.y, k*v.z);
}

function v3dot(v1,v2) {
    if (!(v1 instanceof Vector3 && v2 instanceof Vector3)) {
        throw new TypeError("Expected two vectors, received: " + v1.toString() + ", " + v2.toString());
    }
    return v1.x*v2.x + v1.y*v2.y + v1.z*v2.z;
}

function v3cross(v1,v2) {
    if (!(v1 instanceof Vector3 && v2 instanceof Vector3)) {
        throw new TypeError("Expected two vectors, received: " + v1.toString() + ", " + v2.toString());
    }
    return new Vector3(v1.y*v2.z - v1.z*v2.y, v1.z*v2.x-v1.x*v2.z, v1.x*v2.y - v1.y*v2.x);
}

/* And some utility functions built out of them: */

function v3sub(v1,v2) {
    return v3add(v1,v3scale(-1,v2));
}

function v3len(v) {
    return Math.sqrt(v3dot(v,v));
}

function v3normalize(v) {
    return v3scale(1 / v3len(v), v);
}

function v3dist(v1,v2) {
    return v3len(v3sub(v1,v2));
}

/* 2D functions too! */
function v2add() {
    var x = 0;
    var y = 0;
    for (var i = 0; i < arguments.length; i++) {
        if (!(arguments[i] instanceof Vector2)) {
            throw new TypeError("Expected vector arguments, received arguments[" + i + "]: " + arguments[i].toString());
        }
        x += arguments[i].x;
        y += arguments[i].y;
    }
    return new Vector2(x, y);
}

function v2scale(k,v) {
    if (!(typeof k == 'number' && v instanceof Vector2)) {
        throw new TypeError("Expected scalar and vector, received: " + k.toString() + ", " + v.toString());
    }
    return new Vector3(k*v.x, k*v.y);
}

function v2dot(v1,v2) {
    if (!(v1 instanceof Vector2 && v2 instanceof Vector2)) {
        throw new TypeError("Expected two vectors, received: " + v1.toString() + ", " + v2.toString());
    }
    return v1.x*v2.x + v1.y*v2.y;
}

function v2sub(v1,v2) {
    return v2add(v1,v2scale(-1,v2));
}

function Color3(r,g,b) {
    if (typeof r != 'number' || typeof g != 'number' || typeof b != 'number') {
        throw new TypeError("Expected scalar components, received: " +
            r.toString() + ", " + g.toString() + ", " + b.toString());
    }
    this.r = r;
    this.g = g;
    this.b = b;
}

var Radiance3 = Color3;
var Power3 = Color3;

/* We also want to be able to add and scale colors. No fancier operations though.
 * (Dot and cross products of colors are meaningless)
 */
function c3add() {
    var r = 0;
    var g = 0;
    var b = 0;
    for (var i = 0; i < arguments.length; i++) {
        if (!(arguments[i] instanceof Color3)) {
            throw new TypeError("Expected color arguments, received arguments[" + i + "]: " + arguments[i].toString());
        }
        r += arguments[i].r;
        g += arguments[i].g;
        b += arguments[i].b;
    }
    return new Color3(r, g, b);
}

function c3scale(k,c) {
    if (!(typeof k == 'number' && c instanceof Color3)) {
        throw new TypeError("Expected scalar and color, received: " + k.toString() + ", " + c.toString());
    }
    return new Color3(k*c.r, k*c.g, k*c.b);
}

// Some (slightly) fancier stuff

function Ray(origin,direction) {
    if (!(origin instanceof Vector3 && direction instanceof Vector3)) {
        throw new TypeError("Expected vector origin and direction, received: " +
            origin.toString() + ", " + direction.toString());
    }
    this.origin = origin;
    this.direction = direction; // by convention, unit length
}

function RawImage(width,height) {
    this.width = width;
    this.height = height;
    this.data = []; // array of Radiance3
    for (var i = 0; i < width; i++) {
        for (var j = 0; j < height; j++) {
            this.data[i + width * j] = 0;
        }
    }
}

RawImage.prototype.get = function(x,y) {
    return this.data[x + this.width * y];
};

RawImage.prototype.set = function(x,y,rad) {
    this.data[x + this.width * y] = rad;
};

/* Gamma encoding w/ gamma = 2.2 (sRGB standard curve).
 * scale should multiply radiance to between 0.0 and 1.0.
 */
function ppmGammaEncode(radiance, scale) {
    const gamma = 2.2;
    return Math.round(Math.pow(
        Math.min(1.0, Math.max(0.0, radiance * scale)),
        1.0 / gamma) * 255);
}

/* Convert raw mathematically generated image (array of Radiance3 objects)
 * to rgb image data, 0-255. Use ppm gamma encoding.
 * Pass in imagedata to fill (from a createImageData call, probably). Modifies
 * the given imageData IN PLACE!
 */
function encodeImageData(rawImage, scale, imageData) {
    for (var y = 0; y < rawImage.height; y++) {
        for (var x = 0; x < rawImage.width; x++) {
            var px = x + rawImage.width * y;
            imageData.data[4*px+0] = ppmGammaEncode(rawImage.get(x,y).r, scale);
            imageData.data[4*px+1] = ppmGammaEncode(rawImage.get(x,y).g, scale);
            imageData.data[4*px+2] = ppmGammaEncode(rawImage.get(x,y).b, scale);
            imageData.data[4*px+3] = 255; // alpha = 1.0 (opaque)
        }
    }
}

// Test image from the book
function initTestImage() {
    var testImage = new RawImage(100,100);
    for (var y = 0; y < 100; y++) {
        for (var x = 0; x < 100; x++) {
            if ((x+y) % 2) {
                testImage.set(x, y, {r: 0, g: 0, b: 0.1});
            } else {
                testImage.set(x, y, {r: (y/100), g: (y/100), b: (y/100)});
            }
        }
    }
    return testImage;
}


/* Convert image data to a long string (in PPM file format).
 * Return the string.
 */
function imageDataToPpm(imageData) {
    var output = "";
    output += "P3 " + imageData.width + " " + imageData.height + " 255\n";
    for (var y = 0; y < imageData.height; y++) {
        output += "\n # y = " + y + "\n";
        for (var x = 0; x < imageData.width; x++) {
            var px = x + imageData.width * y;
            output += imageData.data[px] + " " +
                imageData.data[px+1] + " " +
                imageData.data[px+2] + "\n";
        }
    }
    return output;
}
