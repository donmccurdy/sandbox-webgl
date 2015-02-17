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

	camera.position.z = 300;

	renderer.setSize(WIDTH, HEIGHT);

	container.appendChild(renderer.domElement);

	/* Resources
	********************************/

	var manager = new THREE.LoadingManager();
	manager.onProgress = function (item, loaded, total) {
		console.log(item, loaded, total);
	};

	var loader = new THREE.OBJLoader(manager);

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

	/* Material
	********************************/

	var shaderMaterial = new THREE.MeshLambertMaterial({color: 0x88FF88});

	/* Model
	********************************/

	loader.load('models/tree1.obj', function (object) {
		object.traverse(function (child) {
			if (child instanceof THREE.Mesh) {
				child.material = shaderMaterial;
			}
		});
		object.position.y = - 5;
		scene.add(object);
	});

	/* View controller
	********************************/

	var controls = new THREE.OrbitControls(camera, renderer.domElement);

	/* Lights
	********************************/

	var pointLight1 = new THREE.PointLight(0xFFFFFF, 0.5),
		pointLight2 = new THREE.PointLight(0xFFFFFF, 0.8);

	pointLight1.position.x = 10;
	pointLight1.position.y = 50;
	pointLight1.position.z = 130;

	pointLight2.position.y = 130;

	scene.add(pointLight1);
	scene.add(pointLight2);

	/* Animation loop
	********************************/

	function update () {
		stats.begin();
		controls.update();
		renderer.render(scene, camera);
		stats.end();
		window.requestAnimationFrame(update);
	}
	window.requestAnimationFrame(update);

	/* Debugging exports
	********************************/

}(window.THREE, window.Stats));
