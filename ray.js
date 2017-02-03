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
    // scale sqY to match, but then fix the according to aspect ratio (undo normalization above)
    var rayY = sqY * Math.tan(fieldOfViewX * 0.5) * aspect;
    var rayZ = -1;

    // Finally, scale the whole thing to start on the znear plane. Remember zNear < 0
    return {
        origin: new Point3(rayX * (-zNear), rayY * (-zNear), zNear),
        direction: (new Vector3(rayX, rayY, rayZ)).normalize()
    }

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
            console.log(ray.origin.x, ray.origin.y, ray.origin.z, ray.direction.x, ray.direction.y, ray.direction.z);
            rawImage.set(x,y,new Radiance3((ray.direction.x+1)/5, (ray.direction.y+1)/5, (ray.direction.z+1)/5));

            /*
            // Loop through the triangles, and find the closest one it intersects. Store radiance from that tracing.
            var minDist = Infinity;
            var radiance = new Radiance3();

            for (var i = 0; i < scene.triangle.length; i++) {
                // compute ray-triangle intersections
            }
            */
        }
    }
}
