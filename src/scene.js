/*
 * Created by Alvin on 2/2/17.
 */

// A triangle in the scene (no fancy mesh representation yet)

function Triangle(vertices, normals, bsdf) {
    this.vertices = vertices; // Array of 3 Point3
    this.normals = normals; // Array of 3 Vector3
    this.bsdf = bsdf; // Mysterious BSDF type
}

Triangle.prototype.vertex = function(i) {
    return this.vertices[i];
};

Triangle.prototype.normal = function(i) {
    return this.normals[i];
};

// A light source in the scene

function Light(position, power) {
    this.position = position; // Point3
    this.power = power; // Power3
}

// Scene consists of triangles and lights, in no order.
function Scene(triangles, lights) {
    this.triangles = triangles; // array of Triangle
    this.lights = lights; // array of Light
}

/* Camera for the scene consists of near plane and far plane distances, as well
 * as horizontal field of view. Vertical field of view controlled by aspect ratio.
 * Camera is fixed to sit at origin and point down negative z axis
 */

function Camera(zNear, zFar, fieldOfViewX) {
    this.zNear = zNear;
    this.zFar = zFar;
    this.fieldOfViewX = fieldOfViewX;
}

// scene/camera copied from book
function defaultCamera() {
    return new Camera(-0.1, -100.0, Math.PI/2);
}

/*
 * Returns a BSDF object with a scatter() method that does Blinn-Phong glossy scattering with the given
 * Lambertian (L), Glossiness (G), and Glossy Sharpness (S).
 * L and G must be arrays of 3 numbers, each from 0 to 1. S is from 0 to 2000.
 */
function makeGlossyBsdf(L, G, S) {
    return {
        scatter: function(n, inv, outv, inrad) {
            // Incoming angle = outgoing angle, so sum of incoming and outgoing should be close to proportional
            // to the normal to get exciting glossiness.
            var v = v3normalize(v3add(inv, outv));

            var kGloss;
            if (v3dot(v, n) > 0) {
                kGloss = (S+8) * Math.pow(v3dot(v,n), S) / 8;
            } else {
                kGloss = 0;
            }
            return c3scale(1/Math.PI, new Radiance3(
                inrad.r * (L[0] + kGloss*G[0]),
                inrad.g * (L[1] + kGloss*G[1]),
                inrad.b * (L[2] + kGloss*G[2])
            ));
        }
    }
}

/*
 * Return a BSDF object with a scatter() method that does Lambertian scattering with the given Lambertian (L).
 * L must be an array of 3 numbers, each from 0 to 1.
 */
function makeLambertianBsdf(L) {
    return {
        scatter: function(n, inv, outv, inrad) {
            // Lambertian scattering is independent of viewing angle (it's for "matte objects"). Just multiply
            // incoming radiance based on the lambertian.
            return c3scale(1/Math.PI, new Radiance3(inrad.r * L[0], inrad.g * L[1], inrad.b * L[2]));
        }
    }
}

// first scene in the book. A single triangle.

function testScene() {
    return new Scene(
        [new Triangle(
            [
                new Point3(0,1,-2),
                new Point3(-1.9,-1,-2),
                new Point3(1.6,-0.5,-2)
            ],
            [
                v3normalize(new Vector3(0.0,0.6,1.0)),
                v3normalize(new Vector3(-0.4,-0.4,1.0)),
                v3normalize(new Vector3(0.4,-0.4,1.0))
            ],
            // makeLambertianBsdf([0, 1.0, 0]) // matte green triangle
            makeGlossyBsdf(
                    [0, 0.8, 0], // matte green underneath
                    [0.2, 0.2, 0.2], // shiny white (reflects all colors) gloss
                    100)
        )],
        [new Light(
            new Point3(1.0,3.0,1.0),
            //new Power3(10,10,10)
            new Power3(20,20,20)
        )]
    )
}

// The second scene in the book, with front/back of triangle and a ground made of 2 triangles

function testScene2() {
    const GROUNDY = -1;
    const GROUNDN = new Vector3(0, 1, 0);
    return new Scene([
        new Triangle(
            [
                new Point3(0,1,-2),
                new Point3(-1.9,-1,-2),
                new Point3(1.6,-0.5,-2)
            ],
            [
                v3normalize(new Vector3(0.0,0.6,1.0)),
                v3normalize(new Vector3(-0.4,-0.4,1.0)),
                v3normalize(new Vector3(0.4,-0.4,1.0))
            ],
            makeGlossyBsdf(
                [0, 0.8, 0], // matte green underneath
                [0.2, 0.2, 0.2], // shiny white (reflects all colors) gloss
                100)),
        // the back: same vertices / normals, with opposite orientation.
        new Triangle(
            [
                new Point3(-1.9,-1,-2),
                new Point3(0,1,-2),
                new Point3(1.6,-0.5,-2)
            ],
            [
                v3normalize(new Vector3(-0.4,-0.4,1.0)),
                v3normalize(new Vector3(0.0,0.6,1.0)),
                v3normalize(new Vector3(0.4,-0.4,1.0))
            ],
            makeGlossyBsdf(
                [0, 0.8, 0], // matte green underneath
                [0.2, 0.2, 0.2], // shiny white (reflects all colors) gloss
                100)),
        new Triangle(
            [
                new Point3(-10, GROUNDY, -10),
                new Point3(-10, GROUNDY, -0.01),
                new Point3(10, GROUNDY, -0.01)
            ],
            [GROUNDN, GROUNDN, GROUNDN],
            makeLambertianBsdf([0.8,0.8,0.8])),
        new Triangle(
            [
                new Point3(-10, GROUNDY, -10),
                new Point3(10, GROUNDY, -0.01),
                new Point3(10, GROUNDY, -10)
            ],
            [GROUNDN, GROUNDN, GROUNDN],
            makeLambertianBsdf([0.8,0.8,0.8]))
        ],
        [new Light(
            new Point3(1.0,3.0,1.0),
            //new Power3(10,10,10)
            new Power3(30,30,30)
        )]
    )
}
