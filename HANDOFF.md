# 핸드오프 문서 (korean-typing)

> 다음 Claude Code 세션이 이 프로젝트를 이어받을 수 있도록 작성된 운영 문서.
> 사용자: **doonghwi** (joyyoxyt@gmail.com).
> 마지막 업데이트: 2026-05-31.

---

## 1. 위치 및 환경

| 항목 | 값 |
|---|---|
| 작업 디렉토리 | `C:\dev\taza\korean-typing` |
| 워크스페이스 | `C:\dev\taza` (`.omc` 세션 상태 + 사용자에게 보낸 HTML 가이드가 여기 있음 — git 밖) |
| 운영체제 | Windows 11 Home, PowerShell 5.1 (`$null`, backtick 등 PS 문법). bash 툴도 사용 가능 |
| Node | v24.14.1 / npm 11.11.0 |
| Git | git for Windows 2.51. **로컬 user.name/email 미설정** — 커밋마다 `GIT_AUTHOR_*`/`GIT_COMMITTER_*` 환경변수로 `doonghwi <joyyoxyt@gmail.com>` 지정 (12번 참고) |
| GitHub CLI | `C:\dev\tools\gh\bin\gh.exe` (portable). `doonghwi` 계정 인증 완료 |
| 원격 | `origin` → https://github.com/doonghwi/korean-typing.git (main) |

---

## 2. 기술 스택

- **Vite 8** + **React 19** + **TypeScript** (verbatim module syntax → 타입 import는 `type` 키워드 필수)
- **Vitest 4**: 단위 테스트 **44개** (composer 33 + decompose 8 + position 3). 모두 통과 중
- **Firebase 12 Firestore Lite**: 클라우드 랭킹 (실시간 리스너 미사용, 가벼움). 컬렉션 4개: `records`, `sprints`, `fallings`, `streaks`
- **자체 한글 조합 엔진**: 두벌식, IME 우회. `src/hangul/`
- **영어 모드**: 한/영 토글. 영어는 1:1 문자 비교(조합 없음)
- **GitHub Pages**: main 푸시 시 GitHub Actions 자동 배포 (`.github/workflows/deploy.yml`)
- 번들: JS ~138KB gzipped (단어 풀 3배 확장으로 증가, Firebase ~33KB 포함)

---

## 3. 자주 쓰는 명령

```powershell
Set-Location 'C:\dev\taza\korean-typing'
npm install
npm run dev          # http://localhost:5173/korean-typing/
npm run build        # tsc -b + vite build (TS 체크 포함)
npx vitest run       # 44개 테스트
git push             # → GitHub Actions 자동 배포
```

---

## 4. 디렉토리 구조

```
src/
  hangul/                  # 한글 조합 엔진 (IME 우회)
    constants.ts · composer.ts · decompose.ts · dubeolsik.ts · index.ts
    composer.test.ts · decompose.test.ts
  hooks/
    useTypingSession.ts    # 한글 타이핑 reducer/keydown. ★requirePerfect 옵션 있음
    useEnglishSession.ts   # 영어 타이핑(1:1). ★requirePerfect 옵션 있음
    useCountdown.ts        # 스프린트 60초 카운트다운
  components/
    UserPicker.tsx         # 첫 화면 (이름 선택/추가)
    Profile.tsx            # 프로필: 연습 진입 + 통계 + streak 배너 + ★연속출석 랭킹 + 약점키 + 업적 + 랭킹 + 최근기록
    TypingScreen.tsx       # 한글 타이핑 화면 (prev/current/next 3행)
    TypingScreenEn.tsx     # 영어 타이핑 화면
    SprintScreen.tsx       # 1분 스프린트 게임 (Ko/En) + 스프린트 랭킹
    FallingGame.tsx        # 낙하 단어 게임 (rAF 루프) + 낙하 랭킹
    Stats.tsx · Leaderboard.tsx (CPM 역대/오늘)
    keyboard/ Keyboard.tsx · HandOverlay.tsx · layout.ts
  lessons/
    types.ts
    data.ts                # POSITION_STAGES(7) · WORD_BUCKETS · SHORT/LONG_SENTENCES · JAMO_LEVEL · wordsAtLevel
    data-en.ts             # 영어 버전
    data.position.test.ts  # ★자리연습 단계 제약 검증 테스트
    sources.ts             # source 스킴, buildSprintPool/buildFallingPool, 랭킹 자격
  storage/
    progress.ts            # localStorage: records, streak, sprint/falling best, keystats. ★syncStreakRanking
    cloudRanking.ts        # Firestore CRUD: records/sprints/fallings/streaks (push + dedup fetch)
    achievements.ts        # 업적/뱃지 (저장 데이터에서 파생)
  utils/shuffle.ts · firebase.ts · App.tsx
firestore.rules            # ★보안 규칙 백업 (콘솔 게시는 수동, 8번 참고)
```

---

## 5. 화면 구성

`App.tsx` 라우팅: `pick-user` → `profile` → 세션(`typing`/`sprint`/`falling`).

**연습 3섹션** (Profile 카드): 자리연습 / 단어연습 / 문장연습. 각자 드롭다운 + 시작 버튼.
**게임 2종**: 1분 스프린트 / 낙하게임 (6번).
**한/영 토글**: 모든 섹션·게임이 ko/en 지원.

### 자리연습 (POSITION_STAGES 1~7)
단계별로 **그 단계까지 배운 자모만** 사용. 자모 → 받침없는 → 받침있는 (7단계는 복합모음·쌍자음·ㅆ받침·겹받침).
**제약 규칙**: 줄 하나가 N단계에 유효하려면 `wordRequiredStage(line) ≤ N`. 복합모음·겹받침은 base jamo로 분해 평가됨(조합기가 자동 합성). `data.position.test.ts`가 이 제약을 자동 검증.

### 단어연습 (WORDS 단일 풀, 단계별 필터)
`WORD_BUCKETS`를 dedup한 `WORDS` 배열(현재 **약 2,295개**). `wordRequiredStage(word)`로 단어를 단계별로 자동 분류, `wordsAtLevel(N)`은 N단계까지 칠 수 있는 단어 반환. **단어엔 제약 없음** — 아무 일반 단어나 추가 가능(자동 레벨링).

### 문장연습 (랭킹 대상)
짧은 문장(`SHORT_SENTENCES`) / 긴 글(`LONG_PASSAGES`). 드롭다운 2옵션, 전체 셔플.

---

## 6. 게임 모드 & 클라우드 랭킹 ★이번 세션 핵심

### 1분 스프린트 (`SprintScreen.tsx`)
- 60초 동안 단어/짧은문장을 최대한 많이. 풀 = `buildSprintPool` (전체 단어 + 짧은 문장).
- **★완벽 입력 강제**: `useTypingSession/useEnglishSession`에 `requirePerfect=true`를 넘김 → 글자 수만 채워선 안 넘어가고 **완벽히 일치(`matchesTarget`)해야** 다음 줄. 틀리면 백스페이스로 고쳐야 함.
- **★빨강 오타 표시**: 목표·입력 글자를 `correct/wrong/current/pending` 색으로(메인 화면과 동일 패턴). `koTargetChars`/`enTargetChars`/`inputCharsOf` 헬퍼가 상태 배열 생성.
- 점수 = 정타 수(`inputCount - errorCount`). 영어는 `/5`로 단어 수 환산 표시.

### 낙하 게임 (`FallingGame.tsx`)
- 단어가 위에서 떨어짐. 입력 후 **Enter 또는 Space**로 제출(낙하 단어엔 공백 없음). 바닥 닿으면 목숨↓, 5개 소진 시 게임오버.
- 풀 = `buildFallingPool` (공백 없는 2~4글자 ko / 2~7글자 en).
- **★부드러운 낙하**: 게임 루프가 `requestAnimationFrame`(~60fps). 이동량은 실제 경과시간(dt) 기반이라 주사율 무관하게 속도 동일. (이전엔 50ms setInterval=20fps라 끊겼음)
- 점수 = 제거한 단어 수.

### 클라우드 랭킹 아키텍처 (`cloudRanking.ts`) — 4개 보드 공통 규칙
append-only(수정/삭제 금지) Firestore라 아래 패턴으로 통일:
1. **push best**: 게임/연습마다 현재 점수가 아니라 **개인 최고점**을 전송(`App.tsx` onSprintComplete/onFallingComplete, streak는 `syncStreakRanking`). → 보드가 진짜 최고 반영 + 규칙 게시 전 못 올린 기록도 다음 플레이에 복구.
2. **dedup on read**: fetch는 wide window(limit 50)를 받아 **유저별 최고 1개만** 남김(`Map`). → 한 사람이 여러 줄 차지하는 버그 방지.
3. **merge local best**: 리더보드 컴포넌트가 클라우드 결과에 **본인 로컬 최고점을 병합**. → push 전파 지연/실패에도 내 기록은 즉시 보임(race-proof).
4. **동점 표준 순위(1·1·3)**: 같은 점수는 같은 등수, 다음은 인원수만큼 건너뜀. 모든 보드(streak/sprint/falling)에 적용.

| 보드 | 컬렉션 | 점수 | 표시 위치 | 인덱스 |
|---|---|---|---|---|
| CPM | `records` | cpm | Profile 하단 (역대/오늘 탭) | (lang↑, cpm↓) |
| 스프린트 | `sprints` | 정타 | 스프린트 종료 화면 TOP5 | (lang↑, score↓) |
| 낙하 | `fallings` | 개수 | 게임오버 화면 TOP5 | (lang↑, score↓) |
| **연속출석** | `streaks` | best streak(일) | **Profile streak 배너 아래 TOP5** | 불필요(단일 정렬) |

**streak 랭킹 주의점** (`syncStreakRanking` in progress.ts):
- 언어 무관(한/영 합산 출석). best streak = 역대 최장 연속일.
- "전송됨" 마커는 **push 성공 시에만** 저장(`streak-pushed-v2` 키) → 규칙 게시 전 실패해도 다음에 재시도. 마커 키를 v2로 올려 과거 잘못 박힌 마커 무시.
- recordLine + Profile 진입 시 호출됨.

---

## 7. localStorage 스키마

```
'taza:users'                         string[]
'taza:current-user'                  string
'taza:user:<name>:progress-v3'       { records: LineRecord[] (max 1000, FIFO) }
'taza:user:<name>:lang'              'ko' | 'en'
'taza:user:<name>:keystats:<lang>'   약점키 통계
'taza:user:<name>:sprints'           SprintRecord[] (max 100)
'taza:user:<name>:falling:<lang>'    number (최고 점수)
'taza:user:<name>:streak-pushed-v2'  number (클라우드에 마지막으로 올린 best streak)
```
`recordLine`은 **모든 단계 기록을 로컬 저장**. Cloud push만 `isRecordRankingEligible`(랭킹자격 + 정확도 100%)로 게이트.

---

## 8. Firestore 설정 ★중요

| 항목 | 값 |
|---|---|
| 프로젝트 ID | `korean-typing-3118c` (asia-northeast3 서울) |
| Config | `src/firebase.ts` (공개 안전, 보안은 Rules로) |
| 컬렉션 | `records`, `sprints`, `fallings`, `streaks` |

### ⚠️ 규칙·인덱스는 콘솔에서 수동 적용
이 프로젝트는 GitHub Pages 배포만 쓰고 `firebase deploy`를 **안 씀**. `firestore.rules` 파일은 **백업일 뿐 자동 적용 안 됨**. 새 컬렉션/규칙은 **콘솔에 직접 게시**해야 함:
- 규칙: [콘솔 → Firestore → 규칙 탭](https://console.firebase.google.com/project/korean-typing-3118c/firestore/rules)에 `firestore.rules` 내용 붙여넣고 게시.
- **복합 인덱스**: sprints/fallings 쿼리(`where(lang)+orderBy(score)`)는 인덱스 필요. 게임 한 판 돌리면 F12 콘솔에 `The query requires an index. You can create it here: …` 링크가 뜸 → 클릭해서 생성. **streaks는 단일 정렬이라 불필요.**
- 사용자(doonghwi)가 2026-05-31 시점 규칙 게시 + sprints/fallings 인덱스 생성 완료.

규칙은 누구나 읽기, 검증된 create만, update/delete 금지. (cpm<5000, score≤100000, streak≤100000, user≤30자 등 검증)

---

## 9. 한글 엔진 핵심 동작

- **키→자모**: `e.code`(`KeyR`) 기반 → IME 무관.
- **조합기 상태**: `{ committed, working:{L?,V?,T?} }`. 다음 자모 안 맞으면 commit 후 새 working.
- **백스페이스**: 자모 하나씩 제거. `inputs[]`와 1:1 정렬.
- **분해(decomposeText)**: 음절 + 단독 복합자모(ㅚㅞㅘㄳㅄ 등)도 base jamo로 분해. 채점/`computeBoundaries`/`wordRequiredStage` 공통.
- **채점**: `inputs[i] === targetJamo[i]` 위치 비교. 틀린 글자 빨강.
- **줄 완료 조건**: `inputCount >= targetJamo.length`(틀려도 진행) **또는** `rendered === target`(완벽). ★`requirePerfect=true`면 **완벽 일치일 때만** 완료(스프린트 전용).
- **줄 결과 저장**: finishedAt 순간이 아니라 Enter/Space(다음 줄) 시 push. `advanceRef` 패턴.
- **★띄어쓰기 표시**: 공백을 가운데점(`·`)으로 찍던 것을 제거 → `.tch.space { display:inline-block; width:0.45em }` 빈 칸. 틀린 공백은 `.tch.wrong` 배경색으로 빨갛게. (메인 ko/en + 스프린트 전부)
- **테스트**: 한글 엔진 수정 시 반드시 `npx vitest run`.

---

## 10. 콘텐츠 가이드라인 (중요)

**모든 레슨 텍스트는 직접 작성 원본 또는 일반 어휘** — 저작권 있는 시·가사·소설 일절 금지. 사용자가 가요·시 추가 원했으나 거절함. 한컴타자 콘텐츠도 안 가져옴(UI 패턴만 참고).
- 단어연습/게임 풀: 일반 명사·동사·형용사. 2026-05-31에 ~50개 주제 버킷 추가로 **WORDS 757→2295개(3배)**.
- 자리연습: 단계 제약 음절/단어. **390→1049줄(2.7배)**. 초기 단계는 허용 자모 조합 한계로 3배 못 채움(예: 1단계 받침없는글자 = 자음4×모음3=12개가 상한).

---

## 11. 자주 하는 작업

- **단어 추가**: `data.ts`의 `WORD_BUCKETS`에 추가 → `WORDS_SET` 자동 dedup, 레벨 자동 계산. 낙하/스프린트/단어연습 동시 반영.
- **문장 추가**: `SHORT_SENTENCES` / `LONG_PASSAGES`에 `SentenceLesson` 추가.
- **자리연습 줄 추가**: 해당 단계 lesson `lines`에 추가. **반드시 `wordRequiredStage ≤ 단계` 지킬 것** — 어기면 `data.position.test.ts`가 빨강. (위반 줄·레벨을 메시지로 알려줌)
- **새 자리 단계**: `POSITION_STAGES` + `JAMO_LEVEL`(새 jamo 등록) + 필요시 `MAX_WORD_LEVEL`.
- **랭킹/게임 추가**: cloudRanking에 push(best)/fetch(dedup) 함수 추가 + 컴포넌트에서 merge-local + 동점순위 패턴 따르기. Firestore 규칙·인덱스 콘솔 게시 잊지 말 것.

### gh CLI
```powershell
& 'C:\dev\tools\gh\bin\gh.exe' run list --repo doonghwi/korean-typing --limit 5
& 'C:\dev\tools\gh\bin\gh.exe' run view <id> --repo doonghwi/korean-typing --log-failed
```

---

## 12. 커밋 컨벤션

git user 미설정 → 환경변수로 지정 (bash 한 줄):
```bash
GIT_AUTHOR_NAME=doonghwi GIT_AUTHOR_EMAIL=joyyoxyt@gmail.com \
GIT_COMMITTER_NAME=doonghwi GIT_COMMITTER_EMAIL=joyyoxyt@gmail.com \
git commit -m "..."
```
메시지 영/한 혼용 OK. 트레일러: `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`.
`.gitignore`에 `.omc`, `.claude` 포함. (CRLF 경고는 무시 — Windows 정상)

---

## 13. 사용자 컨텍스트 요약

- **doonghwi** (joyyoxyt@gmail.com), 한국 사용자. 친구·가족 3명 이하 비공식 사용.
- 백엔드 단순함 선호(Firebase 무료 한도). 한컴타자 스타일 UX 선호.
- 진행 방식: "그냥 다 해줘" 선호하되 **큰 결정/제품 방향은 확인**받기. 곁가지 정보 싫어함, UI 깔끔함 중시.
- **산출물 규칙(전역)**: 사용자가 *읽어보길 부탁*한 자료(보고서·가이드·비교)는 **HTML로 작성 + SendUserFile(proactive)**. 작업 내부 로그·spec(이 HANDOFF.md 등)은 md OK. 채팅 내 즉시 토론/결정 질문은 채팅 그대로 OK.

---

## 14. 라이브 상태 (2026-05-31)

이번 세션 주요 커밋(최신순):
- `a83d778` 자리/단어 풀 3배 확장 + 제약 검증 테스트 (data.position.test.ts)
- `69f6631` '제 이름은 둥희입니다' 문장 삭제
- `4098eb7` 띄어쓰기 점(·) 제거 → 빈 칸
- `de3d128` 낙하 rAF 부드럽게 + 단어/문장 풀 1차 보강
- `17f9d59` 게임 랭킹 유저별 dedup + 최고점 push + 동점순위
- `e2913dc` 스프린트 빨강 오타 표시 + 완벽입력(requirePerfect)
- `0a056bc` streak 랭킹 가시성 픽스(성공시만 마커 + merge)
- `c11452b` 연속출석(streak) 클라우드 랭킹 신규
- `83629c9` 낙하 제출 Enter+Space

상태:
- 모든 변경 push됨(working tree clean), GitHub Actions 자동 배포 성공.
- 테스트 44개 통과, 빌드 OK.
- Firestore 규칙 + sprints/fallings 인덱스 콘솔 게시 완료(사용자 확인).
- ⚠️ 다른 사람이 **업데이트된 사이트에 접속**해야 그 사람 점수/streak가 랭킹에 등록됨(현재는 사용자 본인 위주).

다음 세션:
1. 이 문서 + `git log --oneline -20` 확인
2. `npm run dev` / `npx vitest run`로 시작
3. 자리연습·랭킹·한글 정렬 관련은 차분히 — 자모 정렬·위치 추적 버그가 흔함
4. 사용자에게 한국어로 짧고 명확하게 보고
