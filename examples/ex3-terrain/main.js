/**
 * WebGL Demo
 *
 * Based on: http://aerotwist.com/tutorials/getting-started-with-three-js/
 */

(function (THREE, Stats) {

	/* Scene
	********************************/

	var WIDTH = window.innerWidth,
		HEIGHT = window.innerHeight;

	var VIEW_ANGLE = 45,
		ASPECT = WIDTH / HEIGHT,
		NEAR = 0.1,
		FAR = 10000;

	var container = document.querySelector('#container');

	var renderer = new THREE.WebGLRenderer(),
		camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);

	var scene = new THREE.Scene();

	scene.add(camera);

	camera.position.y = 125;
	camera.position.z = 125;

	renderer.setSize(WIDTH, HEIGHT);

	container.appendChild(renderer.domElement);

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

	/* Responsive layout
	********************************/

	window.addEventListener('resize', function () {
		WIDTH = window.innerWidth;
		HEIGHT = window.innerHeight;
		ASPECT = WIDTH / HEIGHT;

		camera.aspect = ASPECT;
		camera.updateProjectionMatrix();
		renderer.setSize(WIDTH, HEIGHT);
	}, false);

	/* Terrain
	********************************/

	var xSegments = 32,
		ySegments = 32;

	var terrain = THREE.Terrain({
		easing: THREE.Terrain.Linear,
		frequency: 10,
		heightmap: THREE.Terrain.DiamondSquare,
		material: new THREE.MeshLambertMaterial({color: 0xFAFAFA}),
		maxHeight: 50,
		minHeight: -100,
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

	/* View controller
	********************************/

	var controls = new THREE.FirstPersonControls(camera, renderer.domElement);
	// var controls = new THREE.OrbitControls(camera, renderer.domElement);
	// controls.freeze = true;
	controls.movementSpeed = 0.0001;
	controls.lookSpeed = 0.0000003; //.075

    controls.lat = -41;
    controls.lon = -139;
    controls.update(0);

	/* Lights
	********************************/

	// 0xe8bdb0
	var skyLight = new THREE.DirectionalLight(0xAAAAAA, 1.6);
	skyLight.position.set(2950, 2625, -160);
	scene.add(skyLight);

	// 0xc3eaff
	var light = new THREE.DirectionalLight(0xA0A0D0, 0.75);
	light.position.set(-1, -0.5, -1);
	scene.add(light);

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

	var water = new THREE.Mesh(
		new THREE.PlaneGeometry(16384+1024, 16384+1024, 16, 16),
		new THREE.MeshLambertMaterial({color: 0x006ba0, transparent: true, opacity: 0.6})
	);
	water.position.y = -99;
	water.rotation.x = -0.5 * Math.PI;
	scene.add(water);

	/* Animation loop
	********************************/

	function update (delta) {
		stats.begin();
		controls.update(delta);
		renderer.render(scene, camera);
		stats.end();
		window.requestAnimationFrame(update);
	}
	window.requestAnimationFrame(update);

	/* Debugging exports
	********************************/

}(window.THREE, window.Stats));
