/*
 * Created by Alvin on 2/2/17.
 */

/* Given a pixel in an image, image dimensions, and some camera attributes, compute what
 * the corresponding ray is for that camera.
 */
function pxToRay(x,y,width,height,zNear,fieldOfViewX) {
    /* For each pixel, we need to calculate what ray that corresponds
     * to. We know the camera's position, facing direction, and desired x field of view.
     * From that we can calculate the y field of view from the image dimensions.
     * Then getting the corresponding ray is just a little trig.
     */
    var aspect = height / width;
    // normalize (x,y) in its image to the correct corresponding point in a square about (0,0,-1)
    // of "radius 1" (side length 2) on the z = -1 plane. ie the square [-1,1]x[-1,1]x{-1}.
    // Remember the centers of pixels are what counts (Example: 3x3 image)
    var sqX = ((x+0.5) / width - 0.5) * 2.0;
    var sqY = ((y+0.5) / height - 0.5) * 2.0;
    // scale sqX to the correct camera x field of view for the z = -1 plane.
    // (note field of view angle includes positive and negative x values, so have to scale by 1/2 for tangent)
    var rayX = sqX * Math.tan(fieldOfViewX * 0.5);
    // scale sqY to match, but then fix the according to aspect ratio (undo normalization above), and remember
    // that y axis goes the "opposite way" for pixels as for math.
    var rayY = -sqY * Math.tan(fieldOfViewX * 0.5) * aspect;
    var rayZ = -1;

    var rayv = new Vector3(rayX,rayY,rayZ);

    // Finally, scale the whole thing to start on the znear plane. Remember zNear < 0
    return new Ray(v3scale(-zNear, rayv), v3normalize(rayv));
}

/* Given a ray and triangle, compute the barycentric coordinates of the point in the triangle
 * where the ray intersects it, and the distance from the ray origin to that point. If the ray
 * doesn't intersect it or it's within floating point errors, return Infinity for distance. In
 * that case barycentric coordinates aren't valid. (Well, they're still coordinates, they just aren't between 0 and 1).
 *
 * Note that triangles will be considered non-intersecting if they're almost parallel to the ray.
 * To compensate for this, and make sure we don't have "holes" in our shape near the edges, we "puff up" each triangle
 * by epsilon2 - that is, we allow barycentric coordinates to be slightly negative as long as they're within epsilon2
 * of zero (and in this case, we say they are intersecting).
 */
function intersect(ray, t) {
    // my own algorithm bc I'm too lazy to figure out the one in the book
    const epsilon = 1e-7;
    const epsilon2 = 1e-10;

    // vectors in plane of triangle
    var e1 = v3sub(t.vertex(1),t.vertex(0));
    var e2 = v3sub(t.vertex(2),t.vertex(0));
    // compute geometric normal (not those vertex normals, those are made up to smooth the surface)
    var n = v3normalize(v3cross(e2,e1));
    // note that bc of ccw vertex order, this points "out the back" of the triangle relative to its facing orientation.

    // This dot product is positive if the triangle is facing the correct way for the ray direction to hit its front.
    // We cull the almost-parallel rays to avoid divide-by-zero issues.
    // Note that we don't look at the ray origin, so the ray could still point away from the triangle itself in space!
    if (v3dot(ray.direction, n) <= epsilon) {
        return {
            distance: Infinity,
            barycoords: [0, 0, 0]
        };
    }

    // compute orthogonal distance from ray origin to point in plane of triangle (project onto normal), then
    // use this to compute distance along ray.
    var orthd = v3dot(v3sub(t.vertex(0), ray.origin), n);
    var d = orthd / v3dot(ray.direction, n);
    // Note this may be negative if orthd is negative! This corresponds to the case where the ray orientation matches
    // the triangle orientation but the triangle is "on the wrong side of the camera".
    if (d <= 0) {
        return {
            distance: Infinity,
            barycoords: [0, 0, 0]
        }
    }

    // compute vector in plane of triangle from v0 to intersection pt. Note that if d is very large and triangle
    // is both very large and very far away, there could be floating point errors? Maybe?
    var ept = v3sub(v3add(ray.origin,v3scale(d,ray.direction)), t.vertex(0));

    // comppute vectors in plane of triangle orthogonal to e1 / e2, respectively. Use these to compute barycoords.
    // Choose sign so that v3dot(e1perp,e2), v3dot(e2perp,e1) are both positive.
    var e1perp = v3cross(e1, n);
    var e2perp = v3cross(n, e2);

    var b1 = v3dot(ept,e2perp) / v3dot(e1, e2perp);
    var b2 = v3dot(ept, e1perp) / v3dot(e2, e1perp);
    var b0 = 1 - b1 - b2;

    // check if barycentric coords lie outside the "puffed-up" triangle.
    if (b0 < -epsilon2 || b1 < -epsilon2 || b2 < -epsilon2) {
        return {
            distance: Infinity,
            barycoords: [b0, b1, b2]
        }
    } else {
        return {
            distance: d,
            barycoords: [b0, b1, b2]
        }
    }
}

/* Given a scene, triangle, point in the triangle, and opposite ray direction
 * (the "eye ray"), shade the point (compute its radiance) using the light sources in the scene and the material
 * / BSDF properties of the triangle, reflections with other triangles, etc.
 *
 * For now, just do a simple sum over light sources.
 */
function shade(scene, t, pt, n, eyedir) {

    // Point starts out black. Every light will add some radiance to it.
    var radiance = new Radiance3(0, 0, 0);

    for (var i = 0; i < scene.lights.length; i++) {
        // Compute diistance to light, and outgoing direction from pt to that light.
        var lightv = v3sub(scene.lights[i].position, pt);
        var lightd = v3len(lightv);
        var lightdir = v3normalize(lightv);

        // Lightdir points from pt to light. Check if light is on correct side of triangle.
        if (v3dot(n, lightdir) > 0) {

            // Check for shadows. Build "shadow ray" starting near pt, just off the triangle, and traveling
            // toward light source. Check for intersections closer than the light source.
            const shadowepsilon = 1e-4;
            var shadowray = new Ray(v3add(pt, v3scale(shadowepsilon, lightdir)), lightdir);
            var visible = true;
            for (var j = 0; j < scene.triangles.length; j++) {
                d = intersect(shadowray, scene.triangles[j]).distance;
                if (d < lightd - shadowepsilon) {
                    visible = false;
                    break;
                }
            }
            // Now, if there were no shadows, compute incoming radiance and scattering.
            if (visible) {
                // Light intensity is spread evenly about the sphere of radius lightd about the source. Calculate
                // how much makes it to our point.
                var inrad = c3scale(1 / (4 * Math.PI * lightd * lightd), scene.lights[i].power);

                // Scatter using triangle BSDF
                scatterrad = t.bsdf.scatter(n, lightdir, eyedir, inrad);
                // Scale by incident dot product (tilted surfaces are dimmer, light spread over more area)
                radiance = c3add(radiance, c3scale(v3dot(n, lightdir), scatterrad));
            }
        }
    }

    return radiance;
}

/* Given a scene and camera, populate the given rawImage within the rectangle of
 * the image given by (x0,y0) and (x1,y1) by ray tracing. The rest of the rawImage is unmodified.
 * If (x0,y0)=(0,0) and (x1,y1)=(rawImage.length, rawImage.width), this ray traces the entire image.
 */
function rayTrace(scene,camera,x0,x1,y0,y1,rawImage) {
    // Walk through all the pixels of the given rectangle
    for (var y = y0; y < y1; y++) {
        for (var x = x0; x < x1; x++) {
            // Get ray through that pixel
            var ray = pxToRay(x, y, rawImage.width, rawImage.height, camera.zNear, camera.fieldOfViewX);
            // Test pxToRay using "direction colors"
            //console.log(ray.origin.x, ray.origin.y, ray.origin.z, ray.direction.x, ray.direction.y, ray.direction.z);
            //rawImage.set(x,y,new Radiance3((ray.direction.x+1)/5, (ray.direction.y+1)/5, (ray.direction.z+1)/5));

            // Loop through the triangles, and find the closest one it intersects. Store radiance from that tracing.
            var minDist = Infinity;
            // Every pixel is dark blue by default.
            var radiance = new Radiance3(0.02, 0.02, 0.05);

            for (var i = 0; i < scene.triangles.length; i++) {
                var t = scene.triangles[i];
                // calculate where (if at all) ray intersects triangle.
                var iret = intersect(ray, t);
                var d = iret.distance;
                var bc = iret.barycoords;
                // If it's closer than all previous triangles, re-shade accordingly.
                if (d < minDist) {
                    minDist = d;
                    // compute point of intersection
                    var pt = v3add(ray.origin, v3scale(d, ray.direction));

                    // interpolate vertex normal using barycentric coords (for shading)
                    var n = v3normalize(v3add(
                        v3scale(bc[0], t.normal(0)),
                        v3scale(bc[1], t.normal(1)),
                        v3scale(bc[2], t.normal(2))));

                    // We shade based on vertex normal and opposite ray direction (the "physical ray")
                    radiance = shade(scene, t, pt, n, v3scale(-1, ray.direction));
                    // for testing: every intersection is white
                    // radiance = new Radiance3(1, 1, 1);
                    // for fancier testing: shade according to barycentric coords
                    // radiance = new Radiance3(bc[0], bc[1], bc[2]);
                }
            }
            // Finally, shade the image accordingly.
            rawImage.set(x, y, radiance);
        }
    }
}
