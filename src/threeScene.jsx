import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { vertex } from './shaders/vertex';
import { fragment } from './shaders/fragment';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import VirtualScroll from 'virtual-scroll';

gsap.registerPlugin(ScrollTrigger);

const ThreeScene = () => {
  const mountRef = useRef(null);
  const meshRefs = useRef([]);
  const scrollTarget = useRef(0);
  const scrollCurrent = useRef(0);

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 1000);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0xffffff, 1);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    const colors = [
      0xe63946, 0xf1faee, 0xa8dadc, 0x457b9d, 0x1d3557,
      0xffb703, 0xfb8500, 0x023047, 0x8ecae6, 0x219ebc,
      0x8338ec, 0x3a0ca3, 0x00b4d8, 0x48cae4, 0x0077b6,
      0xd4a5a5, 0xef476f, 0x06d6a0, 0x118ab2, 0x073b4c,
    ];

    // Create planes with unique colors and shader materials
    meshRefs.current = colors.map((color, i) => {
      const geometry = new THREE.PlaneGeometry(1.5, 2, 32, 32);
      const material = new THREE.ShaderMaterial({
        vertexShader: vertex,
        fragmentShader: fragment,
        side: THREE.DoubleSide,
        uniforms: {
          color: { value: new THREE.Color(color) },
          progress: { value: 0 },
        },
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.x = (i - 2) * 1;
      mesh.rotation.x = -Math.PI / 16;
      mesh.rotation.y = -Math.PI / 16;
      scene.add(mesh);
      return mesh;
    });

    const scroller = new VirtualScroll();
    scroller.on(event => {
      scrollTarget.current += event.deltaY / 1000; // Normalize the scroll
    });

    function animate() {
      scrollCurrent.current += (scrollTarget.current - scrollCurrent.current) * 0.1;

      meshRefs.current.forEach((mesh, index) => {
        mesh.material.uniforms.progress.value = scrollCurrent.current * 0.5 - index * 0.3;
      });

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    }
    animate();

    // Set up ScrollTrigger
    ScrollTrigger.create({
      trigger: mountRef.current,
      start: "top top",
      end: "bottom bottom",
      scrub: 1,
      onUpdate: () => {
        scrollTarget.current = scrollCurrent.current; 
      },
    });

    const handleResize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      scroller.destroy(); // Clean up VirtualScroll
      mountRef.current.removeChild(renderer.domElement);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} style={{ width: '100vw', height: '100vh' }} />;
};

export default ThreeScene;
