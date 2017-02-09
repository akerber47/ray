function v3eq(v1, v2) {
    const epsilon = 1e-10; // tolerance for floating point errors

    if ((typeof v1 == 'object') && (typeof v2 == 'object') &&
        (typeof v1.x == 'number') && (typeof v2.x == 'number') &&
        (typeof v1.y == 'number') && (typeof v2.y == 'number') &&
        (typeof v1.z == 'number') && (typeof v2.z == 'number')) {
        // Note any comparisons with Infinity or NaN will return false because they don't cancel in subtraction.
        return (Math.abs(v1.x-v2.x) + Math.abs(v1.y-v2.y) + Math.abs(v1.z-v2.z) < epsilon);
    }
    // else return undefined
}

describe("Vector3 Equality", function() {
    beforeEach(function() {
        jasmine.addCustomEqualityTester(v3eq);
    });

    it("can compare Vector3 objects for equality", function() {
        var v = new Vector3(1, 1, 1);
        expect(v).toEqual(v);
        expect(v).toEqual(new Vector3(1, 1, 1));
        expect(v).toEqual(new Vector3(1, 1, 1.0000000000000000000001));
        expect(v).not.toEqual(new Vector3(1, 1, 1.00000001));
        expect(v).not.toEqual(new Vector3(0, 1, 1));
        expect(v).not.toEqual(new Vector3(-1, 1, 1));
        expect(v).not.toEqual(new Vector3(1, 0, 1));
    });

    it("Vector3 and Point3 are comparable", function() {
        expect(new Vector3(1, 2, 3)).toEqual(new Point3(1, 2, 3));
    })

    it("Vector3 comparisons work with Infinity and NaN", function() {
        var v = new Vector3(0, 0, Infinity);
        expect(v).not.toEqual(new Vector3(0, 0, Infinity));
        expect(v).not.toEqual(new Vector3(0, 0, 0));
        expect(v).not.toEqual(new Vector3(0, 0, -Infinity));

        var v2 = new Vector3(NaN, 0, 0);
        expect(v2).not.toEqual(new Vector3(NaN, 0, 0));
        expect(v2).not.toEqual(new Vector3(0, 0, 0));
        expect(v2).not.toEqual(new Vector3(Infinity, 0, 0));
    });
});

describe("Vector3 Operations", function() {
    beforeEach(function() {
        jasmine.addCustomEqualityTester(v3eq);
    });

    var v0 = new Vector3(0, 0, 0);
    var e1 = new Vector3(1, 0, 0);
    var e2 = new Vector3(0, 1, 0);
    var e3 = new Vector3(0, 0, 1);

    it("Vector3 addition", function() {
        expect(v3add(e1, e2)).toEqual(new Vector3(1, 1, 0));
        expect(v3add(e1, e1, e2)).toEqual(new Vector3(2, 1, 0));
        expect(v3add(e3, v3add(e1, e2))).toEqual(new Vector3(1, 1, 1));
        expect(v3add(v0, e1)).toEqual(e1);
        expect(v3add(e1)).toEqual(e1);
        expect(v3add()).toEqual(v0);

        expect(function() {
            v3add(e1, 1);
        }).toThrowError(TypeError);

        expect(function() {
            v3add(2, e1);
        }).toThrowError(TypeError);
    });

    it("Vector3 scaling", function() {
        expect(v3scale(5, e1)).toEqual(new Vector3(5, 0, 0));
        expect(v3scale(0, e1)).toEqual(v0);
        expect(v3add(v3scale(3, e1),v3scale(4,e2),v3scale(5,e3))).toEqual(new Vector3(3, 4, 5));

        expect(function() {
            v3scale(e1, e2);
        }).toThrowError(TypeError);

        expect(function() {
            v3add(2, 3);
        }).toThrowError(TypeError);
    });

    it("Vector3 dot product, length, normalize", function() {
        var v = new Vector3(3, 4, 5);
        var v2 = new Vector3(2, 2, 1);
        expect(v3dot(v, e1)).toEqual(3);
        expect(v3dot(v, v)).toEqual(50);
        expect(v3dot(v, v2)).toEqual(19);
        expect(v3dot(v, v0)).toEqual(0);

        expect(function() {
            v3dot(e1, 1);
        }).toThrowError(TypeError);

        expect(function() {
            v3dot(1, e1);
        }).toThrowError(TypeError);

        expect(v3len(e1)).toEqual(1);
        expect(v3len(v2)).toEqual(3);

        expect(v3normalize(e3)).toEqual(e3);
        expect(v3normalize(v2)).toEqual(new Vector3(2/3, 2/3, 1/3));
    });
});