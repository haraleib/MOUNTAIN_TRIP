//function to init interaction
function interaction(canvas) {
  const mouse = {
    pos: { x : 0, y : 0, z : 0},
    leftButtonDown: false
  };
  function toPos(event) {
    //convert to local coordinates
    const rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  }
  canvas.addEventListener('mousedown', function(event) {
    mouse.pos = toPos(event);
    mouse.leftButtonDown = event.button === 0;
  });
  canvas.addEventListener('mousemove', function(event) {
    const pos = toPos(event);
    const delta = { x : mouse.pos.x - pos.x, y: mouse.pos.y - pos.y };
    if (mouse.leftButtonDown) {
      //add the relative movement of the mouse to the rotation variables
  		camera.rotation.x += delta.x;
  		camera.rotation.y += delta.y;
    }
    mouse.pos = pos;
  });
  canvas.addEventListener('mouseup', function(event) {
    mouse.pos = toPos(event);
    mouse.leftButtonDown = false;
  });
    //reset camera
  document.addEventListener('keypress', function(event) {
    if (event.code === 'KeyR') {
      camera.rotation.x = 0;
  		camera.rotation.y = 0;
      camera.rotation.z = 0.0;
    }
  });
  //move forward
    document.addEventListener('keypress', function(event) {
      if (event.code === 'KeyW') {
        //add the relative movement of the mouse to the rotation variables
        camera.rotation.x += 0.0;
        camera.rotation.y += 0.0;
        camera.rotation.z -= 0.5;
      }
    });
  //move backward
    document.addEventListener('keypress', function(event) {
      if (event.code === 'KeyS') {
        //add the relative movement of the mouse to the rotation variables
        camera.rotation.x += 0.0;
        camera.rotation.y += 0.0;
        camera.rotation.z += 0.5;
      }
    });
}


/*
here we do our camera flight and also applied camera movement for forwarding and backwarding the camera with "W" and "S" keys
*/
function calculateViewMatrix(timeInMilliseconds) {
  /*we define the variables for the camera position
  eye is for the camera, which position the camera has*/
  var eye = [7,0,2];
  var center = [0,0,0]; //the position where the camera looks
  var up = [0, 1, 0];

  //here the first scene starts and lasts 10seconds
  if(timeInMilliseconds<10000 ){
    displayText("Multiple textures on helicopter");
    eye = [0,0,scene1_zcoordinate(timeInMilliseconds)+camera.rotation.z];
    center = [0,0,3]
  } else if(timeInMilliseconds<20000){
      displayText("Heightmap applied on mountain where the heli should land");
    eye = [scene2_xcoordinate(timeInMilliseconds),scene2_ycoordinate(timeInMilliseconds),10+camera.rotation.z];
    center = [0,2,0];
  }else if(timeInMilliseconds<30000){
    displayText("Billboard with text 'land' to show the heli where to land");
    eye =[-11,scene3_ycoordinate(timeInMilliseconds),10+camera.rotation.z];
    center =[0,0,0];
  }
  //when the time is over, so the 30sec, than we define a fixed position for the camera
  else{
      displayText("FIN!!! :)");
     eye = [0,0,12+camera.rotation.z];
     center = [0,0,0];
  }

  viewMatrix = mat4.lookAt(mat4.create(), eye, center, up);
  return viewMatrix;

}

function convertDegreeToRadians(degree) {
  return degree * Math.PI / 180
}

function scene1_zcoordinate(timeInMilliseconds){
  var z =[20];

  return z-(timeInMilliseconds/2000);
}

function scene2_xcoordinate(timeInMilliseconds){
  var x =[9];

  return x-(timeInMilliseconds/5000);
}

function scene2_ycoordinate(timeInMilliseconds){
  var y =[2];

  return y-(timeInMilliseconds/10000);
}

function scene3_ycoordinate(timeInMilliseconds){
  var y =[5];

  return y-(timeInMilliseconds/8000);
}


function initTextures(resources)
{
  //create texture object
  mountaintexture = gl.createTexture();
  //select a texture unit
  gl.activeTexture(gl.TEXTURE0);
  //bind texture to active texture unit
  gl.bindTexture(gl.TEXTURE_2D, mountaintexture);
  //set sampling parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
  gl.texImage2D(gl.TEXTURE_2D, //texture unit target == texture type
    0, //level of detail level (default 0)
    gl.RGBA, //internal format of the data in memory
    gl.RGBA, //image format (should match internal format)
    gl.UNSIGNED_BYTE, //image data type
    resources.mountaintexture); //actual image data
  //clean up/unbind texture
  gl.bindTexture(gl.TEXTURE_2D, null);

  //create texture object
  helitexture2 = gl.createTexture();
  //select a texture unit
  gl.activeTexture(gl.TEXTURE2);
  //bind texture to active texture unit
  gl.bindTexture(gl.TEXTURE_2D, helitexture2);
  //set sampling parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
  gl.texImage2D(gl.TEXTURE_2D, //texture unit target == texture type
    0, //level of detail level (default 0)
    gl.RGBA, //internal format of the data in memory
    gl.RGBA, //image format (should match internal format)
    gl.UNSIGNED_BYTE, //image data type
    resources.helitexture2); //actual image data
  //clean up/unbind texture
  gl.bindTexture(gl.TEXTURE_2D, null);

  //create texture object
  helitexture = gl.createTexture();
  //select a texture unit
  gl.activeTexture(gl.TEXTURE1);
  //bind texture to active texture unit
  gl.bindTexture(gl.TEXTURE_2D, helitexture);
  //set sampling parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
  gl.texImage2D(gl.TEXTURE_2D, //texture unit target == texture type
    0, //level of detail level (default 0)
    gl.RGBA, //internal format of the data in memory
    gl.RGBA, //image format (should match internal format)
    gl.UNSIGNED_BYTE, //image data type
    resources.helitexture); //actual image data
  //clean up/unbind texture
  gl.bindTexture(gl.TEXTURE_2D, null);

  //create texture object
  billboardtexture = gl.createTexture();
  //select a texture unit
  gl.activeTexture(gl.TEXTURE3);
  //bind texture to active texture unit
  gl.bindTexture(gl.TEXTURE_2D, billboardtexture);
  //set sampling parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
  gl.texImage2D(gl.TEXTURE_2D, //texture unit target == texture type
    0, //level of detail level (default 0)
    gl.RGBA, //internal format of the data in memory
    gl.RGBA, //image format (should match internal format)
    gl.UNSIGNED_BYTE, //image data type
    resources.billboardtexture); //actual image data
  //clean up/unbind texture
  gl.bindTexture(gl.TEXTURE_2D, null);

  //create texture object
  greytexture = gl.createTexture();
  //select a texture unit
  gl.activeTexture(gl.TEXTURE4);
  //bind texture to active texture unit
  gl.bindTexture(gl.TEXTURE_2D, greytexture);
  //set sampling parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
  gl.texImage2D(gl.TEXTURE_2D, //texture unit target == texture type
    0, //level of detail level (default 0)
    gl.RGBA, //internal format of the data in memory
    gl.RGBA, //image format (should match internal format)
    gl.UNSIGNED_BYTE, //image data type
    resources.greytexture); //actual image data
  //clean up/unbind texture
  gl.bindTexture(gl.TEXTURE_2D, null);
}


function makeMountain() {
  var mountain = makeRectMash();
  return mountain;
}

/*function to make 400 quads for heightmap*/
function makeRectMash() {
  var position = [];
  var normal = [];
  var texture = [];
  var index = [];

  var quads = 400;

  for (var y = 0; y <= quads; ++y) {
    var v = y / quads; // v always between 0 and 1
    for (var x = 0; x <= quads; ++x) {
      var u = x / quads;    //u always between 0 and 1
      position.push(u, v, 0);
      texture.push(u, v);
      normal.push(0, 0, 1);
    }
  }

  var rowCount = (quads + 1);
  for (var y = 0; y < quads; ++y) {
    var rowOffset0 = (y + 0) * rowCount;
    var rowOffset1 = (y + 1) * rowCount;
    for (var x = 0; x < quads; ++x) {
      var offset0 = rowOffset0 + x;
      var offset1 = rowOffset1 + x;
      index.push(offset0, offset0 + 1, offset1);
      index.push(offset1, offset0 + 1, offset1 + 1);
    }
  }

  return {
    position: position,
    normal: normal,
    texture: texture,
    index: index
  };
}


/*complex 3d shape*/
function makeHeliNose() {

  var position = [
     1.5, 0, 0,
    -1.5, 1, 0,0.80
    -1.5, 0.80,	0.58,
    -1.5, 0.30,	0.9,
    -1.5, -0.30, 0.9,
    -1.5, -0.80, 0.58,
    -1.5, -1, 0,
    -1.5, -0.80, -0.58,
    -1.5, -0.30, -0.9,
    -1.5, 0.30,	-0.9,
    -1.5, 0.80,	-0.58];

  var normal = [0, 0, 1,
                0, 0, 1,
                0, 0, 1,
                0, 0, 1,
                0, 0, 1,
                0, 0, 1,
                0, 0, 1,
                0, 0, 1,
                0, 0, 1,
                0, 0, 1,
                0, 0, 1
              ];
  var texture = [0, 0,
                 1, 0,
                 1, 1,
                 0, 1,
                 0, 0,
                 1, 0,
                 1, 1,
                 0, 1,
                 0, 0,
                 1, 0,
                 1, 1 ];
  var index = [0, 1, 2,
                0, 2, 3,
                0, 3, 4,
                0, 4, 5,
                0, 5, 6,
                0, 6, 7,
                0, 7, 8,
                0, 8, 9,
                0, 9, 10,
                0, 10, 1];
  return {
    position: position,
    normal: normal,
    texture: texture,
    index: index
  };
}
