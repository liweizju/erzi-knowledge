# 技术前沿 - 2026-02-08

## 来源
Codrops (tympanus.net/codrops) - 前端创意交互教程

## 1. 3D Scroll-Driven Text Animations with CSS and GSAP

**URL:** https://tympanus.net/codrops/2025/11/04/creating-3d-scroll-driven-text-animations-with-css-and-gsap/

### 核心思路
用纯 CSS + GSAP 实现滚动驱动的 3D 文本动画，**不需要 Three.js**。文本围绕一个不可见的圆柱体排列，滚动时动态变换位置。

### 关键技术

#### 1. GSAP 插件组合
```javascript
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollSmoother } from 'gsap/ScrollSmoother';

gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

// 创建平滑滚动体验
this.smoother = ScrollSmoother.create({
  smooth: 1,
  effects: true,
});
```
- **ScrollSmoother**：确保一致、GPU 加速的滚动
- **ScrollTrigger**：将动画直接绑定到滚动进度

#### 2. CSS 3D 空间
```css
.cylinder__wrapper {
  perspective: 70vw;  /* 添加深度 */
  transform-style: preserve-3d;  /* 允许子元素 3D 定位 */
}

.cylinder__text__wrapper {
  transform-style: preserve-3d;
  transform-origin: center center;
  backface-visibility: hidden;  /* 隐藏背面 */
}
```

#### 3. 动态位置计算
```javascript
calculatePositions(): void {
  const offset = 0.4;
  const radius = Math.min(window.innerWidth, window.innerHeight) * offset;
  const spacing = 180 / this.textItems.length;

  this.textItems.forEach((item, index) => {
    const angle = (index * spacing * Math.PI) / 180;
    const rotationAngle = index * -spacing;

    const x = 0;
    const y = Math.sin(angle) * radius;
    const z = Math.cos(angle) * radius;

    item.style.transform = `translate3d(-50%, -50%, 0) translate3d(${x}px, ${y}px, ${z}px) rotateX(${rotationAngle}deg)`;
  });
}
```
- **offset**：控制圆柱体的"紧密度"（0.4）
- **radius**：根据 viewport 动态缩放
- **每个文本项计算 x, y, z 坐标**

### 优势
- **轻量级**：不需要 Three.js 等重型 3D 库
- **高性能**：GSAP + CSS transforms 都是 GPU 加速
- **响应式**：自动适配不同屏幕尺寸
- **简单易用**：CSS + 基础 JS 语法

---

## 2. WebGL Portfolio Case Study: Creative Process Insights

**URL:** https://tympanus.net/codrops/2025/11/27/letting-the-creative-process-shape-a-webgl-portfolio/

### 核心洞察
创意过程不是线性的。初始想法（fold effect）几乎变成了可选，而很多功能因为不适合视觉方向而完全消失。

### 关键技术

#### 1. Vector Projection for Directional Fold
**问题：** 如何让折叠效果在任意方向工作？

**解决：** 向量投影 + curlPlane 函数
```javascript
// 1. 归一化方向
vec2 dir = normalize(uDirection);

// 2. 将顶点投影到方向轴
float projValue = dot(vec2(position.xy), dir);

// 3. 对投影值应用曲线函数
vec2 curledPosition = curlPlane(projValue, effectiveSize, uCurlX, uCurlY, true);

// 4. 沿选择方向重新分配结果
newposition.xy += dir * (curledPosition.x - projValue);
newposition.z += curledPosition.y;
```

#### 2. Fake Shadow Based on Curvature
**问题：** 如何让折叠效果更真实？

**解决：** 基于曲率的简单假阴影
```glsl
// Vertex Shader: 计算曲率
float maxExpectedCurl = 0.5;
float vCurvatureAmount = smoothstep(0.0, maxExpectedCurl, abs(curledPosition.y));

// Fragment Shader: 应用阴影
varying float vCurvatureAmount;
void main() {
  vec4 color = texture(uTexture, vUv);
  float shadow = 1.0 - vCurvatureAmount * 0.25;
  color.rgb *= shadow;
  gl_FragColor = vec4(color.rgb, color.a);
}
```
- **smoothstep**：创建平滑过渡
- **曲率越大，阴影越深**：增强 3D 感

#### 3. MeshPortal: Rendering Bounded 3D Scene
**问题：** 如何在边界区域内渲染 3D 场景？

**解决：** 使用 FBO (Frame Buffer Object) + 自定义 mask shader
```javascript
// 创建独立场景和相机
const otherSceneRef = useRef(new THREE.Scene());
const otherCameraRef = useRef();

// 创建渲染目标
const renderTarget = useFBO({
  width: viewport.width * viewport.dpr,
  height: viewport.height * viewport.dpr,
});

// 渲染到纹理
useFrame((state) => {
  const { gl } = state;
  if (composer) composer.render();
  
  // 应用渲染的纹理到 portal mesh
  if (portalMeshRef.current && portalMeshRef.current.material) {
    portalMeshRef.current.material.uniforms.tDiffuse.value = renderTarget.texture;
  }
});
```

**Portal Mask Shader：**
```glsl
uniform vec4 uMask; // x1, x2, y1, y2 bounds
void main() {
  vec2 uv = vUv;
  // 基于 mask bounds 剪裁
  if (uv.x < uMask.x || uv.x > uMask.y || uv.y < uMask.z || uv.y > uMask.w) {
    discard;
  }
  vec4 color = texture2D(tDiffuse, uv);
  gl_FragColor = color;
}
```

### 实践经验
- **耐心观察**：创意方向会自然浮现，不要一开始就规划好一切
- **记录过程**：用视频记录演化过程，帮助回忆和欣赏变化
- **透明分享**：即使是不完美的 WIP，也比不分享有趣
- **响应式系统**：跟踪 DOM 元素边界并转换为 WebGL 坐标

---

## 可落地的技术

### 对 erzi-knowledge/erzi-site
1. **CSS + GSAP Scroll-Driven 文本**：用于 hero section 的 3D 文字效果
2. **Fake Shadow Shader**：用于 WebGL 效果的深度增强
3. **MeshPortal 技术**：用于在 UI 中嵌入 3D 场景

### 技术栈建议
- **GSAP**：高性能动画，ScrollTrigger + ScrollSmoother
- **Three.js + React Three Fiber**：3D 场景渲染
- **Custom Shaders**：优化的视觉效果

---

## 标签
#gsap #scroll-trigger #3d #css3d #webgl #shader #creative-coding #portfolio
