var gl = null;
var secondShaderProgram = null;
var root = null;
var staticLightNode, rotateLightNodeNode, rotateNode;

var floorTexture;
var helitexture2;
var billboardtexture;
var mountaintexture;
var greytexture;

//for movement
const camera = {
 rotation: {
   x: 0,
   y: 0,
   z: 0
 }
};


//load the shader resources using a utility function
loadResources({
  vs_single: 'shader/single.vs.glsl',
  fs_single: 'shader/single.fs.glsl',
  vs_shader: 'shader/shader.vs.glsl',
  fs_shader: 'shader/shader.fs.glsl',
  helitexture2: 'models/lava.jpg',
  helitexture: 'models/heli.jpg',
  mountaintexture: 'models/mountain.png',
  billboardtexture: 'models/billboard.jpg',
  greytexture: 'models/grey.png',
}).then(function (resources) {
  init(resources);

  render(0);
});

function init(resources) {
  //create a GL context
  gl = createContext();
  //init textures
  initTextures(resources);

  //enable depth test to let objects in front occluse objects further away
  gl.enable(gl.DEPTH_TEST);


  root = createSceneGraph(gl, resources);
  secondShaderProgram = new ShaderSGNode(createProgram(gl, resources.vs_single, resources.fs_single));
  root.append(secondShaderProgram);



  var greyheaven = new RenderSGNode(makeRect(6, 4));

  var greyheavenMatrix = glm.transform({translate: [0.8,0,-16], rotateY : 5, scale: 10});
  var greyheaventransformationnode = new TransformationSGNode(greyheavenMatrix, [greyheaven]);
  secondShaderProgram.append(greyheaventransformationnode);
  interaction(gl.canvas);
}

function createLightSphere(resources) {
  return new ShaderSGNode(createProgram(gl, resources.vs_shader, resources.fs_shader), [
    new RenderSGNode(makeSphere(.4,7,7))
  ]);
}

function createSceneGraph(gl, resources) {
  //create scenegraph
  const root = new ShaderSGNode(createProgram(gl, resources.vs_shader, resources.fs_shader));

    doSetUpLightNodes(root, resources);
    //initialize mountain
    let mountain = new MaterialSGNode(
                  new TextureSGNode(mountaintexture, 0, null, null,
                    new HeightMapRenderNode(makeMountain())
                ));

    mountain.ambient = [0, 0, 0, 1];
    mountain.diffuse = [0.1, 0.1, 0.1, 1];
    mountain.specular = [0.5, 0.5, 0.5, 1];
    mountain.shininess = 50.0;

    root.append(new TransformationSGNode(glm.transform({ translate: [-10,2,-8], rotateX: 90, scale: 20}), [
      mountain
    ]));


  createBillboard(root);
  createHeliCopter(root);
  createComplexShape(root);

  return root;
}

function doSetUpLightNodes(root, resources){
  let light = new LightSGNode();
  light.ambient = [0, 0, 0, 1];
  light.diffuse = [1, 1, 1, 1];
  light.specular = [1, 1, 1, 1];
  light.position = [3, 3, 1];
  light.append(createLightSphere(resources));

  staticLightNode = new TransformationSGNode(mat4.create(), [
      light
  ]);

  root.append(staticLightNode);

  let light2 = new LightSGNode();
  light2.uniform = 'u_light2';
  light2.diffuse = [1, 0.3, 0.3, 1];
  light2.specular = [0.9, 1, 0.3, 1];
  light2.position = [0, 4, -10];
  light2.append(createLightSphere(resources));

  rotateLightNode = new TransformationSGNode(mat4.create(), [
      light2
  ]);
  root.append(rotateLightNode);
}

var heliTransformationNode, heliPropellerTransformationNode;
var heliGround, heliGroundmatrix, heliGroundNode;
var billboard, billboardmatrix, billboardnode, billboardtransformationnode;
var helinose, helinosematrix, helinosenode;
var animatedAngle = 0;

function createComplexShape(root){
  /*billboard*/
    helinose = new MaterialNode( //use now framework implementation of material node
                new TextureSGNode(helitexture, 1, helitexture2, greytexture,
                new RenderSGNode(makeHeliNose())
                ));


    helinosematrix = glm.transform({translate: [0.8,0.2,0.13], rotateY : 10, scale: 0.25});
    helinosenode = new TransformationSGNode(helinosematrix, [helinose]);
    heliTransformationNode.append(helinosenode);
}


function createBillboard(root){
  /*billboard*/
    billboard = new MaterialNode( //use now framework implementation of material node
                new TextureSGNode(billboardtexture, 3, null, greytexture,
                new BillBoardRenderNode(makeRect(2, 1))
                ));

    doSetUpInitialLightToObjects(billboard);

    billboardmatrix = glm.transform({translate: [1,0.5,-2], rotateY: 45, scale: 3});
    billboardnode = new TransformationSGNode(billboardmatrix, [billboard]);

    billboardtransformationnode = new TransformationSceneGraphNode(billboardmatrix);
    billboardtransformationnode.append(billboardnode);

    root.append(billboardtransformationnode);
}

function createHeliCopter(root){

/*heliground*/
  heliGround = new MaterialNode(
      new TextureSGNode(helitexture,1, helitexture2, greytexture,
      new RenderSGNode(makeRect(0.15, 0.08))
 ));

  doSetUpInitialLightToObjects(heliGround);

  heliGroundmatrix = glm.transform({translate: [0,0,0], rotateX: -45, scale: 3});
  heliGroundNode = new TransformationSGNode(heliGroundmatrix, [heliGround]);

  heliTransformationNode = new TransformationSceneGraphNode(heliGroundmatrix);
  heliTransformationNode.append(heliGroundNode);

  /*heliTop*/
  var heliTop = new MaterialNode(
      new TextureSGNode(helitexture,1,helitexture2, greytexture,
      new RenderSGNode(makeRect(0.15, 0.08))
  ));
    doSetUpInitialLightToObjects(heliTop);

    heliTopmatrix = glm.transform({translate: [0.0,0.33,0.33], rotateX: -45, scale: 3});
    heliTopNode = new TransformationSGNode(heliTopmatrix, [heliTop]);

    heliTransformationNode.append(heliTopNode);

/*helileft*/

var heliLeft = new MaterialNode(
    new TextureSGNode(helitexture,1,helitexture2, greytexture,
    new RenderSGNode(makeRect(0.15, 0.08))
));

   doSetUpInitialLightToObjects(heliLeft);
  var heliLeftMatrix = glm.transform({translate: [0,0.33,0], rotateX: -135, scale: 3});
  var heliLeftNode = new TransformationSGNode(heliLeftMatrix, [heliLeft]);
  heliTransformationNode.append(heliLeftNode);

/*heliright*/
var heliRight = new MaterialNode(
    new TextureSGNode(helitexture,1,helitexture2, greytexture,
    new RenderSGNode(makeRect(0.15, 0.08))
));

  doSetUpInitialLightToObjects(heliRight);
  var heliRightMatrix = glm.transform({translate: [0.0,0.0,0.33], rotateX: 45, scale: 3});
  var heliRightNode = new TransformationSGNode(heliRightMatrix, [heliRight]);
  heliTransformationNode.append(heliRightNode);

  /*helifront*/
  var heliFront = new MaterialNode(
      new TextureSGNode(helitexture,1, helitexture2, greytexture,
      new RenderSGNode(makeRect(0.08, 0.08))
  ));

    doSetUpInitialLightToObjects(heliFront);
    var heliFrontMatrix = glm.transform({translate: [0.45,0.2,0.2], rotateY: 90, scale: 3});
    var heliFrontNode = new TransformationSGNode(heliFrontMatrix, [heliFront]);
    heliTransformationNode.append(heliFrontNode);

    /*heliback*/
    var heliBack = new MaterialNode(
        new TextureSGNode(helitexture,1,helitexture2, greytexture,
        new RenderSGNode(makeRect(0.08, 0.08))
    ));

      doSetUpInitialLightToObjects(heliBack);
      var heliBackMatrix = glm.transform({translate: [-.45,0.2,0.2], rotateY: 90, scale: 3});
      var heliBackNode = new TransformationSGNode(heliBackMatrix, [heliBack]);
      heliTransformationNode.append(heliBackNode);


    root.append(heliTransformationNode);

  /*heliback*/
    var heliprop1 = new MaterialNode([
  new RenderSGNode(makeRect(0.001, 0.1))
    ]);
    doSetUpInitialLightToObjects(heliprop1);
    var heliProp1Matrix = glm.transform({translate: [0,0.2,0.0], rotateX: 65, scale: 3});
    var heliProp1Node = new TransformationSGNode(heliProp1Matrix, [heliprop1]);

    heliPropellerTransformationNode = new TransformationSceneGraphNode(heliProp1Matrix);

    /*heliback*/
      var heliprop2 = new MaterialNode([
    new RenderSGNode(makeRect(0.1, 0.001))
      ]);
      doSetUpInitialLightToObjects(heliprop2);
      var heliProp2Matrix = glm.transform({translate: [0,0.2,0.0], rotateX: 65, scale: 3});
      var heliProp2Node = new TransformationSGNode(heliProp2Matrix, [heliprop2]);


    heliPropellerTransformationNode.append(heliProp1Node);
    heliPropellerTransformationNode.append(heliProp2Node);

    heliTransformationNode.append(heliPropellerTransformationNode);
}

function doSetUpInitialLightToObjects(materialNode){
  materialNode.specular = [0.5, 0.5, 0.5, 1];
  materialNode.shininess = 0.7;
}


/*
  heli flight in three different scenes
*/
function heliFlight(timeInMilliseconds){

    if(timeInMilliseconds<10000) {
      //heli starts and propeller start moving and speeding up
     heliTransformationNode.matrix =  mat4.multiply(mat4.create(),heliTransformationNode.matrix, glm.translate(0.0,0.002,0));
      heliPropellerTransformationNode.matrix =  mat4.multiply(mat4.create(), heliPropellerTransformationNode.matrix , glm.rotateY (animatedAngle*0.05));
      if(timeInMilliseconds<3000){
        heliTransformationNode.matrix =  mat4.multiply(mat4.create(),heliTransformationNode.matrix, glm.rotateX(animatedAngle/1000));
      }else if(timeInMilliseconds<6000){
       heliTransformationNode.matrix =  mat4.multiply(mat4.create(),heliTransformationNode.matrix, glm.rotateX(-0.25));
     }else if(timeInMilliseconds<9000){
       heliTransformationNode.matrix =  mat4.multiply(mat4.create(),heliTransformationNode.matrix, glm.rotateX(0.1));
     }
   } else if(timeInMilliseconds<20000){
     //heli toward the mountain
        heliTransformationNode.matrix =  mat4.multiply(mat4.create(),heliTransformationNode.matrix, glm.translate(0.0,0.002,-0.0015));
        heliPropellerTransformationNode.matrix =  mat4.multiply(mat4.create(), heliPropellerTransformationNode.matrix , glm.rotateY (animatedAngle*0.05));

      if(timeInMilliseconds<23000){
        heliTransformationNode.matrix =  mat4.multiply(mat4.create(),heliTransformationNode.matrix, glm.rotateY(animatedAngle/40000));
      }
    } else if(timeInMilliseconds<30000){
      //heli lands on mountain
        heliTransformationNode.matrix =  mat4.multiply(mat4.create(),heliTransformationNode.matrix, glm.translate(0.0,-0.0015,0));
        heliPropellerTransformationNode.matrix =  mat4.multiply(mat4.create(), heliPropellerTransformationNode.matrix , glm.rotateY(30000-timeInMilliseconds));
    }
  }

function render(timeInMilliseconds) {
  checkForWindowResize(gl);

  gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
  //set background color to light gray
  gl.clearColor(0.8, 0.8, 0.8, 1.0);
  //clear the buffer
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


  const context = createSGContext(gl);
  context.projectionMatrix = mat4.perspective(mat4.create(), glm.deg2rad(30), gl.drawingBufferWidth / gl.drawingBufferHeight, 0.01, 100);

  updateViewMatrixForcameraFlight(context, timeInMilliseconds);

  context.sceneMatrix = mat4.multiply(mat4.create(),
                            glm.rotateY(camera.rotation.x),
                            glm.rotateX(camera.rotation.y));


  rotateLightNode.matrix = glm.rotateY(-timeInMilliseconds*0.04);


 heliFlight(timeInMilliseconds);

  root.render(context);

  //animate
  requestAnimationFrame(render);
  //animate based on elapsed time
  animatedAngle = timeInMilliseconds/10;
}


function updateViewMatrixForcameraFlight(context, timeInMilliseconds){
  context.viewMatrix = calculateViewMatrix(timeInMilliseconds);
}

/**
 * a material node contains the material properties for the underlying models
 */
class MaterialNode extends SGNode {

  constructor(children) {
    super(children);
    this.ambient = [0.2, 0.2, 0.2, 1.0];
    this.diffuse = [0.8, 0.8, 0.8, 1.0];
    this.specular = [0, 0, 0, 1];
    this.emission = [0, 0, 0, 1];
    this.shininess = 0.0;
    this.uniform = 'u_material';
  }

  setMaterialUniforms(context) {
    const gl = context.gl,
      shader = context.shader;

    //hint setting a structure element using the dot notation, e.g. u_material.test
    gl.uniform4fv(gl.getUniformLocation(shader, this.uniform+'.ambient'), this.ambient);
    gl.uniform4fv(gl.getUniformLocation(shader, this.uniform+'.diffuse'), this.diffuse);
    gl.uniform4fv(gl.getUniformLocation(shader, this.uniform+'.specular'), this.specular);
    gl.uniform4fv(gl.getUniformLocation(shader, this.uniform+'.emission'), this.emission);
    gl.uniform1f(gl.getUniformLocation(shader, this.uniform+'.shininess'), this.shininess);
  }

  render(context) {
    this.setMaterialUniforms(context);

    //render children
    super.render(context);
  }
}

/**
 * a transformation node, i.e applied a transformation matrix to its successors
 */
class TransformationSceneGraphNode extends SGNode {
  /**
   * the matrix to apply
   * @param matrix
   */
  constructor(matrix) {
    super();
    this.matrix = matrix || mat4.create();
  }

  render(context) {
    //backup previous one
    var previous = context.sceneMatrix;
    //set current world matrix by multiplying it
    if (previous === null) {
      context.sceneMatrix = mat4.clone(this.matrix);
    }
    else {
      context.sceneMatrix = mat4.multiply(mat4.create(), previous, this.matrix);
    }

    //render children
    super.render(context);
    //restore backup
    context.sceneMatrix = previous;
  }

  setMatrix(matrix) {
    this.matrix = matrix;
  }
}

//a scene graph node for setting texture parameters
class TextureSGNode extends SGNode {


  constructor(texture, textureunit, texture2, texture3, children) {
      super(children);
      this.texture = texture;
      this.textureunit = textureunit;
      //we can init a second texture for multitexturing
      if(texture2 != null && texture3 != null){
        this.textureunit2 = textureunit+1;
        this.texture2 = texture2;
        this.textureunit3 = 4; //had to do thi hardcoded because of timeissues
        this.texture3 = texture3;
      }
  }

  render(context)
  {
    gl.uniform1i(gl.getUniformLocation(context.shader, 'u_enableObjectTexture'), 1);

    //set additional shader parameters
    gl.uniform1i(gl.getUniformLocation(context.shader, 'u_tex'), this.textureunit);

    //enable second texturing
    if(this.texture2 != null && this.texture3 != null){
      gl.uniform1i(gl.getUniformLocation(context.shader, 'u_enableSecondObjectTexture'), 1);
      gl.uniform1i(gl.getUniformLocation(context.shader, 'u_tex1'), this.textureunit2);
      gl.uniform1i(gl.getUniformLocation(context.shader, 'u_tex2'), this.textureunit3);
    }

    //activate/select texture unit and bind texture
    gl.activeTexture(gl.TEXTURE0 + this.textureunit);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);

    if(this.texture2 != null){
    //activate/select texture unit and bind texture
      gl.activeTexture(gl.TEXTURE0 + this.textureunit2);
      gl.bindTexture(gl.TEXTURE_2D, this.texture2);
    }
    //render children
    super.render(context);

      //diable second texturing
    gl.uniform1i(gl.getUniformLocation(context.shader, 'u_enableSecondObjectTexture'), 0);
    gl.uniform1i(gl.getUniformLocation(context.shader, 'u_enableObjectTexture'), 0);
  }
}

//class for handling heightmap
class HeightMapRenderNode extends RenderSGNode{
  constructor(renderer, children){
    super(renderer, children);
  }
  render(context)
  {
      //enable hightmap
    gl.uniform1i(gl.getUniformLocation(context.shader, 'u_enableHightmap'), 1);
    //render children
    super.render(context);
  //diable heightmap
    gl.uniform1i(gl.getUniformLocation(context.shader, 'u_enableHightmap'), 0);
  }
}

//class for handling billboarding
class BillBoardRenderNode extends RenderSGNode{

  constructor(renderer, children){
    super(renderer, children);
  }

  render(context)
  {
    //enable billboarding
    gl.uniform1i(gl.getUniformLocation(context.shader, 'u_enableBillboarding'), 1);
    //render children
    super.render(context);
    //diable billboarding
    gl.uniform1i(gl.getUniformLocation(context.shader, 'u_enableBillboarding'), 0);
  }
}
