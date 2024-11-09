import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { vertex } from './shaders/vertex';
import { fragment } from './shaders/fragment';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import VirtualScroll from 'virtual-scroll';
import * as dat from 'dat.gui';

gsap.registerPlugin(ScrollTrigger);

const ThreeScene = () => {
  const mountRef = useRef(null);
  const meshRefs = useRef([]);
  const scrollTarget = useRef(0);
  const scrollCurrent = useRef(0);
  const cameraPosition = useRef({ x: 3, y: 0, z: 0 });
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  const targetPositionY = useRef([]);

  const initializeScene = (loadedTextures) => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 1000);
    camera.position.set(cameraPosition.current.x, cameraPosition.current.y, cameraPosition.current.z);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0xffffff, 1);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    // Create planes and apply textures
    meshRefs.current = loadedTextures.map((texture, i) => {
      const geometry = new THREE.PlaneGeometry(2, 3, 32, 32);
      const material = new THREE.ShaderMaterial({
        vertexShader: vertex,
        fragmentShader: fragment,
        side: THREE.DoubleSide,
        uniforms: {
          uTexture: { value: texture },
          progress: { value: 0 },
        },
      });

      const mesh = new THREE.Mesh(geometry, material);
      const container = new THREE.Object3D();
      container.add(mesh);
      container.position.z = -i * 3;
      scene.add(container);

      targetPositionY.current[i] = 0;
      return container;
    });

    // const gui = new dat.GUI();
    raycaster.precision = 0.0001;

    // const cameraFolder = gui.addFolder('Camera Position');
    // cameraFolder.add(cameraPosition.current, 'x', -10, 10).onChange(value => {
    //   camera.position.x = value;
    // });
    // cameraFolder.add(cameraPosition.current, 'y', -10, 10).onChange(value => {
    //   camera.position.y = value;
    // });
    // cameraFolder.add(cameraPosition.current, 'z', -10, 10).onChange(value => {
    //   camera.position.z = value;
    // });
    // cameraFolder.open();

    const scroller = new VirtualScroll();
    scroller.on(event => {
      scrollTarget.current += event.deltaY / 1000;
    });

    function animate() {
      scrollCurrent.current += (scrollTarget.current - scrollCurrent.current) * 0.3;

      meshRefs.current.forEach((container, index) => {
        const mesh = container.children[0];
        mesh.material.uniforms.progress.value = scrollCurrent.current * 0.5 - index * 0.3;
        mesh.position.y += (targetPositionY.current[index] - mesh.position.y) * 0.1;
      });

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    }
    animate();

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

    const handleMouseMove = (event) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      meshRefs.current.forEach((container, index) => {
        const mesh = container.children[0];
        targetPositionY.current[index] = 0;
      });

      const intersects = raycaster.intersectObjects(meshRefs.current.map(c => c.children[0]));

      if (intersects.length > 0) {
        const intersectedMesh = intersects[0].object;
        const meshIndex = meshRefs.current.findIndex(container => container.children[0] === intersectedMesh);
        targetPositionY.current[meshIndex] = 1;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      scroller.destroy();
      mountRef.current.removeChild(renderer.domElement);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      renderer.dispose();
      gui.destroy();
    };
  };

  useEffect(() => {
    // Fetch posters and initialize scene
    const fetchPostersAndInitialize = async () => {
      const movies = await fetchMovies();
      const textureLoader = new THREE.TextureLoader();
      const loadedTextures = movies.map(movie => textureLoader.load(movie.posterPath));
      
      initializeScene(loadedTextures); 
    };

    fetchPostersAndInitialize();
  }, []); 

  return <div ref={mountRef} style={{ width: '100vw', height: '100vh' }} />;
};

const fetchMovies = async () => {
  const accessToken = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJmMmQyZWEzM2Y3MjBhMTQ5MWU4MjE1MDM5MWEwNzYxZiIsIm5iZiI6MTczMTE0Njg0NC42NjE4MzUsInN1YiI6IjY1MjE1OTAzYzFmZmJkMDBmZTEwY2NmZiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.1HGu69GzirQ6feFPTbec7aJUyaIhh5xaKNcymg49GPE';
  const url = 'https://api.themoviedb.org/3/movie/upcoming?language=en-US&page=1';
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const data = await response.json();
  return data.results.map(movie => ({
    title: movie.title,
    posterPath: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
  }));
};

export default ThreeScene;
