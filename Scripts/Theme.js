var Zoom=380;
var Upward=417;
var gui;
var theme;

// set opponent reflexes (0 - easiest, 1 - hardest)
var difficulty = 0.2;
var play=0;
var name='You';
var day=1;
var follow=true;

var renderer, scene, camera, pointLight, s_light,a_light;
var controls ;
var fieldWidth = 400, fieldHeight = 200;

// paddle variables
var paddleWidth, paddleHeight, paddleDepth, paddleQuality;
var paddle1DirY = 0, paddle2DirY = 0, paddleSpeed = 4,paddleSpeed1 = 6;
var plane;
var ball, paddle1, paddle2;
var ballDirX = 1, ballDirY = 1, ballSpeed = difficulty*10+1;
var bounceTime = 0;

// game-related variables
var score1 = 0, score2 = 0;
// you can change this to any positive whole number
var maxScore = 5;


function setup() {	
	score1 = 0;
	score2 = 0;
	var x=0;
	initObjects();
	camera.position.set(-500,0,300);
	camera.up = new THREE.Vector3(0,0,1);
	camera.lookAt(new THREE.Vector3(0,0,0));
	buildGui();	
	draw(); }

function initObjects() {
	var modal_w = window.innerWidth*0.75,
	modal_h =   window.innerHeight;

	//camera attributes
	var VIEW_ANGLE =50,
	ASPECT = modal_w / modal_h,
	NEAR = 0.1,
	FAR = 10000;

	renderer = new THREE.WebGLRenderer();
	camera = new THREE.PerspectiveCamera( VIEW_ANGLE,ASPECT,NEAR,FAR);
	scene = new THREE.Scene();
	scene.add(camera);
	renderer.setSize(window.innerWidth*0.75, window.innerHeight);
	var c = document.getElementById("gameCanvas");
	c.appendChild(renderer.domElement);


//..............................................................................................................Sky..............................
	var skyGeometry =new THREE.CubeGeometry( 1500,1,1000,1,1,1);
	var skyMaterial = new THREE.MeshBasicMaterial({color: 0x8ac7db});
	var sky = new THREE.Mesh(skyGeometry,skyMaterial);
	sky.position.y = -750;	
	scene.add(sky); 
	var skyGeometry =new THREE.CubeGeometry( 1500,1,1000,1,1,1);
	var skyMaterial = new THREE.MeshBasicMaterial({color: 0x8ac7db});
	var sky = new THREE.Mesh(skyGeometry,skyMaterial);
	sky.position.y = 750;
	scene.add(sky);
	var skyGeometry =new THREE.CubeGeometry( 1,1500,1000,1,1,1);
	var skyMaterial = new THREE.MeshBasicMaterial({color: 0x8ac7db});
	var sky = new THREE.Mesh(skyGeometry,skyMaterial);
	sky.position.x = -750;
	scene.add(sky); 
	var skyGeometry =new THREE.CubeGeometry( 1,1500,1000,1,1,1);
	var skyMaterial = new THREE.MeshBasicMaterial({color: 0x8ac7db});
	var sky = new THREE.Mesh(skyGeometry,skyMaterial);
	sky.position.x = 750;
	scene.add(sky);

//..............................................................................................................Table...........................
	var metal_t= THREE.ImageUtils.loadTexture('https://image.shutterstock.com/image-photo/beautiful-water-drop-on-dandelion-260nw-789676552.jpg', {}, function() {});
	var planeGeometry = new THREE.PlaneGeometry( fieldWidth*0.95,fieldHeight*0.99,10,10 );
	var planeMaterial = new THREE.MeshPhongMaterial( {map: metal_t} );
	plane = new THREE.Mesh( planeGeometry,planeMaterial );
	scene.add( plane );
	plane.receiveShadow = true;	

	var wood_t = THREE.ImageUtils.loadTexture('./Textures/wood.jpg', {}, function() {});
	var tableGeometry =new THREE.CubeGeometry(fieldWidth * 1.05,fieldHeight * 1.03,100,10,10,1);
	var tableMaterial = new THREE.MeshLambertMaterial({map: wood_t});
	var table = new THREE.Mesh(tableGeometry, tableMaterial);
	table.position.z = -51;
	scene.add(table);
	table.receiveShadow = true;
	table.castShadow = true;

//..............................................................................................................paddles.........................
	paddleWidth = 10;
	paddleHeight = 30;
	paddleDepth = 10;	

	//paddle2's material
	var paddle2Geometry = new THREE.CubeGeometry(paddleWidth,paddleHeight,paddleDepth,1,1,1);
	var paddle2Material =new THREE.MeshLambertMaterial({ color: 0xBF0040 });
	paddle2 = new THREE.Mesh(paddle2Geometry,paddle2Material);
	scene.add(paddle2);
	paddle2.receiveShadow = true;
	paddle2.castShadow = true;
	paddle2.position.x = +fieldWidth/2 - paddleWidth;
	paddle2.position.z = paddleDepth;

	//paddle1's material
	var paddle1Geometry = new THREE.CubeGeometry(paddleWidth,paddleHeight,paddleDepth,1,1,1);
	var paddle1Material =new THREE.MeshLambertMaterial({ color: 0x0000FF });
	paddle1 = new THREE.Mesh(paddle1Geometry,paddle1Material);
	scene.add(paddle1);
	paddle1.receiveShadow = true;
	paddle1.castShadow = true;
	paddle1.position.x = -fieldWidth/2 + paddleWidth;
	paddle1.position.z = paddleDepth;

//..............................................................................................................ground..........................

	var groundGeometry =new THREE.CubeGeometry( 1500,1500,3,1,1,1);
	var groundMaterial = new THREE.MeshLambertMaterial({ color: 0x009900 });
	var ground = new THREE.Mesh(groundGeometry,groundMaterial);
	ground.position.z = -110;
	ground.receiveShadow = true;	
	scene.add(ground);	

	var grassGeometry = new THREE.PlaneBufferGeometry(1500,1500);
	var texture = new THREE.CanvasTexture( generateTexture() );

	for ( var i = 0; i <20; i ++ ) {
		var grassMaterial = new THREE.MeshLambertMaterial( {
			color: new THREE.Color().setHSL( 0.3, 0.75, ( i / 15 ) * 0.4 + 0.1 ),
			map: texture,
			depthWrite: false,
			transparent: true } );

		var grass = new THREE.Mesh( grassGeometry, grassMaterial );
		grass.position.z = -105;
		grass.position.y = i * 0.25;
		grass.receiveShadow = true;
		scene.add( grass ); }	

function generateTexture() {
	var canvas = document.createElement( 'canvas' );
	canvas.width = 512;
	canvas.height = 512;
	var context = canvas.getContext( '2d' );
	for ( var i = 0; i < 20000; i ++ ) {
		context.fillStyle = 'hsl(0,0%,' + ( Math.random() * 50 + 50 ) + '%)';
		context.beginPath();
		context.arc( Math.random() * canvas.width, Math.random() * canvas.height, Math.random() + 0.15, 0, Math.PI * 2, true );
		context.fill(); }
	context.globalAlpha = 0.075;
	context.globalCompositeOperation = 'lighter';
	return canvas; }

//..............................................................................................................ball vars.......................
	var radius = 5,      
	segments = 10,
	rings = 10;
	var sphereGeometry=new THREE.SphereGeometry(radius,segments,rings);
	var sphereMaterial =new THREE.MeshPhongMaterial({ color: 0x000000 });
	ball = new THREE.Mesh(sphereGeometry,sphereMaterial);
	scene.add(ball);
	ball.position.x = 0;
	ball.position.y = 0;
	ball.position.z = radius;  
	ball.receiveShadow = true;
	ball.castShadow = true;			

//..............................................................................................................Trees...........................
	var bark_t= THREE.ImageUtils.loadTexture('./Textures/bark.jpg', {}, function() {});
	bark_t.wrapS = bark_t.wrapT = THREE.RepeatWrapping;
	bark_t.anisotropy = 16;
	var pillarMaterial = new THREE.MeshLambertMaterial({map: bark_t,side: THREE.DoubleSide});

	for (var i = 0; i < 3; i++){
		for(var j=0;j<2;j++){
			var backdropGeometry=new THREE.CylinderGeometry( 20, 40, 600, 20, 1,1 );
			var backdrop = new THREE.Mesh(backdropGeometry, pillarMaterial);
			backdrop.position.x = -400 + i * 400;
			backdrop.position.y = -400+j*800;
			backdrop.position.z = -30;
			backdrop.rotation.x=Math.PI/2;
			backdrop.castShadow = true;
			backdrop.receiveShadow = true;		
			scene.add(backdrop);	}}	

	var leaves_t= THREE.ImageUtils.loadTexture('./Textures/leave.jpg', {}, function() {});
	leaves_t.wrapS =leaves_t.wrapT = THREE.RepeatWrapping;
	leaves_t.anisotropy = 16;
	var leavesMaterial = new THREE.MeshLambertMaterial({map: leaves_t,side: THREE.DoubleSide});

	for (var i = 0; i < 3; i++) {
		for(var j=0;j<2;j++) {
			var leavesGeometry=new THREE.SphereGeometry(150,7,9,2, 6.3, 0, 6.3);
			var leave = new THREE.Mesh(leavesGeometry, leavesMaterial);
			leave.position.x = -400 + i * 400;
			leave.position.y = -400+j*800;
			leave.position.z = 200;
			leave.rotation.x=Math.PI/2;
			leave.castShadow = true;
			leave.receiveShadow = true;		
			scene.add(leave); }}

//..............................................................................................................point light.....................
	a_light = new THREE.AmbientLight( 0xffffff,0.9); // soft white light
	scene.add( a_light );
	s_light = new THREE.SpotLight(0xF8D898);
	s_light.position.set(0, 0, 50);
	s_light.intensity = 10;
	s_light.castShadow = true;
	scene.add(s_light); 

	var hemiLight = new THREE.HemisphereLight(0xffffff, 0x00ff00, 0.1);
	hemiLight.position.copy(new THREE.Vector3(0, 0, 750));
	hemiLight.name = 'hemiLight';
	scene.add(hemiLight);
	renderer.shadowMapEnabled = true;	

window.addEventListener( 'resize', onWindowResize, false );
}

function draw(){		
	renderer.render(scene, camera);
	requestAnimationFrame(draw);
	if(play==1){
		ballPhysics();
		SpotlightPhysics();
		paddlePhysics();}
	cameraPhysics();
	playerPaddleMovement();
	opponentPaddleMovement(); }

function ballPhysics() {
	if (ball.position.x <= -fieldWidth/2){	// if ball goes off the 'left' side (Player's side)
		score2++;
		document.getElementById("scores").innerHTML = score1 + "-" + score2;
		resetBall(2);
		matchScoreCheck();	}

	if (ball.position.x >= fieldWidth/2) {	// if ball goes off the 'right' side (CPU's side)
		score1++;
		document.getElementById("scores").innerHTML = score1 + "-" + score2;
		resetBall(1);
		matchScoreCheck();	}

	if (ball.position.y <= -fieldHeight/2) { // if ball goes off the top side (side of table)
		ballDirY = -ballDirY;}	

	if (ball.position.y >= fieldHeight/2) { // if ball goes off the bottom side (side of table)
		ballDirY = -ballDirY;}

	// update ball position over time
	ball.position.x += ballDirX * ballSpeed;
	ball.position.y += ballDirY * ballSpeed;

	// limit ball's y-speed to 2x the x-speed
	// this is so the ball doesn't speed from left to right super fast
	// keeps game playable for humans
	if (ballDirY > ballSpeed * 2) { ballDirY = ballSpeed * 2; }
	else if (ballDirY < -ballSpeed * 2) { ballDirY = -ballSpeed * 2; }}

function SpotlightPhysics() {
	if(follow==true){
		s_light.target=ball;
		s_light.position.x =ball.position.x;
		s_light.position.y =ball.position.y; }
	else
		{s_light.position.x =0;
		s_light.position.y =0;
		s_light.position.z=130;
		s_light.target=plane; }}

function opponentPaddleMovement() { // Handles CPU paddle movement and logic

	paddle2DirY = (ball.position.y - paddle2.position.y) * difficulty; // Lerp towards the ball on the y plane

	if (Math.abs(paddle2DirY) <= paddleSpeed) { paddle2.position.y += paddle2DirY; } // in case the Lerp function produces a value above max paddle speed, we clamp it

	else { // if the lerp value is too high, we have to limit speed to paddleSpeed
		if (paddle2DirY > paddleSpeed) { paddle2.position.y += paddleSpeed; } // if paddle is lerping in +ve direction
		else if (paddle2DirY < -paddleSpeed) { paddle2.position.y -= paddleSpeed; }} // if paddle is lerping in -ve direction
	}

function playerPaddleMovement() { // Handles player's paddle movement

	if (Key.isDown(Key.A)) { // move left
		if (paddle1.position.y < fieldHeight * 0.45) { paddle1DirY = paddleSpeed1 * 0.5; }
		else { paddle1DirY = 0; }}	

	else if (Key.isDown(Key.D)) { // move right
		if (paddle1.position.y > -fieldHeight * 0.45) { paddle1DirY = -paddleSpeed1 * 0.5; }
		else { paddle1DirY = 0; }}

	else { paddle1DirY = 0; }

	paddle1.scale.y += (1 - paddle1.scale.y) * 0.2;	
	paddle1.position.y += paddle1DirY;}

function cameraPhysics() {	
	camera.position.x = paddle1.position.x -Zoom;
	camera.position.y += (paddle1.position.y - camera.position.y) * 0.05;
	camera.position.z = Upward;
	camera.rotation.x = -0.01 * (ball.position.y) * Math.PI/180;
	camera.rotation.y = -60 * Math.PI/180;
	camera.rotation.z = -90 * Math.PI/180;}

function paddlePhysics() {	// Handles paddle collision logic
	if (ball.position.x <= paddle1.position.x + paddleWidth &&  ball.position.x >= paddle1.position.x)
		{
		if (ball.position.y <= paddle1.position.y + paddleHeight/2 &&  ball.position.y >= paddle1.position.y - paddleHeight/2)
			{
			if (ballDirX < 0) { ballDirX = -ballDirX; ballDirY -= paddle1DirY * 0.7; } // and if ball is travelling towards player (-ve direction)
			}
		}

	// OPPONENT PADDLE LOGIC	

	if (ball.position.x <= paddle2.position.x + paddleWidth &&  ball.position.x >= paddle2.position.x)
		{
		if (ball.position.y <= paddle2.position.y + paddleHeight/2 &&  ball.position.y >= paddle2.position.y - paddleHeight/2)
			{
			if (ballDirX > 0) { ballDirX = -ballDirX; ballDirY -= paddle2DirY * 0.7; } // and if ball is travelling towards opponent (+ve direction)
			}
		}}

function resetBall(loser) {
	ball.position.x = 0;
	ball.position.y = 0;
	s_light.position.set(0, 0, 50);

	if (loser == 1) {ballDirX = -1;}
	else {ballDirX = 1;}

	ballDirY = 1; }

function matchScoreCheck() {  //checking if anyone won
	if (score1 >= maxScore)
		{ballSpeed = 0; //stop game
		document.getElementById("scores").innerHTML = name+" wins!";}

	else if (score2 >= maxScore)
		{ballSpeed = 0; // stop the ball
		document.getElementById("scores").innerHTML = "CPU wins!";}
	}

function onWindowResize() {
	camera.aspect = window.innerWidth*0.75 / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth*0.75, window.innerHeight );
	}

function buildGui() {
	var params = {  Zoom:380,
					Name: 'You',
					Theme:'DAY',
					Upward:417,
					difficulty:0.2,
					AmbientIntensity:0.9,
					AmbientLight:a_light.color.getHex(),
					Play:function(){ play=1; },
					Pause:function(){ play=0;},
					Restart:function(){ 
					play=0; score1=0; score2=0;
					document.getElementById("scores").innerHTML = score1+"-"+score2;  
					ball.position.x = 0;
					ball.position.y = 0;
					s_light.position.set(0, 0, 50);
					ballSpeed = difficulty*10+1;	},
					SpotlightRadius:50,
					Spotlight:s_light.color.getHex(),
					SpotlightIntensity:1,
					Paddle1:paddle1.material.color.getHex(),
					Paddle2:paddle2.material.color.getHex(),
					Followball:true};
	gui = new dat.GUI();
	gui.remember(params); 
	gui.open();
	
	var f1 = gui.addFolder('Game Controls');
	f1.add(params, 'Name').onChange( function ( val ) { document.getElementById("name").innerHTML = val+"- CPU";	name=val;} );
	theme=f1.add(params, 'Theme', [ 'DAY', 'NIGHT'] ).onChange( function ( val ){
		if(val=='DAY'){
			f3.remove(c);
			f3.remove(d);
			f3.remove(e);
			f3.remove(f);
			s_light.intensity=0;
			a_light.intensity=0.9;
			a=f3.addColor( params, 'AmbientLight' ).onChange( function ( val ) {a_light.color.setHex( val );} );
			b=f3.add( params, 'AmbientIntensity', 0.2,1 ).step(0.1).onChange( function ( val ) {a_light.intensity= val;} );
			}
		else if(val=='NIGHT'){
			f3.remove(a);
			f3.remove(b); 
			a_light.intensity=0;
			s_light.intensity=1;
			c=f3.addColor( params, 'Spotlight' ).onChange( function ( val ) {s_light.color.setHex( val );} );
			d=f3.add( params, 'SpotlightIntensity', 0.2,1 ).step(0.1).onChange( function ( val ) {s_light.intensity= val;} );
			e=f3.add( params, 'SpotlightRadius',30,200 ).step(10).onChange( function ( val ) {s_light.position.z= val;} );		
			f=f3.add( params, 'Followball').onChange( function ( val ) {follow=val; if(follow==true){s_light.position.z=50;}} );
			}
		});
	f1.add(params,'Play');
	f1.add(params,'Pause');
	f1.add(params,'Restart');
	f1.add( params, 'difficulty', 0,1 ).step(0.1).onChange( function ( val ) {difficulty= val; ballSpeed = difficulty*10+1;} );
	f1.addColor( params, 'Paddle1' ).onChange( function ( val ) {paddle1.material.color.setHex( val );} );
	f1.addColor( params, 'Paddle2' ).onChange( function ( val ) {paddle2.material.color.setHex(val );} );
	
	var f2 = gui.addFolder('Camera Controls');
	f2.add( params, 'Zoom', 90,500 ).step(10).onChange( function ( val ) {Zoom = val;} );
	f2.add( params, 'Upward', 90,550 ).onChange( function ( val ) {Upward = val;} );

	var f3 = gui.addFolder('Light Controls');
	s_light.intensity=0;
	a=f3.addColor( params, 'AmbientLight' ).onChange( function ( val ) {a_light.color.setHex( val );} );
	b=f3.add( params, 'AmbientIntensity', 0.2,1 ).step(0.1).onChange( function ( val ) {a_light.intensity= val;} );
	}



