/*
 * Created by Alvin on 2/9/17.
 */

/* Same as in util-spec.js. XXX How do I fix this? */
function v3eq(v1, v2) {
    const epsilon = 1e-10; // tolerance for floating point errors

    if (v1 instanceof Vector3 && v2 instanceof Vector3) {
        // Note any comparisons with Infinity or NaN will return false because they don't cancel in subtraction.
        return (Math.abs(v1.x-v2.x) + Math.abs(v1.y-v2.y) + Math.abs(v1.z-v2.z) < epsilon);
    }
    // else return undefined
}
function rayeq(r1, r2) {
    if (r1 instanceof Ray && r2 instanceof Ray) {
        return v3eq(r1.direction, r2.direction) && v3eq(r1.origin, r2.origin);
    }
    // else return undefined
}

describe("Converting pixels to rays", function () {
    beforeEach(function () {
        jasmine.addCustomEqualityTester(rayeq);
    });

    it("1x1 window", function () {
        // 1x1 window should center the ray on the z=-1 plane, starting zNear away
        // from the origin along the negative z axis
        var zNear = -1e-7;
        var zray = new Ray(new Vector3(0, 0, zNear), new Vector3(0, 0, -1));

        expect(pxToRay(0, 0, 1, 1, zNear, 90)).toEqual(zray);

    });

    it("2x2 window", function() {
        // Set wide field of view for easier calculations. At this field of view, on z = -1 window will be scaled to
        // [-2, 2]x[-2,2]
        var fieldOfViewX = 2 * Math.atan(2);

        // pixel 0,0 should be at -0.1,0.1 on z=-0.1 near plane.
        var zray00 = new Ray(new Vector3(-0.1,0.1,-0.1), v3normalize(new Vector3(-1,1,-1)));
        expect(pxToRay(0, 0, 2, 2, -0.1, fieldOfViewX)).toEqual(zray00);

        // pixel 0,1 at -0.1,-0.1.
        var zray01 = new Ray(new Vector3(-0.1,-0.1,-0.1), v3normalize(new Vector3(-1,-1,-1)));
        expect(pxToRay(0, 1, 2, 2, -0.1, fieldOfViewX)).toEqual(zray01);

        // pixel 1,0 at 0.1,0.1.
        var zray01 = new Ray(new Vector3(0.1,0.1,-0.1), v3normalize(new Vector3(1,1,-1)));
        expect(pxToRay(1, 0, 2, 2, -0.1, fieldOfViewX)).toEqual(zray01);

        // pixel 1,1 at 0.1,-0.1.
        var zray01 = new Ray(new Vector3(0.1,-0.1,-0.1), v3normalize(new Vector3(1,-1,-1)));
        expect(pxToRay(1, 1, 2, 2, -0.1, fieldOfViewX)).toEqual(zray01);

    });

    it("4x2 window", function () {
        // field of view is 90 degrees, so on z = -1 plane window will be scaled to [-1,1]x[-1/2,1/2].
        // pixel 0,0 should be at (-3/4, 1/4), scaled accordingly.
        var zray00 = new Ray(new Vector3(-0.75e-7, 0.25e-7, -1e-7),
            new Vector3(-3 / Math.sqrt(26), 1 / Math.sqrt(26), 4 / Math.sqrt(26)));
        expect(pxToRay(0, 0, 4, 2, -1e-7, 90)).toEqual(zray00);

    });
});


