/* Subtle 3D wireframe object for the hero — loads only if THREE is available */
(function(){
  const canvas = document.getElementById('hero3d-canvas');
  if(!canvas || typeof THREE === 'undefined') return;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const stage = canvas.parentElement;
  let width = stage.clientWidth, height = stage.clientHeight;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, width/height, 0.1, 100);
  camera.position.set(0, 0, 9);

  const renderer = new THREE.WebGLRenderer({ canvas, alpha:true, antialias:true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(width, height);

  const isDark = document.documentElement.classList.contains('dark');
  const lineColor = isDark ? 0xEFA8B5 : 0xD96C7B;
  const dotColor = isDark ? 0x6F8068 : 0x7D9079;

  const geo = new THREE.IcosahedronGeometry(3.1, 1);
  const wireGeo = new THREE.EdgesGeometry(geo);
  const mat = new THREE.LineBasicMaterial({ color: lineColor, transparent:true, opacity: isDark ? 0.55 : 0.38 });
  const shape = new THREE.LineSegments(wireGeo, mat);
  scene.add(shape);

  // vertex points for a subtle depth accent
  const ptsGeo = new THREE.BufferGeometry().setFromPoints(geo.attributes.position.array.length ? Array.from({length: geo.attributes.position.count}, (_,i) => new THREE.Vector3(
    geo.attributes.position.getX(i), geo.attributes.position.getY(i), geo.attributes.position.getZ(i)
  )) : []);
  const ptsMat = new THREE.PointsMaterial({ color: dotColor, size: 0.06, transparent:true, opacity:0.7 });
  const pts = new THREE.Points(ptsGeo, ptsMat);
  shape.add(pts);

  let targetRotX = 0.15, targetRotY = 0.2;
  let curRotX = targetRotX, curRotY = targetRotY;

  stage.addEventListener('mousemove', (e) => {
    const r = stage.getBoundingClientRect();
    const px = (e.clientX - r.left)/r.width - 0.5;
    const py = (e.clientY - r.top)/r.height - 0.5;
    targetRotY = 0.2 + px*0.5;
    targetRotX = 0.15 - py*0.35;
  });

  function resize(){
    width = stage.clientWidth; height = stage.clientHeight;
    if(width===0||height===0) return;
    camera.aspect = width/height; camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }
  window.addEventListener('resize', resize);

  let t = 0;
  function animate(){
    requestAnimationFrame(animate);
    t += 0.0035;
    curRotX += (targetRotX - curRotX) * 0.04;
    curRotY += (targetRotY - curRotY) * 0.04;
    shape.rotation.x = curRotX + Math.sin(t*0.6)*0.03;
    shape.rotation.y = curRotY + t*0.12;
    renderer.render(scene, camera);
  }
  if(prefersReducedMotion){
    shape.rotation.set(0.3, 0.5, 0);
    renderer.render(scene, camera);
  } else {
    animate();
  }
})();
