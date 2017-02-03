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

// My very own terrible vector library.

function v3add(v1,v2) {
    return new Vector3(v1.x+v2.x, v1.y+v2.y, v1.z+v2.z);
}

function v3scale(k,v) {
    return new Vector3(k*v.x, k*v.y, k*v.z);
}

function v3sub(v1,v2) {
    return v3add(v1,v3scale(-1,v2));
}

function v3dot(v1,v2) {
    return v1.x*v2.x + v1.y*v2.y + v1.z*v2.z;
}

function v3len(v) {
    return Math.sqrt(v3dot(v,v));
}

function v3normalize(v) {
    return v3scale(1 / v3len(v), v);
}

function v3cross(v1,v2) {
    return new Vector3(v1.y*v2.z - v1.z*v2.y, v1.z*v2.x-v1.x*v2.z, v1.x*v2.y - v1.y*v2.x);
}


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
    this.direction = direction || new Vector3(); // Vector3
}

function RawImage(width,height) {
    this.width = width;
    this.height = height;
    this.data = []; // array of Radiance3
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
