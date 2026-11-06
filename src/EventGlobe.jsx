import { Html, OrbitControls, PerformanceMonitor, useCursor } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import { getGPUTier } from 'detect-gpu';
import * as THREE from 'three';
import landDots from './landDots.json';

const GLOBE_RADIUS = 2.05;
const HOME_CITY = 'Bhubaneswar';
const HOME_POSITION = [20.35, 85.82];
const BRAND = { indigo: '#4F46E5', lime: '#D4FF4F', coral: '#FF8068', paper: '#F2F1EC' };
const CATEGORY_LABELS = { all: 'ALL', music: 'MUSIC', ideas: 'IDEAS', wellness: 'WELLNESS', social: 'SOCIAL', art: 'ART', food: 'FOOD', tech: 'TECH', free: 'FREE', weekend: 'WEEKEND' };
const CATEGORY_OPTIONS = ['music', 'tech', 'food', 'art', 'free', 'weekend'];

function pointFromLatLon(lat, lon, radius = GLOBE_RADIUS) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(-radius * Math.sin(phi) * Math.cos(theta), radius * Math.cos(phi), radius * Math.sin(phi) * Math.sin(theta));
}

function categoryMatches(event, category) {
  if (!category || category === 'all') return true;
  if (category === 'free') return event.price === 'Free';
  if (category === 'tech') return event.category === 'ideas';
  if (category === 'art') return ['ideas', 'music', 'art'].includes(event.category);
  if (category === 'food') return ['social', 'food'].includes(event.category);
  if (category === 'weekend') return ['Saturday', 'Sunday'].some((day) => event.fullDate?.startsWith(day));
  return event.category === category;
}

function formatPrice(price) {
  if (price === 'Free') return 'Free';
  const amount = String(price).replace(/[^0-9]/g, '');
  return `INR ${amount || '0'}`;
}

function faceRotation(position) { return Math.atan2(-position.x, position.z); }

function GlobeDots({ reducedMotion }) {
  const pointsRef = useRef(null);
  const introStart = useRef(performance.now());
  const { positions, delays } = useMemo(() => {
    const values = [];
    const delayValues = [];
    landDots.forEach(([lat, lon], index) => {
      const point = pointFromLatLon(lat, lon, GLOBE_RADIUS + 0.018);
      values.push(point.x, point.y, point.z);
      delayValues.push((index % 97) / 97);
    });
    return { positions: new Float32Array(values), delays: new Float32Array(delayValues) };
  }, []);
  const material = useMemo(() => new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: { uReveal: { value: 0 }, uColor: { value: new THREE.Color(BRAND.indigo) } },
    vertexShader: `attribute float aDelay; varying float vFacing; varying float vDelay; void main() { vec4 mvPosition = modelViewMatrix * vec4(position, 1.0); vec3 normal = normalize(normalMatrix * normalize(position)); vec3 viewDirection = normalize(-mvPosition.xyz); vFacing = max(dot(normal, viewDirection), 0.0); vDelay = aDelay; gl_PointSize = 3.8; gl_Position = projectionMatrix * mvPosition; }`,
    fragmentShader: `uniform vec3 uColor; uniform float uReveal; varying float vFacing; varying float vDelay; void main() { vec2 point = gl_PointCoord - .5; float circle = 1.0 - smoothstep(.42, .5, length(point)); float reveal = smoothstep(vDelay - .12, vDelay + .12, uReveal); float alpha = circle * smoothstep(.03, .35, vFacing) * reveal * .86; if (alpha < .01) discard; gl_FragColor = vec4(uColor, alpha); }`,
  }), []);
  useEffect(() => () => material.dispose(), [material]);
  useFrame(() => {
    if (!pointsRef.current) return;
    const target = reducedMotion ? 1 : Math.min(1, (performance.now() - introStart.current) / 1400);
    material.uniforms.uReveal.value = target;
  });
  return <points ref={pointsRef} material={material}><bufferGeometry><bufferAttribute attach="attributes-position" count={positions.length / 3} array={positions} itemSize={3} /><bufferAttribute attach="attributes-aDelay" count={delays.length} array={delays} itemSize={1} /></bufferGeometry></points>;
}

function Atmosphere() {
  const material = useMemo(() => new THREE.ShaderMaterial({
    transparent: true, side: THREE.BackSide, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uIndigo: { value: new THREE.Color(BRAND.indigo) }, uLime: { value: new THREE.Color(BRAND.lime) } },
    vertexShader: `varying vec3 vNormal; void main() { vNormal = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `uniform vec3 uIndigo; uniform vec3 uLime; varying vec3 vNormal; void main() { float rim = pow(1.0 - max(dot(vNormal, vec3(0.0, 0.0, 1.0)), 0.0), 2.2); gl_FragColor = vec4(mix(uIndigo, uLime, rim), rim * .34); }`,
  }), []);
  useEffect(() => () => material.dispose(), [material]);
  return <mesh scale={1.055} material={material}><sphereGeometry args={[GLOBE_RADIUS, 48, 32]} /></mesh>;
}

function Graticule() {
  const positions = useMemo(() => {
    const values = [];
    for (let lat = -60; lat <= 60; lat += 30) for (let lon = -180; lon <= 180; lon += 8) { const point = pointFromLatLon(lat, lon, GLOBE_RADIUS + .026); values.push(point.x, point.y, point.z); }
    for (let lon = -150; lon <= 180; lon += 30) for (let lat = -90; lat <= 90; lat += 8) { const point = pointFromLatLon(lat, lon, GLOBE_RADIUS + .026); values.push(point.x, point.y, point.z); }
    return new Float32Array(values);
  }, []);
  return <lineSegments><bufferGeometry><bufferAttribute attach="attributes-position" count={positions.length / 3} array={positions} itemSize={3} /></bufferGeometry><lineBasicMaterial color={BRAND.indigo} transparent opacity={.16} /></lineSegments>;
}

function RipplePin({ cluster, onSelect, active, highlighted, reducedMotion, activeScene, onFacingChange }) {
  const groupRef = useRef(null);
  const ringRef = useRef(null);
  const facingRef = useRef(null);
  const worldPosition = useRef(new THREE.Vector3());
  const cameraDirection = useRef(new THREE.Vector3());
  const normal = useMemo(() => pointFromLatLon(cluster.lat, cluster.lon, 1).normalize(), [cluster.lat, cluster.lon]);
  const quaternion = useMemo(() => new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal), [normal]);
  const position = useMemo(() => pointFromLatLon(cluster.lat, cluster.lon, GLOBE_RADIUS + .045), [cluster.lat, cluster.lon]);
  const hovered = highlighted;
  useCursor(hovered, 'pointer', 'auto');
  useFrame(({ camera, clock }, delta) => {
    if (!groupRef.current) return;
    groupRef.current.getWorldPosition(worldPosition.current);
    const worldNormal = worldPosition.current.clone().normalize();
    const facing = worldNormal.dot(cameraDirection.current.copy(camera.position).sub(worldPosition.current).normalize()) > .05;
    if (facingRef.current !== facing) { facingRef.current = facing; onFacingChange(cluster.city, facing); }
    groupRef.current.visible = facing;
    const scale = active || hovered ? 1.3 : 1;
    groupRef.current.scale.lerp(new THREE.Vector3(scale, scale, scale), Math.min(1, delta * 10));
    if (ringRef.current) {
      if (reducedMotion || !activeScene) ringRef.current.scale.setScalar(1);
      else { const wave = (Math.sin(clock.elapsedTime * 2 + cluster.wave) + 1) / 2; ringRef.current.scale.setScalar(.8 + wave * 1.35); ringRef.current.material.opacity = .5 - wave * .34; }
    }
  });
  return <group ref={groupRef} position={position} quaternion={quaternion} onClick={(event) => { event.stopPropagation(); if (event.delta > 4) return; onSelect(cluster); }}><mesh><sphereGeometry args={[active || hovered ? .13 : .09, 16, 12]} /><meshStandardMaterial color={cluster.featured ? BRAND.lime : BRAND.coral} emissive={cluster.featured ? BRAND.lime : BRAND.coral} emissiveIntensity={2.4} toneMapped={false} /></mesh><mesh ref={ringRef} rotation={[0, 0, 0]}><ringGeometry args={[.13, .145, 32]} /><meshBasicMaterial color={cluster.featured ? BRAND.lime : BRAND.coral} transparent opacity={.4} side={THREE.DoubleSide} depthWrite={false} /></mesh>{cluster.events.length > 1 && <Html position={[0, 0, .22]} center distanceFactor={7}><span className="globe-pin-count">{cluster.events.length}</span></Html>}{hovered && <Html position={[0, 0, .26]} center distanceFactor={6}><span className="globe-pin-tooltip">{cluster.events.length > 1 ? `${cluster.city} - ${cluster.events.length} events` : cluster.events[0].title}</span></Html>}</group>;
}

function Arc({ from, to, color, activeScene, reducedMotion, index }) {
  const curve = useMemo(() => { const start = pointFromLatLon(from[0], from[1], GLOBE_RADIUS + .035); const end = pointFromLatLon(to[0], to[1], GLOBE_RADIUS + .035); const mid = start.clone().add(end).multiplyScalar(.5).normalize().multiplyScalar(GLOBE_RADIUS + .35); return new THREE.CatmullRomCurve3([start, mid, end]); }, [from, to]);
  const tubeRef = useRef(null);
  const dotRef = useRef(null);
  const geometry = useMemo(() => new THREE.TubeGeometry(curve, 40, .009, 5, false), [curve]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  useFrame(({ clock }) => { if (!tubeRef.current) return; const progress = reducedMotion ? 1 : Math.min(1, clock.elapsedTime * .3 - index * .2); tubeRef.current.geometry.setDrawRange(0, Math.floor(geometry.index.count * Math.max(0, progress))); if (dotRef.current && activeScene && !reducedMotion) dotRef.current.position.copy(curve.getPointAt((clock.elapsedTime * .08 + index * .2) % 1)); });
  return <group><mesh ref={tubeRef} geometry={geometry}><meshBasicMaterial color={color} transparent opacity={.5} depthWrite={false} /></mesh><mesh ref={dotRef} position={curve.getPointAt(0)}><sphereGeometry args={[.035, 8, 8]} /><meshBasicMaterial color={BRAND.lime} toneMapped={false} /></mesh></group>;
}

function TicketCard({ event, position, color, index, onSelect, reducedMotion, activeScene }) {
  const groupRef = useRef(null);
  const basePosition = useMemo(() => new THREE.Vector3(...position), [position]);
  const targetRotation = useRef(new THREE.Vector2());
  useFrame(({ clock }, delta) => { if (!groupRef.current) return; if (reducedMotion || !activeScene) targetRotation.current.set(0, 0); groupRef.current.position.y = basePosition.y + (reducedMotion ? 0 : Math.sin(clock.elapsedTime * 1.2 + index) * .06); groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotation.current.y, delta * 5); groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotation.current.x, delta * 5); });
  if (!event) return null;
  return <group ref={groupRef} position={position} onPointerMove={(eventPointer) => { if (reducedMotion) return; targetRotation.current.set(THREE.MathUtils.clamp(eventPointer.pointer.x * .14, -.14, .14), THREE.MathUtils.clamp(eventPointer.pointer.y * -.14, -.14, .14)); }} onPointerOut={() => targetRotation.current.set(0, 0)} onClick={(eventPointer) => { eventPointer.stopPropagation(); if (eventPointer.delta <= 4) onSelect(event); }}><FloatCard color={color} event={event} index={index} onSelect={onSelect} /></group>;
}

function FloatCard({ color, event, index, onSelect }) {
  return <Html transform distanceFactor={5.3} className="ticket-3d-html"><button type="button" className={`ticket-3d ticket-index-${index}`} style={{ '--ticket-color': color }} onClick={() => onSelect(event)}><span>{event.date}</span><strong>{event.title}</strong><small>{event.city}</small><em>Starts in 2 days</em></button></Html>;
}

function Scene({ events, onSelect, onOpen, hoveredId, activeCategory, reducedMotion, active, hidden, onInteraction, onEmptyClick, onClose, onSave, onHost, homeCity, onPerformance, performanceOk, viewRequest, deselectRequest }) {
  const globeRef = useRef(null);
  const controlsRef = useRef(null);
  const cardRef = useRef(null);
  const [selected, setSelected] = useState(null);
  const [selectedFacing, setSelectedFacing] = useState(true);
  const [dragging, setDragging] = useState(false);
  const interactionAt = useRef(0);
  const animation = useRef({ active: false, start: 0, from: 0, to: 0, fromCamera: 7, toCamera: 7 });
  const previousFocus = useRef(null);
  const category = activeCategory || 'all';
  const visibleEvents = useMemo(() => events.filter((event) => categoryMatches(event, category)), [events, category]);
  const clusters = useMemo(() => { const grouped = new Map(); visibleEvents.forEach((event) => { const key = event.city || event.location; if (!grouped.has(key)) grouped.set(key, { city: key, events: [], lat: event.lat, lon: event.lon, featured: false, wave: event.wave || 0 }); const group = grouped.get(key); group.events.push(event); group.featured = group.featured || event.featured; }); return [...grouped.values()]; }, [visibleEvents]);
  const homeEvent = useMemo(() => events.find((event) => event.city === homeCity) || { lat: HOME_POSITION[0], lon: HOME_POSITION[1] }, [events, homeCity]);
  const homePosition = useMemo(() => pointFromLatLon(homeEvent.lat, homeEvent.lon, GLOBE_RADIUS), [homeEvent.lat, homeEvent.lon]);
  const featuredTargets = useMemo(() => { const seen = new Set(); return visibleEvents.filter((event) => event.featured && event.city !== homeCity && !seen.has(event.city) && seen.add(event.city)); }, [visibleEvents, homeCity]);
  const tickets = useMemo(() => visibleEvents.filter((event) => event.featured).slice(0, 3), [visibleEvents]);
  const selectedCluster = selected ? clusters.find((cluster) => cluster.city === selected.city) : null;
  const selectedPosition = selectedCluster ? pointFromLatLon(selectedCluster.lat, selectedCluster.lon, GLOBE_RADIUS + .36) : null;
  const selectedEvent = selectedCluster?.events[0];
  const markInteraction = () => { interactionAt.current = performance.now(); onInteraction?.(); };
  const choose = (cluster) => {
    if (!cluster) return;
    markInteraction();
    previousFocus.current = document.activeElement;
    setSelected(cluster);
    setSelectedFacing(true);
    onSelect(cluster.events[0]);
    const target = faceRotation(pointFromLatLon(cluster.lat, cluster.lon, 1));
    animation.current = { active: true, start: performance.now(), from: globeRef.current?.rotation.y || 0, to: target, fromCamera: controlsRef.current?.object.position.length() || 7, toCamera: 6.2 };
  };
  const deselect = () => { if (!selected) { onEmptyClick?.(); return; } markInteraction(); setSelected(null); setSelectedFacing(false); onSelect(null); onClose?.(); animation.current = { active: true, start: performance.now(), from: globeRef.current?.rotation.y || 0, to: faceRotation(homePosition), fromCamera: controlsRef.current?.object.position.length() || 6.2, toCamera: 7 }; window.requestAnimationFrame(() => previousFocus.current?.focus?.()); };
  useEffect(() => { if (selected && selectedFacing) cardRef.current?.focus(); }, [selected, selectedFacing]);
  useEffect(() => { if (!globeRef.current) return; globeRef.current.rotation.y = faceRotation(homePosition); }, [homePosition]);
  useEffect(() => { if (!viewRequest || !globeRef.current) return; markInteraction(); if (selected) { setSelected(null); setSelectedFacing(false); onSelect(null); } const target = faceRotation(homePosition); animation.current = { active: true, start: performance.now(), from: globeRef.current.rotation.y, to: target, fromCamera: controlsRef.current?.object.position.length() || 7, toCamera: 7 }; }, [viewRequest, homePosition]);
  useEffect(() => { if (deselectRequest && selected) { setSelected(null); setSelectedFacing(false); } }, [deselectRequest]);
  useEffect(() => { const onKeyDown = (event) => { if (event.key === 'Escape') deselect(); }; window.addEventListener('keydown', onKeyDown); return () => window.removeEventListener('keydown', onKeyDown); });
  useFrame((_, delta) => {
    if (!globeRef.current || hidden) return;
    const elapsed = performance.now() - (animation.current.start || performance.now());
    if (animation.current.active) { const progress = Math.min(1, elapsed / 700); const eased = 1 - (1 - progress) ** 3; const delta = THREE.MathUtils.euclideanModulo(animation.current.to - animation.current.from + Math.PI, Math.PI * 2) - Math.PI; globeRef.current.rotation.y = animation.current.from + delta * eased; if (controlsRef.current) controlsRef.current.object.position.z = THREE.MathUtils.lerp(animation.current.fromCamera, animation.current.toCamera, eased); if (progress === 1) animation.current.active = false; }
    const canRotate = active && !selected && !dragging && performance.now() - interactionAt.current > 4000 && !reducedMotion;
    if (canRotate && !animation.current.active) globeRef.current.rotation.y += .12 * delta;
  });
  const facingCallback = (city, facing) => { if (selected?.city === city) setSelectedFacing(facing); };
  return <>
    <PerformanceMonitor onDecline={() => { onInteraction(); onPerformance?.(false); }} onIncline={() => onPerformance?.(true)} />
    <ambientLight intensity={1.8} /><pointLight position={[3, 4, 5]} color={BRAND.lime} intensity={6} distance={8} /><pointLight position={[-4, -2, 2]} color={BRAND.indigo} intensity={4} distance={8} />
    <group ref={globeRef}><mesh><sphereGeometry args={[GLOBE_RADIUS - .035, 48, 32]} /><meshBasicMaterial color="#20246b" depthWrite /></mesh><Atmosphere /><Graticule /><GlobeDots reducedMotion={reducedMotion} />{clusters.map((cluster) => <RipplePin key={cluster.city} cluster={cluster} active={selected?.city === cluster.city} highlighted={cluster.events.some((event) => event.id === hoveredId)} reducedMotion={reducedMotion} activeScene={active && !hidden} onSelect={choose} onFacingChange={facingCallback} />)}{featuredTargets.map((event, index) => <Arc key={event.city} from={[homeEvent.lat, homeEvent.lon]} to={[event.lat, event.lon]} color={index % 2 ? BRAND.coral : BRAND.indigo} activeScene={active} reducedMotion={reducedMotion} index={index} />)}{selected && selectedPosition && selectedFacing && <Html position={selectedPosition} center distanceFactor={5.1}><div ref={cardRef} className="pin-event-card" tabIndex="-1"><button className="pin-card-close" type="button" onClick={deselect} aria-label="Close selected event">×</button>{selectedCluster.events.length === 1 ? <><span>{selectedEvent.date} - {selectedEvent.categoryLabel}</span><strong>{selectedEvent.title}</strong><small>{selectedEvent.location}</small><em className="pin-price">{formatPrice(selectedEvent.price)}</em>{selectedEvent.spots <= 15 && <small className="pin-spots">{selectedEvent.spots} spots left</small>}<div className="pin-card-actions"><button type="button" onClick={() => onOpen(selectedEvent)}>View details →</button><button type="button" onClick={() => onSave?.(selectedEvent)}>♡ Save</button></div></> : <><strong>{selectedCluster.city} - {selectedCluster.events.length} events</strong><div className="cluster-events">{selectedCluster.events.slice(0, 3).map((event) => <button key={event.id} type="button" onClick={() => onOpen(event)}><span>{event.date}</span>{event.title}</button>)}</div><button className="cluster-link" type="button" onClick={() => onOpen(selectedEvent)}>See all {selectedCluster.events.length} in the list below</button></>}</div></Html>}</group>
    {performanceOk && tickets.map((event, index) => <TicketCard key={event.id} event={event} position={[[2.85, 1.12, .4], [-3.05, .45, -.4], [2.65, -1.45, -.35]][index]} color={index === 0 ? BRAND.lime : index === 1 ? BRAND.coral : BRAND.indigo} index={index} onSelect={onOpen} reducedMotion={reducedMotion} activeScene={active} />)}
    <OrbitControls ref={controlsRef} enableZoom={false} enablePan={false} enableDamping dampingFactor={.08} autoRotate={false} rotateSpeed={.55} minPolarAngle={Math.PI * .25} maxPolarAngle={Math.PI * .75} onStart={() => { setDragging(true); markInteraction(); }} onChange={markInteraction} onEnd={() => { setDragging(false); markInteraction(); }} />
  </>;
}

function StaticFallback({ events, onSelect }) {
  const visibleEvents = [...events.filter((event) => event.city === HOME_CITY), ...events.filter((event) => event.city !== HOME_CITY)].slice(0, 3);
  return <div className="globe-fallback" role="region" aria-label="Static Pulse event globe fallback"><div className="fallback-globe"><span className="fallback-pin pin-one" /><span className="fallback-pin pin-two" /><span className="fallback-pin pin-three" /><span className="fallback-pin pin-four" /></div><div className="fallback-copy"><strong>Pulse globe</strong><span>Explore signals in your city</span></div><div className="fallback-events">{visibleEvents.map((event) => <button type="button" key={event.id} onClick={() => onSelect(event)}><span>{event.date}</span>{event.title}</button>)}</div></div>;
}

function GlobeControls({ activeCategory, onCategory, onNearMe, onReset }) {
  return <div className="globe-controls" aria-label="Globe controls"><button type="button" onClick={onNearMe}>Near me</button><button type="button" onClick={onReset}>Reset view</button>{CATEGORY_OPTIONS.map((category) => <button type="button" className={activeCategory === category ? 'is-active' : ''} key={category} onClick={() => onCategory(category)}>{CATEGORY_LABELS[category]}</button>)}</div>;
}

export default function EventGlobe({ events, onSelect, onOpen = onSelect, hoveredId, activeCategory, onCategoryChange, onSave, onHost, homeCity = HOME_CITY }) {
  const [active, setActive] = useState(true);
  const [hidden, setHidden] = useState(() => document.hidden);
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [gpuTier, setGpuTier] = useState(null);
  const [dpr, setDpr] = useState(1.5);
  const [performanceOk, setPerformanceOk] = useState(true);
  const [viewRequest, setViewRequest] = useState(null);
  const [deselectRequest, setDeselectRequest] = useState(null);
  const [localCategory, setLocalCategory] = useState(activeCategory || 'all');
  const [interacted, setInteracted] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const wrapperRef = useRef(null);
  const category = activeCategory || localCategory;
  const filteredEvents = events.filter((event) => categoryMatches(event, category));
  const handleSelect = (event) => { setAnnouncement(event ? `Selected: ${event.title}, ${event.date}, ${event.city}` : ''); onSelect(event); };
  useEffect(() => { getGPUTier().then((result) => setGpuTier(result.tier === 0 ? 0 : 1)).catch(() => setGpuTier(1)); }, []);
  useEffect(() => { const query = window.matchMedia('(prefers-reduced-motion: reduce)'); const update = (event) => setReducedMotion(event.matches); query.addEventListener?.('change', update); return () => query.removeEventListener?.('change', update); }, []);
  useEffect(() => { const update = () => setHidden(document.hidden); document.addEventListener('visibilitychange', update); return () => document.removeEventListener('visibilitychange', update); }, []);
  useEffect(() => { const observer = new IntersectionObserver(([entry]) => setActive(entry.isIntersecting), { threshold: .05 }); if (wrapperRef.current) observer.observe(wrapperRef.current); return () => observer.disconnect(); }, []);
  const setCategory = (next) => { setLocalCategory(next); onCategoryChange?.(next); setInteracted(true); };
  const reset = () => { setLocalCategory('all'); setInteracted(true); };
  const home = events.find((event) => event.city === homeCity) || { lat: HOME_POSITION[0], lon: HOME_POSITION[1] };
  return <div ref={wrapperRef} className="globe-stage"><div className="globe-status"><span className="status-dot" /> {category === 'all' ? 'LIVE SIGNALS' : `${filteredEvents.length} ${CATEGORY_LABELS[category]} EVENTS`} <b>{filteredEvents.length} EVENTS</b></div>{gpuTier === 0 ? <StaticFallback events={filteredEvents} onSelect={handleSelect} /> : <Canvas dpr={[1, dpr]} frameloop={active && !hidden ? 'always' : 'never'} camera={{ position: [0, 0, 7], fov: 42 }} gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }} onCreated={({ gl }) => gl.domElement.setAttribute('aria-hidden', 'true')} onPointerMissed={() => { setDeselectRequest(Date.now()); handleSelect(null); }}><Scene events={filteredEvents} onSelect={handleSelect} onOpen={onOpen} hoveredId={hoveredId} activeCategory={category} reducedMotion={reducedMotion} active={active} hidden={hidden} onInteraction={() => setInteracted(true)} onEmptyClick={() => handleSelect(null)} onClose={() => handleSelect(null)} onSave={onSave} onHost={onHost} homeCity={homeCity} performanceOk={performanceOk} viewRequest={viewRequest} deselectRequest={deselectRequest} onPerformance={(ok) => { setPerformanceOk(ok); setDpr(ok ? 1.5 : 1); }} /></Canvas>}{filteredEvents.length === 0 && <div className="globe-empty"><strong>No signals here yet.</strong><span>Be the first to host in {homeCity}.</span><button type="button" onClick={onHost}>Host an event</button></div>}<div className={`globe-hint ${interacted ? 'is-hidden' : ''}`} aria-live="polite">Drag to spin - Tap a pin to peek</div><div className="globe-live-region" aria-live="polite" aria-atomic="true">{announcement}</div><GlobeControls activeCategory={category} onCategory={setCategory} onNearMe={() => { setInteracted(true); setViewRequest({ type: 'home', at: Date.now() }); }} onReset={() => { reset(); setViewRequest({ type: 'home', at: Date.now() }); }} /><details className="globe-a11y-list"><summary>Browse events as a list</summary><ul>{filteredEvents.map((event) => <li key={event.id}><button type="button" onClick={() => handleSelect(event)}><span>{event.date}</span>{event.title} <b>↗</b></button></li>)}</ul></details></div>;
}
