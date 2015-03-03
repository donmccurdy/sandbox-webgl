/**
 * WebGL Demo
 *
 * Based on: http://aerotwist.com/tutorials/getting-started-with-three-js/
 */

(function (THREE, Stats) {

	var blocker = document.getElementById( 'blocker' );
	var instructions = document.getElementById( 'instructions' );

	var camera, scene, renderer,
		controls, raycaster, terrain, water;

	var canJump = true;

	/* Scene
	********************************/

	var WIDTH = window.innerWidth,
		HEIGHT = window.innerHeight;

	var VIEW_ANGLE = 45,
		ASPECT = WIDTH / HEIGHT,
		NEAR = 0.1,
		FAR = 10000;

	var container = blocker;

	/* PointerLock
	********************************/

	var havePointerLock = 'pointerLockElement' in document
		|| 'mozPointerLockElement' in document
		|| 'webkitPointerLockElement' in document;

	if ( havePointerLock ) {

		var element = document.body;

		var pointerlockchange = function () {

			if ( document.pointerLockElement === element
					|| document.mozPointerLockElement === element
					|| document.webkitPointerLockElement === element ) {

				controlsEnabled = true;
				controls.enabled = true;

				blocker.style.display = 'none';

			} else {

				controls.enabled = false;

				blocker.style.display = '-webkit-box';
				blocker.style.display = '-moz-box';
				blocker.style.display = 'box';

				instructions.style.display = '';

			}

		};

		var pointerlockerror = function () {
			instructions.style.display = '';
		};

		// Hook pointer lock state change events
		document.addEventListener( 'pointerlockchange', pointerlockchange, false );
		document.addEventListener( 'mozpointerlockchange', pointerlockchange, false );
		document.addEventListener( 'webkitpointerlockchange', pointerlockchange, false );

		document.addEventListener( 'pointerlockerror', pointerlockerror, false );
		document.addEventListener( 'mozpointerlockerror', pointerlockerror, false );
		document.addEventListener( 'webkitpointerlockerror', pointerlockerror, false );

		instructions.addEventListener( 'click', function () {

			instructions.style.display = 'none';

			// Ask the browser to lock the pointer
			element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;

			if ( /Firefox/i.test( navigator.userAgent ) ) {

				var fullscreenchange = function () {

					if ( document.fullscreenElement === element
						|| document.mozFullscreenElement === element
						|| document.mozFullScreenElement === element ) {

						document.removeEventListener( 'fullscreenchange', fullscreenchange );
						document.removeEventListener( 'mozfullscreenchange', fullscreenchange );

						element.requestPointerLock();
					}

				};

				document.addEventListener( 'fullscreenchange', fullscreenchange, false );
				document.addEventListener( 'mozfullscreenchange', fullscreenchange, false );

				element.requestFullscreen = element.requestFullscreen
					|| element.mozRequestFullscreen
					|| element.mozRequestFullScreen
					|| element.webkitRequestFullscreen;

				element.requestFullscreen();

			} else {

				element.requestPointerLock();

			}

		}, false );

	} else {

		instructions.innerHTML = 'Your browser doesn\'t seem to support Pointer Lock API';

	}


	/* Resources
	********************************/

	var manager = new THREE.LoadingManager();
	manager.onProgress = function (item, loaded, total) {
		console.log(item, loaded, total);
	};

	var loader = new THREE.OBJMTLLoader(manager);

	/* Stats
	********************************/

	var stats = new Stats();
	stats.setMode(0); // 0: fps, 1: ms

	// align top-left
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.left = '0px';
	stats.domElement.style.top = '0px';

	document.body.appendChild(stats.domElement);

	/* Init
	********************************/

	init();
	animate();

	var controlsEnabled = false;

	var moveForward = false;
	var moveBackward = false;
	var moveLeft = false;
	var moveRight = false;

	var prevTime = window.performance.now();
	var velocity = new THREE.Vector3();

	function init() {

		renderer = new THREE.WebGLRenderer();
		renderer.setSize(WIDTH, HEIGHT);

		camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
		camera.position.y = 125;
		camera.position.z = 125;

		scene = new THREE.Scene();
		scene.fog = new THREE.Fog( 0xffffff, 0, 750 );
		scene.add(camera);

		container.appendChild(renderer.domElement);

		/* Lighting
		********************************/

		var light = new THREE.HemisphereLight( 0xeeeeff, 0x777788, 0.75 );
		light.position.set( 0.5, 1, 0.75 );
		scene.add( light );

		controls = new THREE.PointerLockControls( camera );
		scene.add( controls.getObject() );

		/* Keyboard Events
		********************************/

		var onKeyDown = function ( event ) {

			switch ( event.keyCode ) {

				case 38: // up
				case 87: // w
					moveForward = true;
					break;

				case 37: // left
				case 65: // a
					moveLeft = true; break;

				case 40: // down
				case 83: // s
					moveBackward = true;
					break;

				case 39: // right
				case 68: // d
					moveRight = true;
					break;

				case 32: // space
					if ( canJump === true ) velocity.y += 350;
					canJump = false;
					break;

			}

		};

		var onKeyUp = function ( event ) {

			switch( event.keyCode ) {

				case 38: // up
				case 87: // w
					moveForward = false;
					break;

				case 37: // left
				case 65: // a
					moveLeft = false;
					break;

				case 40: // down
				case 83: // s
					moveBackward = false;
					break;

				case 39: // right
				case 68: // d
					moveRight = false;
					break;

			}

		};

		document.addEventListener( 'keydown', onKeyDown, false );
		document.addEventListener( 'keyup', onKeyUp, false );

		raycaster = new THREE.Raycaster( new THREE.Vector3(), new THREE.Vector3( 0, - 1, 0 ), 0, 10 );

		/* Terrain
		********************************/

		var xSegments = 32,
			ySegments = 32;

		terrain = THREE.Terrain({
			easing: THREE.Terrain.Linear,
			frequency: 10,
			heightmap: THREE.Terrain.DiamondSquare,
			material: new THREE.MeshLambertMaterial({color: 0xFAFAFA}),
			maxHeight: 150,
			minHeight: 0,
			steps: 3,
			useBufferGeometry: false,
			xSegments: xSegments,
			xSize: 512,
			ySegments: ySegments,
			ySize: 512
		});

		scene.add(terrain);

		/* Scenery
		********************************/

		loader.load('models/tree.obj', 'models/tree.mtl', function (object) {
			var trees = THREE.Terrain.ScatterMeshes(terrain.children[0].geometry, {
				mesh: object,
				w: xSegments,
				h: ySegments,
				spread: 0.4,
				randomness: Math.random
			});

			trees.rotateX(-1 * Math.PI / 2); // lolwut

			scene.add(trees);
		});

		/* Sky
		********************************/

		THREE.ImageUtils.loadTexture('assets/sky1.jpg', undefined, function(t1) {
			var skyDome = new THREE.Mesh(
				new THREE.SphereGeometry(8192, 16, 16, 0, Math.PI*2, 0, Math.PI*0.5),
				new THREE.MeshBasicMaterial({map: t1, side: THREE.BackSide, fog: false})
			);
			skyDome.position.y = -99;
			scene.add(skyDome);
		});


		/* Water
		********************************/

		water = new THREE.Mesh(
			new THREE.PlaneGeometry(16384+1024, 16384+1024, 16, 16),
			new THREE.MeshLambertMaterial({color: 0x006ba0, transparent: true, opacity: 0.6})
		);
		water.position.y = -99;
		water.rotation.x = -0.5 * Math.PI;
		scene.add(water);

		/* Renderer
		********************************/

		renderer = new THREE.WebGLRenderer();
		renderer.setClearColor( 0xffffff );
		renderer.setPixelRatio( window.devicePixelRatio );
		renderer.setSize( window.innerWidth, window.innerHeight );
		document.body.appendChild( renderer.domElement );

		window.addEventListener( 'resize', onWindowResize, false );

	}


	/* Resize
	********************************/

	function onWindowResize() {

		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();

		renderer.setSize( window.innerWidth, window.innerHeight );

	}


	/* Animation
	********************************/

	function animate() {

		window.requestAnimationFrame( animate );

		stats.begin();

		if ( controlsEnabled ) {
			raycaster.ray.origin.copy( controls.getObject().position );
			raycaster.ray.origin.y -= 10;

			var intersections = raycaster.intersectObjects( [terrain, water] );

			var isOnObject = intersections.length > 0;

			var time = window.performance.now();
			var delta = ( time - prevTime ) / 1000;

			velocity.x -= velocity.x * 10.0 * delta;
			velocity.z -= velocity.z * 10.0 * delta;

			velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass

			if ( moveForward ) velocity.z -= 400.0 * delta;
			if ( moveBackward ) velocity.z += 400.0 * delta;

			if ( moveLeft ) velocity.x -= 400.0 * delta;
			if ( moveRight ) velocity.x += 400.0 * delta;

			if ( isOnObject === true ) {
				velocity.y = Math.max( 0, velocity.y );

				canJump = true;
			}

			controls.getObject().translateX( velocity.x * delta );
			controls.getObject().translateY( velocity.y * delta );
			controls.getObject().translateZ( velocity.z * delta );

			if ( controls.getObject().position.y < 10 ) {

				velocity.y = 0;
				controls.getObject().position.y = 10;

				canJump = true;

			}

			prevTime = time;

		}

		renderer.render( scene, camera );

		stats.end();

	}

	/* Debugging exports
	********************************/

}(window.THREE, window.Stats));
