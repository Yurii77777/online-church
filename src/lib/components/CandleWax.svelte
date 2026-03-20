<script lang="ts">
	import { T, useTask } from '@threlte/core';
	import * as THREE from 'three';

	let time = $state(0);

	// Candle body — shorter, church-candle proportions
	const bodyGeometry = new THREE.CylinderGeometry(0.12, 0.13, 1.2, 32, 1);
	const bodyMaterial = new THREE.MeshStandardMaterial({
		color: '#d4a030',
		emissive: '#a06810',
		emissiveIntensity: 0.25,
		roughness: 0.5,
		metalness: 0.05
	});

	// Wick
	const wickGeometry = new THREE.CylinderGeometry(0.006, 0.008, 0.12, 8);
	const wickMaterial = new THREE.MeshStandardMaterial({
		color: '#1a1a1a',
		roughness: 1.0
	});

	// Melted wax pool at top
	const meltGeometry = new THREE.CylinderGeometry(0.11, 0.11, 0.04, 32);
	const meltMaterial = new THREE.MeshStandardMaterial({
		color: '#e8b030',
		emissive: '#b07818',
		emissiveIntensity: 0.2,
		roughness: 0.25,
		metalness: 0.1,
		transparent: true,
		opacity: 0.9
	});

	// Wax drip
	const dripGeometry = new THREE.SphereGeometry(0.02, 12, 8);
	const dripMaterial = new THREE.MeshStandardMaterial({
		color: '#e0a828',
		emissive: '#a07015',
		emissiveIntensity: 0.2,
		roughness: 0.35
	});

	let dripY = $state(0.3);
	let dripX = $state(0.12);

	useTask((delta) => {
		time += delta;
		dripY = 0.3 - ((time * 0.15) % 0.8);
		dripX = 0.12 + Math.sin(time * 0.5) * 0.008;
	});
</script>

<T.Group position={[0, -0.25, 0]}>
	<!-- Candle body -->
	<T.Mesh geometry={bodyGeometry} material={bodyMaterial} position.y={0.6} />

	<!-- Wick -->
	<T.Mesh geometry={wickGeometry} material={wickMaterial} position={[0, 1.26, 0]} />

	<!-- Melted wax pool -->
	<T.Mesh geometry={meltGeometry} material={meltMaterial} position={[0, 1.19, 0]} />

	<!-- Wax drip -->
	<T.Mesh
		geometry={dripGeometry}
		material={dripMaterial}
		position={[dripX, dripY + 0.6, 0]}
		scale={[1, 1.5, 1]}
	/>

	<!-- Second drip -->
	<T.Mesh
		geometry={dripGeometry}
		material={dripMaterial}
		position={[-0.11, dripY + 0.35, 0.04]}
		scale={[0.8, 1.3, 0.8]}
	/>
</T.Group>
