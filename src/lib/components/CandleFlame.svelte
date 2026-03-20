<script lang="ts">
	import { T, useTask } from '@threlte/core';
	import * as THREE from 'three';
	import flameVert from '$lib/shaders/flame.vert?raw';
	import flameFrag from '$lib/shaders/flame.frag?raw';

	let { position = [0, 1.05, 0] }: { position?: [number, number, number] } = $props();

	const uniforms = {
		uTime: { value: 0 }
	};

	const material = new THREE.ShaderMaterial({
		vertexShader: flameVert,
		fragmentShader: flameFrag,
		uniforms,
		transparent: true,
		side: THREE.DoubleSide,
		depthWrite: false,
		blending: THREE.AdditiveBlending
	});

	const geometry = new THREE.PlaneGeometry(0.3, 0.6, 8, 16);

	useTask((delta) => {
		uniforms.uTime.value += delta;
	});
</script>

<!-- Flame billboard - two crossed planes -->
<T.Group {position}>
	<T.Mesh {geometry} {material} />
	<T.Mesh {geometry} {material} rotation.y={Math.PI / 2} />
	<!-- Point light at flame -->
	<T.PointLight
		color="#ffaa44"
		intensity={8}
		distance={6}
		decay={1.5}
	/>
	<!-- Secondary softer fill light -->
	<T.PointLight
		color="#ff8833"
		intensity={3}
		distance={10}
		decay={2}
		position={[0, 0.3, 0]}
	/>
</T.Group>
