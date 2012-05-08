// Illuminite.
(function (glob) {
	
	var Illuminite = {};
	
	Illuminite.PointLight = function(position,color,intensity) {
		this.position		= position	instanceof Array && position.length	=== 3 ? position : [0,0,0];
		this.color			= color		instanceof Array && color.length	=== 3 ? color : [255,255,255];
		this.diffusePower	= intensity && !isNaN(intensity) ? intensity : 100;
		this.specularPower	= intensity && !isNaN(intensity) ? intensity : 100;
	};
	
	Illuminite.SpotLight = function(position,normal,color,intensity) {
		this.position	= position	instanceof Array && position.length	=== 3 ? position : [0,0,0];
		this.normal		= normal	instanceof Array && normal.length	=== 3 ? normal : [0,0,0];
		this.color		= color		instanceof Array && color.length	=== 3 ? color : [255,255,255];
		this.diffusePower	= intensity && !isNaN(intensity) ? intensity : 100;
		this.specularPower	= intensity && !isNaN(intensity) ? intensity : 100;
	};
	
	Illuminite.AmbientLight = function(position,color,intensity) {
		this.position	= position	instanceof Array && position.length	=== 3 ? position : [0,0,0];
		this.color		= color		instanceof Array && color.length	=== 3 ? color : [255,255,255];
		this.diffusePower	= intensity && !isNaN(intensity) ? intensity : 100;
		this.specularPower	= intensity && !isNaN(intensity) ? intensity : 100;
	};
	
	Illuminite.LightModel = function() {
		this.specular = [0,0,0];
		this.diffuse = [0,0,0];
	};
	
	Illuminite.LightModel.prototype = {
		"constructor": function LightModel(){},
		"rgb": function() {
			return [
				(this.specular[0] + this.diffuse[0])|0,
				(this.specular[1] + this.diffuse[1])|0,
				(this.specular[2] + this.diffuse[2])|0
			];
		}
	};
	
	// Calculate Blinn Phong for vertex.
	Illuminite.calcBlinnPhong = function(lights,camera,vertex,vertexNormal,specularHardness) {
		var lightModelOut = new Illuminite.LightModel();
		var light,
			lightDir = [0,0,0],
			lightDistance = 0,
			squaredLightDistance = 0,
			diffuseIntensity = 0,
			diffuseOut = [],
			halfVector = [],
			halfVectorLength = 0,
			specularIntensity = 0,
			halfVectorDotProduct = 0,
			specularOut = [],
			vertexFacesLight;
		
		specularHardness = specularHardness && !isNaN(specularHardness) ? specularHardness : 100;
		
		for (var lightIndex = 0; lightIndex < lights.length; lightIndex++) {
			light = lights[lightIndex];
			
			var vertexDotProduct =
				(light.position[0] * vertexNormal[0]) +
				(light.position[1] * vertexNormal[1]) +
				(light.position[2] * vertexNormal[2]);
			
			if (light.diffusePower > 0 && vertexDotProduct > 0) {
				// Find the vector between the light and vertex being calculated
				lightDir = [
					light.position[0] - vertex[0],
					light.position[1] - vertex[1],
					light.position[2] - vertex[2]
				];
				
				// Get the distance between the light and vertex from it
				lightDistance = Math.sqrt((lightDir[0] * lightDir[0]) + (lightDir[1] * lightDir[1]) + (lightDir[2] * lightDir[2]));
				
				// Multiply for inverse square wave attenuation law (Will optimise out in future, once this is working)
				squaredLightDistance = lightDistance * lightDistance;
				
				// Normalise distance vector
				lightDir[0] /= lightDistance;
				lightDir[1] /= lightDistance;
				lightDir[2] /= lightDistance;
				
				// Calculate intensity of diffuse component
				diffuseIntensity =
					(lightDir[0] * vertexNormal[0]) + 
					(lightDir[1] * vertexNormal[1]) + 
					(lightDir[2] * vertexNormal[2]);
				
				// Clamp to 0-1 (possibly remove for HDR?)
				diffuseIntensity = diffuseIntensity > 1 ? 1 : diffuseIntensity;
				
				// Get diffuse colour
				diffuseOut = [
					Math.abs(diffuseIntensity * light.color[0] * light.diffusePower / squaredLightDistance),
					Math.abs(diffuseIntensity * light.color[1] * light.diffusePower / squaredLightDistance),
					Math.abs(diffuseIntensity * light.color[2] * light.diffusePower / squaredLightDistance)
				];
				
				// Specular reflection part ----------------------------
				
				// Calculate half-vector
				// First, add light direction and camera vectors
				halfVector = [
					lightDir[0] + camera[0],
					lightDir[1] + camera[1],
					lightDir[2] + camera[2]
				];
				
				// Find length for normalisation
				halfVectorLength = Math.sqrt((halfVector[0] * halfVector[0]) + (halfVector[1] * halfVector[1]) + (halfVector[2] * halfVector[2]));
				halfVector[0] /= halfVectorLength;
				halfVector[1] /= halfVectorLength;
				halfVector[2] /= halfVectorLength;
				
				// Get dot product of vertex normal and half vector
				halfVectorDotProduct =
					(halfVector[0] * vertexNormal[0]) +
					(halfVector[1] * vertexNormal[1]) +
					(halfVector[2] * vertexNormal[2]);
					
				// Clamp to 1. Same as above...
				halfVectorDotProduct = halfVectorDotProduct > 1 ? 1 : halfVectorDotProduct;
				
				// Calculate specular intensity
				specularIntensity = Math.pow(halfVectorDotProduct,specularHardness);
				
				// Calculate specular component...
				specularOut = [
					Math.abs(specularIntensity * light.color[0] * light.specularPower / squaredLightDistance),
					Math.abs(specularIntensity * light.color[1] * light.specularPower / squaredLightDistance),
					Math.abs(specularIntensity * light.color[2] * light.specularPower / squaredLightDistance)
				]
				
				// Add together diffuse component for this light
				lightModelOut.diffuse[0] += diffuseOut[0];
				lightModelOut.diffuse[1] += diffuseOut[1];
				lightModelOut.diffuse[2] += diffuseOut[2];
				
				// Add together specular component for this light
				lightModelOut.specular[0] += specularOut[0];
				lightModelOut.specular[1] += specularOut[1];
				lightModelOut.specular[2] += specularOut[2];
			}
		}
		
		return lightModelOut;
	};
	
	(typeof module != "undefined" && module.exports) ? (module.exports = Illuminite) : (typeof define != "undefined" ? (define("illuminite", [], function() { return Illuminite; })) : (glob.Illuminite = Illuminite));
})(this);