import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

const MESSAGES = [
  "Welcome to CivicCase! I am Earth-chan. Let's make your community better together.",
  "As a resident, report issues with a photo and a precise pin on the map.",
  "Our AI categorizes your reports automatically so the right team responds fast.",
  "Track status updates in real time and chat with me whenever you need help.",
]

const TYPE_SPEED_MS = 38
const HOLD_MS = 3000
const FADE_MS = 400
const GAP_MS = 2000

export default function EarthChanScene() {
  const containerRef = useRef(null)
  const bubbleRef = useRef(null)
  const [messageIndex, setMessageIndex] = useState(0)
  const [typed, setTyped] = useState('')
  const [bubbleVisible, setBubbleVisible] = useState(true)
  const [isTyping, setIsTyping] = useState(true)

  useEffect(() => {
    const current = MESSAGES[messageIndex]
    let charIndex = 0
    const timers = []

    setTyped('')
    setBubbleVisible(true)
    setIsTyping(true)

    const typingTimer = setInterval(() => {
      charIndex += 1
      setTyped(current.slice(0, charIndex))
      if (charIndex >= current.length) {
        clearInterval(typingTimer)
        setIsTyping(false)

        const holdTimer = setTimeout(() => {
          setBubbleVisible(false)

          const gapTimer = setTimeout(() => {
            setMessageIndex((i) => (i + 1) % MESSAGES.length)
          }, FADE_MS + GAP_MS)
          timers.push(gapTimer)
        }, HOLD_MS)
        timers.push(holdTimer)
      }
    }, TYPE_SPEED_MS)

    return () => {
      clearInterval(typingTimer)
      timers.forEach(clearTimeout)
    }
  }, [messageIndex])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return undefined

    const getSize = () => ({
      width: container.clientWidth || window.innerWidth,
      height: container.clientHeight || window.innerHeight,
    })

    let { width, height } = getSize()

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 100)
    camera.position.set(0, 0, 5)

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, premultipliedAlpha: false })
    renderer.setClearColor(0x000000, 0)
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    container.appendChild(renderer.domElement)

    const TARGET_HEIGHT = 4.4
    const CHARACTER_X = -2.4
    const CHARACTER_Y = -2.6 + TARGET_HEIGHT / 2

    const initialWidth = TARGET_HEIGHT * (1024 / 1536)
    const characterGeometry = new THREE.PlaneGeometry(initialWidth, TARGET_HEIGHT)
    const characterMaterial = new THREE.MeshBasicMaterial({
      color: 0xff00ff,
      side: THREE.DoubleSide,
      transparent: true,
      alphaTest: 0.1,
      depthWrite: false,
    })
    const character = new THREE.Mesh(characterGeometry, characterMaterial)
    character.position.set(CHARACTER_X, CHARACTER_Y, 0)
    scene.add(character)

    const img = new window.Image()
    img.onload = () => {
      const texture = new THREE.Texture(img)
      texture.colorSpace = THREE.SRGBColorSpace
      texture.premultiplyAlpha = false
      texture.needsUpdate = true
      characterMaterial.map = texture
      characterMaterial.color = new THREE.Color(0xffffff)
      characterMaterial.needsUpdate = true

      const aspect = img.naturalWidth / img.naturalHeight
      const targetWidth = TARGET_HEIGHT * aspect
      character.geometry.dispose()
      character.geometry = new THREE.PlaneGeometry(targetWidth, TARGET_HEIGHT)
    }
    img.onerror = (event) => {
      // eslint-disable-next-line no-console
      console.error('[EarthChan] image failed to load', event)
    }
    img.src = '/earth-chan.png'

    const bubbleAnchor = new THREE.Vector3(-1.85, 1.35, 0)
    const projectedVec = new THREE.Vector3()
    let firstFrameDone = false

    let rafId = 0
    const render = () => {
      renderer.render(scene, camera)

      projectedVec.copy(bubbleAnchor).project(camera)
      const screenX = (projectedVec.x + 1) * 0.5 * width
      const screenY = (1 - projectedVec.y) * 0.5 * height

      if (bubbleRef.current) {
        bubbleRef.current.style.left = `${screenX}px`
        bubbleRef.current.style.top = `${screenY}px`

        if (!firstFrameDone) {
          firstFrameDone = true
          bubbleRef.current.style.visibility = 'visible'
        }
      }

      rafId = requestAnimationFrame(render)
    }
    render()

    const handleResize = () => {
      const next = getSize()
      if (next.width === 0 || next.height === 0) return
      width = next.width
      height = next.height
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', handleResize)
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
      renderer.dispose()
      character.geometry.dispose()
      if (characterMaterial.map) {
        characterMaterial.map.dispose()
      }
      characterMaterial.dispose()
    }
  }, [])

  const bubbleClass = bubbleVisible
    ? 'earth-scene__bubble earth-scene__bubble--visible'
    : 'earth-scene__bubble'

  return (
    <div className="earth-scene">
      <div ref={containerRef} className="earth-scene__canvas" aria-hidden="true" />
      <div
        ref={bubbleRef}
        className={bubbleClass}
        role="status"
        aria-live="polite"
      >
        <p className="earth-scene__bubble-text">
          {typed}
          {isTyping && <span className="earth-scene__caret" />}
        </p>
      </div>
    </div>
  )
}
