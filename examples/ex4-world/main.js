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

	window.camera = camera;
	camera.position.y = 200;
	camera.up.set( 0, 0, -1 );

	renderer.setSize(WIDTH, HEIGHT);
	renderer.setClearColor(0xF0F0F0);

	container.appendChild(renderer.domElement);

	/* Material
	********************************/

	// https://color.adobe.com/Campfire-color-theme-2528696
	var COLORS = [0x588C7E, 0xF2E394, 0xF2AE72, 0xD96459, 0x8C4646];

	var materials = COLORS.map(function (color) {
		return new THREE.MeshPhongMaterial({color: color, opacity: 1.0});
	});

	/* Countries
	********************************/

	var EXTRUDE_AMOUNT = 1;

	window.fetch('models/countries.json')
		.then(function(response) {
			return response.json();
		}).then(function(countries) {
			countries.forEach(loadCountry);
		}).catch(function(ex) {
			console.log('Countries could not be loaded.', ex);
		});

	function loadCountry (country) {
		var mesh, material,
			paths = THREE.transformSVGPath(country.feature);
		
		for (var i = 0; i < paths.length; i++) {
			paths[i] = paths[i].extrude({
				amount: EXTRUDE_AMOUNT,
				bevelEnabled: false
			});

			if (i > 0) paths[0].merge(paths[i]);
		}

		material = materials[Math.floor((Math.random() * materials.length))];
		mesh = new THREE.Mesh(paths[0], material);

		mesh.name = country.data.name;

		mesh.rotation.x = Math.PI/2;
		mesh.translateX(-475);
		mesh.translateZ(50);
		mesh.translateY(20);

		scene.add(mesh);
	}

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

	/* Model
	********************************/

	/* View controller
	********************************/

	var controls = new THREE.MapControls(camera, renderer.domElement);

	/* Lights
	********************************/

	var pointLight1 = new THREE.PointLight(0xFFFFFF, 0.5),
		pointLight2 = new THREE.PointLight(0xFFFFFF, 0.8);

	pointLight1.position.x = 10;
	pointLight1.position.y = 50;
	pointLight1.position.z = 1300;

	pointLight2.position.y = 1300;

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
