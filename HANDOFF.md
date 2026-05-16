# 핸드오프 문서 (korean-typing)

> 다음 Claude Code 세션이 이 프로젝트를 이어받을 수 있도록 작성된 운영 문서.
> 사용자: **doonghwi** (joyyoxyt@gmail.com).
> 마지막 업데이트: 2026-05-17.

---

## 1. 위치 및 환경

| 항목 | 값 |
|---|---|
| 작업 디렉토리 | `C:\dev\taza\korean-typing` |
| 워크스페이스 | `C:\dev\taza` (`.omc` 세션 상태가 여기 있음 — gitignore됨) |
| 운영체제 | Windows 11 Home, PowerShell 5.1 (`$null`, backtick 등 PS 문법 사용) |
| Node | v24.14.1 |
| npm | 11.11.0 |
| Git | git for Windows 2.51 (Git Credential Manager 포함) |
| GitHub CLI | `C:\dev\tools\gh\bin\gh.exe` (winget 없어서 portable zip 설치, user PATH에 추가됨) |

`gh` CLI는 `doonghwi` 계정으로 인증 완료 (`gho_...` 토큰, scopes: gist read:org repo workflow).

---

## 2. 기술 스택

- **Vite 8** + **React 19** + **TypeScript** (verbatim module syntax 켜져 있음 → 타입 import는 `type` 키워드 필수)
- **Vitest 4**: 한글 엔진 단위 테스트 (38개)
- **Firebase 12 Firestore Lite**: 클라우드 랭킹 (실시간 리스너 미사용, 가벼움)
- **자체 한글 조합 엔진**: 두벌식, IME 우회. `src/hangul/`
- **GitHub Pages**: GitHub Actions로 main 푸시 시 자동 배포 (`.github/workflows/deploy.yml`)

---

## 3. 자주 쓰는 명령

```powershell
# 작업 디렉토리로 이동 (필요시)
Set-Location 'C:\dev\taza\korean-typing'

# 의존성 설치
npm install

# 개발 서버 (http://localhost:5173/korean-typing/)
npm run dev

# 빌드 (TS 체크 + Vite 번들)
npm run build

# 한글 엔진 테스트
npx vitest run

# 배포는 main 푸시만 하면 자동
git push   # → GitHub Actions deploy.yml 실행

# gh CLI는 별도 PATH (현재 셸이 PATH 갱신 안 되어 있으면 전체 경로):
& 'C:\dev\tools\gh\bin\gh.exe' run list --repo doonghwi/korean-typing --limit 3
```

---

## 4. 디렉토리 구조

```
src/
  hangul/                  # 한글 조합 엔진 (IME 우회)
    constants.ts           # CHO/JUNG/JONG 배열, 합성 자모 매핑
    composer.ts            # 자모 → 음절 상태머신 + 백스페이스
    decompose.ts           # 음절 → 자모 분해 (채점용)
    dubeolsik.ts           # 두벌식 키맵 + codeToKeyChar(e.code, shift)
    composer.test.ts       # vitest
    decompose.test.ts      # vitest
    index.ts               # re-exports + processKey(state, key)
  hooks/
    useTypingSession.ts    # 핵심 상태 훅: reducer, keydown 리스너, deriveSession
  components/
    UserPicker.tsx         # 첫 화면 (이름 선택/추가)
    Profile.tsx            # 프로필 (오늘/역대 최고, 드롭다운, 랭킹, 최근 기록)
    TypingScreen.tsx       # 타이핑 화면 (한컴 스타일 prev/current/next pair)
    Stats.tsx              # CPM/정확도/시간/오타 카드
    Leaderboard.tsx        # Firestore 데이터 표시 (역대/오늘 탭)
    keyboard/
      Keyboard.tsx         # 가상 키보드 (다음 키 강조)
      HandOverlay.tsx      # 손 모양 SVG 오버레이 (활성 키 방향으로 이동)
      layout.ts            # KEYBOARD_ROWS, findKeyByChar, finger mapping
  lessons/
    types.ts               # Stage/Lesson 타입 (eligibleForRanking 포함)
    data.ts                # STAGES 정의 + 헬퍼 (findStage, isSourceRankingEligible 등)
    sources.ts             # 프로필 드롭다운용 SOURCES, linesForSource
  storage/
    progress.ts            # localStorage (records, users, currentUser)
    cloudRanking.ts        # Firestore CRUD (pushRecord, fetchTopRecords)
  utils/
    shuffle.ts             # Fisher-Yates
  firebase.ts              # Firebase 초기화 (config + db)
  App.tsx                  # 라우팅: pick-user → profile → session
.github/workflows/deploy.yml  # 자동 배포
vite.config.ts             # base: '/korean-typing/' + vitest 설정
```

---

## 5. 단계 구조 (Stage)

10단계, `eligibleForRanking` 플래그로 랭킹 자격 분리:

| # | 제목 | 키/자모 | 랭킹? |
|---|---|---|---|
| 1 | 기본자리 | A S D F · J K L (ㅁ ㄴ ㅇ ㄹ · ㅓ ㅏ ㅣ) | ❌ |
| 2 | 왼손 윗자리 | Q W E R T (ㅂ ㅈ ㄷ ㄱ ㅅ) | ❌ |
| 3 | 왼손 아랫자리 | Z X C V B (ㅋ ㅌ ㅊ ㅍ ㅠ) | ❌ |
| 4 | 가운데자리 | G H (ㅎ ㅗ) | ❌ |
| 5 | 오른손 윗자리 | Y U I O P (ㅛ ㅕ ㅑ ㅐ ㅔ) | ❌ |
| 6 | 오른손 아랫자리 | N M (ㅜ ㅡ) | ❌ |
| 7 | 전체자리 | 복합 모음·쌍자음·겹받침 | ❌ |
| 8 | 단어연습 | 주제별 단어 | ❌ |
| 9 | 문장연습 | 짧은 문장 | ✅ |
| 10 | 긴글연습 | 단락 (직접 쓴 원본) | ✅ |

**1~7 (자리연습)**: 각 항목(자모/음절/단어)이 한 줄. 셔플 후 하나씩 등장.
**8 (단어)**: 단어 하나가 한 줄.
**9 (문장)**: 문장 하나가 한 줄.
**10 (긴글)**: 단락 내 각 문장이 한 줄.

**랭킹 자격**: `eligibleForRanking: true` 단계만 `recordLine`이 실행됨. 다른 단계는 로컬·클라우드 둘 다 저장 안 함.

**미래 단계 추가**: 새 단계는 `STAGES` 배열에 추가하고 `eligibleForRanking` 플래그만 세팅. 번호는 안 꼬임.

---

## 6. 콘텐츠 가이드라인 (중요)

**모든 레슨 텍스트는 직접 작성한 원본 또는 일반 어휘**:
- 자리연습 (1~7): 자모, 일반 음절, 사전 어휘 — 저작권 무관
- 단어연습 (8): 주제별 일반 명사 (음식, 가족, 자연 등) — 저작권 무관
- 문장연습 (9): 일상 표현, 스톡 인사말 (안녕하세요 등) + 직접 쓴 짧은 문장
- 긴글연습 (10): **모두 직접 작성한 원본 산문**. 시·가사·소설·노래 가사 일체 사용 안 함.

사용자가 가요·시 추가를 원했으나 저작권 문제로 거절. 한컴타자연습의 콘텐츠도 가져오지 않음. UI 패턴(prev/current/next 3행, 입력 박스 강조)만 참고.

---

## 7. localStorage 스키마

```ts
'taza:users'              // string[] : 등록된 이름들
'taza:current-user'       // string : 현재 로그인 이름
'taza:user:<name>:progress-v3' // UserProgress
```

`UserProgress`:
```ts
{
  records: LineRecord[]   // max 1000, FIFO
}
LineRecord = { at, source, cpm, accuracy, text }
```

이전 버전 키 (`progress`, `progress-v2`)는 더 이상 안 읽음. v3 도입 시점에 사용자가 막 시작한 상태였어서 마이그레이션 안 함.

---

## 8. Firestore 설정

| 항목 | 값 |
|---|---|
| 프로젝트 ID | `korean-typing-3118c` |
| 위치 | asia-northeast3 (서울) |
| Config 파일 | `src/firebase.ts` (공개 안전, 보안은 Rules로) |
| 컬렉션 | `records` |
| 보안 규칙 | ✅ 적용됨 (사용자가 직접 게시) — 7자 이상 제한은 없고, cpm < 5000, user ≤ 30자, text ≤ 200자 등 검증 |

문서 스키마 (`records/<auto-id>`):
```ts
{
  user: string      // 1~30자
  source: string    // 'stage-9' 등
  cpm: number       // 0~5000
  accuracy: number  // 0~1
  text: string      // 1~200자
  at: number        // Date.now()
}
```

쿼리:
- 역대 TOP 10: `orderBy('cpm', 'desc').limit(10)` — 단일 필드 인덱스, 자동
- 오늘 TOP 10: top 50 가져와서 클라이언트에서 `at >= startOfToday` 필터

---

## 9. 한글 엔진 핵심 동작

**키 입력 → 자모 매핑**: `e.code` (`KeyR`) 기반 → IME 영향 없음. 한국어 키보드 모드에서도 OK.

**조합기 상태**: `{ committed: string, working: { L?, V?, T? } }`. 작동 음절을 working에 쌓고, 다음 자모가 안 맞으면 working을 committed로 commit하고 새 working 시작.

**백스페이스**: 한 번 = 자모 하나 제거 (committed 음절도 분해 후 마지막 자모 제거). `inputs[]`와 정확히 1:1 매핑되어 위치 정렬 유지.

**채점**:
- `inputs[i] === targetJamo[i]` 비교 (자모 단위 위치 비교)
- 한 자모라도 틀린 글자는 빨간색 표시
- 완료 조건: `inputCount >= targetJamo.length` (틀려도 전부 치면 다음으로) OR `rendered === target` (완벽)

**리터럴 입력**: 마침표·쉼표·숫자 등은 `e.key.length === 1` fallback으로 `inputLiteral` 호출. 공백도 동일.

**테스트 38개**: composer 33 + decompose 5. 모두 통과 중. 한글 엔진 수정 시 반드시 `npx vitest run`.

---

## 10. 알려진 이슈 / 미해결

- **iPad 키보드 종속성**: 외장 키보드 필수. 화면 키보드는 IME 우회 불가. README에 명시됨.
- **이름 도용 가능**: Firebase Auth 없음. 누구나 아무 이름으로 기록 등록 가능. 3명 신뢰 기반이라 OK.
- **bundle size**: 105KB gzipped (Firebase가 +33KB 차지). 추가 최적화 가능하나 현재 충분.
- **세벌식 미지원**: 두벌식 전용. 추가하려면 `src/hangul/dubeolsik.ts` 옆에 키맵 추가 + 사용자 설정.

---

## 11. 자주 하는 작업

### 새 단계 추가
1. `src/lessons/data.ts`의 `STAGES` 배열에 새 객체 추가
2. 랭킹 등록 원하면 `eligibleForRanking: true`
3. `src/lessons/sources.ts`는 자동 반영 (배열 매핑)

### 콘텐츠 수정
- 단어/문장 추가·변경: `src/lessons/data.ts`만 수정
- 모든 레슨 콘텐츠는 직접 작성한 원본만 사용 (저작권 안전 콘텐츠)

### 두벌식 키맵 수정
- `src/hangul/dubeolsik.ts`의 `DUBEOLSIK` 객체
- 변경 시 composer 테스트 재실행 권장

### 손 모양 조정
- `src/components/keyboard/HandOverlay.tsx`
- `SHIFT_FACTOR = 0.55` (활성 키 방향으로 손 이동 비율)
- `FINGER_HOME` 객체: 각 손가락 기준 위치 (viewBox 100×60)

### Firestore 보안 규칙 수정
- Firebase 콘솔 → Firestore Database → 규칙 탭
- 현재 규칙은 `firestore.rules` 파일로 백업 안 되어 있음 — 콘솔에서 직접 확인
- 마지막 적용된 규칙 요지: 누구나 읽기, create만 허용 (update/delete 금지), 필드 검증 강제

### gh CLI 명령
```powershell
& 'C:\dev\tools\gh\bin\gh.exe' run list --repo doonghwi/korean-typing --limit 5
& 'C:\dev\tools\gh\bin\gh.exe' run view <run-id> --repo doonghwi/korean-typing --log-failed
& 'C:\dev\tools\gh\bin\gh.exe' workflow run deploy.yml --repo doonghwi/korean-typing --ref main
```

---

## 12. 커밋 컨벤션

지금까지 사용한 패턴:
```
git -c user.email=joyyoxyt@gmail.com -c user.name=doonghwi commit -m "..."
```

메시지는 영어로 짧게 (한국어 commit 메시지도 OK).

`.gitignore`에 `.omc`, `.claude` 추가됨 (OMC 로컬 상태 제외).

---

## 13. 사용자 컨텍스트 요약

- **doonghwi** (joyyoxyt@gmail.com), 한국 사용자
- 3명 이하 친구·가족용 비공식 사용
- TypingClub의 한글 미지원 + iPad 무료 앱 부재를 동기로 시작
- 백엔드 단순함 선호 (Firebase 무료 한도로 충분)
- 한컴타자연습 스타일 UX 선호 (3줄 prev/current/next, 빨간 오타 표시 등)
- 작업 진행 방식: 단계별 확인보다는 "그냥 다 해줘" 방향 (autopilot 선호하지만 큰 결정은 확인 받음)

---

## 14. 핸드오프 시점 라이브 상태

- 마지막 커밋: `21f01a0` — 자리연습 한 항목 한 줄 + 랭킹 stage 기반
- 모든 변경사항 push됨 (working tree clean)
- 38개 테스트 통과 중
- 라이브 사이트 정상 동작 확인됨
- 사용자가 iPad에서도 동작 확인 완료
- Firestore 보안 규칙 적용 완료

다음 세션에서 일을 이어갈 때:
1. 이 문서를 먼저 읽고 컨텍스트 파악
2. `git log --oneline -20`으로 최근 작업 확인
3. `npm run dev`로 로컬 확인 후 작업 시작
4. `npx vitest run`으로 한글 엔진 깨지지 않았는지 검증

문제 생기면 사용자에게 한국어로 짧고 명확하게 보고. 디버깅은 차분히 — 자모 정렬·위치 추적 관련 버그가 흔함 (`inputs[] ↔ composer` 정렬).
