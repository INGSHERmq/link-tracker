'use client'

import { useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera, Environment, Float } from '@react-three/drei'
import * as THREE from 'three'

function Car() {
  const groupRef = useRef<THREE.Group>(null)
  const [hovered, setHovered] = useState(false)

  useFrame((state) => {
    if (groupRef.current) {
      // Rotación suave automática
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.3

      // Rotación más rápida cuando el mouse está cerca
      if (hovered) {
        groupRef.current.rotation.y += 0.02
      }
    }
  })

  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
      <group
        ref={groupRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        {/* Chasis principal del automóvil */}
        <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[4, 0.5, 1.8]} />
          <meshStandardMaterial color="#1a1a2e" metalness={0.8} roughness={0.2} />
        </mesh>

        {/* Parte superior del automóvil */}
        <mesh position={[0, 1, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.5, 0.4, 1.6]} />
          <meshStandardMaterial color="#16213e" metalness={0.7} roughness={0.3} />
        </mesh>

        {/* Parabrisas delantero */}
        <mesh position={[0.8, 1.15, 0]} rotation={[0.3, 0, 0]} castShadow>
          <boxGeometry args={[0.8, 0.5, 1.5]} />
          <meshStandardMaterial color="#0f3460" metalness={0.9} roughness={0.1} transparent opacity={0.8} />
        </mesh>

        {/* Parabrisas trasero */}
        <mesh position={[-0.8, 1.1, 0]} rotation={[-0.3, 0, 0]} castShadow>
          <boxGeometry args={[0.6, 0.4, 1.4]} />
          <meshStandardMaterial color="#0f3460" metalness={0.9} roughness={0.1} transparent opacity={0.8} />
        </mesh>

        {/* Capó delantero */}
        <mesh position={[1.5, 0.6, 0]} rotation={[0.1, 0, 0]} castShadow>
          <boxGeometry args={[1, 0.3, 1.6]} />
          <meshStandardMaterial color="#1a1a2e" metalness={0.8} roughness={0.2} />
        </mesh>

        {/* Maletero trasero */}
        <mesh position={[-1.5, 0.65, 0]} rotation={[-0.1, 0, 0]} castShadow>
          <boxGeometry args={[0.8, 0.35, 1.5]} />
          <meshStandardMaterial color="#1a1a2e" metalness={0.8} roughness={0.2} />
        </mesh>

        {/* Rueda delantera izquierda */}
        <Wheel position={[1.2, 0.25, 0.9]} />
        {/* Rueda delantera derecha */}
        <Wheel position={[1.2, 0.25, -0.9]} />
        {/* Rueda trasera izquierda */}
        <Wheel position={[-1.2, 0.25, 0.9]} />
        {/* Rueda trasera derecha */}
        <Wheel position={[-1.2, 0.25, -0.9]} />

        {/* Faros delanteros */}
        <mesh position={[2, 0.5, 0.6]} castShadow>
          <cylinderGeometry args={[0.15, 0.15, 0.1, 16]} rotation={[0, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#ffff00" emissive="#ffff00" emissiveIntensity={2} />
        </mesh>
        <mesh position={[2, 0.5, -0.6]} castShadow>
          <cylinderGeometry args={[0.15, 0.15, 0.1, 16]} rotation={[0, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#ffff00" emissive="#ffff00" emissiveIntensity={2} />
        </mesh>

        {/* Luces traseras */}
        <mesh position={[-2, 0.5, 0.6]} castShadow>
          <boxGeometry args={[0.1, 0.2, 0.3]} />
          <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={1} />
        </mesh>
        <mesh position={[-2, 0.5, -0.6]} castShadow>
          <boxGeometry args={[0.1, 0.2, 0.3]} />
          <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={1} />
        </mesh>

        {/* Líneas de neón decorativas */}
        <mesh position={[0, 0.3, 0.95]}>
          <boxGeometry args={[3.5, 0.05, 0.05]} />
          <meshStandardMaterial color="#e94560" emissive="#e94560" emissiveIntensity={0.5} />
        </mesh>
        <mesh position={[0, 0.3, -0.95]}>
          <boxGeometry args={[3.5, 0.05, 0.05]} />
          <meshStandardMaterial color="#e94560" emissive="#e94560" emissiveIntensity={0.5} />
        </mesh>
      </group>
    </Float>
  )
}

function Wheel({ position }: { position: [number, number, number] }) {
  const wheelRef = useRef<THREE.Mesh>(null)

  useFrame(() => {
    if (wheelRef.current) {
      wheelRef.current.rotation.x += 0.02
    }
  })

  return (
    <group position={position}>
      {/* Neumático */}
      <mesh ref={wheelRef} castShadow>
        <cylinderGeometry args={[0.3, 0.3, 0.2, 32]} rotation={[0, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
      </mesh>

      {/* Rin */}
      <mesh rotation={[0, 0, Math.PI / 2]} position={[0, 0, 0.11]}>
        <cylinderGeometry args={[0.2, 0.2, 0.05, 8]} />
        <meshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Centro del rin */}
      <mesh rotation={[0, 0, Math.PI / 2]} position={[0, 0, 0.13]}>
        <cylinderGeometry args={[0.08, 0.08, 0.05, 16]} />
        <meshStandardMaterial color="#333333" metalness={0.7} roughness={0.3} />
      </mesh>
    </group>
  )
}

function Scene() {
  return (
    <>
      <PerspectiveCamera makeDefault position={[6, 4, 6]} fov={45} />
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.5}
        autoRotate
        autoRotateSpeed={1}
      />

      {/* Iluminación */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={1.5} castShadow />
      <directionalLight position={[-5, 3, -5]} intensity={0.8} />
      <pointLight position={[0, 5, 0]} intensity={0.8} color="#6366f1" />

      {/* Suelo con grid */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#1e1b4b" roughness={0.5} metalness={0.8} />
      </mesh>

      {/* Grid decorativo */}
      <gridHelper args={[30, 30, 0x6366f1, 0x3730a3]} position={[0, -0.49, 0]} />

      {/* Automóvil */}
      <Car />
    </>
  )
}

export default function Car3DBackground() {
  return (
    <div className="w-full h-full relative">
      <Canvas shadows gl={{ antialias: true }}>
        <Scene />
      </Canvas>
    </div>
  )
}
