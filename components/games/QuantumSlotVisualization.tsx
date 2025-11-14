'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { SlotSymbol, ReelState, type ReelQuantumState } from '@/lib/games/schrodingers-slots-engine';

interface QuantumSlotVisualizationProps {
  reels: ReelQuantumState[];
  isSpinning: boolean;
  onSpinComplete?: () => void;
}

/**
 * Three.js Quantum Slot Visualization
 * Shows particles, wave functions, entanglement, and collapse animations
 */
export default function QuantumSlotVisualization({
  reels,
  isSpinning,
  onSpinComplete
}: QuantumSlotVisualizationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const particleSystemsRef = useRef<THREE.Points[]>([]);
  const entanglementLinesRef = useRef<THREE.Line[]>([]);

  const [animationProgress, setAnimationProgress] = useState(0);

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;

    // Setup scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000510);
    sceneRef.current = scene;

    // Setup camera
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 15;
    cameraRef.current = camera;

    // Setup renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    scene.add(ambientLight);

    // Add point lights
    const pointLight1 = new THREE.PointLight(0x00ffff, 1, 100);
    pointLight1.position.set(10, 10, 10);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xff00ff, 1, 100);
    pointLight2.position.set(-10, -10, 10);
    scene.add(pointLight2);

    // Create quantum foam background
    createQuantumFoam(scene);

    // Animation loop
    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);

      // Update particles
      updateParticles();

      // Rotate scene slightly
      scene.rotation.y += 0.001;

      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current) return;

      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      renderer.dispose();
      containerRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  // Update visualization when reels change
  useEffect(() => {
    if (!sceneRef.current) return;

    // Clear old visualizations
    clearParticles();
    clearEntanglementLines();

    // Create new visualizations based on reel states
    reels.forEach((reel, index) => {
      const position = new THREE.Vector3((index - 2) * 3, 0, 0);

      switch (reel.state) {
        case ReelState.SUPERPOSITION:
          createSuperpositionEffect(position, reel);
          break;
        case ReelState.ENTANGLED:
          createEntanglementEffect(position, reel, index);
          break;
        case ReelState.TUNNELED:
          createTunnelingEffect(position, reel);
          break;
        case ReelState.COLLAPSED:
          createCollapseEffect(position, reel);
          break;
      }
    });
  }, [reels]);

  // Spin animation
  useEffect(() => {
    if (isSpinning) {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 0.02;
        setAnimationProgress(progress);

        if (progress >= 1) {
          clearInterval(interval);
          onSpinComplete?.();
        }
      }, 16); // ~60fps

      return () => clearInterval(interval);
    }
  }, [isSpinning, onSpinComplete]);

  /**
   * Create quantum foam background
   */
  const createQuantumFoam = (scene: THREE.Scene) => {
    const geometry = new THREE.BufferGeometry();
    const vertices = [];

    // Create random particle positions
    for (let i = 0; i < 2000; i++) {
      vertices.push(
        (Math.random() - 0.5) * 50,
        (Math.random() - 0.5) * 50,
        (Math.random() - 0.5) * 50
      );
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

    const material = new THREE.PointsMaterial({
      color: 0x00ffff,
      size: 0.05,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);
  };

  /**
   * Create superposition effect (multiple ghosted symbols)
   */
  const createSuperpositionEffect = (position: THREE.Vector3, reel: ReelQuantumState) => {
    if (!sceneRef.current) return;

    const geometry = new THREE.SphereGeometry(0.5, 32, 32);

    // Create multiple semi-transparent spheres for superposition
    reel.symbols.forEach((symbol, index) => {
      const material = new THREE.MeshPhongMaterial({
        color: getSymbolColor(symbol),
        transparent: true,
        opacity: 0.3 + (reel.amplitude / 1000) * 0.4,
        emissive: getSymbolColor(symbol),
        emissiveIntensity: 0.5
      });

      const sphere = new THREE.Mesh(geometry, material);
      sphere.position.copy(position);
      sphere.position.y += (index - 1) * 0.5; // Stack them vertically

      sceneRef.current!.add(sphere);
    });

    // Add wave particles
    createWaveParticles(position, reel.amplitude);
  };

  /**
   * Create entanglement effect (lightning between reels)
   */
  const createEntanglementEffect = (
    position: THREE.Vector3,
    reel: ReelQuantumState,
    index: number
  ) => {
    if (!sceneRef.current) return;

    // Create sphere for this reel
    const geometry = new THREE.SphereGeometry(0.6, 32, 32);
    const material = new THREE.MeshPhongMaterial({
      color: 0xff00ff,
      emissive: 0xff00ff,
      emissiveIntensity: 0.8,
      transparent: true,
      opacity: 0.7
    });

    const sphere = new THREE.Mesh(geometry, material);
    sphere.position.copy(position);
    sceneRef.current!.add(sphere);

    // Create entanglement lines
    reel.entangledWith.forEach(partnerId => {
      const partnerPosition = new THREE.Vector3((partnerId - 2) * 3, 0, 0);

      const points = [];
      const segments = 20;

      for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        const x = position.x + (partnerPosition.x - position.x) * t;
        const y = position.y + Math.sin(t * Math.PI * 4) * 0.5; // Wave pattern
        const z = position.z + (partnerPosition.z - position.z) * t;

        points.push(new THREE.Vector3(x, y, z));
      }

      const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
      const lineMaterial = new THREE.LineBasicMaterial({
        color: 0xff00ff,
        transparent: true,
        opacity: 0.8,
        linewidth: 2
      });

      const line = new THREE.Line(lineGeometry, lineMaterial);
      sceneRef.current!.add(line);
      entanglementLinesRef.current.push(line);
    });
  };

  /**
   * Create tunneling effect (particle teleportation)
   */
  const createTunnelingEffect = (position: THREE.Vector3, reel: ReelQuantumState) => {
    if (!sceneRef.current) return;

    // Create spiraling particles
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    const colors = [];

    for (let i = 0; i < 100; i++) {
      const angle = (i / 100) * Math.PI * 4;
      const radius = (i / 100) * 2;

      vertices.push(
        position.x + Math.cos(angle) * radius,
        position.y + (i / 100) * 4 - 2,
        position.z + Math.sin(angle) * radius
      );

      // Gradient from cyan to magenta
      const color = new THREE.Color();
      color.setHSL(0.5 + (i / 100) * 0.3, 1, 0.5);
      colors.push(color.r, color.g, color.b);
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.1,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });

    const particles = new THREE.Points(geometry, material);
    sceneRef.current!.add(particles);
    particleSystemsRef.current.push(particles);
  };

  /**
   * Create collapse effect (explosion of particles)
   */
  const createCollapseEffect = (position: THREE.Vector3, reel: ReelQuantumState) => {
    if (!sceneRef.current) return;

    const geometry = new THREE.SphereGeometry(0.8, 32, 32);
    const material = new THREE.MeshPhongMaterial({
      color: getSymbolColor(reel.symbols[0]),
      emissive: getSymbolColor(reel.symbols[0]),
      emissiveIntensity: 1,
      transparent: false,
      opacity: 1
    });

    const sphere = new THREE.Mesh(geometry, material);
    sphere.position.copy(position);
    sceneRef.current!.add(sphere);

    // Add explosion particles
    createExplosionParticles(position);
  };

  /**
   * Create wave particles for superposition
   */
  const createWaveParticles = (position: THREE.Vector3, amplitude: number) => {
    if (!sceneRef.current) return;

    const geometry = new THREE.BufferGeometry();
    const vertices = [];

    const particleCount = Math.floor(amplitude / 10);

    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const radius = 1.5;

      vertices.push(
        position.x + Math.cos(angle) * radius,
        position.y + Math.sin(angle * 3) * 0.3,
        position.z + Math.sin(angle) * radius
      );
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

    const material = new THREE.PointsMaterial({
      color: 0x00ffff,
      size: 0.08,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });

    const particles = new THREE.Points(geometry, material);
    sceneRef.current!.add(particles);
    particleSystemsRef.current.push(particles);
  };

  /**
   * Create explosion particles for collapse
   */
  const createExplosionParticles = (position: THREE.Vector3) => {
    if (!sceneRef.current) return;

    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    const velocities = [];

    for (let i = 0; i < 50; i++) {
      vertices.push(position.x, position.y, position.z);

      // Random velocity
      velocities.push(
        (Math.random() - 0.5) * 0.2,
        (Math.random() - 0.5) * 0.2,
        (Math.random() - 0.5) * 0.2
      );
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('velocity', new THREE.Float32BufferAttribute(velocities, 3));

    const material = new THREE.PointsMaterial({
      color: 0xffff00,
      size: 0.1,
      transparent: true,
      opacity: 1,
      blending: THREE.AdditiveBlending
    });

    const particles = new THREE.Points(geometry, material);
    sceneRef.current!.add(particles);
    particleSystemsRef.current.push(particles);
  };

  /**
   * Update particle animations
   */
  const updateParticles = () => {
    particleSystemsRef.current.forEach(particles => {
      particles.rotation.y += 0.01;
      particles.rotation.x += 0.005;
    });

    entanglementLinesRef.current.forEach(line => {
      // Animate entanglement lines
      const positions = line.geometry.attributes.position;
      if (positions) {
        for (let i = 0; i < positions.count; i++) {
          const y = positions.getY(i);
          positions.setY(i, y + Math.sin(Date.now() * 0.001 + i) * 0.01);
        }
        positions.needsUpdate = true;
      }
    });
  };

  /**
   * Clear all particles
   */
  const clearParticles = () => {
    if (!sceneRef.current) return;

    particleSystemsRef.current.forEach(particles => {
      sceneRef.current!.remove(particles);
      particles.geometry.dispose();
      (particles.material as THREE.Material).dispose();
    });

    particleSystemsRef.current = [];
  };

  /**
   * Clear entanglement lines
   */
  const clearEntanglementLines = () => {
    if (!sceneRef.current) return;

    entanglementLinesRef.current.forEach(line => {
      sceneRef.current!.remove(line);
      line.geometry.dispose();
      (line.material as THREE.Material).dispose();
    });

    entanglementLinesRef.current = [];
  };

  /**
   * Get color for symbol
   */
  const getSymbolColor = (symbol: SlotSymbol): number => {
    const colors = {
      [SlotSymbol.QUANTUM]: 0x00ffff,
      [SlotSymbol.ENTANGLE]: 0xff00ff,
      [SlotSymbol.WAVE]: 0x0088ff,
      [SlotSymbol.PHOTON]: 0xffff00,
      [SlotSymbol.ELECTRON]: 0xff8800,
      [SlotSymbol.PROTON]: 0xff0000,
      [SlotSymbol.NEUTRON]: 0x888888,
      [SlotSymbol.QUARK]: 0x8800ff,
      [SlotSymbol.HIGGS]: 0x00ff00,
      [SlotSymbol.VOID]: 0x000000,
    };

    return colors[symbol] || 0xffffff;
  };

  return (
    <div
      ref={containerRef}
      className="w-full h-[600px] rounded-lg overflow-hidden border-2 border-cyan-500/30 shadow-lg shadow-cyan-500/20"
      style={{
        background: 'radial-gradient(circle at center, #001020 0%, #000510 100%)'
      }}
    />
  );
}
