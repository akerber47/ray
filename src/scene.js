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
            {}
        )],
        [new Light(
            new Point3(1.0,3.0,1.0),
            new Power3(10,10,10)
        )]
    )
}
