// Phong Vertex Shader

attribute vec3 a_position;
attribute vec3 a_normal;
attribute vec2 a_texCoord;


uniform bool u_enableBillboarding;
attribute vec3 a_cameraPosition;

uniform mat4 u_modelView;
uniform mat3 u_normalMatrix;
uniform mat4 u_projection;
uniform mat4 u_invView;

uniform vec3 u_lightPos;
uniform bool u_enableHightmap;

//output of this shader
varying vec3 v_normalVec;
varying vec3 v_eyeVec;
varying vec3 v_lightVec;
varying vec2 v_texCoord;

uniform sampler2D u_tex;

uniform vec3 u_light2Pos;
varying vec3 v_light2Vec;

void main() {
	vec4 eyePosition;

 	if(!u_enableHightmap){
	vec4 eyePosition = u_modelView * vec4(a_position,1);

  v_normalVec = u_normalMatrix * a_normal;

  v_eyeVec = -eyePosition.xyz;
	v_lightVec = u_lightPos - eyePosition.xyz;
		v_light2Vec = u_light2Pos - eyePosition.xyz;
	v_texCoord = a_texCoord;

	gl_Position = u_projection * eyePosition;
}


	//enables heightmap
 	if(u_enableHightmap){
		float scalingfactor = 0.5;

		//height from the heightmap image
		vec3 colorToTake = vec3(texture2D(u_tex, a_texCoord));
	 	float heightWithScalingFactor = colorToTake[0] * scalingfactor;

		 //New vertex
		vec3 newVertexPosition = vec3(a_position[0],  a_position[1], heightWithScalingFactor);

		eyePosition = u_modelView * vec4(newVertexPosition,1);
		v_normalVec = u_normalMatrix * a_normal;
		v_eyeVec = -eyePosition.xyz;
		v_lightVec = u_lightPos - eyePosition.xyz;
	v_light2Vec = u_light2Pos - eyePosition.xyz;
		gl_Position = u_projection * eyePosition;
		return;
	}

	if(u_enableBillboarding)
	{
			gl_Position = u_projection * (u_modelView * vec4(0.0, 0.0, 0.0, 1.0) + vec4(a_position.x, a_position.y, 0.0, 0.0));
	}
}
