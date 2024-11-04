import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'


const ThreeScene = () => {
  const mountRef = useRef(null)

  useEffect(() => {
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 1000)
    camera.position.z = 5
    const renderer = new THREE.WebGLRenderer()
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setClearColor(0xfffffff, 1)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    mountRef.current.appendChild(renderer.domElement)

    const geometry = new THREE.PlaneGeometry(1.5, 2)
    const material = new THREE.MeshBasicMaterial({color:  0x00ff00})
    const mesh = new THREE.Mesh(geometry, material)
    scene.add(mesh)

    function animate() {
      renderer.render(scene, camera)
      requestAnimationFrame(animate)
    }
    animate()

    const handleResize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight)
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
    }

    window.addEventListener('resize', handleResize)

    return () => {
      mountRef.current.removeChild(renderer.domElement)
      window.removeEventListener('resize', handleResize)
      renderer.dispose()
    }

  },[])

  return  <div ref={mountRef} style={{width: "100vw", height: "100vh"}}/>
  
}

export default ThreeScene
