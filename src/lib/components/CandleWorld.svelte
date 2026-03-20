<script lang="ts">
	import { T, useTask } from '@threlte/core';
	import { OrbitControls } from '@threlte/extras';
	import CandleFlame from './CandleFlame.svelte';
	import CandleWax from './CandleWax.svelte';
</script>

<!-- Camera — pulled back and centered on the candle -->
<T.PerspectiveCamera makeDefault position={[0, 0.7, 2.8]} fov={50}>
	<OrbitControls
		enableZoom={false}
		enablePan={false}
		autoRotate
		autoRotateSpeed={0.5}
		minPolarAngle={Math.PI / 4}
		maxPolarAngle={Math.PI / 2.2}
		target={[0, 0.5, 0]}
	/>
</T.PerspectiveCamera>

<!-- Ambient — warm so wax is always visible -->
<T.AmbientLight color="#5a4025" intensity={1.0} />

<!-- Rim light from behind -->
<T.DirectionalLight color="#332244" intensity={0.6} position={[0, 2, -3]} />

<!-- Candle holder / base -->
<T.Mesh position={[0, -0.32, 0]}>
	<T.CylinderGeometry args={[0.2, 0.25, 0.12, 32]} />
	<T.MeshStandardMaterial color="#8b7355" roughness={0.7} metalness={0.3} />
</T.Mesh>

<!-- Candle -->
<CandleWax />

<!-- Flame -->
<CandleFlame />

<!-- Floor / surface -->
<T.Mesh rotation.x={-Math.PI / 2} position.y={-0.39}>
	<T.PlaneGeometry args={[10, 10]} />
	<T.MeshStandardMaterial color="#0a0a12" roughness={0.9} />
</T.Mesh>
