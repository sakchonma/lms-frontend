import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, ContactShadows, Float, Environment } from '@react-three/drei';

// ชิ้นส่วนตัวละคร (Low Poly Chibi Style)
const ChibiCharacter = ({ equippedItems }) => {
  const group = useRef();
  
  // Animation หายใจเบาๆ
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    group.current.position.y = Math.sin(t * 1) * 0.1 - 0.5; // Floating effect
    group.current.rotation.y = Math.sin(t * 0.5) * 0.1; // Gentle sway
  });

  // สีเริ่มต้น (ถ้าไม่ได้ใส่ของ)
  const colors = {
    skin: '#ffdbac',
    shirt: equippedItems?.shirtColor || '#00ff88', // Default Neon Green
    pants: equippedItems?.pantsColor || '#1a1d23',
    hat: equippedItems?.hatColor || null
  };

  return (
    <group ref={group} dispose={null}>
      {/* --- HEAD --- */}
      <mesh position={[0, 1.4, 0]}>
        <sphereGeometry args={[0.6, 32, 32]} />
        <meshStandardMaterial color={colors.skin} roughness={0.5} />
      </mesh>

      {/* Eyes */}
      <mesh position={[0.2, 1.5, 0.5]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color="black" />
      </mesh>
      <mesh position={[-0.2, 1.5, 0.5]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color="black" />
      </mesh>
      
      {/* Cheeks (Blush) */}
      <mesh position={[0.3, 1.35, 0.45]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color="#ffaaaa" transparent opacity={0.6} />
      </mesh>
      <mesh position={[-0.3, 1.35, 0.45]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color="#ffaaaa" transparent opacity={0.6} />
      </mesh>

      {/* --- HAT (Optional Item) --- */}
      {colors.hat && (
        <group position={[0, 1.9, 0]}>
          <mesh>
            <coneGeometry args={[0.7, 0.8, 32]} />
            <meshStandardMaterial color={colors.hat} />
          </mesh>
          <mesh position={[0, -0.4, 0]}>
            <torusGeometry args={[0.6, 0.1, 16, 100]} />
            <meshStandardMaterial color={colors.hat} />
          </mesh>
        </group>
      )}

      {/* --- BODY (Shirt) --- */}
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.3, 0.5, 1.2, 32]} />
        <meshStandardMaterial color={colors.shirt} />
      </mesh>

      {/* --- ARMS --- */}
      <mesh position={[0.6, 0.7, 0]} rotation={[0, 0, -0.5]}>
        <capsuleGeometry args={[0.12, 0.8, 4, 8]} />
        <meshStandardMaterial color={colors.shirt} />
      </mesh>
      <mesh position={[-0.6, 0.7, 0]} rotation={[0, 0, 0.5]}>
        <capsuleGeometry args={[0.12, 0.8, 4, 8]} />
        <meshStandardMaterial color={colors.shirt} />
      </mesh>

      {/* --- LEGS (Pants) --- */}
      <mesh position={[0.25, -0.5, 0]}>
        <capsuleGeometry args={[0.15, 0.9, 4, 8]} />
        <meshStandardMaterial color={colors.pants} />
      </mesh>
      <mesh position={[-0.25, -0.5, 0]}>
        <capsuleGeometry args={[0.15, 0.9, 4, 8]} />
        <meshStandardMaterial color={colors.pants} />
      </mesh>

      {/* Shoes */}
      <mesh position={[0.25, -1, 0.1]}>
        <boxGeometry args={[0.2, 0.15, 0.4]} />
        <meshStandardMaterial color="white" />
      </mesh>
      <mesh position={[-0.25, -1, 0.1]}>
        <boxGeometry args={[0.2, 0.15, 0.4]} />
        <meshStandardMaterial color="white" />
      </mesh>
    </group>
  );
};

const Avatar3D = ({ equippedItems }) => {
  return (
    <div style={{ width: '100%', height: '100%', minHeight: '400px', background: 'radial-gradient(circle at 50% 50%, rgba(0,255,136,0.1) 0%, transparent 70%)' }}>
      <Canvas dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={50} />
        
        {/* Lighting setup for cute look */}
        <ambientLight intensity={0.8} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#00ff88" />
        
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
          <ChibiCharacter equippedItems={equippedItems} />
        </Float>

        <ContactShadows resolution={1024} scale={10} blur={2} opacity={0.25} far={10} color="#00ff88" />
        
        <OrbitControls 
          enablePan={false} 
          minPolarAngle={Math.PI / 2.5} 
          maxPolarAngle={Math.PI / 2} 
          minDistance={3}
          maxDistance={7}
        />
        
        {/* Environment Reflection */}
        <Environment preset="city" />
      </Canvas>
    </div>
  );
};

export default Avatar3D;
