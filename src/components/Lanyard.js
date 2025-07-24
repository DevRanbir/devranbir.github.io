/* eslint-disable react/no-unknown-property */
'use client';
import { useEffect, useRef, useState } from 'react';
import { Canvas, extend, useFrame } from '@react-three/fiber';
import { useGLTF, useTexture, Environment, Lightformer } from '@react-three/drei';
import { BallCollider, CuboidCollider, Physics, RigidBody, useRopeJoint, useSphericalJoint } from '@react-three/rapier';
import { MeshLineGeometry, MeshLineMaterial } from 'meshline';
import * as THREE from 'three';

// replace with your own imports, see the usage snippet for details
//import cardGLB from "./card.glb";
//import lanyard from "./lanyard.png";
const PUBLIC_URL = process.env.PUBLIC_URL || '';
const cardGLB = `${PUBLIC_URL}/card.glb`;
const lanyard = `${PUBLIC_URL}/lanyard.png`;



extend({ MeshLineGeometry, MeshLineMaterial });

export default function Lanyard({ position = [0, 0, 30], gravity = [0, -40, 0], fov = 20, transparent = true }) {
  const [hasError, setHasError] = useState(false);
  
  // WebGL error handling effect - same pattern as in Projects.js and Documents.js
  useEffect(() => {
    // Override WebGL context creation to handle errors gracefully
    const originalGetContext = HTMLCanvasElement.prototype.getContext;
    
    HTMLCanvasElement.prototype.getContext = function(contextType, contextAttributes) {
      if (contextType === 'webgl' || contextType === 'experimental-webgl' || contextType === 'webgl2') {
        try {
          const context = originalGetContext.call(this, contextType, {
            ...contextAttributes,
            antialias: false,
            alpha: true,
            premultipliedAlpha: false,
            preserveDrawingBuffer: false,
            failIfMajorPerformanceCaveat: false
          });
          
          if (context) {
            // Add error event listener to suppress GL errors
            const originalTexImage2D = context.texImage2D;
            context.texImage2D = function(...args) {
              try {
                return originalTexImage2D.apply(this, args);
              } catch (error) {
                console.warn('WebGL texImage2D error suppressed:', error);
                return null;
              }
            };
            
            // Override additional WebGL methods that might cause NaN errors
            const originalBufferData = context.bufferData;
            context.bufferData = function(target, data, usage) {
              try {
                // Check for NaN values if data is a Float32Array
                if (data instanceof Float32Array) {
                  for (let i = 0; i < data.length; i++) {
                    if (isNaN(data[i]) || !isFinite(data[i])) {
                      console.warn('NaN or infinite value detected in buffer data, skipping');
                      return;
                    }
                  }
                }
                return originalBufferData.call(this, target, data, usage);
              } catch (error) {
                console.warn('WebGL bufferData error suppressed:', error);
                return null;
              }
            };
          }
          
          return context;
        } catch (error) {
          console.warn('WebGL context creation failed:', error);
          return null;
        }
      }
      return originalGetContext.call(this, contextType, contextAttributes);
    };

    // Cleanup function to restore original method
    return () => {
      HTMLCanvasElement.prototype.getContext = originalGetContext;
    };
  }, []);
  
  // Error recovery effect
  useEffect(() => {
    const handleThreeError = (event) => {
      if (event.error && event.error.message && 
          (event.error.message.includes('NaN') || 
           event.error.message.includes('BufferGeometry') ||
           event.error.message.includes('MeshLine'))) {
        console.warn('Three.js NaN error caught, recovering...', event.error);
        setHasError(true);
        // Reset error state after a brief delay to allow re-render
        setTimeout(() => setHasError(false), 1000);
      }
    };
    
    window.addEventListener('error', handleThreeError);
    return () => window.removeEventListener('error', handleThreeError);
  }, []);

  if (hasError) {
    return (
      <div className="lanyard-wrapper" style={{ display: 'none' }}>
        {/* Hidden fallback during error recovery */}
      </div>
    );
  }

  return (
    <div className="lanyard-wrapper">
      <Canvas
        camera={{ position: position, fov: fov }}
        gl={{ alpha: transparent }}
        onCreated={({ gl }) => gl.setClearColor(new THREE.Color(0x000000), transparent ? 0 : 1)}
        onError={(error) => {
          console.warn('Canvas error:', error);
          setHasError(true);
        }}
      >
        <ambientLight intensity={Math.PI} />
        <Physics gravity={gravity} timeStep={1 / 60}>
          <Band />
        </Physics>
        <Environment blur={0.75}>
          <Lightformer intensity={2} color="white" position={[0, -1, 5]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
          <Lightformer intensity={3} color="white" position={[-1, -1, 1]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
          <Lightformer intensity={3} color="white" position={[1, 1, 1]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
          <Lightformer intensity={10} color="white" position={[-10, 0, 14]} rotation={[0, Math.PI / 2, Math.PI / 3]} scale={[100, 10, 1]} />
        </Environment>
      </Canvas>
    </div>
  );
}
function Band({ maxSpeed = 50, minSpeed = 0 }) {
  const band = useRef(), fixed = useRef(), j1 = useRef(), j2 = useRef(), j3 = useRef(), card = useRef();
  const vec = new THREE.Vector3(), ang = new THREE.Vector3(), rot = new THREE.Vector3(), dir = new THREE.Vector3();
  const segmentProps = { type: 'dynamic', canSleep: true, colliders: false, angularDamping: 4, linearDamping: 4 };
  const { nodes, materials } = useGLTF(cardGLB);
  const texture = useTexture(lanyard);
  
  // Initialize curve with valid default points to prevent NaN errors
  const [curve] = useState(() => new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 4, 0),    // Default positions matching the initial rigid body setup
    new THREE.Vector3(0.5, 4, 0),
    new THREE.Vector3(1, 4, 0),
    new THREE.Vector3(1.5, 4, 0)
  ]));
  
  const [dragged, drag] = useState(false);
  const [hovered, hover] = useState(false);
  const [isSmall, setIsSmall] = useState(() =>
    typeof window !== 'undefined' && window.innerWidth < 1024
  );

  useRopeJoint(fixed, j1, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(j1, j2, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(j2, j3, [[0, 0, 0], [0, 0, 0], 1]);
  useSphericalJoint(j3, card, [[0, 0, 0], [0, 1.50, 0]]);

  useEffect(() => {
    if (hovered) {
      document.body.style.cursor = dragged ? 'grabbing' : 'grab';
      return () => void (document.body.style.cursor = 'auto');
    }
  }, [hovered, dragged]);

  useEffect(() => {
    const handleResize = () => {
      setIsSmall(window.innerWidth < 1024);
    };

    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useFrame((state, delta) => {
    if (dragged) {
      vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera);
      dir.copy(vec).sub(state.camera.position).normalize();
      vec.add(dir.multiplyScalar(state.camera.position.length()));
      [card, j1, j2, j3, fixed].forEach((ref) => ref.current?.wakeUp());
      card.current?.setNextKinematicTranslation({ x: vec.x - dragged.x, y: vec.y - dragged.y, z: vec.z - dragged.z });
    }
    
    // Add comprehensive validation for all rigid body references
    if (fixed.current && j1.current && j2.current && j3.current && card.current && band.current) {
      [j1, j2].forEach((ref) => {
        if (!ref.current.lerped) ref.current.lerped = new THREE.Vector3().copy(ref.current.translation());
        const clampedDistance = Math.max(0.1, Math.min(1, ref.current.lerped.distanceTo(ref.current.translation())));
        ref.current.lerped.lerp(ref.current.translation(), delta * (minSpeed + clampedDistance * (maxSpeed - minSpeed)));
      });
      
      // Validate all translation values before copying to curve points
      const j3Translation = j3.current.translation();
      const j2Translation = j2.current.lerped;
      const j1Translation = j1.current.lerped;
      const fixedTranslation = fixed.current.translation();
      
      // Check for NaN values in all translations
      const isValidTranslation = (translation) => {
        return translation && 
               !isNaN(translation.x) && !isNaN(translation.y) && !isNaN(translation.z) &&
               isFinite(translation.x) && isFinite(translation.y) && isFinite(translation.z);
      };
      
      if (isValidTranslation(j3Translation) && 
          isValidTranslation(j2Translation) && 
          isValidTranslation(j1Translation) && 
          isValidTranslation(fixedTranslation)) {
        
        curve.points[0].copy(j3Translation);
        curve.points[1].copy(j2Translation);
        curve.points[2].copy(j1Translation);
        curve.points[3].copy(fixedTranslation);
        
        // Generate curve points and validate them before setting geometry
        const curvePoints = curve.getPoints(32);
        const validCurvePoints = curvePoints.every(point => 
          !isNaN(point.x) && !isNaN(point.y) && !isNaN(point.z) &&
          isFinite(point.x) && isFinite(point.y) && isFinite(point.z)
        );
        
        if (validCurvePoints && band.current.geometry) {
          try {
            band.current.geometry.setPoints(curvePoints);
          } catch (error) {
            console.warn('Error setting MeshLine points, skipping update:', error);
          }
        }
      }
      
      // Validate angular velocity and rotation before setting
      const angVel = card.current.angvel();
      const rotation = card.current.rotation();
      
      if (angVel && rotation && 
          !isNaN(angVel.x) && !isNaN(angVel.y) && !isNaN(angVel.z) &&
          !isNaN(rotation.x) && !isNaN(rotation.y) && !isNaN(rotation.z) &&
          isFinite(angVel.x) && isFinite(angVel.y) && isFinite(angVel.z) &&
          isFinite(rotation.x) && isFinite(rotation.y) && isFinite(rotation.z)) {
        
        ang.copy(angVel);
        rot.copy(rotation);
        card.current.setAngvel({ x: ang.x, y: ang.y - rot.y * 0.25, z: ang.z });
      }
    }
  });

  curve.curveType = 'chordal';
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

  return (
    <>
      <group position={[0, 4, 0]}>
        <RigidBody ref={fixed} {...segmentProps} type="fixed" />
        <RigidBody position={[0.5, 0, 0]} ref={j1} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1, 0, 0]} ref={j2} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1.5, 0, 0]} ref={j3} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[2, 0, 0]} ref={card} {...segmentProps} type={dragged ? 'kinematicPosition' : 'dynamic'}>
          <CuboidCollider args={[0.8, 1.125, 0.01]} />
          <group
            scale={2.25}
            position={[0, -1.2, -0.05]}
            onPointerOver={() => hover(true)}
            onPointerOut={() => hover(false)}
            onPointerUp={(e) => {
              e.target.releasePointerCapture(e.pointerId);
              drag(false);
            }}
            onPointerDown={(e) => {
              e.target.setPointerCapture(e.pointerId);
              drag(new THREE.Vector3().copy(e.point).sub(vec.copy(card.current.translation())));
            }}>
            <mesh geometry={nodes.card.geometry}>
              <meshPhysicalMaterial map={materials.base.map} map-anisotropy={16} clearcoat={1} clearcoatRoughness={0.15} roughness={0.9} metalness={0.8} />
            </mesh>
            <mesh geometry={nodes.clip.geometry} material={materials.metal} material-roughness={0.3} />
            <mesh geometry={nodes.clamp.geometry} material={materials.metal} />
          </group>
        </RigidBody>
      </group>
      <mesh ref={band}>
        <meshLineGeometry 
          onUpdate={(geometry) => {
            // Add safety check for geometry updates
            if (geometry && geometry.attributes.position) {
              const positions = geometry.attributes.position.array;
              // Check for NaN values in position buffer
              for (let i = 0; i < positions.length; i++) {
                if (isNaN(positions[i]) || !isFinite(positions[i])) {
                  console.warn('Invalid position detected in MeshLineGeometry, skipping update');
                  return;
                }
              }
            }
          }}
        />
        <meshLineMaterial
          color="white"
          depthTest={false}
          resolution={isSmall ? [1000, 2000] : [1000, 1000]}
          useMap
          map={texture}
          repeat={[-4, 1]}
          lineWidth={1}
        />
      </mesh>
    </>
  );
}