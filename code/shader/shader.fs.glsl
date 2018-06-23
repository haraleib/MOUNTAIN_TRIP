precision mediump float;


 // common material properties

struct Material {
	vec4 ambient;
	vec4 diffuse;
	vec4 specular;
	vec4 emission;
	float shininess;
};

 //light properties

struct Light {
	vec4 ambient;
	vec4 diffuse;
	vec4 specular;
};

//illumination related variables
uniform Material u_material;
uniform Light u_light;
varying vec3 v_normalVec;
varying vec3 v_eyeVec;
varying vec3 v_lightVec;

//texture related variables
uniform bool u_enableObjectTexture;
uniform bool u_enableSecondObjectTexture;

varying vec2 v_texCoord;
uniform sampler2D u_tex;
uniform sampler2D u_tex1;
uniform sampler2D u_tex2;

uniform Light u_light2;
varying vec3 v_light2Vec;

vec4 calculateSimplePointLight(Light light, Material material, vec3 lightVec, vec3 normalVec, vec3 eyeVec, vec4 textureColor) {
	lightVec = normalize(lightVec);
	normalVec = normalize(normalVec);
	eyeVec = normalize(eyeVec);

	float diffuse = max(dot(normalVec,lightVec),0.0);

	vec3 reflectVec = reflect(-lightVec,normalVec);
	float spec = pow( max( dot(reflectVec, eyeVec), 0.0) , material.shininess);

  if(u_enableObjectTexture){
    material.diffuse = textureColor;
    material.ambient = textureColor;
  }

	vec4 c_amb  = clamp(light.ambient * material.ambient, 0.0, 1.0);
	vec4 c_diff = clamp(diffuse * light.diffuse * material.diffuse, 0.0, 1.0);
	vec4 c_spec = clamp(spec * light.specular * material.specular, 0.0, 1.0);
	vec4 c_em   = material.emission;

  return c_amb + c_diff + c_spec + c_em;
}

void main (void) {

  vec4 textureColor = vec4(0,0,0,1);
  vec4 textureColor1 = vec4(0,0,0,1);
  vec4 textureColor2 = vec4(0,0,0,1);
  vec4 finalTextureColor = vec4(0,0,0,1);
  if(u_enableObjectTexture)
  {
		textureColor = texture2D(u_tex,v_texCoord);

    if(u_enableSecondObjectTexture) {
      textureColor1 = texture2D(u_tex1, v_texCoord);
      textureColor2 = texture2D(u_tex2, v_texCoord);
      finalTextureColor.x = (textureColor.x + textureColor2.x + textureColor2.x)/3.0;
      finalTextureColor.y = (textureColor.y + textureColor2.y + textureColor2.y)/3.0;
      finalTextureColor.z = (textureColor.z + textureColor2.z + textureColor2.z)/3.0;
    }
  }
  if(u_enableSecondObjectTexture){
	 gl_FragColor = calculateSimplePointLight(u_light, u_material, v_lightVec, v_normalVec, v_eyeVec, finalTextureColor)+
   	+ calculateSimplePointLight(u_light2, u_material, v_light2Vec, v_normalVec, v_eyeVec,  finalTextureColor);
  }else{
      gl_FragColor = calculateSimplePointLight(u_light, u_material, v_lightVec, v_normalVec, v_eyeVec, textureColor)
   	+ calculateSimplePointLight(u_light2, u_material, v_light2Vec, v_normalVec, v_eyeVec, textureColor);
  }
}
