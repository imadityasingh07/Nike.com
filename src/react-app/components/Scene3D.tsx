import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Text3D, MeshTransmissionMaterial, Environment } from '@react-three/drei';
import * as THREE from 'three';

interface Scene3DProps {
  text?: string;
  scale?: number;
}

function FloatingShoe() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime) * 0.3;
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <mesh ref={meshRef} position={[0, 0, 0]} scale={2}>
        <boxGeometry args={[1.5, 0.6, 0.8]} />
        <MeshTransmissionMaterial
          color="#667eea"
          thickness={0.5}
          roughness={0.1}
          transmission={1}
          ior={1.2}
          chromaticAberration={0.02}
          backside={false}
        />
      </mesh>
      <mesh position={[0.3, -0.3, 0.2]} scale={1.8}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <MeshTransmissionMaterial
          color="#764ba2"
          thickness={0.3}
          roughness={0.05}
          transmission={0.8}
          ior={1.1}
          chromaticAberration={0.01}
        />
      </mesh>
    </Float>
  );
}

function FloatingText({ text = "StepForward" }: { text?: string }) {
  const textRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (textRef.current) {
      textRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <group ref={textRef}>
      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
        <Text3D
          font="/fonts/helvetiker_regular.typeface.json"
          size={0.5}
          height={0.1}
          curveSegments={12}
          bevelEnabled
          bevelThickness={0.02}
          bevelSize={0.02}
          bevelOffset={0}
          bevelSegments={5}
          position={[-2, 0, 0]}
        >
          {text}
          <meshStandardMaterial color="#ffffff" />
        </Text3D>
      </Float>
    </group>
  );
}

function ParticleField() {
  const pointsRef = useRef<THREE.Points>(null);
  const particleCount = 100;

  const positions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 20;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
  }

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.1;
      pointsRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.1;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.05} color="#667eea" transparent opacity={0.6} />
    </points>
  );
}

export default function Scene3D({ text, scale = 1 }: Scene3DProps) {
  return (
    <group scale={scale}>
      <Environment preset="sunset" />
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <pointLight position={[-10, -10, -10]} color="#764ba2" intensity={0.5} />
      
      <FloatingShoe />
      {text && <FloatingText text={text} />}
      <ParticleField />
      
      {/* Lighting effects */}
      <spotLight
        position={[0, 5, 0]}
        angle={0.3}
        penumbra={1}
        intensity={0.5}
        color="#667eea"
        castShadow
      />
    </group>
  );
}
