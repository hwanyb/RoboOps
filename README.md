# RoboOps — 이기종 로봇 Fleet 통합 관제 대시보드 프로토타입 프로젝트
<img width="1920" height="917" alt="image" src="https://github.com/user-attachments/assets/49ce88a4-e189-4db1-84cc-59ae578c318e" />

공장·물류센터 내 다양한 종류의 로봇(AMR, AGV, ARM, DRONE)을 실시간으로 모니터링하고 관제하는 프론트엔드 대시보드 프로젝트입니다.

---

## 기술 스택

| 영역 | 기술 | 선택 이유 |
|------|------|-----------|
| 프레임워크 | Next.js 16 (App Router) | Server/Client Component 분리, 파일 기반 라우팅 |
| 언어 | TypeScript 5 | 로봇·이벤트 도메인 타입 안정성 확보 |
| 상태 관리 | Zustand 5 | 보일러플레이트 없이 WebSocket 이벤트를 store에 직접 반영 |
| 지도 | OpenLayers 10 | 공장 평면도 위 로봇 마커 렌더링 / 캔버스 기반 고성능 |
| 3D 뷰어 | Three.js 0.184 | 선택 로봇의 타입별 3D 메시·센서 콘 시각화 |
| 스타일 | Tailwind CSS 4 | 다크 테마 대시보드 UI 빠른 구성 |
| 테스트 | Vitest 4 + Testing Library | 순수 함수(reducer, 알림 규칙)와 컴포넌트 TDD |

---

## 주요 기능

### 실시간 Fleet 모니터링
- **WebSocket 시뮬레이션**: 1.5초 간격으로 로봇 위치·배터리·상태 변경 이벤트 수신
- **헤더 통계**: 전체 / 온라인 / 에러 / 미확인 알림 수 실시간 표시

### OpenLayers 지도
- 로봇 위치를 지도 위 컬러 마커로 표시 (상태에 따라 색상 구분)
- 마커 클릭으로 로봇 선택, 선택 시 강조 표시
- 상태별 범례(Legend) 표시

### Three.js 3D 뷰어
<img width="269" height="207" alt="image" src="https://github.com/user-attachments/assets/d2e2ab8c-8ebd-4a12-be42-3c7b4667d7d0" />

- 로봇 타입(AMR / AGV / ARM / DRONE)마다 다른 3D 메시 렌더링
- 센서 감지 범위를 반투명 콘으로 시각화
- 자동 회전 애니메이션, 상태 변경 시 색상 실시간 반영

### 사이드패널
- **Robots 탭**: 전체 로봇 목록, 상태 뱃지, 배터리 바
<img width="284" height="455" alt="image" src="https://github.com/user-attachments/assets/4b0fab38-23a4-4702-92a4-d2262b6c4ef9" />

- **Alerts 탭**: 미확인 알림 목록, 개별 확인(Acknowledge) 및 전체 삭제
<img width="305" height="369" alt="image" src="https://github.com/user-attachments/assets/f73a88d6-7de1-4f8a-bcb7-abcaf77f70d4" />

- **Detail 탭**: 선택 로봇의 3D 뷰, 위치·배터리·작업 진행률 상세 정보
<img width="286" height="642" alt="image" src="https://github.com/user-attachments/assets/f122ab03-5f0d-455c-9f08-7eb982b62441" />

---

## 아키텍처

```
Browser
  └── FleetProvider (useFleetSocket)
        ├── MockWsService ──(1.5s tick)──► WsEvent 발행
        └── useRobotStore (Zustand)
              ├── DashboardShell
              │     ├── FleetMap (OpenLayers)
              │     └── Sidebar
              │           ├── RobotList
              │           ├── AlertPanel
              │           └── RobotDetailPanel
              │                 └── RobotViewer3D (Three.js)
              └── (36 Vitest tests)
                    ├── fleetReducer.test.ts
                    ├── alertRules.test.ts
                    └── statusUtils.test.ts
```

### 데이터 흐름

```
MockWsService
  │  emit(WsEvent)
  ▼
useFleetSocket          ← getState()로 액션 호출 (구독 없음, 리렌더 방지)
  │  store.updateRobotPosition() 등
  ▼
Zustand robotStore      ← 상태 변경
  │  useShallow(selector)
  ▼
React 컴포넌트 리렌더    ← 셀렉터 결과가 실제로 바뀐 경우에만
```

> **성능 포인트**: 배열을 반환하는 셀렉터는 `useShallow`로 래핑해 참조 불일치로 인한 무한 리렌더를 방지합니다. WebSocket 이벤트 핸들러는 `getState()`로 액션을 직접 호출해 `FleetProvider` 자체는 구독에서 제외합니다.

---

## 프로젝트 구조

```
src/
├── app/
│   ├── layout.tsx          # 루트 레이아웃, FleetProvider 마운트
│   └── page.tsx            # DashboardShell 진입점
├── components/
│   ├── DashboardShell.tsx  # 전체 레이아웃 (헤더 + 지도 + 사이드바)
│   ├── FleetProvider.tsx   # WebSocket 연결 초기화
│   ├── map/
│   │   └── FleetMap.tsx    # OpenLayers 지도 + 로봇 마커
│   ├── viewer/
│   │   └── RobotViewer3D.tsx  # Three.js 3D 뷰어
│   ├── sidebar/
│   │   ├── RobotList.tsx
│   │   ├── AlertPanel.tsx
│   │   └── RobotDetailPanel.tsx
│   └── ui/
│       ├── StatusBadge.tsx
│       └── BatteryBar.tsx
├── hooks/
│   └── useFleetSocket.ts   # WsEvent → Zustand 액션 연결
├── store/
│   └── robotStore.ts       # Zustand 전역 스토어 + 셀렉터
├── services/
│   └── mockWsService.ts    # WebSocket 시뮬레이터 (싱글턴)
├── lib/
│   ├── fleetReducer.ts     # 순수 reducer (테스트 대상)
│   ├── alertRules.ts       # 배터리·오프라인·에러 알림 규칙
│   ├── statusUtils.ts      # 상태→색상 변환 유틸
│   ├── mockData.ts         # 초기 시뮬레이션 데이터
│   └── __tests__/          # Vitest 테스트
└── types/
    ├── robot.ts            # Robot, Position, RobotStatus
    ├── task.ts             # Task, TaskStatus, TaskType
    ├── alert.ts            # Alert, AlertSeverity, AlertCode
    └── ws.ts               # WsEvent 유니온 타입
```

---

## 시작하기

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
# → http://localhost:3000

# 테스트 실행
npm test

# 테스트 감시 모드
npm run test:watch

# 프로덕션 빌드
npm run build
```

---

## TDD 테스트

실제 WebSocket이나 브라우저 API 없이 테스트 가능한 순수 로직을 분리해 TDD로 작성했습니다.

```
src/lib/__tests__/
├── fleetReducer.test.ts   # WsEvent별 상태 변환 검증 (13 tests)
├── alertRules.test.ts     # 배터리·오프라인·에러 알림 규칙 (12 tests)
└── statusUtils.test.ts    # 상태→색상 변환, uptime 포맷 (11 tests)

총 36 tests / 3 suites — 모두 통과
```

**핵심 설계 원칙**: `fleetReducer`는 `(state, event) => newState` 순수 함수이므로, Zustand 스토어와 완전히 독립적으로 단위 테스트합니다. 스토어는 이 reducer의 로직을 액션 내부에서 동일하게 구현합니다.

---

## 로봇 타입

| 타입 | 아이콘 | 설명 |
|------|--------|------|
| AMR | 🤖 | Autonomous Mobile Robot — 자율 이동 로봇 |
| AGV | 🚜 | Automated Guided Vehicle — 고정 경로 운반 로봇 |
| ARM | 🦾 | Robotic Arm — 고정형 산업용 로봇 팔 |
| DRONE | 🚁 | Autonomous Drone — 자율 비행 드론 |

## 알림 규칙

| 코드 | 조건 | 심각도 |
|------|------|--------|
| `BATTERY_LOW` | 배터리 ≤ 25% | warning |
| `BATTERY_CRITICAL` | 배터리 ≤ 10% | critical |
| `ROBOT_OFFLINE` | 마지막 갱신 후 10초 초과 | error |
| `SENSOR_ERROR` | 상태가 `error` | error |
| `OBSTACLE_DETECTED` | 장애물 감지 (이벤트) | error |

---

## 커밋 컨벤션

```
feat:     새로운 기능 추가
fix:      버그 수정
docs:     문서 수정
style:    코드 포맷팅 (로직 변경 없음)
refactor: 코드 리팩토링 (기능 변경 없음)
test:     테스트 코드 추가/수정
chore:    빌드·패키지 설정 변경
```
