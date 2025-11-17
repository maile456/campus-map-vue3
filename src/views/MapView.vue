<template>
  <div class="app-root">
    <!-- 位置详情组件 -->
     <Topbar></Topbar>
    <LibraryModal
      :show="showLibraryModal"
      @close="showLibraryModal = false"
      @navigate="navigateToLibrary"
    />
    <GymModal
      :show="showGymModal"
      @close="showGymModal = false"
      @navigate="navigateToGym"
    />
    <CanteenModal
      :show="showCanteenModal"
      @close="showCanteenModal = false"
      @navigate="navigateToCanteen"
    />

    <div class="map-wrapper">
      <!-- 左侧苹果风格侧栏 -->
      <Sidebar @locate="handleLocate"></Sidebar>

      <!-- 地图容器 -->
      <div ref="mapContainer" class="map-container"></div>

      <!-- 右上控制组（样式参照图片） -->
      <div class="top-controls">
        <button class="control">一键到教室</button>
        <button class="control">图层</button>
        <button class="control">工具</button>
        <button
          :class="['control', { active: currentType === '2d' }]"
          @click="setMapMode('2d')"
        >
          2D
        </button>
        <button
          :class="['control', { active: currentType === '3d' }]"
          @click="setMapMode('3d')"
        >
          3D
        </button>
        <!-- 自行车高峰路线开关 -->
        <button
          :class="['control', { active: showBikeRoutes }]"
          @click="toggleBikeRoutes"
          title="显示/隐藏校园自行车高峰路线"
        >
          🚴 高峰路线
        </button>
        <button class="control" @click="showNavModal = true">地图导航</button>
      </div>

      <!-- 缩放与罗盘 -->
      <div class="map-ctrls">
        <div class="compass">🧭</div>
        <button
          class="lock-btn"
          @click="lockCurrentLocation"
          title="锁定当前位置"
        >
          📍
        </button>
        <div class="zoom">
          <button @click="zoomIn">+</button>
          <button @click="zoomOut">−</button>
        </div>
      </div>

      <!-- 路线面板容器 -->
      <div id="routePanel" class="route-panel-container"></div>

      <!-- 信息窗口 -->
      <div class="info-window" v-if="info.show">
        <div class="info-window-header">
          <h3>{{ info.title }}</h3>
          <button class="info-window-close" @click="info.show = false">
            ✕
          </button>
        </div>
        <p>{{ info.desc }}</p>
      </div>

      <!-- 导航模态面板（简洁版） -->
      <div v-if="showNavModal" class="nav-modal">
        <div class="nav-modal-content">
          <!-- 头部 -->
          <div class="nav-modal-header">
            <h3>地图导航</h3>
            <button class="nav-modal-close" @click="showNavModal = false">
              ✕
            </button>
          </div>

          <!-- 步行/驾车选择 -->
          <div class="nav-mode-tabs">
            <button
              :class="['nav-tab', { active: travelMode === 'walking' }]"
              @click="travelMode = 'walking'"
            >
              🚶 步行
            </button>
            <button
              :class="['nav-tab', { active: travelMode === 'driving' }]"
              @click="travelMode = 'driving'"
            >
              🚗 驾车
            </button>
          </div>

          <!-- 输入表单 -->
          <div class="nav-form">
            <!-- 起点 -->
            <div class="nav-input-group">
              <label class="nav-label">📍 起点</label>
              <div class="nav-search-box">
                <input
                  v-model="navOrigin"
                  placeholder="输入起点地址（如：图书馆、一号教学楼）"
                  class="nav-input"
                />
                <button class="nav-search-btn" @click="searchOrigin">🔍</button>
              </div>
              <div v-if="selectedOrigin.name" class="nav-selected">
                ✓ 已选择：<strong>{{ selectedOrigin.name }}</strong>
              </div>
              <!-- 起点搜索结果列表 -->
              <ul v-if="originSearchResults.length" class="nav-results-list">
                <li
                  v-for="(result, idx) in originSearchResults"
                  :key="'origin-' + idx"
                  class="nav-result-item"
                >
                  <div class="nav-result-info">
                    <div class="nav-result-title">{{ result.title }}</div>
                    <div class="nav-result-addr">{{ result.address }}</div>
                  </div>
                  <button class="nav-result-btn" @click="selectOrigin(result)">
                    设为起点
                  </button>
                </li>
              </ul>
            </div>

            <!-- 终点 -->
            <div class="nav-input-group">
              <label class="nav-label">🔴 终点</label>
              <div class="nav-search-box">
                <input
                  v-model="navDestination"
                  placeholder="输入终点地址（如：食堂、操场）"
                  class="nav-input"
                />
                <button class="nav-search-btn" @click="searchDestination">
                  🔍
                </button>
              </div>
              <div v-if="selectedDestination.name" class="nav-selected">
                ✓ 已选择：<strong>{{ selectedDestination.name }}</strong>
              </div>
              <!-- 终点搜索结果列表 -->
              <ul v-if="destSearchResults.length" class="nav-results-list">
                <li
                  v-for="(result, idx) in destSearchResults"
                  :key="'dest-' + idx"
                  class="nav-result-item"
                >
                  <div class="nav-result-info">
                    <div class="nav-result-title">{{ result.title }}</div>
                    <div class="nav-result-addr">{{ result.address }}</div>
                  </div>
                  <button
                    class="nav-result-btn"
                    @click="selectDestination(result)"
                  >
                    设为终点
                  </button>
                </li>
              </ul>
            </div>

            <div class="nav-hint">
              💡 输入地址或建筑名称，点击搜索按钮查看结果，然后选择确认
            </div>
          </div>

          <!-- 蓝色开始按钮 -->
          <button class="nav-btn-start" @click="startNavigation">
            🚀 开始导航
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, reactive } from "vue";
import LibraryModal from "../views/LibraryModal.vue";
import GymModal from "../views/GymModal.vue";
import CanteenModal from "../views/CanteenModal.vue";
import Topbar from "../components/Topbar.vue";
import Sidebar from "../components/Sidebar.vue";
import places from "../data/places.json";
const mapContainer = ref(null);
let map = null;

const currentType = ref("2d");

// 建筑数据 - 空数组，用户可以手动添加
const buildings = [];

// 所有 marker 的统一列表（用于在地图点击时定位最近的 marker 并触发）
const allMarkers = [];

// 用于手动添加建筑的临时数据
const newBuilding = reactive({ name: "", lng: "", lat: "", desc: "" });

const info = reactive({ show: false, title: "", desc: "" });

let ac = null; // Autocomplete
let localSearch = null; // LocalSearch for resolving POI to point
// 导航/详情相关状态
const showNavModal = ref(false);
const showLibraryModal = ref(false);
const showGymModal = ref(false);
const showCanteenModal = ref(false);
const originMode = ref("current"); // 'current' or 'mapCenter'
const travelMode = ref("walking"); // 'walking' or 'driving'
const navOrigin = ref("");
const navDestination = ref("");
const originSearchResults = ref([]);
const destSearchResults = ref([]);
const selectedOrigin = reactive({ name: "", point: null });
const selectedDestination = reactive({ name: "", point: null });
let currentRoute = null;
const routeMarkers = [];
// 自行车高峰路线相关状态
const showBikeRoutes = ref(false); // UI 显示状态
const bikeRouteOverlays = []; // 保存绘制的 Polyline 覆盖物
const bikeRoutesLoaded = ref(false); // 是否已加载一次
// 统一地点配置（从 JSON 加载）
// 构建 id => 数据 的映射与 BMapGL 点位缓存
const placeMap = {};
const placePoints = {};
try {
  (places || []).forEach((p) => {
    placeMap[p.id] = p;
    // 在运行时（BMapGL 全局存在后）创建 Point
    if (typeof BMapGL !== "undefined" && p && p.coords) {
      placePoints[p.id] = new BMapGL.Point(p.coords.lng, p.coords.lat);
    }
  });
} catch (e) {
  console.warn("初始化地点数据失败", e);
}

function initMap(type = "2d") {
  if (map) {
    map = null;
    mapContainer.value.innerHTML = "";
  }

  const center = new BMapGL.Point(103.981206, 30.761648);

  map = new BMapGL.Map(mapContainer.value);
  map.enableScrollWheelZoom(true);

  if (type === "2d") {
    map.centerAndZoom(center, 17);
    map.setMapType(BMAP_NORMAL_MAP);
    map.setTilt(0);
  } else {
    map.centerAndZoom(center, 17);
    map.setMapType(BMAP_EARTH_MAP);
    map.setTilt(60);
  }

  // 清理此前的 markers 列表
  try {
    allMarkers.length = 0;
  } catch (e) {}

  // 全局点击监听：在 document 级别捕获所有点击
  // 这样即使 BMapGL 内部阻挡了事件，我们也能在浏览器最底层捕获
  try {
    document.addEventListener(
      "click",
      function (e) {
        try {
          // 获取点击的屏幕坐标
          const clickX = e.clientX;
          const clickY = e.clientY;
          console.log("document click:", clickX, clickY);

          // 获取地图容器的位置
          const mapRect = mapContainer.value.getBoundingClientRect();
          console.log("地图容器位置:", mapRect);

          // 检查点击是否在地图容器内
          if (
            clickX >= mapRect.left &&
            clickX <= mapRect.right &&
            clickY >= mapRect.top &&
            clickY <= mapRect.bottom
          ) {
            console.log("点击在地图容器内");

            // 将屏幕坐标转为地图容器内的相对坐标
            const relX = clickX - mapRect.left;
            const relY = clickY - mapRect.top;

            // 在地图容器内找最近的 marker（通过屏幕坐标）
            let minPixelDist = Infinity;
            let nearest = null;

            for (let i = 0; i < allMarkers.length; i++) {
              const m = allMarkers[i];
              try {
                const pos = m.getPosition();
                const markerPixel = map.pointToPixel(pos);
                if (!markerPixel) continue;

                const dx = relX - markerPixel.x;
                const dy = relY - markerPixel.y;
                const pixelDist = Math.sqrt(dx * dx + dy * dy);

                console.log("marker 距离:", pixelDist);

                if (pixelDist < minPixelDist) {
                  minPixelDist = pixelDist;
                  nearest = m;
                }
              } catch (err) {
                // ignore
              }
            }

            // 阈值 50 像素
            if (nearest && minPixelDist <= 50) {
              console.log("⭐ 全局 click 触发回调！像素距离:", minPixelDist);
              if (typeof nearest._onClick === "function") {
                nearest._onClick();
              }
            }
          }
        } catch (err) {
          console.error("全局 click 处理错误:", err);
        }
      },
      true
    ); // 使用捕获阶段
  } catch (e) {
    console.warn("无法注册全局 click 监听", e);
  }

  // 改进版点击回退：使用屏幕像素距离而非地理距离（体验更好）
  // marker 直接事件有时失效，因此依赖 map click 的像素级回退来触发回调
  try {
    map.addEventListener("click", function (e) {
      try {
        console.log(
          "map click 事件触发，已注册 marker 数：",
          allMarkers.length
        );
        if (!e || !e.point) {
          console.warn("map click 但 e.point 不存在");
          return;
        }

        // 将点击点转为屏幕坐标
        const clickPixel = map.pointToPixel(e.point);
        if (!clickPixel) {
          console.warn("pointToPixel 返回 undefined");
          return;
        }
        console.log("点击屏幕坐标:", clickPixel);

        let minPixelDist = Infinity;
        let nearest = null;

        // 遍历所有 marker，计算屏幕像素距离
        for (let i = 0; i < allMarkers.length; i++) {
          const m = allMarkers[i];
          try {
            const pos = m.getPosition();
            const markerPixel = map.pointToPixel(pos);
            if (!markerPixel) continue;

            // 计算像素距离（二维欧氏距离）
            const dx = clickPixel.x - markerPixel.x;
            const dy = clickPixel.y - markerPixel.y;
            const pixelDist = Math.sqrt(dx * dx + dy * dy);

            if (pixelDist < minPixelDist) {
              minPixelDist = pixelDist;
              nearest = m;
            }
          } catch (err) {
            // ignore
          }
        }

        console.log("最近 marker 距离:", minPixelDist);

        // 阈值：50 像素以内认为点中（屏幕级判定，更符合直观体验）
        if (nearest && minPixelDist <= 50) {
          console.log("map click 触发回调！像素距离:", minPixelDist);
          if (typeof nearest._onClick === "function") {
            nearest._onClick();
          }
        }
      } catch (err) {
        console.error("map click fallback error", err);
      }
    });
  } catch (e) {
    console.warn("无法注册 map click 回退处理", e);
  }

  // 添加初始建筑标记
  addMarkers();

  // 添加各个地点标记（统一从 JSON 加载）
  addPlaceMarkers();

  // 获取当前位置并显示
  showCurrentLocation();

  // 若自动补全还未初始化，在地图初始化后设置
  if (!ac && typeof BMapGL !== "undefined") {
    setupAutocomplete();
  }
}

// 显示当前位置的显著标记
function showCurrentLocation() {
  try {
    const geolocation = new BMapGL.Geolocation();
    geolocation.getCurrentPosition(function (r) {
      if (this.getStatus() === BMAP_STATUS_SUCCESS) {
        const currentPoint = r.point;

        // 创建当前位置标记 - 使用蓝色圆形
        const currentMarker = new BMapGL.Marker(currentPoint, {
          icon: new BMapGL.Icon("/p1.png", new BMapGL.Size(40, 40), {
            imageOffset: new BMapGL.Size(0, 0),
          }),
        });

        // // 添加自定义样式的当前位置圆圈
        // const circle = new BMapGL.Circle(currentPoint, 50, {
        //   fillColor: '#2575fc',
        //   fillOpacity: 0.3,
        //   strokeColor: '#2575fc',
        //   strokeWeight: 2,
        //   strokeOpacity: 0.8
        // });
        // map.addOverlay(circle);

        // 添加当前位置标记
        map.addOverlay(currentMarker);
        // 点击处理
        const currentHandler = function () {
          info.title = "📍 当前位置";
          info.desc = "你在这里";
          info.show = true;
          try {
            map.centerAndZoom(currentPoint, 18);
          } catch (e) {}
        };
        currentMarker._onClick = currentHandler;
        currentMarker.addEventListener("click", currentHandler);
        try {
          allMarkers.push(currentMarker);
        } catch (e) {}
        // 为当前位置添加一个可点击标签（方便移动设备/触控点击）
        try {
          createClickableLabel(currentPoint, "您在这里", currentHandler);
        } catch (e) {}

        // 设置为导航起点
        navOrigin.value = "";

        console.log("当前位置:", currentPoint);
      } else {
        console.warn("定位失败:", this.getStatus());
      }
    });
  } catch (e) {
    console.warn("获取当前位置失败:", e);
  }
}

// 锁定当前位置 - 立即定位并缩放到用户位置
function lockCurrentLocation() {
  try {
    const geolocation = new BMapGL.Geolocation();
    geolocation.getCurrentPosition(function (r) {
      if (this.getStatus() === BMAP_STATUS_SUCCESS) {
        const currentPoint = r.point;
        console.log("锁定位置:", currentPoint);

        // 缩放到用户位置，级别18
        map.centerAndZoom(currentPoint, 18);

        // 显示信息窗口
        info.title = "📍 您的位置";
        info.desc = "已锁定到当前位置";
        info.show = true;
      } else {
        alert("无法获取当前位置，请检查定位权限");
        console.warn("定位失败:", this.getStatus());
      }
    });
  } catch (e) {
    alert("定位错误: " + e.message);
    console.error("锁定位置失败:", e);
  }
}

function setMapMode(mode) {
  // mode: '2d' 或 '3d'
  if (!map) {
    currentType.value = mode;
    return;
  }
  currentType.value = mode;
  try {
    if (mode === "2d") {
      map.setMapType(BMAP_NORMAL_MAP);
      map.setTilt(0);
    } else {
      map.setMapType(BMAP_EARTH_MAP);
      map.setTilt(60);
    }
  } catch (e) {
    console.warn("setMapMode failed", e);
  }
}

function addMarkers() {
  buildings.forEach((b) => {
    const point = new BMapGL.Point(b.pos.lng, b.pos.lat);
    const marker = new BMapGL.Marker(point);
    marker.buildingInfo = b;
    map.addOverlay(marker);
    // 注册可复用的点击处理器并加入全局列表
    const handler = function () {
      info.title = b.name;
      info.desc = b.desc;
      info.show = true;
      try {
        map.centerAndZoom(point, 18);
      } catch (e) {}
    };
    marker._onClick = handler;
    // 在 marker 上尝试绑定多个事件类型（click、mousedown、触摸事件等）
    try {
      marker.addEventListener("click", function (e) {
        console.log("marker click 事件触发", b.name, e);
        handler();
      });
    } catch (err) {
      console.warn("marker click 绑定失败", err);
    }
    try {
      marker.addEventListener("mousedown", function (e) {
        console.log("marker mousedown 事件触发", b.name, e);
        handler();
      });
    } catch (err) {
      console.warn("marker mousedown 绑定失败", err);
    }
    try {
      marker.addEventListener("mouseup", function (e) {
        console.log("marker mouseup 事件触发", b.name, e);
        handler();
      });
    } catch (err) {
      console.warn("marker mouseup 绑定失败", err);
    }
    try {
      allMarkers.push(marker);
    } catch (e) {}
    // 添加纯视觉标签（不绑定事件，因为 BMapGL Label 事件不可靠）
    try {
      const label = new BMapGL.Label(b.name || "", {
        position: point,
        offset: new BMapGL.Size(10, -28),
      });
      label.setStyle({
        cursor: "pointer",
        background: "rgba(255,255,255,0.92)",
        padding: "4px 8px",
        borderRadius: "8px",
        fontSize: "12px",
        color: "#222",
        boxShadow: "0 6px 18px rgba(0,0,0,0.12)",
      });
      map.addOverlay(label);
      // 为 label 创建虚拟 marker 用于 map click 回退
      const virtualMarker = {
        getPosition: function () {
          return point;
        },
        _onClick: handler,
      };
      try {
        allMarkers.push(virtualMarker);
      } catch (e) {}
    } catch (e) {
      // label 创建失败则忽略
    }
  });
}

// 添加图书馆标记
// 统一添加地点标记（从 JSON 加载）
function addPlaceMarkers() {
  try {
    (places || []).forEach((p) => {
      if (!p || !p.coords) return;
      const point = new BMapGL.Point(p.coords.lng, p.coords.lat);
      // 缓存起来供导航/其它功能使用
      placePoints[p.id] = point;
      const marker = new BMapGL.Marker(point, {
        icon: p.icon
          ? new BMapGL.Icon(p.icon, new BMapGL.Size(44, 44), {
              imageOffset: new BMapGL.Size(0, 0),
            })
          : undefined,
      });
      // 点击处理：展示信息并打开对应详情
      const handler = function () {
        // 标题与描述：尽量减少硬编码，通用化
        info.title = (p.label && p.label.trim()) || p.name || "地点";
        // 针对已知几个地点保留原有描述
        if (p.id === "library") {
          info.desc = "点击查看详情";
          showLibraryModal.value = true;
        } else if (p.id === "gym") {
          info.desc = "体育馆 — 可用于篮球、羽毛球、乒乓等活动";
          showGymModal.value = true;
        } else if (p.id === "canteen") {
          info.desc = "校内食堂 — 提供学生餐与特色小吃";
          showCanteenModal.value = true;
        } else {
          info.desc = "";
        }
        info.show = true;
        try {
          map.centerAndZoom(point, 18);
        } catch (e) {}
      };
      marker._onClick = handler;
      marker.addEventListener("click", handler);
      map.addOverlay(marker);
      try {
        allMarkers.push(marker);
      } catch (e) {}
      // 标签
      try {
        createClickableLabel(point, p.label || p.name || "地点", handler);
      } catch (e) {}
    });
  } catch (e) {
    console.warn("addPlaceMarkers 失败:", e);
  }
}

// helper: 创建一个纯视觉标签（不绑定事件，依赖 map click 回退触发回调）
// Label 本身在 BMapGL 中事件支持不完整，因此只作视觉提示，具体点击由 map click 处理
function createClickableLabel(point, text, handler) {
  try {
    const label = new BMapGL.Label(text || "", {
      position: point,
      offset: new BMapGL.Size(10, -28),
    });
    label.setStyle({
      cursor: "pointer",
      background: "rgba(255,255,255,0.92)",
      padding: "4px 8px",
      borderRadius: "8px",
      fontSize: "12px",
      color: "#222",
      boxShadow: "0 6px 18px rgba(0,0,0,0.12)",
    });
    // 不再在 Label 上绑定点击事件（BMapGL Label 事件有问题）
    // 而是把 _onClick 赋给某个 marker，依赖 map click 的像素判定回退
    map.addOverlay(label);
    // 将此 label 的位置与 handler 对应关联到一个虚拟 marker 对象（用于 map click 回退查询）
    const virtualMarker = {
      getPosition: function () {
        return point;
      },
      _onClick: handler,
    };
    try {
      allMarkers.push(virtualMarker);
    } catch (e) {}
    return label;
  } catch (e) {
    console.warn("createClickableLabel failed", e);
    return null;
  }
}

function addBuilding() {
  if (!newBuilding.name.trim()) {
    alert("请输入建筑名称");
    return;
  }
  if (!newBuilding.lng || !newBuilding.lat) {
    alert("请输入经纬度");
    return;
  }

  // 创建新建筑对象
  const building = {
    name: newBuilding.name.trim(),
    pos: {
      lng: parseFloat(newBuilding.lng),
      lat: parseFloat(newBuilding.lat),
    },
    desc: newBuilding.desc.trim() || "校园建筑",
    category: "custom",
  };

  // 添加到数组
  buildings.push(building);

  // 在地图上添加标记
  const point = new BMapGL.Point(building.pos.lng, building.pos.lat);
  const marker = new BMapGL.Marker(point);
  marker.buildingInfo = building;
  map.addOverlay(marker);

  const handler = function () {
    info.title = building.name;
    info.desc = building.desc;
    info.show = true;
    try {
      map.centerAndZoom(point, 18);
    } catch (e) {}
  };
  marker._onClick = handler;
  marker.addEventListener("click", handler);
  try {
    allMarkers.push(marker);
  } catch (e) {}
  try {
    createClickableLabel(point, building.name, handler);
  } catch (e) {}

  // 清空输入框
  newBuilding.name = "";
  newBuilding.desc = "";

  // 中心到新建筑
  map.centerAndZoom(point, 18);
  alert(`✅ 已添加建筑：${building.name}`);
}

// 搜索 POI 并返回结果列表
function searchPOI(query) {
  return new Promise((resolve) => {
    try {
      const s = new BMapGL.LocalSearch(map, {
        renderOptions: {},
        onSearchComplete: function (results) {
          try {
            if (!results) return resolve([]);
            const num = results.getCurrentNumPois();
            const out = [];
            for (let i = 0; i < num; i++) {
              const poi = results.getPoi(i);
              if (!poi) continue;
              out.push({
                title: poi.title || "",
                address: poi.address || "",
                point: poi.point,
              });
            }
            resolve(out);
          } catch (e) {
            resolve([]);
          }
        },
      });
      s.search(query);
    } catch (e) {
      resolve([]);
    }
  });
}

// 搜索起点
async function searchOrigin() {
  const q = (navOrigin.value || "").trim();
  if (!q) {
    alert("请输入起点地址");
    return;
  }
  originSearchResults.value = await searchPOI(q);
  if (originSearchResults.value.length === 0) {
    alert("未找到相关结果");
  }
}

// 搜索终点
async function searchDestination() {
  const q = (navDestination.value || "").trim();
  if (!q) {
    alert("请输入终点地址");
    return;
  }
  destSearchResults.value = await searchPOI(q);
  if (destSearchResults.value.length === 0) {
    alert("未找到相关结果");
  }
}

// 选择起点
function selectOrigin(poi) {
  if (!poi || !poi.point) return;
  selectedOrigin.name = poi.title;
  selectedOrigin.point = poi.point;
  navOrigin.value = poi.title;
  originSearchResults.value = [];
}

// 选择终点
function selectDestination(poi) {
  if (!poi || !poi.point) return;
  selectedDestination.name = poi.title;
  selectedDestination.point = poi.point;
  navDestination.value = poi.title;
  destSearchResults.value = [];
}

// 启动导航（直接取 navOrigin 和 navDestination 字符串进行搜索）
async function startNavigation() {
  if (typeof BMapGL === "undefined" || !map) {
    alert("地图尚未初始化");
    return;
  }

  clearNavigation();

  const originStr =
    (selectedOrigin.point ? selectedOrigin.name : navOrigin.value) || "";
  const destStr =
    (selectedDestination.point
      ? selectedDestination.name
      : navDestination.value) || "";

  if (!originStr) {
    alert("请输入或选择起点地址");
    return;
  }
  if (!destStr) {
    alert("请输入或选择终点地址");
    return;
  }

  try {
    const panelEl = document.getElementById("routePanel");

    if (travelMode.value === "walking") {
      currentRoute = new BMapGL.WalkingRoute(map, {
        renderOptions: { map: map, panel: "routePanel", autoViewport: true },
        onSearchComplete: function (results) {
          if (results && results.getNumPlans && results.getNumPlans() > 0) {
            if (panelEl) panelEl.classList.add("show");
          } else alert("未找到步行路线");
        },
      });
      currentRoute.search(originStr, destStr);
    } else {
      currentRoute = new BMapGL.DrivingRoute(map, {
        renderOptions: { map: map, panel: "routePanel", autoViewport: true },
        onSearchComplete: function (results) {
          if (results && results.getNumPlans && results.getNumPlans() > 0) {
            if (panelEl) panelEl.classList.add("show");
          } else alert("未找到驾车路线");
        },
      });
      currentRoute.search(originStr, destStr);
    }
  } catch (e) {
    console.error("startNavigation failed", e);
    alert("导航出错：" + (e && e.message));
  }
}

function setupAutocomplete() {
  // Autocomplete 初始化暂时禁用（因为已将搜索功能移到 Sidebar 组件）
  // 如需恢复，可在 Sidebar 中重新集成
}

// 获取用户当前位置（Promise）
function getUserLocation() {
  return new Promise((resolve, reject) => {
    try {
      const geolocation = new BMapGL.Geolocation();
      geolocation.getCurrentPosition(function (r) {
        if (this.getStatus() === BMAP_STATUS_SUCCESS) {
          resolve(r.point);
        } else {
          reject(new Error("定位失败"));
        }
      });
    } catch (e) {
      reject(e);
    }
  });
}

function clearNavigation() {
  try {
    if (currentRoute && typeof currentRoute.clearResults === "function")
      currentRoute.clearResults();
  } catch (e) {
    /* ignore */
  }
  // remove any markers we may have added
  routeMarkers.forEach((m) => {
    try {
      map.removeOverlay(m);
    } catch (e) {}
  });
  routeMarkers.length = 0;
  const panel = document.getElementById("routePanel");
  if (panel) {
    panel.innerHTML = "";
    panel.classList.remove("show");
  }
  currentRoute = null;
}

// ================== 自行车高峰路线功能 ==================
function toggleBikeRoutes() {
  showBikeRoutes.value = !showBikeRoutes.value;
  if (showBikeRoutes.value) {
    if (!bikeRoutesLoaded.value) {
      loadBikePeakRoutes();
    } else {
      // 已加载过则直接重新添加 overlay（如果被清理）
      bikeRouteOverlays.forEach((o) => {
        try {
          map.addOverlay(o);
        } catch (e) {}
      });
    }
  } else {
    clearBikeRoutes();
  }
}

function loadBikePeakRoutes() {
  if (typeof BMapGL === "undefined" || !map) {
    alert("地图尚未初始化，无法加载自行车路线");
    return;
  }

  const pairs = [
    {
      origin: "天佑斋北区",
      dest: "西南交通大学一号教学楼",
      color: "#FF5722", // 橙红色
    },
    {
      origin: "西南交通大学犀浦校区二食堂",
      dest: "西南交通大学一号教学楼",
      color: "#2196F3", // 蓝色
    },
  ];

  pairs.forEach((pair) => {
    try {
      const riding = new BMapGL.RidingRoute(map, {
        renderOptions: {}, // 不直接渲染默认结果，便于自定义样式
        onSearchComplete: function (results) {
          try {
            if (results && results.getNumPlans && results.getNumPlans() > 0) {
              const plan = results.getPlan(0);
              // 获取路线集合（不同版本 API 有差异，做兼容）
              const routes = plan.getRoutes
                ? plan.getRoutes()
                : plan.getRoute
                ? [plan.getRoute(0)]
                : [];
              if (!routes.length && plan.getPath) {
                // 兜底：某些情况下直接有 path
                const path = plan.getPath();
                if (Array.isArray(path) && path.length) {
                  drawBikePolyline(path, pair.color, pair.origin, pair.dest);
                }
              }
              routes.forEach((r) => {
                try {
                  const path = r.getPath ? r.getPath() : [];
                  if (Array.isArray(path) && path.length) {
                    drawBikePolyline(path, pair.color, pair.origin, pair.dest);
                  }
                } catch (ie) {}
              });
            } else {
              console.warn("未找到骑行路线", pair);
            }
          } catch (e) {
            console.warn("解析骑行路线失败", e);
          }
        },
      });
      riding.search(pair.origin, pair.dest);
    } catch (e) {
      console.warn("骑行路线搜索失败", pair, e);
    }
  });
  bikeRoutesLoaded.value = true;
}

function drawBikePolyline(path, color, originName, destName) {
  try {
    const polyline = new BMapGL.Polyline(path, {
      strokeColor: color || "#FF9800",
      strokeWeight: 6,
      strokeOpacity: 0.85,
    });
    map.addOverlay(polyline);
    bikeRouteOverlays.push(polyline);
    // 点击高亮与信息显示
    polyline.addEventListener("click", function () {
      info.title = `🚴 自行车高峰路线`;
      info.desc = `${originName} → ${destName}`;
      info.show = true;
    });
  } catch (e) {
    console.warn("绘制自行车路线失败", e);
  }
}

function clearBikeRoutes() {
  bikeRouteOverlays.forEach((o) => {
    try {
      map.removeOverlay(o);
    } catch (e) {}
  });
}
// ================== 自行车高峰路线功能结束 ==================

// 批量加载校园 POI 并标注在地图上
function loadCampusPOIs() {
  if (typeof BMapGL === "undefined" || !map) {
    alert("地图尚未初始化");
    return;
  }

  // 常见分类（可根据需要扩展）
  const categories = [
    "图书馆",
    "教学楼",
    "食堂",
    "宿舍",
    "体育场",
    "实验室",
    "行政楼",
    "银行",
    "超市",
    "医院",
    "公交站",
  ];

  // 使用 LocalSearch，但不使用 renderOptions.map（我们手动创建 markers）
  if (!campusPoiSearch) {
    campusPoiSearch = new BMapGL.LocalSearch(map, {
      renderOptions: {},
      onSearchComplete: function (results) {
        if (!results) return;
        const num = results.getCurrentNumPois();
        for (let i = 0; i < num; i++) {
          const poi = results.getPoi(i);
          if (!poi || !poi.point) continue;
          const key = `${poi.title}_${poi.point.lng.toFixed(
            6
          )}_${poi.point.lat.toFixed(6)}`;
          if (poiSet.has(key)) continue;
          poiSet.add(key);

          const marker = new BMapGL.Marker(poi.point);
          const infoText = `${poi.title}${
            poi.address ? " — " + poi.address : ""
          }`;
          map.addOverlay(marker);
          const handler = function () {
            info.title = poi.title || "";
            info.desc = poi.address || "";
            info.show = true;
            try {
              map.centerAndZoom(poi.point, 18);
            } catch (e) {}
          };
          marker._onClick = handler;
          marker.addEventListener("click", handler);
          campusPoiOverlays.push(marker);
          try {
            allMarkers.push(marker);
          } catch (e) {}
          // 同时添加文本标签以增加点击命中面
          try {
            const lbl = createClickableLabel(
              poi.point,
              poi.title || "",
              handler
            );
            if (lbl) campusPoiOverlays.push(lbl);
          } catch (e) {}
        }
      },
    });
  }

  // 使用校园中心和适当的关键字执行搜索
  // 这里我们逐个关键词搜索，LocalSearch 内部会按城市/地图定位范围来匹配结果
  categories.forEach((kw) => {
    // 为每个关键词执行一次搜索
    try {
      campusPoiSearch.search(kw);
    } catch (err) {
      console.warn("campus search failed for", kw, err);
    }
  });
}

// 自动搜索并导入“西南交通大学”的教学楼（使用百度 LocalSearch）
function loadAllTeachingBuildings() {
  if (typeof BMapGL === "undefined" || !map) {
    alert("地图尚未初始化，无法执行导入");
    return;
  }

  // 防止重复运行时重复导入
  const importKey = "swjtu_teaching_imported";
  if (window[importKey]) {
    console.warn(
      "已执行过教学楼导入，若需重新导入请刷新页面或先清理 buildings"
    );
    return;
  }

  // 我们先尝试使用更明确的搜索词组合来拉取教学楼相关 POI
  const queries = [
    "西南交通大学 教学楼",
    "西南交通大学 教学楼 教学",
    "西南交通大学 校区 教学楼",
    "教学楼 西南交通大学",
  ];

  // reuse campusPoiSearch but ensure onSearchComplete 会把每个 poi 收集并注册
  if (!campusPoiSearch) {
    campusPoiSearch = new BMapGL.LocalSearch(map, {
      renderOptions: {},
      onSearchComplete: function (results) {
        if (!results) return;
        const num = results.getCurrentNumPois();
        for (let i = 0; i < num; i++) {
          const poi = results.getPoi(i);
          if (!poi || !poi.point) continue;
          const key = `${poi.title}_${poi.point.lng.toFixed(
            6
          )}_${poi.point.lat.toFixed(6)}`;
          if (poiSet.has(key)) continue;
          poiSet.add(key);

          // 将 POI 转为教学楼条目并添加
          const b = {
            name: poi.title || "教学楼",
            lng: poi.point.lng,
            lat: poi.point.lat,
            desc: poi.address || "",
          };
          addTeachingBuildings([b]);
        }
      },
    });
  }

  // 顺序执行查询
  queries.forEach((q) => {
    try {
      campusPoiSearch.search(q);
    } catch (e) {
      console.warn("search failed", q, e);
    }
  });

  window[importKey] = true;
  console.log("发起教学楼导入请求：", queries);
}

// 诊断用：在控制台打印所有已注册 marker/label 数量
function debugListMarkers() {
  try {
    console.log("allMarkers count:", allMarkers.length);
    for (let i = 0; i < allMarkers.length; i++) {
      try {
        const m = allMarkers[i];
        const pos =
          typeof m.getPosition === "function"
            ? m.getPosition()
            : m.position || null;
        console.log(i, m, pos && { lng: pos.lng, lat: pos.lat });
      } catch (err) {}
    }
  } catch (e) {
    console.warn("debugListMarkers failed", e);
  }
}

function zoomIn() {
  if (!map) return;
  map.zoomIn();
}

function zoomOut() {
  if (!map) return;
  map.zoomOut();
}

// 导航到图书馆
function navigateToLibrary() {
  showLibraryModal.value = false;
  showNavModal.value = true;
  // 自动设置终点为图书馆
  const p = placeMap["library"];
  const pt =
    placePoints["library"] ||
    (p && p.coords ? new BMapGL.Point(p.coords.lng, p.coords.lat) : null);
  selectedDestination.name = p?.name || "图书馆";
  selectedDestination.point = pt;
  navDestination.value = p?.name || "西南交通大学图书馆";
}

// 导航到体育馆
function navigateToGym() {
  showGymModal.value = false;
  showNavModal.value = true;
  const p = placeMap["gym"];
  const pt =
    placePoints["gym"] ||
    (p && p.coords ? new BMapGL.Point(p.coords.lng, p.coords.lat) : null);
  selectedDestination.name = p?.name || "体育馆";
  selectedDestination.point = pt;
  navDestination.value = p?.name || "体育馆";
}

// 导航到食堂
function navigateToCanteen() {
  showCanteenModal.value = false;
  showNavModal.value = true;
  const p = placeMap["canteen"];
  const pt =
    placePoints["canteen"] ||
    (p && p.coords ? new BMapGL.Point(p.coords.lng, p.coords.lat) : null);
  selectedDestination.name = p?.name || "校内食堂";
  selectedDestination.point = pt;
  navDestination.value = p?.name || "校内食堂";
}

// 从 Sidebar 收到定位请求：根据经纬度居中并弹出信息
function handleLocate(payload) {
  try {
    if (!payload || !payload.point) return;
    const p = new BMapGL.Point(payload.point.lng, payload.point.lat);
    map.centerAndZoom(p, 18);
    info.title = payload.title || "位置";
    info.desc = payload.address || "";
    info.show = true;
  } catch (e) {
    console.warn("handleLocate failed", e);
  }
}

// 从 Sidebar 收到打开全景请求：目前先定位并展示提示，后续可扩展为打开全景组件
function handleOpenPanorama(payload) {
  try {
    if (!payload || !payload.point) return;
    const p = new BMapGL.Point(payload.point.lng, payload.point.lat);
    map.centerAndZoom(p, 18);
    info.title = payload.title ? `🔭 全景：${payload.title}` : "🔭 全景";
    info.desc = payload.address || "";
    info.show = true;
    // TODO: 如果需要可在此调用百度全景 API 并打开自定义全景视图
  } catch (e) {
    console.warn("handleOpenPanorama failed", e);
  }
}

onMounted(() => {
  initMap("2d");
});

// 监听从 Sidebar 发出的搜索请求，通过 LocalSearch 执行并回填结果
if (typeof window !== "undefined") {
  const onSidebarSearch = function (e) {
    try {
      const kw = e && e.detail && e.detail.keyword ? e.detail.keyword + "" : "";
      console.log("[Map] 收到 sidebar-search，关键字：", kw);
      if (!kw) return;
      if (typeof BMapGL === "undefined") {
        console.warn("BMapGL 未加载，无法执行 Sidebar 搜索");
        document.dispatchEvent(
          new CustomEvent("sidebar-search-results", { detail: { results: [] } })
        );
        return;
      }

      if (!localSearch) {
        localSearch = new BMapGL.LocalSearch(map, {
          renderOptions: {},
          onSearchComplete: function (results) {
            try {
              const out = [];
              if (!results) {
                console.log("[Map] LocalSearch 返回 null results");
                document.dispatchEvent(
                  new CustomEvent("sidebar-search-results", {
                    detail: { results: out },
                  })
                );
                return;
              }
              const count = results.getCurrentNumPois
                ? results.getCurrentNumPois()
                : results.getNumPois
                ? results.getNumPois()
                : 0;
              console.log("[Map] LocalSearch 完成，POI 数量:", count);
              for (let i = 0; i < count; i++) {
                try {
                  const poi = results.getPoi(i);
                  if (!poi) continue;
                  out.push({
                    title: poi.title || poi.name || "",
                    address: poi.address || "",
                    point: poi.point
                      ? { lng: poi.point.lng, lat: poi.point.lat }
                      : null,
                  });
                } catch (ie) {}
              }
              // 如果 getPoi 不可用，尝试 results.getPoi() 数组形式
              if (
                out.length === 0 &&
                Array.isArray(results.getPoi ? results.getPoi() : [])
              ) {
                const arr = results.getPoi();
                arr.forEach((poi) =>
                  out.push({
                    title: poi.title || poi.name || "",
                    address: poi.address || "",
                    point: poi.point
                      ? { lng: poi.point.lng, lat: poi.point.lat }
                      : null,
                  })
                );
              }
              console.log("[Map] LocalSearch 解析结果数量:", out.length, out);
              document.dispatchEvent(
                new CustomEvent("sidebar-search-results", {
                  detail: { results: out },
                })
              );
            } catch (err) {
              console.warn("LocalSearch onSearchComplete 处理失败", err);
              document.dispatchEvent(
                new CustomEvent("sidebar-search-results", {
                  detail: { results: [] },
                })
              );
            }
          },
        });
      }
      try {
        console.log("[Map] 调用 localSearch.search ->", kw);
        localSearch.search(kw);
      } catch (err) {
        console.warn("localSearch.search 调用失败", err);
        document.dispatchEvent(
          new CustomEvent("sidebar-search-results", { detail: { results: [] } })
        );
      }
    } catch (err) {
      console.warn("处理 sidebar-search 事件失败", err);
      document.dispatchEvent(
        new CustomEvent("sidebar-search-results", { detail: { results: [] } })
      );
    }
  };
  document.removeEventListener("sidebar-search", onSidebarSearch);
  document.addEventListener("sidebar-search", onSidebarSearch);
}
</script>

<style scoped>
:root {
  --glass-bg: rgba(255, 255, 255, 0.6);
  --accent: linear-gradient(90deg, #7b4cff, #6db0ff);
}

* {
  box-sizing: border-box;
}

body,
html,
#app {
  height: 100%;
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    "PingFang SC", "Hiragino Sans GB", "Microsoft Yahei", sans-serif;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: "Microsoft YaHei", "Segoe UI", sans-serif;
}

/* 基础样式重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.map-wrapper {
  position: relative;
  height: calc(100vh - 72px);
  width: 100%;
  display: flex;
}

.left-panel {
  width: 320px;
  background: rgba(255, 255, 255, 0.6);
  -webkit-backdrop-filter: blur(8px);
  backdrop-filter: blur(8px);
  border-radius: 14px;
  margin: 20px;
  padding: 14px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  z-index: 50;
}

.search-small {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.search-small input {
  flex: 1;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  outline: none;
}

.search-small button {
  padding: 8px 12px;
  border-radius: 10px;
  background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.06);
  cursor: pointer;
}

.add-building-section {
  background: rgba(220, 231, 255, 0.5);
  border-radius: 10px;
  padding: 12px;
  margin-bottom: 14px;
  border: 1px solid rgba(37, 117, 252, 0.2);
}

.add-building-section h4 {
  margin: 0 0 10px 0;
  font-size: 13px;
  font-weight: 600;
  color: #2575fc;
}

.add-input {
  width: 100%;
  padding: 8px;
  border-radius: 6px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  font-size: 12px;
  margin-bottom: 8px;
  outline: none;
}

.add-input:focus {
  border-color: #2575fc;
  box-shadow: 0 0 0 2px rgba(37, 117, 252, 0.1);
}

.add-btn {
  width: 100%;
  padding: 8px;
  background: linear-gradient(90deg, #2575fc, #0d47a1);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.18s;
}

.add-btn:hover {
  box-shadow: 0 4px 12px rgba(37, 117, 252, 0.3);
}

.menu-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  margin-bottom: 10px;
  border-radius: 12px;
  cursor: pointer;
  transition: background 0.18s;
}

.menu-item:hover {
  background: rgba(0, 0, 0, 0.04);
}

.menu-item .icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

.menu-item .text {
  flex: 1;
  font-weight: 600;
}

.menu-item .chev {
  color: #999;
}

.map-container {
  flex: 1;
  margin: 20px 20px 20px 0;
  border-radius: 14px;
  overflow: hidden;
  position: relative;
}

.map-container > div {
  height: 100%;
}

.top-controls {
  position: absolute;
  top: 28px;
  right: 28px;
  display: flex;
  gap: 8px;
  z-index: 100;
}

.control {
  padding: 8px 12px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.85);
  border: none;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
  cursor: pointer;
}

.control.active {
  background: #0066ff;
  color: white;
}

.map-ctrls {
  position: absolute;
  right: 28px;
  bottom: 28px;
  display: flex;
  gap: 10px;
  flex-direction: column;
  align-items: center;
  z-index: 100;
}

.compass {
  background: rgba(255, 255, 255, 0.9);
  padding: 10px;
  border-radius: 50%;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}

.lock-btn {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.9);
  font-size: 20px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
  cursor: pointer;
  transition: all 0.18s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.lock-btn:hover {
  background: linear-gradient(90deg, #2575fc, #0d47a1);
  box-shadow: 0 8px 24px rgba(37, 117, 252, 0.3);
}

.zoom {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.zoom button {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  border: none;
  background: rgba(255, 255, 255, 0.9);
  font-size: 18px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
  cursor: pointer;
}

.info-window {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  bottom: 36px;
  min-width: 280px;
  background: white;
  padding: 14px 18px;
  border-radius: 12px;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.14);
  z-index: 100;
}

.info-window-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.info-window-header h3 {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
}

.info-window-close {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #999;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.18s;
}

.info-window-close:hover {
  color: #333;
}

/* 确保百度 Autocomplete 下拉在最顶层可见 */
.BMap_autocomplete,
.BMap_autocomplete .suggest-list,
.BMap_autocomplete .suggest-list li {
  z-index: 99999 !important;
}

/* 导航模态面板样式 */
.nav-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
}

.nav-modal-content {
  width: 420px;
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-height: 85vh;
  overflow-y: auto;
}

.nav-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.nav-modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
}

.nav-modal-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-modal-close:hover {
  color: #333;
}

.nav-mode-tabs {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 12px;
}

.nav-tab {
  flex: 1;
  padding: 12px;
  background: #f5f5f5;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  color: #666;
  transition: all 0.18s;
}

.nav-tab.active {
  background: #0066ff;
  color: white;
}

.nav-tab:hover {
  background: #e0e0e0;
}

.nav-tab.active:hover {
  background: #0052cc;
}

.nav-form {
  margin-bottom: 20px;
}

.nav-input-group {
  margin-bottom: 14px;
}

.nav-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 6px;
  color: #333;
}

.nav-search-box {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.nav-input {
  flex: 1;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  transition: border 0.18s;
}

.nav-input:focus {
  border-color: #0066ff;
}

.nav-search-btn {
  padding: 12px 16px;
  background: #0066ff;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.18s;
}

.nav-search-btn:hover {
  background: #0052cc;
}

.nav-selected {
  font-size: 12px;
  color: #4caf50;
  background: #f1f8e9;
  padding: 8px;
  border-radius: 6px;
  margin-bottom: 8px;
}

.nav-results-list {
  list-style: none;
  margin: 0;
  padding: 0;
  background: #f9f9f9;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  max-height: 250px;
  overflow-y: auto;
}

.nav-result-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  border-bottom: 1px solid #efefef;
  transition: background 0.12s;
}

.nav-result-item:last-child {
  border-bottom: none;
}

.nav-result-item:hover {
  background: #f0f0f0;
}

.nav-result-info {
  flex: 1;
  min-width: 0;
}

.nav-result-title {
  font-weight: 600;
  font-size: 13px;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.nav-result-addr {
  font-size: 11px;
  color: #999;
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.nav-result-btn {
  padding: 6px 12px;
  background: #0066ff;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  font-weight: 600;
  margin-left: 8px;
  white-space: nowrap;
  transition: all 0.18s;
}

.nav-result-btn:hover {
  background: #0052cc;
}

.nav-hint {
  font-size: 12px;
  color: #ff9800;
  background: #fff3e0;
  padding: 10px;
  border-radius: 6px;
  margin-top: 12px;
}

.nav-btn-start {
  width: 100%;
  padding: 14px;
  background: linear-gradient(90deg, #0066ff, #0052cc);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.18s;
  margin-bottom: 16px;
}

.nav-btn-start:hover {
  background: linear-gradient(90deg, #0052cc, #003d99);
  box-shadow: 0 4px 12px rgba(0, 102, 255, 0.3);
}

.route-panel {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
  font-size: 13px;
  color: #666;
}

.route-panel-container {
  position: absolute;
  right: 20px;
  bottom: 20px;
  max-width: 400px;
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  z-index: 99;
  max-height: 50vh;
  overflow-y: auto;
  font-size: 13px;
  color: #333;
  display: none;
}

.route-panel-container.show {
  display: block;
}
</style>
