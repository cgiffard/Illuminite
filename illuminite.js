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
	};
	
	// Calculate Blinn Phong for vertex.
	Illuminite.calcBlinnPhong = function(lights,camera,vertex,vertexNormal,specularHardness) {
		var lightModelOut = new Illuminite.LightModel();
		var lightDir = [0,0,0],
			lightDistance = 0,
			squaredLightDistance = 0,
			diffuseIntensity = 0
			diffuseOut = [],
			halfVector = [],
			halfVectorLength = 0,
			specularIntensity = 0,
			halfVectorDotProduct = 0,
			specularOut = [];
		
		specularHardness = specularHardness && !isNaN(specularHardness) ? specularHardness : 10;
		
		lights.forEach(function(light) {
			if (light.diffusePower > 0) {
				// Find the vector between the light and vertex being calculated
				lightDir = [
					light.position[0] - vertex[0],
					light.position[1] - vertex[1],
					light.position[2] - vertex[2]
				];
				
				// Get the distance between the light and vertex from it
				lightDistance = Math.sqrt(Math.pow(lightDir[0],2) + Math.pow(lightDir[1],2) + Math.pow(lightDir[2],2));
				
				// Multiply for inverse square wave attenuation law (Will optimise out in future, once this is working)
				squaredLightDistance = lightDistance * lightDistance;
				
				// Normalise distance vector
				lightDir = lightDir.map(function (component) {
					return component / lightDistance;
				});
				
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
				halfVectorLength = Math.sqrt(Math.pow(halfVector[0],2) + Math.pow(halfVector[1],2) + Math.pow(halfVector[2],2));
				halfVector = halfVector.map(function (component) {
					return component / halfVectorLength;
				});
				
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
				
				
				lightModelOut.diffuse = diffuseOut;
				lightModelOut.specular = specularOut;
			}
		});
		
		return lightModelOut;
	};
	
	(typeof module != "undefined" && module.exports) ? (module.exports = Illuminite) : (typeof define != "undefined" ? (define("illuminite", [], function() { return Illuminite; })) : (glob.Illuminite = Illuminite));
})(this);