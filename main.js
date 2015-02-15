/**
 * WebGL Demo
 *
 * Based on: http://aerotwist.com/tutorials/getting-started-with-three-js/
 */

(function (THREE, ShaderLoader) {

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

	/* Load shaders
	********************************/

	var shaders = new ShaderLoader('shaders', 'shaderChunks');
	shaders.shaderSetLoaded = init;
	shaders.load('default-vertex', 'VERT', 'vertex');
	shaders.load('default-fragment', 'FRAG', 'fragment');

	function init () {

		/* Material
		********************************/

		var uniforms = { amplitude: { type: 'f', value: 0 } },
		attributes = { displacement: {type: 'f', value: []} },
		shaderMaterial = new THREE.ShaderMaterial({
			uniforms: uniforms,
			attributes: attributes,
			vertexShader: shaders.vs.VERT,
			fragmentShader: shaders.fs.FRAG
		});

		/* Model
		********************************/

		var radius = 50,
			segments = 16,
			rings = 16;

		var sphere = new THREE.Mesh(
			new THREE.SphereGeometry(radius, segments, rings),
			shaderMaterial
		);

		scene.add(sphere);

		/* Spikey spikes
		********************************/

		var verts = sphere.geometry.vertices,
			values = attributes.displacement.value;

		for (var v = 0; v < verts.length; v++) {
			values.push(Math.random() * 30);
		}

		/* Lights
		********************************/

		var pointLight = new THREE.PointLight(0xFFFFFF);

		pointLight.position.x = 10;
		pointLight.position.y = 50;
		pointLight.position.z = 130;

		scene.add(pointLight);

		/* Animation loop
		********************************/

		var frame = 0;
		function update () {
			uniforms.amplitude.value = Math.sin(frame);
			frame += 0.1;
			renderer.render(scene, camera);
			window.requestAnimationFrame(update);
		}
		window.requestAnimationFrame(update);

	}

}(window.THREE, window.ShaderLoader));
