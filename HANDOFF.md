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
| Git | git for Windows 2.51 (Git Credential Manager 포함). **로컬 user.name/email 미설정** — 커밋할 때마다 `GIT_AUTHOR_*`/`GIT_COMMITTER_*` 환경변수로 `doonghwi <joyyoxyt@gmail.com>` 지정 |
| GitHub CLI | `C:\dev\tools\gh\bin\gh.exe` (winget 없어서 portable zip 설치, user PATH에 추가됨) |

`gh` CLI는 `doonghwi` 계정으로 인증 완료.

---

## 2. 기술 스택

- **Vite 8** + **React 19** + **TypeScript** (verbatim module syntax 켜져 있음 → 타입 import는 `type` 키워드 필수)
- **Vitest 4**: 한글 엔진 단위 테스트 (41개)
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
```

---

## 4. 디렉토리 구조

```
src/
  hangul/                  # 한글 조합 엔진 (IME 우회)
    constants.ts           # CHO/JUNG/JONG 배열, VOWEL_COMBINE/SPLIT, JONG_COMBINE/SPLIT
    composer.ts            # 자모 → 음절 상태머신 + 백스페이스
    decompose.ts           # 음절·복합자모 → 자모 분해 (채점용)
    dubeolsik.ts           # 두벌식 키맵 + codeToKeyChar(e.code, shift)
    composer.test.ts       # vitest
    decompose.test.ts      # vitest
    index.ts               # re-exports + processKey(state, key)
  hooks/
    useTypingSession.ts    # 핵심 상태 훅: reducer, keydown 리스너, deriveSession
  components/
    UserPicker.tsx         # 첫 화면 (이름 선택/추가)
    Profile.tsx            # 프로필 (3섹션 연습 진입 + 통계 + 랭킹 + 최근 기록)
    TypingScreen.tsx       # 타이핑 화면 (한컴 스타일 prev/current/next pair)
    Stats.tsx              # CPM/정확도/시간/오타 카드
    Leaderboard.tsx        # Firestore 데이터 표시 (역대/오늘 탭)
    keyboard/
      Keyboard.tsx         # 가상 키보드 (다음 키 강조)
      HandOverlay.tsx      # 손 모양 SVG 오버레이 (활성 키 방향으로 이동)
      layout.ts            # KEYBOARD_ROWS, findKeyByChar, finger mapping
  lessons/
    types.ts               # PositionStage/PositionLesson/SentenceLesson 타입
    data.ts                # POSITION_STAGES(7), WORDS(단일풀), SHORT_SENTENCES, LONG_PASSAGES, JAMO_LEVEL, wordRequiredStage, wordsAtLevel
    sources.ts             # source 스킴 + 옵션 배열 + isSourceRankingEligible
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

## 5. 연습 구조 — 3섹션

이전의 10단계 단일 드롭다운을 **자리/단어/문장 3섹션**으로 분리 (2026-05-17 재구성). 각 섹션은 Profile 카드에 자체 드롭다운 + 시작 버튼이 있음.

### 자리연습 (POSITION_STAGES, 1~7)

| # | 제목 | 키/자모 |
|---|---|---|
| 1 | 기본자리 | A S D F · J K L (ㅁ ㄴ ㅇ ㄹ · ㅓ ㅏ ㅣ) |
| 2 | 왼손 윗자리 | Q W E R T (ㅂ ㅈ ㄷ ㄱ ㅅ) |
| 3 | 왼손 아랫자리 | Z X C V B (ㅋ ㅌ ㅊ ㅍ ㅠ) |
| 4 | 가운데자리 | G H (ㅎ ㅗ) |
| 5 | 오른손 윗자리 | Y U I O P (ㅛ ㅕ ㅑ ㅐ ㅔ) |
| 6 | 오른손 아랫자리 | N M (ㅜ ㅡ) |
| 7 | 전체자리 | 복합 모음 · 쌍자음 · 겹받침 |

각 단계는 `자모 → 받침 없는 글자 → 받침 있는 글자`(7단계는 복합모음·쌍자음·ㅆ받침·겹받침) 레슨으로 구성. **단어 레슨은 모두 제거** — 단어연습 섹션으로 이동.

소스: `position-1` ~ `position-7`. 시작하면 해당 단계의 모든 레슨 라인 풀해서 셔플.

### 단어연습 (WORDS 단일 풀, 단계별 필터)

`WORDS`: 모든 단어 중복 제거된 단일 배열. 주제별 그룹 없음 (사용자가 주제별 불필요하다고 함).

**난이도 라벨**: `wordRequiredStage(word)`가 단어를 분해해서 가장 늦은 jamo의 단계를 반환 (`JAMO_LEVEL` 맵 기반). `wordsAtLevel(N)`은 N단계까지 키로 칠 수 있는 단어들만 반환 (앱 부팅 시 한 번 계산, O(1) 조회).

**JAMO_LEVEL 매핑**:
- 1단계: ㅁ ㄴ ㅇ ㄹ · ㅓ ㅏ ㅣ
- 2단계: ㅂ ㅈ ㄷ ㄱ ㅅ
- 3단계: ㅋ ㅌ ㅊ ㅍ · ㅠ
- 4단계: ㅎ ㅗ
- 5단계: ㅛ ㅕ ㅑ ㅐ ㅔ
- 6단계: ㅜ ㅡ
- 7단계: ㄲ ㄸ ㅃ ㅆ ㅉ (쌍자음 — Shift 필요)
- 복합 모음/겹받침은 분해 후 base jamo 단계로 평가됨 (조합기가 자동 합성)

소스: `words-1` ~ `words-6`, `words-all` (= 7단계까지). 드롭다운에는 "1단계까지" ~ "6단계까지", "전체".

### 문장연습 (랭킹 등록 대상)

| 종류 | 소스 | 데이터 |
|---|---|---|
| 짧은 문장 | `sentences-short` | `SHORT_SENTENCES` 12 레슨, 각 7~10문장 |
| 긴 글 | `sentences-long` | `LONG_PASSAGES` 13 레슨, 각 5~6 문장 |

드롭다운은 **2 옵션만**. 시작하면 해당 카테고리의 모든 라인을 풀해서 셔플 (레슨 단위 선택 없음).

**랭킹**: `isSourceRankingEligible(source)` → `sentences-short` / `sentences-long`만 `true`. cloud push는 이 둘만. 나머지(자리·단어)는 로컬 저장만.

**미래 계획**: 긴글연습에 사용자 커스텀 글귀 추가/선택 기능 예정 (사용자가 "알아만 둬"로 언급). 커스텀이 추가되면 드롭다운에 `<optgroup>`으로 짧은/긴/내 글귀 그룹화하거나 별도 옵션. 저작권 이슈 때문에 사용자 본인 작성만 허용.

---

## 6. 콘텐츠 가이드라인 (중요)

**모든 레슨 텍스트는 직접 작성한 원본 또는 일반 어휘**:
- 자리연습 (1~7): 자모, 일반 음절, 사전 어휘 — 저작권 무관
- 단어연습 (WORDS): 일반 명사 (음식·가족·자연 등 22 버킷에서 합쳐 dedup) — 저작권 무관
- 문장연습 짧은 문장: 일상 표현, 스톡 인사말 (안녕하세요 등) + 직접 쓴 짧은 문장
- 문장연습 긴 글: **모두 직접 작성한 원본 산문**. 시·가사·소설·노래 가사 일체 사용 안 함.

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

**중요**: `recordLine`은 이제 **모든 단계의 기록을 로컬에 저장**. Cloud push만 `isSourceRankingEligible`로 게이트. 자리연습·단어연습도 프로필의 최근 기록·최고 타수에 반영됨.

이전 버전 키 (`progress`, `progress-v2`)는 더 이상 안 읽음. v3 도입 시점에 사용자가 막 시작한 상태였어서 마이그레이션 안 함.

`source` 필드 값:
- `position-1` ~ `position-7` (자리)
- `words-1` ~ `words-6`, `words-all` (단어)
- `sentences-short`, `sentences-long` (문장)
- 옛 레코드: `stage-N` (재구성 이전 사용자 기록, 그대로 유지)

---

## 8. Firestore 설정

| 항목 | 값 |
|---|---|
| 프로젝트 ID | `korean-typing-3118c` |
| 위치 | asia-northeast3 (서울) |
| Config 파일 | `src/firebase.ts` (공개 안전, 보안은 Rules로) |
| 컬렉션 | `records` |
| 보안 규칙 | ✅ 적용됨 (사용자가 직접 게시) — cpm < 5000, user ≤ 30자, text ≤ 200자 등 검증 |

문서 스키마 (`records/<auto-id>`):
```ts
{
  user: string      // 1~30자
  source: string    // 'sentences-short' | 'sentences-long' | (legacy: 'stage-9'/'stage-10')
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

**자모 분해 (decomposeText)**: 음절뿐 아니라 **단독 복합 자모(ㅚ, ㅞ, ㅘ, ㄳ, ㅄ 등)도 분해**해서 base jamo 시퀀스로 변환. `computeBoundaries`도 같은 규칙 사용. 이전엔 단독 복합자모가 분해 안 돼서 `targetJamo` 길이 1로 잡혀 첫 base jamo 입력 순간 세션이 종료되는 버그가 있었음 (`aa36b36`).

**채점**:
- `inputs[i] === targetJamo[i]` 비교 (자모 단위 위치 비교)
- 한 자모라도 틀린 글자는 빨간색 표시
- 완료 조건: `inputCount >= targetJamo.length` (틀려도 전부 치면 다음으로) OR `rendered === target` (완벽)

**리터럴 입력**: 마침표·쉼표·숫자 등은 `e.key.length === 1` fallback으로 `inputLiteral` 호출. 공백도 동일.

**테스트 41개**: composer 33 + decompose 8. 모두 통과 중. 한글 엔진 수정 시 반드시 `npx vitest run`.

---

## 10. 알려진 이슈 / 미해결

- **iPad 키보드 종속성**: 외장 키보드 필수. 화면 키보드는 IME 우회 불가. README에 명시됨.
- **이름 도용 가능**: Firebase Auth 없음. 누구나 아무 이름으로 기록 등록 가능. 3명 신뢰 기반이라 OK.
- **bundle size**: 111KB gzipped (Firebase가 +33KB 차지). 추가 최적화 가능하나 현재 충분.
- **세벌식 미지원**: 두벌식 전용. 추가하려면 `src/hangul/dubeolsik.ts` 옆에 키맵 추가 + 사용자 설정.
- **단어 레벨 추정의 한계**: `wordRequiredStage`는 base jamo 단계 max를 보므로 `값`(ㅂㅅ 겹받침)이 2단계로 잡힘. 자판 키 기준으로는 맞지만 "겹받침 개념을 모르는 2단계 사용자"가 보면 어려울 수 있음. 실용적으로 큰 문제 아님.
- **미래 작업: 커스텀 긴글**: 사용자가 직접 작성한 긴 글귀를 추가하고 드롭다운에서 선택 가능하게 (사용자가 "알아만 둬"로 언급). localStorage 저장 방향. 5번 섹션 끝 참고.

---

## 11. 자주 하는 작업

### 새 자리 단계 추가
1. `src/lessons/data.ts`의 `POSITION_STAGES` 배열에 새 객체 추가
2. `JAMO_LEVEL`에 새로 등장하는 jamo 등록 (단어 레벨 계산에 필요)
3. `WORD_OPTIONS`도 `MAX_WORD_LEVEL` 상수 따라가니까 필요시 상수 갱신
4. Profile, sources.ts는 자동 반영

### 새 단어 추가
- `src/lessons/data.ts`의 `WORD_BUCKETS`에 추가 (또는 새 버킷 배열 추가)
- `WORDS_SET`이 자동 dedup, `WORDS_BY_LEVEL`도 자동 재계산

### 문장/긴글 추가
- `src/lessons/data.ts`의 `SHORT_SENTENCES` 또는 `LONG_PASSAGES`에 새 `SentenceLesson` 객체 추가
- 시작하면 해당 카테고리 전체 풀에 자동 합쳐짐 (개별 선택은 없음)

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

git config user 미설정이므로 환경변수로 지정 (PowerShell):
```powershell
$env:GIT_AUTHOR_NAME='doonghwi'; $env:GIT_AUTHOR_EMAIL='joyyoxyt@gmail.com'
$env:GIT_COMMITTER_NAME='doonghwi'; $env:GIT_COMMITTER_EMAIL='joyyoxyt@gmail.com'
git commit -m "..."
```

또는 한 줄 (bash):
```bash
GIT_AUTHOR_NAME=doonghwi GIT_AUTHOR_EMAIL=joyyoxyt@gmail.com \
GIT_COMMITTER_NAME=doonghwi GIT_COMMITTER_EMAIL=joyyoxyt@gmail.com \
git commit -m "..."
```

메시지는 영어/한국어 혼용 OK. `Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>` 트레일러 붙임.

`.gitignore`에 `.omc`, `.claude` 추가됨 (OMC 로컬 상태 제외).

---

## 13. 사용자 컨텍스트 요약

- **doonghwi** (joyyoxyt@gmail.com), 한국 사용자
- 3명 이하 친구·가족용 비공식 사용
- TypingClub의 한글 미지원 + iPad 무료 앱 부재를 동기로 시작
- 백엔드 단순함 선호 (Firebase 무료 한도로 충분)
- 한컴타자연습 스타일 UX 선호 (3줄 prev/current/next, 빨간 오타 표시 등)
- 작업 진행 방식: 단계별 확인보다는 "그냥 다 해줘" 방향 (autopilot 선호하지만 큰 결정은 확인 받음)
- UI 깔끔함 중시: 곁가지 정보(예: 옆에 단어 개수 표시) 같은 건 안 좋아함

---

## 14. 핸드오프 시점 라이브 상태

- 마지막 커밋: `a342759` — 문장연습 두 옵션만 두고 전체 셔플
- 직전: `ce6f2f0` — 3섹션 재구성 / `aa36b36` — 복합자모 입력 버그 픽스
- 모든 변경사항 push됨 (working tree clean)
- 41개 테스트 통과 중
- 빌드 OK (111KB gzipped)
- 라이브 사이트 정상 동작 확인됨
- 사용자가 iPad에서도 동작 확인 완료
- Firestore 보안 규칙 적용 완료

다음 세션에서 일을 이어갈 때:
1. 이 문서를 먼저 읽고 컨텍스트 파악
2. `git log --oneline -20`으로 최근 작업 확인
3. `npm run dev`로 로컬 확인 후 작업 시작
4. `npx vitest run`으로 한글 엔진 깨지지 않았는지 검증

문제 생기면 사용자에게 한국어로 짧고 명확하게 보고. 디버깅은 차분히 — 자모 정렬·위치 추적 관련 버그가 흔함 (`inputs[] ↔ composer` 정렬).
